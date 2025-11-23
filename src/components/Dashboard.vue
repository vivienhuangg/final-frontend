<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div>
          <h1>TripSync</h1>
          <p class="subtitle">Collaborative travel planning made easy</p>
        </div>
        <div class="user-section">
          <div class="user-info" v-if="currentUser">
            <span class="user-name">
              {{ currentUser.firstName || currentUser.username }}
            </span>
          </div>
          <div class="notification-bell" v-if="pendingInvitations.length > 0" @click="scrollToInvitations">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="notification-count">{{ pendingInvitations.length }}</span>
          </div>
          <button class="btn-secondary" @click="handleLogout">Logout</button>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <!-- Notifications/Invitations Section -->
      <div v-if="pendingInvitations.length > 0" class="invitations-section">
        <div class="section-header">
          <div class="section-title-row">
            <h2>Invitations</h2>
            <span class="notification-badge">{{ pendingInvitations.length }}</span>
          </div>
        </div>
        <div class="invitations-grid">
          <div
            v-for="invitation in pendingInvitations"
            :key="invitation.id"
            class="invitation-card"
          >
            <div class="invitation-card-image" v-if="invitation.trip.headerImage">
              <img :src="invitation.trip.headerImage" :alt="invitation.trip.title" />
              <div class="countdown-overlay">
                <div class="countdown-content">
                  <span class="countdown-label">{{ getCountdownLabel(invitation.trip) }}</span>
                  <span class="countdown-value">{{ getDaysUntilTrip(invitation.trip) }}</span>
                  <span class="countdown-unit">{{ getDaysUntilTrip(invitation.trip) === 1 ? 'day' : 'days' }}</span>
                </div>
              </div>
            </div>
            <div class="invitation-card-content">
              <div class="invitation-header">
                <div>
                  <h3>{{ invitation.trip.title }}</h3>
                  <p class="invitation-from">
                    Invited by {{ getTravelerName(invitation.inviter) }}
                  </p>
                </div>
                <span class="invitation-badge">New</span>
              </div>
              <p class="trip-destination">{{ invitation.trip.destination }}</p>
              <p class="trip-dates">
                {{ formatDate(invitation.trip.startDate) }} – {{ formatDate(invitation.trip.endDate) }}
              </p>
              <div class="invitation-actions">
                <button class="btn-accept" @click.stop="acceptInvitation(invitation.id)">
                  Accept
                </button>
                <button class="btn-decline" @click.stop="declineInvitation(invitation.id)">
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Trips Section -->
      <div class="trips-section">
        <div class="trips-header">
          <h2>Upcoming Trips</h2>
          <button class="btn-primary" @click="showNewTripDialog = true">
            + New Trip
          </button>
        </div>

        <div class="trips-grid" v-if="upcomingTrips.length > 0">
          <div
            v-for="trip in upcomingTrips"
            :key="trip.id"
            class="trip-card"
            @click="selectTrip(trip.id)"
          >
            <div class="trip-card-image" v-if="trip.headerImage">
              <img :src="trip.headerImage" :alt="trip.title" />
              <div class="countdown-overlay">
                <div class="countdown-content">
                  <span class="countdown-label">{{ getCountdownLabel(trip) }}</span>
                  <span class="countdown-value">{{ getDaysUntilTrip(trip) }}</span>
                  <span class="countdown-unit">{{ getDaysUntilTrip(trip) === 1 ? 'day' : 'days' }}</span>
                </div>
              </div>
            </div>
            <div class="trip-card-content">
              <div class="trip-card-header">
                <h3>{{ trip.title }}</h3>
                <span v-if="isOrganizer(trip)" class="organizer-badge">Organizer</span>
              </div>
              <p class="trip-destination">{{ trip.destination }}</p>
              <p class="trip-dates">
                {{ formatDate(trip.startDate) }} – {{ formatDate(trip.endDate) }}
              </p>
              <p class="trip-travelers">{{ trip.travelers.length }} travelers</p>
            </div>
          </div>
        </div>

        <div v-else-if="pendingInvitations.length === 0" class="empty-state">
          <p>No upcoming trips. Create your first trip to get started!</p>
        </div>
      </div>

      <!-- Past Trips Section -->
      <div v-if="pastTrips.length > 0" class="trips-section">
        <div class="trips-header">
          <h2>Past Trips</h2>
        </div>

        <div class="trips-grid">
          <div
            v-for="trip in pastTrips"
            :key="trip.id"
            class="trip-card past-trip"
            @click="selectTrip(trip.id)"
          >
            <div class="trip-card-image" v-if="trip.headerImage">
              <img :src="trip.headerImage" :alt="trip.title" />
              <div class="countdown-overlay past">
                <div class="countdown-content">
                  <span class="countdown-label">Ended</span>
                  <span class="countdown-value">{{ getDaysSinceTrip(trip) }}</span>
                  <span class="countdown-unit">{{ getDaysSinceTrip(trip) === 1 ? 'day' : 'days' }} ago</span>
                </div>
              </div>
            </div>
            <div class="trip-card-content">
              <div class="trip-card-header">
                <h3>{{ trip.title }}</h3>
                <span v-if="isOrganizer(trip)" class="organizer-badge">Organizer</span>
              </div>
              <p class="trip-destination">{{ trip.destination }}</p>
              <p class="trip-dates">
                {{ formatDate(trip.startDate) }} – {{ formatDate(trip.endDate) }}
              </p>
              <p class="trip-travelers">{{ trip.travelers.length }} travelers</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Trip Dialog -->
    <div v-if="showNewTripDialog" class="dialog-overlay" @click="showNewTripDialog = false">
      <div class="dialog" @click.stop>
        <h2>Create New Trip</h2>
        <form @submit.prevent="createTrip">
          <div class="form-group">
            <label>Trip Name</label>
            <input v-model="newTrip.title" type="text" required placeholder="e.g., Spring Break Miami" />
          </div>
          <div class="form-group">
            <label>Destination</label>
            <input v-model="newTrip.destination" type="text" required placeholder="e.g., Miami, FL" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date</label>
              <input v-model="newTrip.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input v-model="newTrip.endDate" type="date" required />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showNewTripDialog = false">
              Cancel
            </button>
            <button type="submit" class="btn-primary">Create Trip</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { mockTrips, mockTripInvitations, mockTravelers } from '../data/mockData';
import type { Trip, TripInvitation } from '../types/trip';

const emit = defineEmits<{
  (e: 'select-trip', tripId: string): void;
  (e: 'logout'): void;
}>();

const { currentUser } = useAuth();
const trips = ref<Trip[]>([...mockTrips]);
const invitations = ref<TripInvitation[]>([...mockTripInvitations]);
const showNewTripDialog = ref(false);
const newTrip = ref({
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
});

// Separate trips into upcoming and past
const upcomingTrips = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return trips.value.filter(trip => {
    const endDate = new Date(trip.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });
});

const pastTrips = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return trips.value.filter(trip => {
    const endDate = new Date(trip.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  });
});

const pendingInvitations = computed(() => {
  if (!currentUser.value) return [];
  return invitations.value.filter(inv => 
    inv.invitee === currentUser.value?.id && inv.status === 'pending'
  );
});

function getTravelerName(travelerId: string): string {
  const traveler = mockTravelers.find(t => t.id === travelerId);
  return traveler?.name || 'Unknown';
}

function acceptInvitation(invitationId: string) {
  const invitation = invitations.value.find(inv => inv.id === invitationId);
  if (invitation) {
    invitation.status = 'accepted';
    // Add user to trip travelers
    if (currentUser.value && !invitation.trip.travelers.some(t => t.id === currentUser.value?.id)) {
      invitation.trip.travelers.push({
        id: currentUser.value.id,
        name: currentUser.value.firstName && currentUser.value.lastName
          ? `${currentUser.value.firstName} ${currentUser.value.lastName}`
          : currentUser.value.username,
        email: `${currentUser.value.username}@example.com`,
        firstName: currentUser.value.firstName,
        lastName: currentUser.value.lastName,
      });
    }
    // Add trip to trips list
    trips.value.push(invitation.trip);
  }
}

function declineInvitation(invitationId: string) {
  const invitation = invitations.value.find(inv => inv.id === invitationId);
  if (invitation) {
    invitation.status = 'declined';
  }
}

function scrollToInvitations() {
  const invitationsSection = document.querySelector('.invitations-section');
  if (invitationsSection) {
    invitationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function getDaysUntilTrip(trip: Trip): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(trip.startDate);
  startDate.setHours(0, 0, 0, 0);
  const diffTime = startDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function getDaysSinceTrip(trip: Trip): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(trip.endDate);
  endDate.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - endDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function getCountdownLabel(trip: Trip): string {
  const days = getDaysUntilTrip(trip);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return 'In';
  return 'In';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function selectTrip(tripId: string) {
  emit('select-trip', tripId);
}

function isOrganizer(trip: Trip): boolean {
  return currentUser.value && trip.organizer === currentUser.value.id;
}

function createTrip() {
  if (!currentUser.value) return;
  
  const trip: Trip = {
    id: Date.now().toString(),
    title: newTrip.value.title,
    destination: newTrip.value.destination,
    startDate: newTrip.value.startDate,
    endDate: newTrip.value.endDate,
    organizer: currentUser.value.id,
    travelers: [{
      id: currentUser.value.id,
      name: currentUser.value.firstName && currentUser.value.lastName
        ? `${currentUser.value.firstName} ${currentUser.value.lastName}`
        : currentUser.value.username,
      email: `${currentUser.value.username}@example.com`,
      firstName: currentUser.value.firstName,
      lastName: currentUser.value.lastName,
    }],
  };
  trips.value.push(trip);
  showNewTripDialog.value = false;
  newTrip.value = { title: '', destination: '', startDate: '', endDate: '' };
  selectTrip(trip.id);
}

function handleLogout() {
  emit('logout');
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-header {
  background: white;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #42b983;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
  color: #666;
}

.notification-bell:hover {
  background: #f0f0f0;
  color: #333;
}

.notification-count {
  position: absolute;
  top: 0;
  right: 0;
  background: #d32f2f;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  border: 2px solid white;
}

.dashboard-content {
  width: 100%;
  padding: 2rem;
}

.trips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.trips-header h2 {
  font-size: 1.5rem;
  color: #333;
}

.trips-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.trip-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
}

.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>
