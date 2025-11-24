<template>
  <div class="attractions-tab">
    <div class="space-y-6">
      <!-- Header Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Attractions & Activities</h2>
            <p class="card-description">Submit ideas and vote on what to do</p>
          </div>
          <div class="header-actions">
            <div class="personal-view-toggle">
              <label for="personal-view" class="toggle-label">Personal View</label>
              <label class="switch">
                <input
                  id="personal-view"
                  type="checkbox"
                  v-model="showPersonalView"
                />
                <span class="slider"></span>
              </label>
            </div>
            <button class="btn-add-attraction" @click="showAddDialog = true">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Attraction
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredAttractions.length === 0" class="card">
        <div class="empty-state">
          <svg v-if="attractions.length === 0" class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <svg v-else class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p v-if="attractions.length === 0">No attractions yet. Be the first to suggest one!</p>
          <p v-else>You haven't opted in to any activities yet</p>
          <p v-if="showPersonalView && attractions.length > 0" class="empty-hint">
            Toggle the "Personal View" switch off to see all activities
          </p>
        </div>
      </div>

      <!-- Attractions List -->
      <div v-else class="attractions-list">
        <div
          v-for="attraction in filteredAttractions"
          :key="attraction.id"
          class="attraction-card"
          :class="{ 'opted-in': isOptedIn(attraction.id) }"
        >
          <div class="card-gradient"></div>
          <div class="card-header-inner">
            <div class="card-title-section">
              <div class="title-row">
                <h3 class="attraction-title">{{ attraction.name }}</h3>
                <div class="badges">
                  <span v-if="attraction.isHiddenGem" class="badge hidden-gem">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Hidden Gem
                  </span>
                  <span v-if="isOptedIn(attraction.id)" class="badge opted-in-badge">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    You're In!
                  </span>
                </div>
              </div>
              <p class="attraction-description">{{ attraction.description }}</p>
            </div>
            <div class="score-section">
              <div class="score-display">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span class="score-value">{{ getAverageScore(attraction.id).toFixed(1) }}</span>
              </div>
              <p class="votes-count">{{ getVoteCount(attraction.id) }} votes</p>
              <div v-if="getOptedInCount(attraction.id) > 0" class="opted-in-count">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ getOptedInCount(attraction.id) }} opted in</span>
              </div>
            </div>
          </div>
          <div class="card-content">
            <!-- Date/Time Info -->
            <div v-if="attraction.date || attraction.time" class="datetime-info">
              <div v-if="attraction.date" class="datetime-item">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatDate(attraction.date) }}</span>
              </div>
              <div v-if="attraction.time || attraction.endTime" class="datetime-item">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ formatTime(attraction.time, attraction.endTime) }}</span>
              </div>
            </div>

            <!-- Suggested By & Cost/Duration -->
            <div class="attraction-meta">
              <div class="suggested-by">
                <div class="avatar-small">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Suggested by {{ getSubmitterName(attraction.addedBy) }}</span>
              </div>
              <div class="cost-duration">
                <span v-if="attraction.estimatedCost > 0" class="badge cost-badge">
                  ${{ attraction.estimatedCost.toFixed(2) }} per person
                </span>
                <span v-if="attraction.estimatedDuration" class="badge duration-badge">
                  {{ attraction.estimatedDuration }}
                </span>
              </div>
            </div>

            <!-- Rating Slider -->
            <div class="rating-section">
              <div class="rating-header">
                <label class="rating-label">Your Rating</label>
                <div class="rating-display">
                  <svg class="w-4 h-4 text-yellow-500 fill-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{{ getUserRating(attraction.id) }}/10</span>
                </div>
              </div>
              <input
                type="range"
                :min="0"
                :max="10"
                :step="1"
                :value="getUserRating(attraction.id)"
                @input="handleRatingChange(attraction.id, parseInt(($event.target as HTMLInputElement).value))"
                class="rating-slider"
              />
            </div>

            <!-- Opt-in Switch -->
            <div class="opt-in-section">
              <label :for="`opt-in-${attraction.id}`" class="opt-in-label">
                {{ isOptedIn(attraction.id) ? "I'm attending this activity" : "Opt in to this activity" }}
              </label>
              <label class="switch">
                <input
                  :id="`opt-in-${attraction.id}`"
                  type="checkbox"
                  :checked="isOptedIn(attraction.id)"
                  @change="handleToggleOptIn(attraction.id)"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Save Rankings Button -->
        <button v-if="!showPersonalView && hasUnsavedRatings" class="btn-save-rankings" @click="handleSaveRankings">
          Save Rankings
        </button>
      </div>
    </div>

    <!-- Add Attraction Dialog -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="showAddDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">Add Attraction</h2>
          <p class="dialog-description">Suggest a place or activity for the group</p>
        </div>
        <form @submit.prevent="handleAddAttraction" class="dialog-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              id="name"
              v-model="newAttraction.name"
              type="text"
              required
              placeholder="e.g., South Beach"
            />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="newAttraction.description"
              placeholder="Why should we go here?"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="cost">Estimated Cost per Person ($)</label>
            <input
              id="cost"
              v-model.number="newAttraction.estimatedCost"
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="date">Date</label>
              <input
                id="date"
                v-model="newAttraction.date"
                type="date"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="time">Start Time</label>
              <input
                id="time"
                v-model="newAttraction.time"
                type="time"
              />
            </div>
            <div class="form-group">
              <label for="endTime">End Time</label>
              <input
                id="endTime"
                v-model="newAttraction.endTime"
                type="time"
              />
            </div>
          </div>
          <button type="submit" class="btn-submit">Add Attraction</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '../../stores/useAuth';
import { activityApi, ratingApi } from '../../services/api';
import type { ActivityWithDetails, Traveler } from '../../types/trip';

const props = defineProps<{
  activities: ActivityWithDetails[];
  travelers: Traveler[];
  tripId: string;
}>();

const emit = defineEmits<{
  (e: 'rate', activityId: string, rating: number): void;
  (e: 'toggle-attendance', activityId: string, travelerId: string): void;
  (e: 'add-activity', activity: ActivityWithDetails): void;
  (e: 'delete-activity', activityId: string): void;
}>();

const { currentUser, getSession } = useAuth();
const currentUserId = computed(() => currentUser.value?.id || '');

// State
const showPersonalView = ref(false);
const showAddDialog = ref(false);
const userRatings = ref<Record<string, number>>({});
const ratings = ref<Record<string, { user: string; ratingNum: number; rating: string }[]>>({});
const optedInAttractions = ref<Set<string>>(new Set());
const unsavedRatings = ref<Set<string>>(new Set());

// Map activities to attractions format
const attractions = computed(() => {
  return props.activities.map(activity => ({
    id: activity.id,
    name: activity.title,
    description: activity.description || '',
    estimatedCost: activity.cost || 0,
    estimatedDuration: activity.duration || '',
    date: activity.start ? new Date(activity.start).toISOString().split('T')[0] : '',
    time: activity.start ? new Date(activity.start).toTimeString().slice(0, 5) : '',
    endTime: activity.end ? new Date(activity.end).toTimeString().slice(0, 5) : '',
    addedBy: activity.attendees?.[0] || currentUserId.value,
    isHiddenGem: false, // Could be determined by rating/attendance ratio
  }));
});

const filteredAttractions = computed(() => {
  if (showPersonalView.value) {
    return attractions.value.filter(attr => optedInAttractions.value.has(attr.id));
  }
  return attractions.value;
});

// Load ratings for all activities
async function loadRatings() {
  const session = getSession();
  if (!session) return;

  try {
    for (const activity of props.activities) {
      try {
        const response = await ratingApi.getRatingsByItem({ item: activity.id });
        ratings.value[activity.id] = response.results || [];
        
        // Find current user's rating
        const userRating = response.results.find(r => r.user === currentUserId.value);
        if (userRating) {
          userRatings.value[activity.id] = userRating.ratingNum;
        }
      } catch (e) {
        console.warn('Failed to load ratings for activity:', activity.id, e);
      }
    }
  } catch (error) {
    console.error('Error loading ratings:', error);
  }
}

// Initialize opted-in attractions from activities
function initializeOptedIn() {
  props.activities.forEach(activity => {
    if (activity.attendees?.includes(currentUserId.value)) {
      optedInAttractions.value.add(activity.id);
    }
  });
}

onMounted(() => {
  loadRatings();
  initializeOptedIn();
});

watch(() => props.activities, () => {
  loadRatings();
  initializeOptedIn();
}, { deep: true });

// Helper functions
function getAverageScore(activityId: string): number {
  const activityRatings = ratings.value[activityId] || [];
  if (activityRatings.length === 0) return 0;
  const sum = activityRatings.reduce((acc, r) => acc + r.ratingNum, 0);
  return sum / activityRatings.length;
}

function getVoteCount(activityId: string): number {
  return (ratings.value[activityId] || []).length;
}

function getOptedInCount(activityId: string): number {
  const activity = props.activities.find(a => a.id === activityId);
  return activity?.attendees?.length || 0;
}

function getUserRating(activityId: string): number {
  return userRatings.value[activityId] || 5;
}

function isOptedIn(activityId: string): boolean {
  return optedInAttractions.value.has(activityId);
}

function getSubmitterName(userId: string): string {
  const traveler = props.travelers.find(t => t.id === userId);
  return traveler?.name || 'Unknown';
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTime(startTime?: string, endTime?: string): string {
  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }
  return startTime || endTime || '';
}

// Handlers
async function handleRatingChange(activityId: string, rating: number) {
  userRatings.value[activityId] = rating;
  unsavedRatings.value.add(activityId);
}

async function handleSaveRankings() {
  const session = getSession();
  if (!session) return;

  try {
    for (const activityId of unsavedRatings.value) {
      const rating = userRatings.value[activityId];
      if (!rating) continue;

      try {
        // Try to get existing rating first
        const existingRatings = ratings.value[activityId] || [];
        const existingRating = existingRatings.find(r => r.user === currentUserId.value);

        if (existingRating) {
          // Update existing rating
          await ratingApi.changeRating({
            rating: existingRating.rating,
            ratingNum: rating,
          });
        } else {
          // Create new rating
          await ratingApi.addRating({
            item: activityId,
            ratingNum: rating,
          });
        }

        // Reload ratings for this activity
        const response = await ratingApi.getRatingsByItem({ item: activityId });
        ratings.value[activityId] = response.results || [];
      } catch (error) {
        console.error(`Failed to save rating for ${activityId}:`, error);
      }
    }

    unsavedRatings.value.clear();
    emit('rate', '', 0); // Trigger parent refresh if needed
  } catch (error) {
    console.error('Error saving rankings:', error);
  }
}

const hasUnsavedRatings = computed(() => unsavedRatings.value.size > 0);

async function handleToggleOptIn(activityId: string) {
  if (optedInAttractions.value.has(activityId)) {
    optedInAttractions.value.delete(activityId);
  } else {
    optedInAttractions.value.add(activityId);
  }
  emit('toggle-attendance', activityId, currentUserId.value);
}

async function handleAddAttraction() {
  const session = getSession();
  if (!session) return;

  try {
    // Convert date and time to datetime strings
    let startDateTime = '';
    let endDateTime = '';
    
    if (newAttraction.value.date) {
      if (newAttraction.value.time) {
        startDateTime = `${newAttraction.value.date}T${newAttraction.value.time}:00`;
      } else {
        startDateTime = `${newAttraction.value.date}T00:00:00`;
      }
      
      if (newAttraction.value.endTime) {
        endDateTime = `${newAttraction.value.date}T${newAttraction.value.endTime}:00`;
      } else if (newAttraction.value.time) {
        // Default to 2 hours after start if no end time
        const start = new Date(startDateTime);
        start.setHours(start.getHours() + 2);
        endDateTime = start.toISOString();
      } else {
        endDateTime = `${newAttraction.value.date}T23:59:59`;
      }
    } else {
      // Default to now if no date provided
      const now = new Date();
      startDateTime = now.toISOString();
      const end = new Date(now);
      end.setHours(end.getHours() + 2);
      endDateTime = end.toISOString();
    }

    const activity: ActivityWithDetails = {
      id: '', // Will be set by API
      title: newAttraction.value.name,
      description: newAttraction.value.description,
      event: props.tripId,
      start: startDateTime,
      end: endDateTime,
      cost: newAttraction.value.estimatedCost || 0,
      location: '',
      duration: newAttraction.value.estimatedDuration,
      pricePerPerson: newAttraction.value.estimatedCost,
      source: 'manual',
      rating: 0,
      votes: 0,
      attendees: [currentUserId.value],
    };

    emit('add-activity', activity);
    
    // Reset form
    newAttraction.value = {
      name: '',
      description: '',
      estimatedCost: 0,
      estimatedDuration: '',
      date: '',
      time: '',
      endTime: '',
    };
    
    showAddDialog.value = false;
  } catch (error) {
    console.error('Error adding attraction:', error);
  }
}

const newAttraction = ref({
  name: '',
  description: '',
  estimatedCost: 0,
  estimatedDuration: '',
  date: '',
  time: '',
  endTime: '',
});
</script>

<style scoped>
.attractions-tab {
  width: 100%;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.card {
  position: relative;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  padding-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 0.25rem;
}

.card-description {
  font-size: 0.875rem;
  color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.personal-view-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-label {
  font-size: 0.875rem;
  color: #1e3a5f;
  font-weight: 500;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #14b8a6;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.btn-add-attraction {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #ff7b6b;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.btn-add-attraction:hover {
  background: #ff6859;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.w-3 {
  width: 0.75rem;
}

.h-3 {
  height: 0.75rem;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.text-blue-600 {
  color: #2563eb;
}

.text-yellow-500 {
  color: #eab308;
}

.text-blue-500 {
  color: #3b82f6;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #64748b;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 0.75rem;
  opacity: 0.2;
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 0.25rem;
  color: #94a3b8;
}

.attractions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attraction-card {
  position: relative;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border: 0;
}

.attraction-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: scale(1.01);
}

.attraction-card.opted-in {
  box-shadow: 0 0 0 2px #14b8a6;
}

.card-gradient {
  height: 6px;
  background: linear-gradient(to right, #14b8a6, #ff7b6b, #f4c542);
}

.card-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  padding-bottom: 1rem;
}

.card-title-section {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.attraction-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a5f;
}

.badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.hidden-gem {
  background: rgba(244, 197, 66, 0.2);
  color: #d4af37;
  border: 1px solid rgba(244, 197, 66, 0.4);
}

.badge.opted-in-badge {
  background: rgba(20, 184, 166, 0.2);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}

.badge.cost-badge {
  background: linear-gradient(to right, #f0fdf4, #d1fae5);
  color: #15803d;
  border: 1px solid #86efac;
}

.badge.duration-badge {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.attraction-description {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.score-section {
  text-align: right;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  background: linear-gradient(to bottom right, #dbeafe, #cffafe);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e3a5f;
}

.votes-count {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.opted-in-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #14b8a6;
  margin-top: 0.25rem;
}

.card-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datetime-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(123, 163, 209, 0.1);
  border-radius: 0.75rem;
  flex-wrap: wrap;
}

.datetime-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1e293b;
}

.attraction-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.suggested-by {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.avatar-small {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #14b8a6, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cost-duration {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.rating-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e3a5f;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e3a5f;
}

.rating-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
}

.rating-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #14b8a6;
  cursor: pointer;
}

.rating-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #14b8a6;
  cursor: pointer;
  border: none;
}

.opt-in-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: linear-gradient(to right, #f0fdfa, #ecfeff);
  border-radius: 0.5rem;
}

.opt-in-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e3a5f;
  cursor: pointer;
}

.btn-save-rankings {
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
  margin-top: 1rem;
}

.btn-save-rankings:hover {
  background: #0d9488;
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
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 0.5rem;
}

.dialog-description {
  font-size: 0.875rem;
  color: #64748b;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #faf8f6;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  margin-top: 0.5rem;
}

.btn-submit:hover {
  background: #0d9488;
}
</style>
