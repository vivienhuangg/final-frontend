<template>
  <div class="invitations-page">
    <div class="container mx-auto p-6 max-w-4xl">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-[#1e3a5f]">Your Invitations</h1>
        <button class="btn-secondary" type="button" @click="goBack">Back to Dashboard</button>
      </div>

      <div v-if="loading" class="empty-state">Loading invitations…</div>
      <div v-else>
        <section class="mb-8" v-if="pendingInvites.length">
          <div class="section-title-row mb-3">
            <h2 class="text-xl font-semibold text-[#1e3a5f]">Pending</h2>
            <span class="notification-badge">{{ pendingInvites.length }}</span>
          </div>
          <div class="invites-list">
            <InvitationCard
              v-for="inv in pendingInvites"
              :key="inv.id"
              :invitation="inv"
              @accept="acceptInvitation(inv.id)"
              @decline="rejectInvitation(inv.id)"
            />
          </div>
        </section>

        <section class="mb-8" v-if="acceptedInvites.length">
          <h2 class="text-xl font-semibold text-[#1e3a5f] mb-3">Accepted</h2>
          <div class="invites-list">
            <InvitationCard
              v-for="inv in acceptedInvites"
              :key="inv.id"
              :invitation="inv"
              :readonly="true"
              @delete="deleteInvitation(inv.id)"
            />
          </div>
        </section>

        <section v-if="declinedInvites.length">
          <h2 class="text-xl font-semibold text-[#1e3a5f] mb-3">Declined</h2>
          <div class="invites-list">
            <InvitationCard
              v-for="inv in declinedInvites"
              :key="inv.id"
              :invitation="inv"
              :readonly="true"
              @delete="deleteInvitation(inv.id)"
            />
          </div>
        </section>

        <div v-if="!pendingInvites.length && !acceptedInvites.length && !declinedInvites.length" class="empty-state">
          No invitations yet.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import * as Invitations from '../api/invitations';
import * as Trips from '../api/trips';
import * as Users from '../api/users';
import { useAuth } from '../stores/useAuth';
import type { TripInvitation } from '../types/trip';
import { transformApiInvitationToTripInvitation, transformApiTripToTrip } from '../utils/dataTransformers';

const router = useRouter();
const { currentUser, getSession } = useAuth();

const loading = ref(false);
const invitations = ref<TripInvitation[]>([]);

// Define InvitationCard locally so it's available in template
const InvitationCard = defineComponent({
  name: 'InvitationCard',
  props: {
    invitation: { type: Object, required: true },
    readonly: { type: Boolean, default: false },
  },
  emits: ['accept', 'decline', 'delete'],
  setup(props, { emit }) {
    function onAccept() { emit('accept'); }
    function onDecline() { emit('decline'); }
    function onDelete() { emit('delete'); }
    return { onAccept, onDecline, onDelete };
  },
  template: `
    <div class="invitation-card">
      <div class="invitation-card-content">
        <div class="invitation-header">
          <div>
            <h3>{{ invitation.trip.title }}</h3>
            <p class="invitation-from">Organized by {{ invitation.trip.travelers.find(t => t.id === invitation.trip.organizer)?.name || invitation.trip.organizer }}</p>
            <p class="trip-card-dates mt-1">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ new Date(invitation.trip.startDate).toLocaleDateString() }} - {{ new Date(invitation.trip.endDate).toLocaleDateString() }}</span>
            </p>
          </div>
          <span class="invitation-badge">{{ invitation.status === 'pending' ? 'Invitation' : invitation.status }}</span>
        </div>
        <div class="invitation-actions" v-if="!readonly && invitation.status === 'pending'">
          <button class="btn-accept" type="button" @click.stop="onAccept">Accept</button>
          <button class="btn-decline" type="button" @click.stop="onDecline">Decline</button>
        </div>
        <div class="invitation-actions" v-else>
          <button class="btn-secondary" type="button" @click.stop="onDelete">Remove</button>
        </div>
      </div>
    </div>
  `,
});

function goBack() {
  router.push({ name: 'dashboard' });
}

onMounted(async () => {
  await loadInvitations();
});

async function loadInvitations() {
  const session = getSession();
  if (!session || !currentUser.value) return;

  try {
    loading.value = true;
  const response = await Invitations.getMyInvitations();

    const invitationTrips: TripInvitation[] = [];
    for (const apiInv of response.results) {
      try {
        // Prefer embedded trip details from backend to avoid extra calls and auth issues
        const tripBase = (apiInv.tripDetails || apiInv.trip);
        let tripSummary: any = tripBase;
        if (!tripSummary) {
          // Fallback: fetch trip (may require membership)
          const tripResponse = await Trips.getTrip(apiInv.event);
          tripSummary = tripResponse.trip;
        }

        // Collect traveler names
        const travelerIds = new Set<string>();
  travelerIds.add(tripSummary.organizer);
  tripSummary.travellers.forEach((id: string) => travelerIds.add(id));

        const travelerNames = new Map<string, { firstName?: string; lastName?: string; username: string }>();
        for (const userId of travelerIds) {
          try {
            const [usernameResponse, nameResponse] = await Promise.all([
              Users.getUsername(userId).catch(() => ({ username: userId })),
              Users.getUserName(userId).catch(() => ({ firstName: undefined, lastName: undefined } as any)),
            ]);
            travelerNames.set(userId, {
              firstName: (nameResponse as any).firstName,
              lastName: (nameResponse as any).lastName,
              username: usernameResponse.username || userId,
            });
          } catch (e) {
            travelerNames.set(userId, { username: userId });
          }
        }

        const trip = transformApiTripToTrip(tripSummary, undefined, travelerNames);
        const invitation = transformApiInvitationToTripInvitation(
          {
            invitation: apiInv.invitation,
            event: apiInv.event,
            accepted: apiInv.acceptedStatus as 'Yes' | 'No' | 'Maybe',
          },
          trip,
        );
        invitation.invitee = currentUser.value.id;
        invitationTrips.push(invitation);
      } catch (e) {
        // Not a trip invitation (likely activity) – skip for this page
        continue;
      }
    }

    invitations.value = invitationTrips;
  } catch (error) {
    console.error('Failed to load invitations:', error);
  } finally {
    loading.value = false;
  }
}

const pendingInvites = computed(() => invitations.value.filter((inv) => inv.status === 'pending'));
const acceptedInvites = computed(() => invitations.value.filter((inv) => inv.status === 'accepted'));
const declinedInvites = computed(() => invitations.value.filter((inv) => inv.status === 'declined'));

async function acceptInvitation(invitationId: string) {
  const session = getSession();
  if (!session) return;
  try {
    await Invitations.acceptInvitation(invitationId);
    await loadInvitations();
  } catch (error: any) {
    console.error('Failed to accept invitation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to accept invitation';
    alert(errorMessage);
  }
}

async function rejectInvitation(invitationId: string) {
  const session = getSession();
  if (!session) return;
  try {
    await Invitations.rejectInvitation(invitationId);
    await loadInvitations();
  } catch (error: any) {
    console.error('Failed to decline invitation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to decline invitation';
    alert(errorMessage);
  }
}

async function deleteInvitation(invitationId: string) {
  const session = getSession();
  if (!session) return;
  try {
    await Invitations.deleteInvitation(invitationId);
    await loadInvitations();
  } catch (error: any) {
    console.error('Failed to delete invitation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete invitation';
    alert(errorMessage);
  }
}
</script>

<style scoped>
.invitations-page {
  min-height: 100vh;
  background: #f5f1ed;
}
.container { width: 100%; max-width: 64rem; margin: 0 auto; padding: 1.5rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.p-6 { padding: 1.5rem; }
.max-w-4xl { max-width: 64rem; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.mb-6 { margin-bottom: 1.5rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.font-bold { font-weight: 700; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.font-semibold { font-weight: 600; }
.btn-secondary { background: #f0f0f0; color: #333; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
.btn-secondary:hover { background: #e0e0e0; }
.section-title-row { display: flex; align-items: center; gap: 0.75rem; }
.notification-badge { background: #d32f2f; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; }
.invites-list { display: flex; flex-direction: column; gap: 1rem; }
.empty-state { text-align: center; padding: 2rem; color: #888; }
.invitation-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border: 2px solid #42b983; position: relative; width: 100%; }
.invitation-card-content { padding: 1rem; }
.invitation-header { display: flex; justify-content: space-between; align-items: flex-start; }
.invitation-header h3 { font-size: 1.1rem; color: #333; }
.invitation-from { color: #666; font-size: 0.85rem; margin-top: 0.25rem; }
.invitation-badge { background: #42b983; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.invitation-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.btn-accept { flex: 1; background: #42b983; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
.btn-accept:hover { background: #35a372; }
.btn-decline { flex: 1; background: white; color: #666; border: 1.5px solid #e0e0e0; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
.btn-decline:hover { background: #f5f5f5; border-color: #ccc; }
.w-4 { width: 1rem; }
.h-4 { height: 1rem; }
.mt-1 { margin-top: 0.25rem; }
.text-blue-600 { color: #2563eb; }
</style>
