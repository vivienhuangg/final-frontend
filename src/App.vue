<template>
  <div class="app">
    <h1>Travel Planner</h1>
    <p class="subtitle">Collaborative travel planning made easy</p>
    
    <div class="api-status">
      <p>API Base URL: {{ apiBaseUrl }}</p>
      <p>Status: <span :class="apiStatus">{{ apiStatusText }}</span></p>
    </div>

    <div class="demo-section">
      <h2>Quick Demo</h2>
      <div class="demo-controls">
        <button @click="testAuth" :disabled="loading">
          Test Authentication API
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { authService } from './api';
import type { AuthenticateRequest } from './types/api';

const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
});

const loading = ref(false);
const apiStatus = ref<'connected' | 'disconnected' | 'testing'>('disconnected');
const apiStatusText = computed(() => {
  switch (apiStatus.value) {
    case 'connected':
      return 'Connected';
    case 'testing':
      return 'Testing...';
    default:
      return 'Not tested';
  }
});

async function testAuth() {
  loading.value = true;
  apiStatus.value = 'testing';
  
  try {
    // Example: Test authentication (this will fail if backend isn't running, but shows the setup works)
    const testRequest: AuthenticateRequest = {
      username: 'test',
      password: 'test',
    };
    
    await authService.authenticate(testRequest);
    apiStatus.value = 'connected';
  } catch (error) {
    console.error('API test failed (this is expected if backend is not running):', error);
    // Even if it fails, we know the API client is set up correctly
    apiStatus.value = 'disconnected';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #42b983;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.api-status {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
}

.api-status p {
  margin: 0.5rem 0;
  color: #333;
}

.api-status span {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.api-status span.connected {
  color: #42b983;
  background: #e8f5e9;
}

.api-status span.disconnected {
  color: #666;
  background: #f5f5f5;
}

.api-status span.testing {
  color: #ff9800;
  background: #fff3e0;
}

.demo-section {
  width: 100%;
  max-width: 600px;
}

.demo-section h2 {
  color: #333;
  margin-bottom: 1rem;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #35a372;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

