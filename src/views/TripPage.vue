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
import { tripApi, userApi } from '../services/api';
import { transformApiTripToTrip } from '../utils/dataTransformers';

const route = useRoute();
const router = useRouter();
const { getSession } = useAuth();
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
    const response = await tripApi.getTrip({ trip: id });
    // Fetch traveler names
    const travelerIds = new Set<string>();
    travelerIds.add(response.trip.organizer);
    response.trip.travellers.forEach((uid: string) => travelerIds.add(uid));
    const travelerNames = new Map<string, { firstName?: string; lastName?: string; username: string }>();
    for (const userId of travelerIds) {
      try {
        const name = await userApi.getName({ targetUser: userId });
        travelerNames.set(userId, { firstName: name.firstName, lastName: name.lastName, username: userId });
      } catch {
        travelerNames.set(userId, { username: userId });
      }
    }
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
