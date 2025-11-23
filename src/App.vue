<template>
  <div class="app">
    <LoginPage
      v-if="!isAuthenticated"
      @authenticated="handleAuthenticated"
    />
    <div v-else class="app-content">
      <Dashboard
        v-if="!selectedTripId"
        @select-trip="handleSelectTrip"
        @logout="handleLogout"
      />
      <TripView
        v-else
        :trip="selectedTrip"
        @back="handleBack"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import LoginPage from './components/LoginPage.vue';
import Dashboard from './components/Dashboard.vue';
import TripView from './components/TripView.vue';
import { useAuth } from './composables/useAuth';
import { mockTrips } from './data/mockData';
import type { Trip } from './types/trip';

const { isAuthenticated, initializeAuth } = useAuth();
const trips = ref<Trip[]>([...mockTrips]);
const selectedTripId = ref<string | null>(null);

const selectedTrip = computed(() => {
  if (!selectedTripId.value) return null;
  return trips.value.find(t => t.id === selectedTripId.value) || null;
});

onMounted(() => {
  initializeAuth();
});

function handleAuthenticated() {
  // User is now authenticated, app will show dashboard
}

function handleSelectTrip(tripId: string) {
  selectedTripId.value = tripId;
}

function handleBack() {
  selectedTripId.value = null;
}

function handleLogout() {
  const { logout } = useAuth();
  logout();
  selectedTripId.value = null;
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f5f5f5;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app {
  width: 100%;
  min-height: 100vh;
}

.app-content {
  width: 100%;
  min-height: 100vh;
}
</style>
