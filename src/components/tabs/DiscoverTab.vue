<template>
  <div class="discover-tab">
    <div class="discover-header">
      <h2>Discover Experiences</h2>
      <p class="subtitle">Find activities and events in {{ destination }}</p>
    </div>

    <div class="source-toggles">
      <button
        :class="['toggle', { active: activeSource === 'airbnb' }]"
        @click="activeSource = 'airbnb'"
      >
        Airbnb Experiences
      </button>
      <button
        :class="['toggle', { active: activeSource === 'eventbrite' }]"
        @click="activeSource = 'eventbrite'"
      >
        Eventbrite Events
      </button>
    </div>

    <div class="experiences-grid">
      <div
        v-for="experience in filteredExperiences"
        :key="experience.id"
        class="experience-card"
      >
        <div class="experience-image" v-if="experience.image">
          <img :src="experience.image" :alt="experience.title" />
        </div>
        <div class="experience-content">
          <h3>{{ experience.title }}</h3>
          <div class="experience-details">
            <p v-if="experience.location">
              <span class="detail-label">📍</span> {{ experience.location }}
            </p>
            <p v-if="experience.duration">
              <span class="detail-label">⏱</span> {{ experience.duration }}
            </p>
            <p v-if="experience.groupSize">
              <span class="detail-label">👥</span> {{ experience.groupSize }}
            </p>
            <p v-if="experience.pricePerPerson">
              <span class="detail-label">💰</span> ${{ experience.pricePerPerson }}/person
            </p>
          </div>
          <button class="btn-add" @click="addToTrip(experience)">
            Add to Trip
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ActivityWithDetails } from '../../types/trip';

const props = defineProps<{
  destination: string;
  tripId?: string;
}>();

const emit = defineEmits<{
  (e: 'add-activity', activity: ActivityWithDetails): void;
}>();

const activeSource = ref<'airbnb' | 'eventbrite'>('airbnb');

// Mock experiences data
const experiences = ref([
  {
    id: '1',
    title: 'Art Deco Walking Tour',
    location: 'South Beach',
    duration: '2 hours',
    groupSize: 'Up to 12',
    pricePerPerson: 35,
    source: 'airbnb' as const,
    image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=400&h=250&fit=crop',
  },
  {
    id: '2',
    title: 'Sunset Sailing Experience',
    location: 'Biscayne Bay',
    duration: '3 hours',
    groupSize: 'Up to 8',
    pricePerPerson: 65,
    source: 'airbnb' as const,
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=250&fit=crop',
  },
  {
    id: '3',
    title: 'Wynwood Street Art Tour',
    location: 'Wynwood',
    duration: '2.5 hours',
    groupSize: 'Up to 15',
    pricePerPerson: 28,
    source: 'airbnb' as const,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop',
  },
  {
    id: '4',
    title: 'Miami Food Festival',
    location: 'Downtown Miami',
    duration: '4 hours',
    groupSize: 'Up to 100',
    pricePerPerson: 45,
    source: 'eventbrite' as const,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop',
  },
  {
    id: '5',
    title: 'Beach Volleyball Tournament',
    location: 'South Beach',
    duration: '3 hours',
    groupSize: 'Up to 24',
    pricePerPerson: 20,
    source: 'eventbrite' as const,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop',
  },
]);

const filteredExperiences = computed(() => {
  return experiences.value.filter(e => e.source === activeSource.value);
});

function addToTrip(experience: any) {
  const activity: ActivityWithDetails = {
    id: Date.now().toString(),
    title: experience.title,
    event: props.tripId || '1', // Trip ID
    start: new Date().toISOString(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    cost: experience.pricePerPerson || 0,
    location: experience.location,
    duration: experience.duration,
    groupSize: experience.groupSize,
    pricePerPerson: experience.pricePerPerson,
    source: 'discover',
    rating: 0,
    votes: 0,
  };
  emit('add-activity', activity);
}
</script>

<style scoped>
.discover-tab {
  width: 100%;
}

.discover-header {
  margin-bottom: 2rem;
}

.discover-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1rem;
}

.source-toggles {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.toggle {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle:hover {
  border-color: #42b983;
  color: #42b983;
}

.toggle.active {
  background: #42b983;
  border-color: #42b983;
  color: white;
}

.experiences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.experience-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.experience-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.experience-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #e0e0e0;
}

.experience-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.experience-content {
  padding: 1.5rem;
}

.experience-content h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}

.experience-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.experience-details p {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-label {
  font-size: 1rem;
}

.btn-add {
  width: 100%;
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #35a372;
}
</style>

