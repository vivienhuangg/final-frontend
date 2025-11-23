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
          <button class="btn-secondary" @click="handleLogout">Logout</button>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="trips-section">
        <div class="trips-header">
          <h2>My Trips</h2>
          <button class="btn-primary" @click="showNewTripDialog = true">
            + New Trip
          </button>
        </div>

        <div class="trips-grid" v-if="trips.length > 0">
          <div
            v-for="trip in trips"
            :key="trip.id"
            class="trip-card"
            @click="selectTrip(trip.id)"
          >
            <div class="trip-card-image" v-if="trip.headerImage">
              <img :src="trip.headerImage" :alt="trip.title" />
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

        <div v-else class="empty-state">
          <p>No trips yet. Create your first trip to get started!</p>
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
import { mockTrips } from '../data/mockData';
import type { Trip } from '../types/trip';

const emit = defineEmits<{
  (e: 'select-trip', tripId: string): void;
  (e: 'logout'): void;
}>();

const { currentUser } = useAuth();
const trips = ref<Trip[]>([...mockTrips]);
const showNewTripDialog = ref(false);
const newTrip = ref({
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
});

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
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
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

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.trip-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
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
}

.trip-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
