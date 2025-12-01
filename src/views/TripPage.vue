<template>
  <div>
    <TripView v-if="trip" :trip="trip" @back="goBack" />
    <div v-else class="loading">Loading trip...</div>
  </div>
  </template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TripView from '../components/TripView.vue';
import type { Trip } from '../types/trip';
import { useAuth } from '../stores/useAuth';
import * as Trips from '../api/trips';
import * as Users from '../api/users';
import { transformApiTripToTrip } from '../utils/dataTransformers';

const route = useRoute();
const router = useRouter();
const { getSession, currentUser } = useAuth();
const trip = ref<Trip | null>(null);

async function loadTrip() {
  const session = getSession();
  if (!session) {
    router.replace({ name: 'auth' });
    return;
  }
  const id = String(route.params.id || '');
  if (!id) {
    router.replace({ name: 'dashboard' });
    return;
  }
  try {
    const response = await Trips.getTrip(id);
    // Fetch traveler names
    const travelerIds = new Set<string>();
    travelerIds.add(response.trip.organizer);
    response.trip.travellers.forEach((uid: string) => travelerIds.add(uid));
    const travelerNames = new Map<string, { firstName?: string; lastName?: string; username: string }>();
    for (const userId of travelerIds) {
      try {
        // Resolve username per userId
        const usernameResp = await Users.getUsername(userId).catch(() => ({ username: userId }));
        let uname = usernameResp.username || userId;
        // Guard: if backend incorrectly returns the signed-in user's username for others, fallback to userId
        const myUname = (currentUser.value?.username || '').toString();
        const myId = (currentUser.value?.id || '').toString();
        if (uname === myUname && String(userId) !== myId) {
          uname = String(userId);
        }
        // Resolve first/last name by username to avoid backend misrouting by session
        const nameByUsername = await Users.getUserNameByUsername(uname);
        travelerNames.set(userId, {
          firstName: nameByUsername.firstName,
          lastName: nameByUsername.lastName,
          username: uname,
        });
      } catch {
        travelerNames.set(userId, { username: userId });
      }
    }
    console.log('Trip travellers from API:', response.trip.travellers);
    console.log('Traveler names map:', Array.from(travelerNames.entries()));
    trip.value = transformApiTripToTrip(response.trip, undefined, travelerNames);
  } catch (e) {
    console.error('Failed to load trip', e);
    router.replace({ name: 'dashboard' });
  }
}

function goBack() {
  router.push({ name: 'dashboard' });
}

onMounted(loadTrip);
</script>

<style scoped>
.loading { padding: 2rem; text-align: center; color: #64748b; }
</style>
