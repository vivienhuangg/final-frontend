<template>
  <div class="invitations-page">
    <div class="container mx-auto p-6 max-w-4xl">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-[#1e3a5f]">Your Invitations</h1>
        <button class="btn-secondary" type="button" @click="goBack">Back to Dashboard</button>
      </div>

      <div v-if="loading" class="empty-state">Loading invitations…</div>
      <div v-else>
        <section class="section-block" v-if="pendingInvites.length">
          <div class="section-header">
            <div class="section-title-row">
              <h2 class="text-xl font-semibold text-[#1e3a5f]">Pending Invitations</h2>
              <span class="notification-badge">{{ pendingInvites.length }}</span>
            </div>
            <p class="section-description">Trips you've been invited to join. Accept to add them to your dashboard.</p>
          </div>
          <div class="invitations-grid">
            <div v-for="inv in pendingInvites" :key="inv.id" class="invitation-card">
              <div class="invitation-card-content">
                <div class="invitation-header">
                  <div>
                    <h3 class="trip-title">{{ inv.trip.title }}</h3>
                    <p class="invitation-from">Organized by <span class="organizer-name">{{ organizerUsername(inv.trip) }}</span></p>
                    <p class="trip-card-dates mt-2">
                      <svg class="date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ formatDateRange(inv.trip.startDate, inv.trip.endDate) }}</span>
                    </p>
                  </div>
                  <span class="invitation-badge">Invitation</span>
                </div>
                <div class="invitation-actions">
                  <button class="btn-accept" type="button" @click.stop="acceptInvitation(inv.id)">Accept</button>
                  <button class="btn-decline" type="button" @click.stop="rejectInvitation(inv.id)">Decline</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section-block" v-if="acceptedInvites.length">
          <div class="section-header">
            <h2 class="text-xl font-semibold text-[#1e3a5f] mb-3">Accepted Trips</h2>
          </div>
          <div class="invitations-grid">
            <div v-for="inv in acceptedInvites" :key="inv.id" class="invitation-card accepted">
              <div class="invitation-card-content">
                <div class="invitation-header">
                  <div>
                    <h3 class="trip-title">{{ inv.trip.title }}</h3>
                    <p class="invitation-from">Organizer: <span class="organizer-name">{{ organizerUsername(inv.trip) }}</span></p>
                    <p class="trip-card-dates mt-2">
                      <svg class="date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ formatDateRange(inv.trip.startDate, inv.trip.endDate) }}</span>
                    </p>
                  </div>
                  <span class="invitation-badge accepted">Accepted</span>
                </div>
                <div class="invitation-actions">
                  <button class="btn-secondary remove-btn" type="button" @click.stop="deleteInvitation(inv.id)">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section-block" v-if="declinedInvites.length">
          <div class="section-header">
            <h2 class="text-xl font-semibold text-[#1e3a5f] mb-3">Declined</h2>
          </div>
          <div class="invitations-grid">
            <div v-for="inv in declinedInvites" :key="inv.id" class="invitation-card declined">
              <div class="invitation-card-content">
                <div class="invitation-header">
                  <div>
                    <h3 class="trip-title">{{ inv.trip.title }}</h3>
                    <p class="invitation-from">Organizer: <span class="organizer-name">{{ organizerUsername(inv.trip) }}</span></p>
                    <p class="trip-card-dates mt-2">
                      <svg class="date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ formatDateRange(inv.trip.startDate, inv.trip.endDate) }}</span>
                    </p>
                  </div>
                  <span class="invitation-badge declined">Declined</span>
                </div>
                <div class="invitation-actions">
                  <button class="btn-secondary remove-btn" type="button" @click.stop="deleteInvitation(inv.id)">Remove</button>
                </div>
              </div>
            </div>
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
import { computed, onMounted, ref } from 'vue';
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

// (Inline InvitationCard component removed; using direct markup instead)

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

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
  const startFmt = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endFmt = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  if (sameMonth) {
    // Example: Nov 23–29, 2025
    return `${startFmt}–${endDate.getDate()}, ${endDate.getFullYear()}`;
  }
  // Example: Nov 29, 2025 – Dec 05, 2025
  return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function organizerUsername(trip: { organizer: string; travelers?: any[] }): string {
  const travelers = (trip as any).travelers || [];
  const org = travelers.find((t: any) => t.id === trip.organizer);
  return org?.username || trip.organizer;
}

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
.invitations-grid { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; }
.section-block { margin-bottom: 3rem; }
.trip-title { font-size: 1.05rem; font-weight: 600; color: #1f2937; line-height: 1.35; }
.organizer-name { font-weight: 500; color: #334155; }
.date-icon { width: 1rem; height: 1rem; margin-right: 0.35rem; color: #2563eb; flex-shrink: 0; }
.trip-card-dates { display: flex; align-items: center; font-size: 0.75rem; letter-spacing: .25px; color: #475569; font-weight: 500; }
.empty-state { text-align: center; padding: 2rem; color: #888; }
.invitation-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #dbe9e3; position: relative; width: 100%; transition: box-shadow .18s ease, transform .18s ease; }
.invitation-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.08); transform: translateY(-2px); }
.invitation-card.accepted { border-color: #c8dbff; }
.invitation-card.declined { border-color: #f5c7c7; }
.invitation-card-content { padding: 1.1rem 1.25rem 1.2rem; display: flex; flex-direction: column; gap: .75rem; }
.invitation-header { display: flex; justify-content: space-between; align-items: flex-start; }
.invitation-header h3 { margin: 0; }
.invitation-from { color: #666; font-size: 0.85rem; margin-top: 0.25rem; }
.invitation-badge { background: #2f8f65; color: white; padding: 0.35rem .85rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; letter-spacing: .5px; display: inline-flex; align-items: center; gap: .4rem; }
.invitation-badge.accepted { background: #1d4ed8; }
.invitation-badge.declined { background: #b91c1c; }
.invitation-actions { display: flex; gap: 0.65rem; margin-top: 0.35rem; }
.invitation-actions.single { justify-content: flex-end; }
.btn-accept { flex: 1; background: linear-gradient(135deg,#42b983,#3aa876); color: white; border: none; padding: 0.55rem 0.85rem; border-radius: 9px; font-size: 0.85rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,.12); transition: background .15s ease, box-shadow .15s ease; }
.btn-accept:hover { background: linear-gradient(135deg,#3aa876,#319267); box-shadow: 0 3px 6px rgba(0,0,0,.16); }
.btn-decline { flex: 1; background: #ffffff; color: #475569; border: 1.5px solid #d8dee2; padding: 0.55rem 0.85rem; border-radius: 9px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background .15s ease, border-color .15s ease; }
.btn-decline:hover { background: #f1f5f9; border-color: #c4ccd2; }
.remove-btn { background: #f1f5f9; color: #475569; border: 1px solid #d8dee2; padding: 0.5rem 0.9rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: background .15s ease, border-color .15s ease; }
.remove-btn:hover { background: #e2e8f0; border-color: #c4ccd2; }
.section-description { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; line-height: 1.4; }
.invitations-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 640px) { .invitations-grid { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; } }
@media (min-width: 860px) { .invitations-grid { gap: 1.5rem; } }
.section-description { font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; }
.w-4 { width: 1rem; }
.h-4 { height: 1rem; }
.mt-1 { margin-top: 0.25rem; }
.text-blue-600 { color: #2563eb; }
</style>
