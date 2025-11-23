<template>
  <div class="itinerary-tab">
    <div class="itinerary-header">
      <div>
        <h2>Itinerary</h2>
        <p class="subtitle">Plan and track activities for your trip</p>
      </div>
      <button class="btn-primary" @click="showAddActivityDialog = true">
        + Add Activity
      </button>
    </div>

    <!-- Tab Toggles -->
    <div class="tab-toggles">
      <button
        :class="['toggle', { active: activeView === 'mine' }]"
        @click="activeView = 'mine'"
      >
        My Events
      </button>
      
      <button
        :class="['toggle', { active: activeView === 'group' }]"
        @click="activeView = 'group'"
      >
        Current Group Events
      </button>
      <button
        :class="['toggle', { active: activeView === 'proposals' }]"
        @click="activeView = 'proposals'"
      >
        Group Event Proposals
      </button>
    </div>

    <!-- Recommended Section (only in Proposals) -->
    <div v-if="activeView === 'proposals' && recommendedEvents.length > 0" class="recommended-section">
      <div class="section-header">
        <h3 class="section-title">
          <span class="icon">⭐</span>
          Recommended for You
        </h3>
        <p class="section-subtitle">Based on group ratings and preferences</p>
      </div>
      <div class="timeline-container">
        <div class="timeline">
          <div
            v-for="(activity, index) in recommendedEvents"
            :key="activity.id"
            class="timeline-item"
          >
            <!-- Timeline Line -->
            <div class="timeline-line" v-if="index < recommendedEvents.length - 1"></div>
            
             <!-- Timeline Dot -->
             <div class="timeline-dot recommended" :class="{ 'opted-out': optedOutEvents.has(activity.id) }"></div>

             <!-- Activity Card -->
             <div class="activity-card recommended-card" :class="{ 'opted-out-card': optedOutEvents.has(activity.id) }">
               <div class="recommended-badge" v-if="!optedOutEvents.has(activity.id)">Recommended</div>
               <div class="opted-out-badge" v-else>Opted Out</div>
              <div class="activity-image-container" v-if="activity.image">
                <img :src="activity.image" :alt="activity.title" class="activity-image" />
              </div>
              
              <div class="activity-content">
                <div class="activity-header">
                  <div class="activity-title-section">
                    <h3>{{ activity.title }}</h3>
                    <div class="activity-meta">
                      <span v-if="activity.location" class="meta-item">
                        <span class="icon">📍</span> {{ activity.location }}
                      </span>
                      <span v-if="activity.start" class="meta-item">
                        <span class="icon">🕐</span> {{ formatTime(activity.start) }}
                      </span>
                      <span v-if="activity.duration" class="meta-item">
                        <span class="icon">⏱</span> {{ activity.duration }}
                      </span>
                      <span v-if="activity.pricePerPerson" class="meta-item">
                        <span class="icon">💰</span> ${{ activity.pricePerPerson }}/person
                      </span>
                    </div>
                  </div>
                  <div class="activity-badge group">
                    Group Event
                  </div>
                </div>

                <p v-if="activity.description" class="activity-description">
                  {{ activity.description }}
                </p>

                <div class="activity-tags" v-if="activity.tags && activity.tags.length > 0">
                  <span
                    v-for="tag in activity.tags"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div class="activity-stats">
                  <div class="stat">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-value">{{ activity.rating?.toFixed(1) || 'N/A' }}/10</span>
                    <span class="stat-label">Rating</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">👥</span>
                    <span class="stat-value">{{ activity.attendees?.length || 0 }}</span>
                    <span class="stat-label">Attending</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">🗳️</span>
                    <span class="stat-value">{{ activity.votes || 0 }}</span>
                    <span class="stat-label">Votes</span>
                  </div>
                </div>

                <div class="activity-actions">
                  <div class="rating-section" v-if="!isSoloEvent(activity)">
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

                  <div class="proposal-actions">
                    <button
                      v-if="!isGroupEvent(activity)"
                      class="make-group-event-btn"
                      @click="makeGroupEvent(activity.id)"
                    >
                      <span class="btn-icon">✓</span>
                      Make Group Event
                    </button>
                    <div v-else class="group-event-actions">
                      <button
                        v-if="!optedOutEvents.has(activity.id)"
                        class="opt-out-btn"
                        @click="toggleOptOut(activity.id)"
                      >
                        <span class="btn-icon">✗</span>
                        Opt Out
                      </button>
                      <button
                        v-else
                        class="opt-in-btn"
                        @click="toggleOptOut(activity.id)"
                      >
                        <span class="btn-icon">✓</span>
                        Opt Back In
                      </button>
                      <button
                        class="unmake-group-event-btn"
                        @click="unmakeGroupEvent(activity.id)"
                      >
                        <span class="btn-icon">↩</span>
                        Remove from Group Events
                      </button>
                    </div>
                    <button
                      class="delete-proposal-btn"
                      @click="deleteProposal(activity.id)"
                    >
                      <span class="btn-icon">🗑</span>
                      Delete Proposal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Proposals Section (not recommended) -->
    <div v-if="activeView === 'proposals' && otherProposals.length > 0" class="other-events-section">
      <div class="section-header">
        <h3 class="section-title">
          <span class="icon">📋</span>
          Other Proposals
        </h3>
      </div>
      <div class="timeline-container">
        <div class="timeline">
          <div
            v-for="(activity, index) in otherProposals"
            :key="activity.id"
            class="timeline-item"
          >
            <!-- Timeline Line -->
            <div class="timeline-line" v-if="index < otherProposals.length - 1"></div>
            
            <!-- Timeline Dot -->
            <div class="timeline-dot"></div>

            <!-- Activity Card -->
            <div class="activity-card" :class="{ 'opted-out-card': optedOutEvents.has(activity.id) }">
              <div class="opted-out-badge" v-if="optedOutEvents.has(activity.id)">Opted Out</div>
              <div class="activity-image-container" v-if="activity.image">
                <img :src="activity.image" :alt="activity.title" class="activity-image" />
              </div>
              
              <div class="activity-content">
                <div class="activity-header">
                  <div class="activity-title-section">
                    <h3>{{ activity.title }}</h3>
                    <div class="activity-meta">
                      <span v-if="activity.location" class="meta-item">
                        <span class="icon">📍</span> {{ activity.location }}
                      </span>
                      <span v-if="activity.start" class="meta-item">
                        <span class="icon">🕐</span> {{ formatTime(activity.start) }}
                      </span>
                      <span v-if="activity.duration" class="meta-item">
                        <span class="icon">⏱</span> {{ activity.duration }}
                      </span>
                      <span v-if="activity.pricePerPerson" class="meta-item">
                        <span class="icon">💰</span> ${{ activity.pricePerPerson }}/person
                      </span>
                    </div>
                  </div>
                  <div class="activity-badge group">
                    Proposal
                  </div>
                </div>

                <p v-if="activity.description" class="activity-description">
                  {{ activity.description }}
                </p>

                <div class="activity-tags" v-if="activity.tags && activity.tags.length > 0">
                  <span
                    v-for="tag in activity.tags"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div class="activity-stats">
                  <div class="stat">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-value">{{ activity.rating?.toFixed(1) || 'N/A' }}/10</span>
                    <span class="stat-label">Rating</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">👥</span>
                    <span class="stat-value">{{ activity.attendees?.length || 0 }}</span>
                    <span class="stat-label">Attending</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">🗳️</span>
                    <span class="stat-value">{{ activity.votes || 0 }}</span>
                    <span class="stat-label">Votes</span>
                  </div>
                </div>

                <div class="activity-actions">
                  <div class="rating-section" v-if="!isSoloEvent(activity)">
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

                  <div class="proposal-actions">
                    <button
                      v-if="!isGroupEvent(activity)"
                      class="make-group-event-btn"
                      @click="makeGroupEvent(activity.id)"
                    >
                      <span class="btn-icon">✓</span>
                      Make Group Event
                    </button>
                    <button
                      class="delete-proposal-btn"
                      @click="deleteProposal(activity.id)"
                    >
                      <span class="btn-icon">🗑</span>
                      Delete Proposal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Group Events Section -->
    <div v-if="activeView === 'group' && currentGroupEvents.length > 0" class="current-group-events-section">
      <div class="section-header">
        <h3 class="section-title">
          <span class="icon">👥</span>
          Current Group Events
        </h3>
        <p class="section-subtitle">Events that have been committed to by the group</p>
      </div>
      <div class="timeline-container">
        <div class="timeline">
          <div
            v-for="(activity, index) in currentGroupEvents"
            :key="activity.id"
            class="timeline-item"
          >
            <!-- Timeline Line -->
            <div class="timeline-line" v-if="index < currentGroupEvents.length - 1"></div>
            
            <!-- Timeline Dot -->
            <div class="timeline-dot" :class="{ 'opted-out': optedOutEvents.has(activity.id) }"></div>

            <!-- Activity Card -->
            <div class="activity-card" :class="{ 'opted-out-card': optedOutEvents.has(activity.id) }">
              <div class="opted-out-badge" v-if="optedOutEvents.has(activity.id)">Opted Out</div>
              <div class="activity-image-container" v-if="activity.image">
                <img :src="activity.image" :alt="activity.title" class="activity-image" />
              </div>
              
              <div class="activity-content">
                <div class="activity-header">
                  <div class="activity-title-section">
                    <h3>{{ activity.title }}</h3>
                    <div class="activity-meta">
                      <span v-if="activity.location" class="meta-item">
                        <span class="icon">📍</span> {{ activity.location }}
                      </span>
                      <span v-if="activity.start" class="meta-item">
                        <span class="icon">🕐</span> {{ formatTime(activity.start) }}
                      </span>
                      <span v-if="activity.duration" class="meta-item">
                        <span class="icon">⏱</span> {{ activity.duration }}
                      </span>
                      <span v-if="activity.pricePerPerson" class="meta-item">
                        <span class="icon">💰</span> ${{ activity.pricePerPerson }}/person
                      </span>
                    </div>
                  </div>
                  <div class="activity-badge group">
                    Group Event
                  </div>
                </div>

                <p v-if="activity.description" class="activity-description">
                  {{ activity.description }}
                </p>

                <div class="activity-tags" v-if="activity.tags && activity.tags.length > 0">
                  <span
                    v-for="tag in activity.tags"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div class="activity-actions">
                  <div class="proposal-actions">
                    <div class="group-event-actions">
                      <button
                        class="see-attendees-btn"
                        @click="openAttendeesDialog(activity.id)"
                      >
                        <span class="btn-icon">👥</span>
                        See Attendees ({{ activity.attendees?.length || 0 }})
                      </button>
                      <button
                        v-if="!optedOutEvents.has(activity.id)"
                        class="opt-out-btn"
                        @click="toggleOptOut(activity.id)"
                      >
                        <span class="btn-icon">✗</span>
                        Opt Out
                      </button>
                      <button
                        v-else
                        class="opt-in-btn"
                        @click="toggleOptOut(activity.id)"
                      >
                        <span class="btn-icon">✓</span>
                        Opt Back In
                      </button>
                      <button
                        class="unmake-group-event-btn"
                        @click="confirmUnmakeGroupEvent(activity.id)"
                      >
                        <span class="btn-icon">↩</span>
                        Remove from Group Events
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- My Events Timeline View -->
    <div class="timeline-container" v-if="activeView === 'mine' && displayedActivities.length > 0">
      <div class="timeline">
        <div
          v-for="(activity, index) in displayedActivities"
          :key="activity.id"
          class="timeline-item"
        >
          <!-- Timeline Line -->
          <div class="timeline-line" v-if="index < displayedActivities.length - 1"></div>
          
          <!-- Timeline Dot -->
          <div class="timeline-dot"></div>

          <!-- Activity Card -->
          <div class="activity-card">
            <!-- Remove Button for My Events -->
            <button 
              v-if="activeView === 'mine'"
              class="remove-btn"
              @click="removeFromMyEvents(activity.id)"
              title="Remove from my events"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            
            <div class="activity-image-container" v-if="activity.image">
              <img :src="activity.image" :alt="activity.title" class="activity-image" />
            </div>
            
            <div class="activity-content">
              <div class="activity-header">
                <div class="activity-title-section">
                  <h3>{{ activity.title }}</h3>
                  <div class="activity-meta">
                    <span v-if="activity.location" class="meta-item">
                      <span class="icon">📍</span> {{ activity.location }}
                    </span>
                    <span v-if="activity.start" class="meta-item">
                      <span class="icon">🕐</span> {{ formatTime(activity.start) }}
                    </span>
                    <span v-if="activity.duration" class="meta-item">
                      <span class="icon">⏱</span> {{ activity.duration }}
                    </span>
                    <span v-if="activity.pricePerPerson" class="meta-item">
                      <span class="icon">💰</span> ${{ activity.pricePerPerson }}/person
                    </span>
                  </div>
                </div>
                <div class="activity-badge" :class="isSoloEvent(activity) ? 'solo' : 'group'">
                  {{ isSoloEvent(activity) ? 'Solo Event' : 'Group Event' }}
                </div>
              </div>

              <p v-if="activity.description" class="activity-description">
                {{ activity.description }}
              </p>

              <div class="activity-tags" v-if="activity.tags && activity.tags.length > 0">
                <span
                  v-for="tag in activity.tags"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="(activeView === 'mine' && displayedActivities.length === 0) || (activeView === 'proposals' && recommendedEvents.length === 0 && otherProposals.length === 0) || (activeView === 'group' && currentGroupEvents.length === 0)" class="empty-state">
      <div class="empty-icon">📅</div>
      <p class="empty-title">
        <span v-if="activeView === 'mine'">No personal events yet</span>
        <span v-else-if="activeView === 'proposals'">No proposals yet</span>
        <span v-else>No group events yet</span>
      </p>
      <p class="empty-subtitle">
        <span v-if="activeView === 'mine'">Add activities you're planning to attend</span>
        <span v-else-if="activeView === 'proposals'">Activities that can be made into group events will appear here</span>
        <span v-else>Group events that have been committed to will appear here</span>
      </p>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="dialog-overlay" @click="cancelConfirm">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-icon">⚠️</div>
        <h3 class="confirm-title">Confirm Action</h3>
        <p class="confirm-message">{{ confirmDialogConfig?.message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="cancelConfirm">
            {{ confirmDialogConfig?.cancelText || 'Cancel' }}
          </button>
          <button class="btn-confirm" @click="confirmDialogConfig?.onConfirm">
            {{ confirmDialogConfig?.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Attendees Dialog -->
    <div v-if="showAttendeesDialog" class="dialog-overlay" @click="showAttendeesDialog = false">
      <div class="dialog" @click.stop>
        <h2>Attendees</h2>
        <div v-if="selectedActivityForAttendees">
          <p class="attendees-count">
            {{ selectedActivityForAttendees.attendees?.length || 0 }} 
            {{ (selectedActivityForAttendees.attendees?.length || 0) === 1 ? 'person' : 'people' }} attending
          </p>
          <div class="attendees-list">
            <div
              v-for="attendeeId in selectedActivityForAttendees.attendees"
              :key="attendeeId"
              class="attendee-item"
            >
              <span class="attendee-name">
                {{ getTravelerName(attendeeId) }}
              </span>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="showAttendeesDialog = false">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Add Activity Dialog -->
    <div v-if="showAddActivityDialog" class="dialog-overlay" @click="showAddActivityDialog = false">
      <div class="dialog" @click.stop>
        <h2>Add Activity</h2>
        <form @submit.prevent="addActivity">
          <div class="form-group">
            <label>Title *</label>
            <input v-model="newActivity.title" type="text" required placeholder="e.g., Visit Art Museum" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="newActivity.description"
              rows="3"
              placeholder="Add a description for this activity..."
            ></textarea>
          </div>
          <div class="form-group">
            <label>Image URL (optional)</label>
            <input v-model="newActivity.image" type="url" placeholder="https://example.com/image.jpg" />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input v-model="newActivity.location" type="text" placeholder="e.g., Downtown Miami" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date & Time *</label>
              <input v-model="newActivity.start" type="datetime-local" required />
            </div>
            <div class="form-group">
              <label>End Date & Time *</label>
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
          <div class="form-group">
            <label>Event Type</label>
            <div class="event-type-toggle">
              <label class="event-type-option">
                <input
                  type="radio"
                  :value="true"
                  v-model="newActivity.isPersonal"
                />
                <span class="option-content">
                  <span class="option-icon">👤</span>
                  <div>
                    <div class="option-title">Personal Event</div>
                    <div class="option-description">Just for you</div>
                  </div>
                </span>
              </label>
              <label class="event-type-option">
                <input
                  type="radio"
                  :value="false"
                  v-model="newActivity.isPersonal"
                />
                <span class="option-content">
                  <span class="option-icon">👥</span>
                  <div>
                    <div class="option-title">Group Event</div>
                    <div class="option-description">For everyone in the trip</div>
                  </div>
                </span>
              </label>
            </div>
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
  (e: 'delete-activity', activityId: string): void;
}>();

const { currentUser } = useAuth();
const currentUserId = computed(() => currentUser.value?.id || '1');
const userRatings = ref<Record<string, number>>({});
const showAddActivityDialog = ref(false);
const activeView = ref<'mine' | 'proposals' | 'group'>('mine');
const showConfirmDialog = ref(false);
const showAttendeesDialog = ref(false);
const selectedActivityForAttendees = ref<ActivityWithDetails | null>(null);
const confirmDialogConfig = ref<{
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
} | null>(null);
const newActivity = ref({
  title: '',
  description: '',
  image: '',
  location: '',
  start: '',
  end: '',
  cost: 0,
  duration: '',
  isPersonal: true, // true = personal/solo event, false = group event
});

// Track which events user has explicitly opted out of
const optedOutEvents = ref<Set<string>>(new Set());

// Helper: Check if activity is a solo event (personal event - only creator attends)
function isSoloEvent(activity: ActivityWithDetails): boolean {
  // Solo events are manually created activities where ONLY the creator is in attendees
  return activity.source === 'manual' && 
         activity.attendees?.length === 1 &&
         activity.attendees.includes(currentUserId.value);
}

// Helper: Check if activity is a group event (has multiple attendees or is from discover)
function isGroupEvent(activity: ActivityWithDetails): boolean {
  // Group events have multiple attendees or are from discover
  return (activity.attendees?.length || 0) > 1 || activity.source === 'discover';
}

// My Events: Shows solo events you created + group events you haven't opted out of
const personalEvents = computed(() => {
  return props.activities.filter(activity => {
    const isOptedOut = optedOutEvents.value.has(activity.id);
    if (isOptedOut) return false;
    
    // Solo events: you're always attending (you created them)
    if (isSoloEvent(activity)) {
      return true;
    }
    
    // Group events: default to attending unless opted out
    return true;
  }).sort((a, b) => {
    if (!a.start || !b.start) return 0;
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
});

// Group Events: All activities that are not solo events (or solo events you opted out of)
const groupEvents = computed(() => {
  return props.activities.filter(activity => {
    // If it's a solo event and you haven't opted out, don't show in group events
    if (isSoloEvent(activity) && !optedOutEvents.value.has(activity.id)) {
      return false;
    }
    // Show all other activities (discover events, or opted-out solo events)
    return true;
  });
});

// Calculate recommendation scores based on ranking algorithm
const activityScores = computed(() => {
  const scores: Record<string, number> = {};
  
  // Calculate how many activities each user is attending (for fairness)
  // Count activities they haven't opted out of
  const userActivityCounts: Record<string, number> = {};
  props.travelers.forEach(traveler => {
    userActivityCounts[traveler.id] = props.activities.filter(a => {
      if (optedOutEvents.value.has(a.id)) return false;
      if (isSoloEvent(a) && a.attendees?.includes(traveler.id)) return true;
      if (!isSoloEvent(a)) return true; // Group events default to attending
      return false;
    }).length;
  });
  
  const maxUserActivities = Math.max(...Object.values(userActivityCounts), 1);
  
  // Only calculate scores for group events (not solo events)
  groupEvents.value.filter(a => !isSoloEvent(a)).forEach(activity => {
    let score = 0;
    
    // Base score: Average rating (0-10 scale, normalized to 0-1)
    const avgRating = activity.rating || 0;
    score += (avgRating / 10) * 0.4; // 40% weight
    
    // Vote count boost (more votes = more consensus)
    const voteCount = activity.votes || 0;
    const groupEventsOnly = groupEvents.value.filter(a => !isSoloEvent(a));
    const maxVotes = Math.max(...groupEventsOnly.map(a => a.votes || 0), 1);
    score += (voteCount / maxVotes) * 0.2; // 20% weight
    
    // Hidden gem boost: High rating but low attendance
    const attendanceCount = activity.attendees?.length || 0;
    const maxAttendance = Math.max(...groupEventsOnly.map(a => a.attendees?.length || 0), 1);
    const isHiddenGem = activity.tags?.includes('Hidden Gem') || false;
    if (isHiddenGem && avgRating >= 7 && attendanceCount < maxAttendance * 0.5) {
      score += 0.2; // 20% boost for hidden gems
    }
    
    // Fairness boost: Activities rated highly by underrepresented users
    // (users who have fewer activities they're attending)
    const underrepresentedBoost = props.travelers
      .filter(t => userActivityCounts[t.id] < maxUserActivities * 0.7)
      .length / props.travelers.length;
    score += underrepresentedBoost * 0.2; // 20% weight
    
    scores[activity.id] = score;
  });
  
  return scores;
});

// Recommended events: Top scoring proposals (not yet group events, excluding solo events)
const recommendedEvents = computed(() => {
  return [...groupEvents.value]
    .filter(activity => 
      !isSoloEvent(activity) &&
      !isGroupEvent(activity) && // Only show proposals (not yet group events)
      activityScores.value[activity.id] >= 0.5
    ) // Threshold for recommendation
    .sort((a, b) => {
      // Sort opted-out events to the bottom
      const aOptedOut = optedOutEvents.value.has(a.id);
      const bOptedOut = optedOutEvents.value.has(b.id);
      if (aOptedOut !== bOptedOut) {
        return aOptedOut ? 1 : -1;
      }
      
      const scoreA = activityScores.value[a.id] || 0;
      const scoreB = activityScores.value[b.id] || 0;
      if (Math.abs(scoreB - scoreA) > 0.01) {
        return scoreB - scoreA; // Sort by score descending
      }
      // If scores are similar, sort by date
      if (!a.start || !b.start) return 0;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
});

// Other proposals: Not recommended (proposals that don't meet recommendation threshold)
const otherProposals = computed(() => {
  const recommendedIds = new Set(recommendedEvents.value.map(a => a.id));
  return groupEvents.value
    .filter(activity => 
      !isSoloEvent(activity) &&
      !isGroupEvent(activity) && // Only show proposals (not group events)
      !recommendedIds.has(activity.id)
    )
    .sort((a, b) => {
      // Sort opted-out events to the bottom
      const aOptedOut = optedOutEvents.value.has(a.id);
      const bOptedOut = optedOutEvents.value.has(b.id);
      if (aOptedOut !== bOptedOut) {
        return aOptedOut ? 1 : -1;
      }
      
      if (!a.start || !b.start) return 0;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
});

// Current group events: Actual group events that have been committed to
const currentGroupEvents = computed(() => {
  return groupEvents.value
    .filter(activity => 
      !isSoloEvent(activity) &&
      isGroupEvent(activity) // Only show actual group events
    )
    .sort((a, b) => {
      // Sort opted-out events to the bottom
      const aOptedOut = optedOutEvents.value.has(a.id);
      const bOptedOut = optedOutEvents.value.has(b.id);
      if (aOptedOut !== bOptedOut) {
        return aOptedOut ? 1 : -1;
      }
      
      if (!a.start || !b.start) return 0;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
});

const displayedActivities = computed(() => {
  return activeView.value === 'mine' ? personalEvents.value : [];
});

function rateActivity(activityId: string, rating: number) {
  userRatings.value[activityId] = rating;
  emit('rate', activityId, rating);
}

function makeGroupEvent(activityId: string) {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return;
  
  // Add all travelers to attendees to make it a group event
  const allTravelerIds = props.travelers.map(t => t.id);
  
  // Ensure all travelers are in attendees
  allTravelerIds.forEach(travelerId => {
    if (!activity.attendees?.includes(travelerId)) {
      emit('toggle-attendance', activityId, travelerId);
    }
  });
  
  // Remove from opted out if it was there
  optedOutEvents.value.delete(activityId);
}

function confirmUnmakeGroupEvent(activityId: string) {
  showConfirmDialog.value = true;
  confirmDialogConfig.value = {
    message: 'This will remove this event from everyone\'s calendar and convert it back to a proposal. Are you sure?',
    confirmText: 'Remove from Group Events',
    cancelText: 'Cancel',
    onConfirm: () => {
      unmakeGroupEvent(activityId);
      showConfirmDialog.value = false;
      confirmDialogConfig.value = null;
    },
  };
}

function unmakeGroupEvent(activityId: string) {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return;
  
  // Remove all travelers from attendees to convert back to proposal
  const allTravelerIds = props.travelers.map(t => t.id);
  
  // Remove all travelers from attendees
  allTravelerIds.forEach(travelerId => {
    if (activity.attendees?.includes(travelerId)) {
      emit('toggle-attendance', activityId, travelerId);
    }
  });
  
  // Remove from opted out
  optedOutEvents.value.delete(activityId);
}

function deleteProposal(activityId: string) {
  showConfirmDialog.value = true;
  confirmDialogConfig.value = {
    message: 'Are you sure you want to delete this proposal? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => {
      emit('delete-activity', activityId);
      optedOutEvents.value.delete(activityId);
      showConfirmDialog.value = false;
      confirmDialogConfig.value = null;
    },
  };
}

function toggleOptOut(activityId: string) {
  const activity = props.activities.find(a => a.id === activityId);
  
  if (optedOutEvents.value.has(activityId)) {
    // User is opting back in
    optedOutEvents.value.delete(activityId);
    // Ensure user is in attendees list
    if (activity && !activity.attendees?.includes(currentUserId.value)) {
      emit('toggle-attendance', activityId, currentUserId.value);
    }
  } else {
    // User is opting out
    optedOutEvents.value.add(activityId);
    // Remove user from attendees list
    if (activity?.attendees?.includes(currentUserId.value)) {
      emit('toggle-attendance', activityId, currentUserId.value);
    }
  }
}

function toggleAttendance(activityId: string) {
  // This is used for the X button in My Events
  emit('toggle-attendance', activityId, currentUserId.value);
  optedOutEvents.value.add(activityId);
}

function removeFromMyEvents(activityId: string) {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return;
  
  const isSolo = isSoloEvent(activity);
  
  if (isSolo) {
    // Solo event: ask to delete
    showConfirmDialog.value = true;
    confirmDialogConfig.value = {
      message: 'Are you sure you want to delete this event?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        emit('delete-activity', activityId);
        showConfirmDialog.value = false;
        confirmDialogConfig.value = null;
      },
    };
  } else {
    // Group event: ask to opt out
    showConfirmDialog.value = true;
    confirmDialogConfig.value = {
      message: 'Are you sure you want to opt out?',
      confirmText: 'Opt Out',
      cancelText: 'Cancel',
      onConfirm: () => {
        emit('toggle-attendance', activityId, currentUserId.value);
        optedOutEvents.value.add(activityId);
        showConfirmDialog.value = false;
        confirmDialogConfig.value = null;
      },
    };
  }
}

function cancelConfirm() {
  showConfirmDialog.value = false;
  confirmDialogConfig.value = null;
}

function isAttending(activityId: string): boolean {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return false;
  
  // If user has explicitly opted out, they're not attending
  if (optedOutEvents.value.has(activityId)) {
    return false;
  }
  
  // Solo events: you're always attending (you created them)
  if (isSoloEvent(activity)) {
    return true;
  }
  
  // Group events: default to attending (unless opted out)
  return true;
}

function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getTravelerName(travelerId: string): string {
  const traveler = props.travelers.find(t => t.id === travelerId);
  return traveler?.name || 'Unknown';
}

function openAttendeesDialog(activityId: string) {
  const activity = props.activities.find(a => a.id === activityId);
  if (activity) {
    selectedActivityForAttendees.value = activity;
    showAttendeesDialog.value = true;
  }
}

function addActivity() {
  // For personal events: only current user attends
  // For group events: all travelers attend by default (they can opt out later)
  const attendees = newActivity.value.isPersonal
    ? [currentUserId.value] // Personal: just you
    : props.travelers.map(t => t.id); // Group: everyone by default

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
    description: newActivity.value.description,
    image: newActivity.value.image || undefined,
    source: 'manual',
    rating: 0,
    votes: 0,
    attendees: attendees,
  };

  emit('add-activity', activity);
  showAddActivityDialog.value = false;
  newActivity.value = {
    title: '',
    description: '',
    image: '',
    location: '',
    start: '',
    end: '',
    cost: 0,
    duration: '',
    isPersonal: true,
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
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 1rem;
}

.tab-toggles {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.toggle {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.toggle:hover {
  color: #333;
  background: #f9f9f9;
}

.toggle.active {
  color: #42b983;
  border-bottom-color: #42b983;
}

.timeline-container {
  position: relative;
  padding: 2rem 0;
}

.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.timeline-item {
  position: relative;
  padding-left: 3rem;
  margin-bottom: 3rem;
}

.timeline-line {
  position: absolute;
  left: 0.5rem;
  top: 2.5rem;
  width: 2px;
  height: calc(100% + 1rem);
  background: linear-gradient(to bottom, #42b983, #e0e0e0);
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #42b983;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #42b983;
  z-index: 2;
}

.timeline-dot.recommended {
  background: #ffd700;
  box-shadow: 0 0 0 2px #ffd700;
}

.timeline-dot.opted-out {
  background: #ccc;
  box-shadow: 0 0 0 2px #ccc;
  opacity: 0.6;
}

.activity-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #e0e0e0;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.remove-btn:hover {
  background: #fee;
  border-color: #fcc;
  color: #c33;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 4px 12px rgba(204, 51, 51, 0.2);
}

.remove-btn:active {
  transform: scale(0.95) rotate(90deg);
}

.activity-image-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activity-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-content {
  padding: 2rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.activity-title-section {
  flex: 1;
}

.activity-title-section h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-item .icon {
  font-size: 1rem;
}

.activity-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.activity-badge.solo {
  background: #e8f5e9;
  color: #42b983;
}

.activity-badge.personal {
  background: #e8f5e9;
  color: #42b983;
}

.activity-badge.group {
  background: #f3e8ff;
  color: #667eea;
}

.recommended-section {
  margin-bottom: 3rem;
}

.other-events-section {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.section-subtitle {
  color: #666;
  font-size: 0.95rem;
  margin-left: 2rem;
}

.recommended-card {
  position: relative;
  border: 2px solid #ffd700;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
}

.recommended-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.opted-out-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #fee;
  color: #c33;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  z-index: 10;
  border: 1px solid #fcc;
}

.opted-out-card {
  opacity: 0.7;
  border: 2px solid #ddd;
}

.opted-out-card:hover {
  opacity: 0.9;
}

.activity-description {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.activity-stats {
  display: flex;
  gap: 2rem;
  padding: 1.5rem 0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  width: 36px;
  height: 36px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.rating-btn:hover {
  border-color: #42b983;
  color: #42b983;
  transform: scale(1.1);
}

.rating-btn.active {
  background: #42b983;
  border-color: #42b983;
  color: white;
  transform: scale(1.1);
}

.proposal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.group-event-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Base button styles */
.make-group-event-btn,
.opt-out-btn,
.opt-in-btn,
.unmake-group-event-btn,
.delete-proposal-btn,
.see-attendees-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.make-group-event-btn {
  background: #42b983;
  color: white;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.25);
}

.make-group-event-btn:hover {
  background: #35a372;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.35);
  transform: translateY(-1px);
}

.make-group-event-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(66, 185, 131, 0.3);
}

.opt-out-btn {
  background: white;
  color: #d32f2f;
  border: 1.5px solid #ffcdd2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.opt-out-btn:hover {
  background: #ffebee;
  border-color: #ef9a9a;
  color: #c62828;
  box-shadow: 0 3px 8px rgba(211, 47, 47, 0.15);
  transform: translateY(-1px);
}

.opt-out-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(211, 47, 47, 0.2);
}

.opt-in-btn {
  background: white;
  color: #42b983;
  border: 1.5px solid #a5d6a7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.opt-in-btn:hover {
  background: #e8f5e9;
  border-color: #81c784;
  color: #2e7d32;
  box-shadow: 0 3px 8px rgba(66, 185, 131, 0.15);
  transform: translateY(-1px);
}

.opt-in-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(66, 185, 131, 0.2);
}

.unmake-group-event-btn {
  background: white;
  color: #f57c00;
  border: 1.5px solid #ffe0b2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.unmake-group-event-btn:hover {
  background: #fff3e0;
  border-color: #ffcc80;
  color: #e65100;
  box-shadow: 0 3px 8px rgba(245, 124, 0, 0.15);
  transform: translateY(-1px);
}

.unmake-group-event-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(245, 124, 0, 0.2);
}

.delete-proposal-btn {
  background: white;
  color: #d32f2f;
  border: 1.5px solid #ffcdd2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 0.25rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.delete-proposal-btn:hover {
  background: #ffebee;
  border-color: #ef9a9a;
  color: #c62828;
  box-shadow: 0 3px 8px rgba(211, 47, 47, 0.15);
  transform: translateY(-1px);
}

.delete-proposal-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(211, 47, 47, 0.2);
}

.see-attendees-btn {
  background: #42b983;
  color: white;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.25);
}

.see-attendees-btn:hover {
  background: #35a372;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.35);
  transform: translateY(-1px);
}

.see-attendees-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(66, 185, 131, 0.3);
}

.attendees-count {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.attendees-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.attendee-item {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.attendee-name {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.btn-icon {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1;
}

.empty-state {
  text-align: center;
  padding: 6rem 2rem;
  color: #888;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  font-size: 1rem;
  color: #999;
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
  backdrop-filter: blur(4px);
}

.dialog {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.confirm-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
}

.confirm-message {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1.5px solid #e0e0e0;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-cancel:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.btn-confirm {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-confirm:hover {
  background: #c62828;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.dialog h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
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

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.event-type-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.event-type-option {
  display: block;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s;
  background: white;
}

.event-type-option:hover {
  border-color: #42b983;
  background: #f9f9f9;
}

.event-type-option input[type="radio"] {
  display: none;
}

.event-type-option:has(input:checked) {
  border-color: #42b983;
  background: #e8f5e9;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-icon {
  font-size: 2rem;
}

.option-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.85rem;
  color: #666;
}
</style>
