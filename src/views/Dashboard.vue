<template>
  <div class="dashboard">
    <div class="container mx-auto p-6 max-w-6xl">
      <!-- Simplified Header -->
      <div class="flex justify-between items-center mb-8">
        <div class="logo">
          <h1 class="text-2xl font-bold text-[#1e3a5f]">TripSync</h1>
        </div>
        <button class="btn-sign-out" @click="handleLogout">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      <!-- Welcome + Invitations section -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-semibold mb-2 text-[#1e3a5f]">Your Trips</h1>
            <p class="text-muted-foreground">Plan unforgettable adventures with your squad</p>
          </div>
          <button
            v-if="pendingInvitations.length > 0"
            class="btn-primary flex items-center gap-2"
            type="button"
            @click="scrollToInvitations"
          >
            <span class="notification-badge">{{ pendingInvitations.length }}</span>
            <span>View invites</span>
          </button>
        </div>

        <!-- Pending invitations list -->
        <div v-if="pendingInvitations.length > 0" class="invitations-section">
          <div class="section-header">
            <div class="section-title-row">
              <h2 class="text-xl font-semibold text-[#1e3a5f]">Pending Trip Invitations</h2>
              <span class="notification-badge">{{ pendingInvitations.length }}</span>
            </div>
            <p class="text-muted-foreground mt-1">Trips you've been invited to join. Accept to add them to your list.
            </p>
          </div>

          <div class="invitations-grid">
            <div v-for="inv in pendingInvitations" :key="inv.id" class="invitation-card">
              <div class="invitation-card-content">
                <div class="invitation-header">
                  <div>
                    <h3>{{ inv.trip.title }}</h3>
                    <p class="invitation-from">Organized by {{ inv.trip.organizer }}</p>
                    <p class="trip-card-dates mt-1">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ formatDate(inv.trip.startDate) }} - {{ formatDate(inv.trip.endDate) }}</span>
                    </p>
                  </div>
                  <span class="invitation-badge">Invitation</span>
                </div>

                <div class="invitation-actions">
                  <button class="btn-accept" type="button" @click.stop="acceptInvitation(inv.id)">
                    Accept
                  </button>
                  <button class="btn-decline" type="button" @click.stop="declineInvitation(inv.id)">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state" role="status" aria-live="polite">
        <span class="loading-spinner"></span>
        <span>Loading trips...</span>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Create New Trip Card -->
        <div class="trip-card create-card" @click="showNewTripDialog = true">
          <div class="create-card-content">
            <div class="create-icon">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p class="create-text">Create New Trip</p>
            <p class="create-subtext">Start your next adventure</p>
          </div>
        </div>

        <!-- Trip Cards -->
        <div v-for="trip in upcomingTrips" :key="trip.id" class="trip-card" @click="selectTrip(trip.id)">
          <div class="trip-card-gradient"></div>
          <div class="trip-card-delete" @click.stop="selectTrip(trip.id)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div class="trip-card-content-inner">
            <h3 class="trip-card-title">{{ trip.title }}</h3>
            <div class="trip-card-destination">
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ trip.destination }}
            </div>
            <div class="trip-card-dates">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
            </div>
            <div class="trip-card-members">
              <div class="member-avatars">
                <div v-for="(traveler, idx) in trip.travelers.slice(0, 3)" :key="traveler.id" class="member-avatar"
                  :style="{ backgroundColor: getAvatarColor(idx) }">
                  {{ traveler.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <span class="member-count">{{ trip.travelers.length }} {{ trip.travelers.length === 1 ? 'member' :
                'members' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Trip Dialog -->
    <div v-if="showNewTripDialog" class="dialog-overlay" @click="showNewTripDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">Create New Trip</h2>
          <p class="dialog-description">Start planning your next adventure</p>
        </div>
        <form @submit.prevent="createTrip" class="dialog-form">
          <div class="form-group">
            <label for="tripName">Trip Name</label>
            <input id="tripName" v-model="newTrip.title" type="text" required
              placeholder="e.g., Spring Break in Miami" />
          </div>
          <div class="form-group">
            <label for="destination">Destination</label>
            <input id="destination" v-model="newTrip.destination" type="text" required placeholder="e.g., Miami, FL" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input id="startDate" v-model="newTrip.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label for="endDate">End Date</label>
              <input id="endDate" v-model="newTrip.endDate" type="date" :min="newTrip.startDate || undefined"
                required />
            </div>
          </div>
          <div v-if="createError" class="error-message">{{ createError }}</div>
          <button type="submit" class="btn-submit" :disabled="createLoading">
            {{ createLoading ? 'Creating...' : 'Create Trip' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import * as Invitations from "../api/invitations";
import * as Trips from "../api/trips";
import * as Users from "../api/users";
import { useAuth } from "../stores/useAuth";
import type { Trip, TripInvitation } from "../types/trip";
import {
  transformApiInvitationToTripInvitation,
  transformApiTripToTrip,
} from "../utils/dataTransformers";

const emit = defineEmits<{
  (e: "select-trip", trip: Trip): void;
  (e: "logout"): void;
}>();

const router = useRouter();
const { currentUser, getSession } = useAuth();
const trips = ref<Trip[]>([]);
const invitations = ref<TripInvitation[]>([]);
const showInvitations = ref(false);
const showNewTripDialog = ref(false);
const loading = ref(false);
const createLoading = ref(false);
const createError = ref('');
const newTrip = ref({
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
});

watch(
  () => newTrip.value.startDate,
  (startDate) => {
    if (!startDate) return;
    if (newTrip.value.endDate && newTrip.value.endDate < startDate) {
      newTrip.value.endDate = startDate;
    }
  },
);

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAvatarColor(index: number): string {
  const colors = ["#42b983", "#ff7b6b", "#f4c542", "#0ea5e9"];
  return colors[index % colors.length];
}

// Fetch trips and invitations on mount
onMounted(async () => {
  await loadTrips();
  await loadInvitations();
});

async function loadTrips() {
  const session = getSession();
  if (!session) return;

  try {
    loading.value = true;
    const response = await Trips.getMyTrips();

    // Fetch user names for all travelers
    const travelerIds = new Set<string>();
    response.results.forEach(({ trip }) => {
      travelerIds.add(trip.organizer);
      trip.travellers.forEach((id) => travelerIds.add(id));
    });

    const travelerNames = new Map<
      string,
      { firstName?: string; lastName?: string; username: string }
    >();
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
        // User name not set, use username
        travelerNames.set(userId, { username: userId });
      }
    }

    // Transform API trips to component trips
    trips.value = response.results.map(({ trip }) =>
      transformApiTripToTrip(trip, undefined, travelerNames),
    );
  } catch (error: any) {
    console.error("Failed to load trips:", error);
  } finally {
    loading.value = false;
  }
}

async function loadInvitations() {
  const session = getSession();
  if (!session || !currentUser.value) return;

	try {
    const response = await Invitations.getMyInvitations();

		// Fetch trip details for each invitation
		const invitationTrips: TripInvitation[] = [];
		for (const apiInv of response.results) {
      // Only include pending invitations (acceptedStatus === "No")
      if (apiInv.acceptedStatus === "No") {
				try {
					// Get trip details
          const tripResponse = await Trips.getTrip(apiInv.event);

					// Fetch traveler names
					const travelerIds = new Set<string>();
					travelerIds.add(tripResponse.trip.organizer);
					tripResponse.trip.travellers.forEach((id) => travelerIds.add(id));

          const travelerNames = new Map<
            string,
            { firstName?: string; lastName?: string; username: string }
          >();
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

					const trip = transformApiTripToTrip(
						tripResponse.trip,
						undefined,
						travelerNames,
					);
					const invitation = transformApiInvitationToTripInvitation(
						{
							invitation: apiInv.invitation,
							event: apiInv.event,
							accepted: apiInv.acceptedStatus,
						},
						trip,
					);
					invitation.invitee = currentUser.value.id;
					invitationTrips.push(invitation);
				} catch (e) {
					console.warn("Failed to load trip for invitation:", e);
				}
			}
		}

    invitations.value = invitationTrips;
  } catch (error: any) {
    console.error("Failed to load invitations:", error);
  }
}

// Separate trips into upcoming and past
const upcomingTrips = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return trips.value.filter((trip) => {
    const endDate = new Date(trip.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });
});

const pastTrips = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return trips.value.filter((trip) => {
    const endDate = new Date(trip.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  });
});

const pendingInvitations = computed(() => {
  if (!currentUser.value) return [];
  return invitations.value.filter(
    (inv) => inv.invitee === currentUser.value?.id && inv.status === "pending",
  );
});

async function getTravelerName(travelerId: string): Promise<string> {
  const session = getSession();
  if (!session) return travelerId;

  try {
    const nameResponse = await Users.getUserName(travelerId);
    if (nameResponse.firstName && nameResponse.lastName) {
      return `${nameResponse.firstName} ${nameResponse.lastName}`;
    }
    return travelerId;
  } catch (e) {
    return travelerId;
  }
}

async function acceptInvitation(invitationId: string) {
  const session = getSession();
  if (!session) return;

  try {
    await Invitations.acceptInvitation(invitationId);

    // Update local state
    const invitation = invitations.value.find((inv) => inv.id === invitationId);
    if (invitation) {
      invitation.status = "accepted";
      // Reload trips to get updated trip data
      await loadTrips();
    }
  } catch (error: any) {
    console.error("Failed to accept invitation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to accept invitation";
    alert(errorMessage);
  }
}

async function declineInvitation(invitationId: string) {
  const session = getSession();
  if (!session) return;

  try {
    await Invitations.rejectInvitation(invitationId);

    // Update local state
    const invitation = invitations.value.find((inv) => inv.id === invitationId);
    if (invitation) {
      invitation.status = "declined";
    }
  } catch (error: any) {
    console.error("Failed to decline invitation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to decline invitation";
    alert(errorMessage);
  }
}

function scrollToInvitations() {
	const invitationsSection = document.querySelector(".invitations-section");
  if (invitationsSection) {
		invitationsSection.scrollIntoView({ behavior: "smooth", block: "start" });
	}
}

function selectTrip(tripId: string) {
  router.push({ name: 'trip', params: { id: tripId } });
}

function isOrganizer(trip: Trip): boolean {
  // Ensure a strict boolean is returned; previous version returned currentUser.value (object|null) short-circuited with comparison.
  // Using optional chaining yields a pure boolean.
  return trip.organizer === currentUser.value?.id;
}

async function createTrip() {
  const session = getSession();
  if (!session || !currentUser.value) return;

  try {
    createLoading.value = true;
    createError.value = '';
    const response = await Trips.createTrip(
      newTrip.value.title,
      newTrip.value.startDate,
      newTrip.value.endDate,
    );

    // Reload trips to get the new trip with full details
    await loadTrips();

    showNewTripDialog.value = false;
    newTrip.value = { title: "", destination: "", startDate: "", endDate: "" };

    // Navigate to the newly created trip
    router.push({ name: 'trip', params: { id: response.trip } });
  } catch (error: any) {
    console.error("Failed to create trip:", error);
    createError.value = error instanceof Error ? error.message : "Failed to create trip";
  } finally {
    createLoading.value = false;
  }
}

async function handleLogout() {
  const { logout } = useAuth();
  await logout();
  router.push({ name: 'auth' });
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f1ed;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.p-6 {
  padding: 1.5rem;
}

.max-w-6xl {
  max-width: 72rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.mb-8 {
  margin-bottom: 2rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.font-semibold {
  font-weight: 600;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-muted-foreground {
  color: #64748b;
}

.grid {
  display: grid;
}

.gap-6 {
  gap: 1.5rem;
}

.md\:grid-cols-2 {
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.lg\:grid-cols-3 {
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.btn-sign-out {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: 9999px;
  color: #333;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-sign-out:hover {
  background: rgba(255, 255, 255, 0.7);
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.trip-card {
  position: relative;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  height: 280px;
  display: flex;
  flex-direction: column;
  border: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #1e3a5f;
  font-size: 1rem;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: 3px solid rgba(20, 184, 166, 0.2);
  border-top-color: #14b8a6;
  animation: loading-spin 0.8s linear infinite;
}

@keyframes loading-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.trip-card:hover {
  transform: scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.trip-card-gradient {
  height: 6px;
  background: linear-gradient(to right, #14b8a6, #ff7b6b, #f4c542);
}

.trip-card-delete {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  border-radius: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
  cursor: pointer;
}

.trip-card:hover .trip-card-delete {
  opacity: 1;
}

.trip-card-content-inner {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.trip-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 0.5rem;
}

.trip-card-destination {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}

.text-teal-600 {
  color: #0d9488;
}

.trip-card-dates {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.text-blue-600 {
  color: #2563eb;
}

.trip-card-members {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
}

.member-avatars {
  display: flex;
  gap: -0.5rem;
}

.member-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid white;
  margin-left: -0.5rem;
}

.member-avatar:first-child {
  margin-left: 0;
}

.member-count {
  font-size: 0.875rem;
  color: #64748b;
}

.create-card {
  border: 2px dashed rgba(255, 123, 107, 0.4);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-card:hover {
  border-color: #ff7b6b;
  background: rgba(255, 255, 255, 0.8);
}

.create-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.create-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: #ff7b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.create-card:hover .create-icon {
  transform: rotate(12deg);
}

.create-text {
  font-weight: 500;
  font-size: 1.125rem;
  color: #1e3a5f;
  margin-bottom: 0.25rem;
}

.create-subtext {
  font-size: 0.875rem;
  color: #64748b;
}

.trip-card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #e0e0e0;
  position: relative;
}

.trip-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.countdown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 1rem;
  pointer-events: none;
}

.countdown-overlay.past {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2));
}

.countdown-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 80px;
}

.countdown-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.countdown-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #42b983;
  line-height: 1;
}

.countdown-overlay.past .countdown-value {
  color: #888;
}

.countdown-unit {
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
}

.trip-card-content {
  padding: 1.5rem;
}

.trip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.trip-card-content h3 {
  font-size: 1.25rem;
  color: #333;
  flex: 1;
}

.organizer-badge {
  background: #e8f5e9;
  color: #42b983;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.trip-destination {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.trip-dates {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.trip-travelers {
  color: #42b983;
  font-size: 0.85rem;
  font-weight: 500;
}

.past-trip {
  opacity: 0.75;
}

.past-trip:hover {
  opacity: 0.9;
}

.invitations-section {
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-badge {
  background: #d32f2f;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.invitations-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.invitation-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #42b983;
  position: relative;
  width: 100%;
}

.invitation-card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #e0e0e0;
  position: relative;
}

.invitation-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.invitation-card-content {
  padding: 1.5rem;
}

.invitation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.invitation-header h3 {
  font-size: 1.25rem;
  color: #333;
  flex: 1;
}

.invitation-from {
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.invitation-badge {
  background: #42b983;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.invitation-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-accept {
  flex: 1;
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-accept:hover {
  background: #35a372;
}

.btn-decline {
  flex: 1;
  background: white;
  color: #666;
  border: 1.5px solid #e0e0e0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-decline:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #888;
}

.btn-primary {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #35a372;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.actions-row { display: flex; align-items: center; gap: 0.75rem; }

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dialog-header {
  margin-bottom: 1.5rem;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 0.5rem;
}

.dialog-description {
  color: #64748b;
  font-size: 0.875rem;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e3a5f;
}

.form-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #faf8f6;
}

.form-group input:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  padding: 0.5rem;
  background: #fee;
  border-radius: 0.375rem;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #0d9488;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
