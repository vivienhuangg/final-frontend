<template>
  <div class="itinerary-tab">
    <div class="itinerary-header">
      <div>
        <h2>Itinerary</h2>
        <p class="subtitle">Rate and opt into activities for your trip</p>
      </div>
      <button class="btn-primary" @click="showAddActivityDialog = true">
        + Add Activity
      </button>
    </div>

    <!-- Personal Events Section -->
    <div class="section" v-if="personalEvents.length > 0">
      <div class="section-header">
        <h3 class="section-title">
          <span class="icon">✓</span>
          My Events
        </h3>
        <p class="section-subtitle">Activities you're attending</p>
      </div>
      <div class="activities-grid">
        <div
          v-for="activity in personalEvents"
          :key="activity.id"
          class="activity-card personal"
        >
          <div class="activity-badge personal-badge">My Event</div>
          <div class="activity-header">
            <h3>{{ activity.title }}</h3>
            <div class="activity-tags" v-if="activity.tags">
              <span
                v-for="tag in activity.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="activity-details">
            <p v-if="activity.location">📍 {{ activity.location }}</p>
            <p v-if="activity.duration">⏱ {{ activity.duration }}</p>
            <p v-if="activity.pricePerPerson">💰 ${{ activity.pricePerPerson }}/person</p>
            <p v-if="activity.start">📅 {{ formatTime(activity.start) }}</p>
          </div>

          <div class="activity-stats">
            <div class="stat">
              <span class="stat-label">Rating:</span>
              <span class="stat-value">{{ activity.rating?.toFixed(1) || 'N/A' }}/10</span>
            </div>
            <div class="stat">
              <span class="stat-label">Votes:</span>
              <span class="stat-value">{{ activity.votes || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Attending:</span>
              <span class="stat-value">{{ activity.attendees?.length || 0 }}</span>
            </div>
          </div>

          <div class="activity-actions">
            <div class="rating-section">
              <label>Your Rating:</label>
              <div class="rating-bar">
                <button
                  v-for="i in 10"
                  :key="i"
                  :class="['rating-btn', { active: userRatings[activity.id] === i }]"
                  @click="rateActivity(activity.id, i)"
                >
                  {{ i }}
                </button>
              </div>
            </div>

            <label class="attendance-toggle">
              <input
                type="checkbox"
                :checked="isAttending(activity.id)"
                @change="toggleAttendance(activity.id)"
              />
              I'm attending this activity
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Group Potential Events Section -->
    <div class="section" v-if="groupEvents.length > 0">
      <div class="section-header">
        <h3 class="section-title">
          <span class="icon">👥</span>
          Group Potential Events
        </h3>
        <p class="section-subtitle">Activities others are considering</p>
      </div>
      <div class="activities-grid">
        <div
          v-for="activity in groupEvents"
          :key="activity.id"
          class="activity-card group"
        >
          <div class="activity-badge group-badge">Group Event</div>
          <div class="activity-header">
            <h3>{{ activity.title }}</h3>
            <div class="activity-tags" v-if="activity.tags">
              <span
                v-for="tag in activity.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="activity-details">
            <p v-if="activity.location">📍 {{ activity.location }}</p>
            <p v-if="activity.duration">⏱ {{ activity.duration }}</p>
            <p v-if="activity.pricePerPerson">💰 ${{ activity.pricePerPerson }}/person</p>
            <p v-if="activity.start">📅 {{ formatTime(activity.start) }}</p>
          </div>

          <div class="activity-stats">
            <div class="stat">
              <span class="stat-label">Rating:</span>
              <span class="stat-value">{{ activity.rating?.toFixed(1) || 'N/A' }}/10</span>
            </div>
            <div class="stat">
              <span class="stat-label">Votes:</span>
              <span class="stat-value">{{ activity.votes || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Attending:</span>
              <span class="stat-value">{{ activity.attendees?.length || 0 }}</span>
            </div>
          </div>

          <div class="activity-actions">
            <div class="rating-section">
              <label>Your Rating:</label>
              <div class="rating-bar">
                <button
                  v-for="i in 10"
                  :key="i"
                  :class="['rating-btn', { active: userRatings[activity.id] === i }]"
                  @click="rateActivity(activity.id, i)"
                >
                  {{ i }}
                </button>
              </div>
            </div>

            <label class="attendance-toggle">
              <input
                type="checkbox"
                :checked="isAttending(activity.id)"
                @change="toggleAttendance(activity.id)"
              />
              I'm attending this activity
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="personalEvents.length === 0 && groupEvents.length === 0" class="empty-state">
      <p>No activities yet. Add your first activity to get started!</p>
    </div>

    <!-- Add Activity Dialog -->
    <div v-if="showAddActivityDialog" class="dialog-overlay" @click="showAddActivityDialog = false">
      <div class="dialog" @click.stop>
        <h2>Add Activity</h2>
        <form @submit.prevent="addActivity">
          <div class="form-group">
            <label>Title</label>
            <input v-model="newActivity.title" type="text" required placeholder="e.g., Visit Art Museum" />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input v-model="newActivity.location" type="text" placeholder="e.g., Downtown Miami" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date & Time</label>
              <input v-model="newActivity.start" type="datetime-local" required />
            </div>
            <div class="form-group">
              <label>End Date & Time</label>
              <input v-model="newActivity.end" type="datetime-local" required />
            </div>
          </div>
          <div class="form-group">
            <label>Cost per Person</label>
            <input v-model.number="newActivity.cost" type="number" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label>Duration (optional)</label>
            <input v-model="newActivity.duration" type="text" placeholder="e.g., 2 hours" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showAddActivityDialog = false">
              Cancel
            </button>
            <button type="submit" class="btn-primary">Add Activity</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '../../composables/useAuth';
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
}>();

const { currentUser } = useAuth();
const currentUserId = computed(() => currentUser.value?.id || '1');
const userRatings = ref<Record<string, number>>({});
const showAddActivityDialog = ref(false);
const newActivity = ref({
  title: '',
  location: '',
  start: '',
  end: '',
  cost: 0,
  duration: '',
});

// Separate activities into personal (user is attending) and group (user is not attending)
const personalEvents = computed(() => {
  return props.activities.filter(activity => 
    activity.attendees?.includes(currentUserId.value)
  );
});

const groupEvents = computed(() => {
  return props.activities.filter(activity => 
    !activity.attendees?.includes(currentUserId.value)
  );
});

function rateActivity(activityId: string, rating: number) {
  userRatings.value[activityId] = rating;
  emit('rate', activityId, rating);
}

function toggleAttendance(activityId: string) {
  emit('toggle-attendance', activityId, currentUserId.value);
}

function isAttending(activityId: string): boolean {
  const activity = props.activities.find(a => a.id === activityId);
  return activity?.attendees?.includes(currentUserId.value) || false;
}

function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function addActivity() {
  const activity: ActivityWithDetails = {
    id: Date.now().toString(),
    title: newActivity.value.title,
    event: props.tripId,
    start: newActivity.value.start || new Date().toISOString(),
    end: newActivity.value.end || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    cost: newActivity.value.cost || 0,
    location: newActivity.value.location,
    duration: newActivity.value.duration,
    pricePerPerson: newActivity.value.cost,
    source: 'manual',
    rating: 0,
    votes: 0,
    attendees: [currentUserId.value], // User automatically attends their own activity
  };

  emit('add-activity', activity);
  showAddActivityDialog.value = false;
  newActivity.value = {
    title: '',
    location: '',
    start: '',
    end: '',
    cost: 0,
    duration: '',
  };
}
</script>

<style scoped>
.itinerary-tab {
  width: 100%;
}

.itinerary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.itinerary-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1rem;
}

.section {
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  font-size: 1.5rem;
}

.section-subtitle {
  color: #666;
  font-size: 0.9rem;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.activity-card.personal {
  border-left: 4px solid #42b983;
  background: linear-gradient(to right, #f0fdf4 0%, white 10%);
}

.activity-card.group {
  border-left: 4px solid #667eea;
  background: linear-gradient(to right, #f5f3ff 0%, white 10%);
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.activity-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.personal-badge {
  background: #42b983;
  color: white;
}

.group-badge {
  background: #667eea;
  color: white;
}

.activity-header {
  margin-bottom: 1rem;
  padding-right: 80px;
}

.activity-header h3 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.75rem;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e8f5e9;
  color: #42b983;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.activity-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.activity-details p {
  font-size: 0.9rem;
  color: #666;
}

.activity-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.activity-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-section label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.rating-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.rating-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.rating-btn:hover {
  border-color: #42b983;
  color: #42b983;
}

.rating-btn.active {
  background: #42b983;
  border-color: #42b983;
  color: white;
}

.attendance-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.attendance-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
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
