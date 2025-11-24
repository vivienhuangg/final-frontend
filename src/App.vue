<template>
  <div class="app">
    <LoginPage
      v-if="!isAuthenticated"
      @authenticated="handleAuthenticated"
    />
    <div v-else class="app-content">
      <Dashboard
        v-if="!selectedTrip"
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
import { ref, onMounted } from 'vue';
import LoginPage from './views/LoginPage.vue';
import Dashboard from './views/Dashboard.vue';
import TripView from './components/TripView.vue';
import { useAuth } from './stores/useAuth';
import type { Trip } from './types/trip';

const { isAuthenticated, initializeAuth, logout } = useAuth();
const selectedTrip = ref<Trip | null>(null);

onMounted(() => {
  initializeAuth();
});

function handleAuthenticated() {
  // User is now authenticated, app will show dashboard
}

function handleSelectTrip(trip: Trip) {
  selectedTrip.value = trip;
}

function handleBack() {
  selectedTrip.value = null;
}

function handleLogout() {
  logout();
  selectedTrip.value = null;
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
