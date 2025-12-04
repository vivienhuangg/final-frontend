<template>
  <div class="app">
    <router-view />
    <!-- Global Help Widget -->
    <HelpWidget />
    <!-- Global Notification Button -->
    <NotificationButton v-if="isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import HelpWidget from './components/HelpWidget.vue';
import NotificationButton from './components/NotificationButton.vue';
import { onMounted, computed } from 'vue';
import { useAuth } from './stores/useAuth';

const { initializeAuth, isAuthenticated } = useAuth();

onMounted(() => {
  initializeAuth();
});
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
