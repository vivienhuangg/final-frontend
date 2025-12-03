<template>
  <div class="discover-tab">
    <div class="placeholder-container">
      <div class="placeholder-icon">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h2 class="placeholder-title">Discover Tab</h2>
      <p class="placeholder-message">This feature will not be implemented for the alpha checkpoint.</p>
      <p class="placeholder-description">
        This tab would typically show personalized recommendations for activities, restaurants, and attractions based on your travel preferences.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tripId: string;
}>();
</script>

<style scoped>
.discover-tab {
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-container {
  text-align: center;
  max-width: 500px;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.placeholder-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}

.placeholder-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 1rem;
}

.placeholder-message {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1rem;
  font-weight: 500;
}

.placeholder-description {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.5;
}
</style>
