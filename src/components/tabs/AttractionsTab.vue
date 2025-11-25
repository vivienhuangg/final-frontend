<template>
  <div class="attractions-tab">
    <div class="space-y-6">
      <!-- Header Card -->
      <div class="card">
        <div class="card-gradient"></div>
        <div class="card-header">
          <div>
            <h2 class="card-title">Attractions & Activities</h2>
            <p class="card-description">Submit ideas and vote on what to do</p>
          </div>
          <button class="btn-add-attraction" @click="showAddDialog = true">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Attraction
          </button>
        </div>
      </div>

      <!-- Tab Toggles -->
      <div class="tab-toggles-card">
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
            Group Events
          </button>
          <button
            :class="['toggle', { active: activeView === 'proposals' }]"
            @click="activeView = 'proposals'"
          >
            Proposals
          </button>
        </div>
      </div>

      <!-- My Events Tab -->
      <div v-if="activeView === 'mine'">
        <div v-if="myEvents.length > 0" class="attractions-list">
          <div
            v-for="activity in myEvents"
            :key="activity.id"
            class="card attraction-card"
          >
            <div class="card-gradient"></div>
            <div class="card-header">
              <div class="card-title-section">
                <div class="title-row">
                  <h3 class="attraction-title">{{ activity.title }}</h3>
                  <div class="badges">
                    <span v-if="activity.solo" class="badge solo-badge">Solo Event</span>
                    <span v-else class="badge committed-badge">Group Event</span>
                  </div>
                </div>
                <p v-if="activity.description" class="attraction-description">{{ activity.description }}</p>
                <!-- Conflict Warning for My Events -->
                <div v-if="getCommittedEventConflicts(activity).length > 0" class="conflict-warning">
                  <div class="conflict-header">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="conflict-title">Time Conflict</span>
                  </div>
                  <div class="conflict-list">
                    <div
                      v-for="conflict in getCommittedEventConflicts(activity)"
                      :key="conflict.activity.id"
                      class="conflict-item"
                    >
                      <span class="conflict-event-name">{{ conflict.activity.title }}</span>
                      <span class="conflict-event-type">({{ conflict.type === 'my-event' ? 'My Event' : 'Group Event' }})</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-actions">
                <button 
                  class="btn-settings-small"
                  @click="openEditDialog(activity)"
                  title="Edit activity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button 
                  class="btn-delete-small"
                  @click="handleDeleteActivity(activity.id)"
                  title="Delete activity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="card-content">
              <div class="attraction-meta">
                <div v-if="getActivityDate(activity)" class="meta-item">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ formatDate(getActivityDate(activity)) }}</span>
                </div>
                <div v-if="getActivityTime(activity) || getActivityEndTime(activity)" class="meta-item">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatTime(getActivityTime(activity), getActivityEndTime(activity)) }}</span>
                </div>
                <div v-if="activity.cost > 0" class="meta-item">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>${{ activity.cost.toFixed(2) }}/person</span>
                </div>
              </div>
              <div v-if="!activity.solo" class="activity-stats">
                <div class="stat">
                  <span class="stat-value">{{ formatRating(getAverageScore(activity.id)) }}/10</span>
                  <span class="stat-label">Rating</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ getVoteCount(activity.id) }}</span>
                  <span class="stat-label">Votes</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ getOptedInCount(activity.id) }}</span>
                  <span class="stat-label">Attending</span>
                </div>
              </div>
              <div v-if="!activity.solo" class="activity-actions">
                <div class="opt-in-section">
                  <label :for="`opt-in-mine-${activity.id}`" class="opt-in-label">
                    {{ isOptedIn(activity.id) ? "I'm attending this activity" : "Opt in to this activity" }}
                  </label>
                  <label class="switch">
                    <input
                      :id="`opt-in-mine-${activity.id}`"
                      type="checkbox"
                      :checked="isOptedIn(activity.id)"
                      @change="handleToggleOptIn(activity.id)"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="card">
          <div class="card-content">
            <div class="empty-state">
              <p class="empty-title">No personal events yet</p>
              <p class="empty-subtitle">Add solo activities that only you can see</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Group Events Tab -->
      <div v-if="activeView === 'group'">
        <div v-if="groupEvents.length > 0" class="attractions-list">
          <div
            v-for="activity in groupEvents"
            :key="activity.id"
            class="card attraction-card"
            :class="{ 'opted-out': !isOptedIn(activity.id) }"
          >
            <div class="card-gradient"></div>
            <div class="card-header">
              <div class="card-title-section">
                <div class="title-row">
                  <h3 class="attraction-title">{{ activity.title }}</h3>
                  <div class="badges">
                    <span class="badge committed-badge">Group Event</span>
                    <span v-if="!isOptedIn(activity.id)" class="badge opted-out-badge">Opted Out</span>
                    <span v-else-if="isOptedIn(activity.id)" class="badge opted-in-badge">You're In!</span>
                  </div>
                </div>
                <p v-if="activity.description" class="attraction-description">{{ activity.description }}</p>
                <!-- Conflict Warning for Group Events -->
                <div v-if="getCommittedEventConflicts(activity).length > 0" class="conflict-warning">
                  <div class="conflict-header">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="conflict-title">Time Conflict</span>
                  </div>
                  <div class="conflict-list">
                    <div
                      v-for="conflict in getCommittedEventConflicts(activity)"
                      :key="conflict.activity.id"
                      class="conflict-item"
                    >
                      <span class="conflict-event-name">{{ conflict.activity.title }}</span>
                      <span class="conflict-event-type">({{ conflict.type === 'my-event' ? 'My Event' : 'Group Event' }})</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-actions">
                <button 
                  class="btn-settings-small"
                  @click="openEditDialog(activity)"
                  title="Edit activity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button 
                  v-if="canDelete(activity.id)"
                  class="btn-delete-small"
                  @click="handleDeleteActivity(activity.id)"
                  title="Delete activity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="card-content">
              <div class="attraction-meta">
                <div v-if="getActivityDate(activity)" class="meta-item">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ formatDate(getActivityDate(activity)) }}</span>
                </div>
                <div v-if="getActivityTime(activity) || getActivityEndTime(activity)" class="meta-item">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatTime(getActivityTime(activity), getActivityEndTime(activity)) }}</span>
                </div>
                <div v-if="activity.cost > 0" class="meta-item">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>${{ activity.cost.toFixed(2) }}/person</span>
                </div>
              </div>
              <div class="activity-stats">
                <div class="stat">
                  <span class="stat-value">{{ formatRating(getAverageScore(activity.id)) }}/10</span>
                  <span class="stat-label">Rating</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ getVoteCount(activity.id) }}</span>
                  <span class="stat-label">Votes</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ getOptedInCount(activity.id) }}</span>
                  <span class="stat-label">Attending</span>
                </div>
              </div>
              <div class="activity-actions">
                <div class="opt-in-section">
                  <label :for="`opt-in-${activity.id}`" class="opt-in-label">
                    {{ isOptedIn(activity.id) ? "I'm attending this activity" : "Opt in to this activity" }}
                  </label>
                  <label class="switch">
                    <input
                      :id="`opt-in-${activity.id}`"
                      type="checkbox"
                      :checked="isOptedIn(activity.id)"
                      @change="handleToggleOptIn(activity.id)"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="activity-controls">
                  <button
                    class="btn-revert-to-proposal"
                    @click="handleRevertToProposal(activity.id)"
                  >
                    Convert to Proposal
                  </button>
                  <button
                    v-if="canDelete(activity.id)"
                    class="btn-delete-activity"
                    @click="handleDeleteActivity(activity.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="card">
          <div class="card-content">
            <div class="empty-state">
              <p class="empty-title">No group events yet</p>
              <p class="empty-subtitle">Committed activities will appear here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Proposals Tab -->
      <div v-if="activeView === 'proposals'">
        <div v-if="proposals.length > 0" class="attractions-list">
          <div
            v-for="activity in proposals"
            :key="activity.id"
            :class="['card attraction-card', { 'recommended-card': activity.isRecommended }]"
          >
            <div v-if="!activity.isRecommended" class="card-gradient"></div>
            <div class="card-header">
              <div class="card-title-section">
                <div class="title-row">
                  <h3 class="attraction-title">{{ activity.title }}</h3>
                  <div class="badges">
                    <span v-if="activity.isRecommended" class="badge recommended-badge">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Recommended
                    </span>
                    <span class="badge proposal-badge">Proposal</span>
                  </div>
                </div>
                <p v-if="activity.description" class="attraction-description">{{ activity.description }}</p>
                <div v-if="activity.isRecommended && activity.recommendationReason" class="recommendation-reason">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ activity.recommendationReason }}</span>
                </div>
                <!-- Conflict Warning for Proposals -->
                <div v-if="getProposalConflicts(activity).length > 0" class="conflict-warning">
                  <div class="conflict-header">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="conflict-title">Time Conflict</span>
                  </div>
                  <div class="conflict-list">
                    <div
                      v-for="conflict in getProposalConflicts(activity)"
                      :key="conflict.activity.id"
                      class="conflict-item"
                    >
                      <span class="conflict-event-name">{{ conflict.activity.title }}</span>
                      <span class="conflict-event-type">({{ conflict.type === 'my-event' ? 'My Event' : 'Group Event' }})</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-actions">
                <button 
                  class="btn-settings-small"
                  @click="openEditDialog(activity)"
                  title="Edit activity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button 
                  v-if="canDelete(activity.id)"
                  class="btn-delete-small"
                  @click="handleDeleteActivity(activity.id)"
                  title="Delete activity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="card-content">
              <div class="attraction-meta">
                <div v-if="getActivityDate(activity)" class="meta-item">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ formatDate(getActivityDate(activity)) }}</span>
                </div>
                <div v-if="getActivityTime(activity) || getActivityEndTime(activity)" class="meta-item">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatTime(getActivityTime(activity), getActivityEndTime(activity)) }}</span>
                </div>
                <div v-if="activity.cost > 0" class="meta-item">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>${{ activity.cost.toFixed(2) }}/person</span>
                </div>
              </div>
              <div class="activity-stats">
                <div class="stat">
                  <span class="stat-value">{{ formatRating(getAverageScore(activity.id)) }}/10</span>
                  <span class="stat-label">Rating</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ getVoteCount(activity.id) }}</span>
                  <span class="stat-label">Votes</span>
                </div>
              </div>
              <div class="activity-actions">
                <div class="rating-section">
                  <label class="rating-label">Your Rating</label>
                  <div class="rating-buttons">
                    <button
                      v-for="i in 10"
                      :key="i"
                      :class="['rating-btn', { active: hasUserRating(activity.id) && getUserRating(activity.id) >= i }]"
                      @click="handleRatingChange(activity.id, i)"
                      :title="`Rate ${i}/10`"
                    >
                      {{ i }}
                    </button>
                  </div>
                </div>
                <div class="activity-controls">
                  <button
                    class="btn-commit-proposal"
                    @click="handleToggleProposal(activity.id, false)"
                  >
                    Commit to Group Event
                  </button>
                  <div class="activity-controls-secondary">
                    <button
                      class="btn-delete-proposal"
                      @click="handleDeleteProposal(activity.id)"
                    >
                      Delete Proposal
                    </button>
                    <div v-if="isCreator(activity.id) || isOrganizer()" class="activity-controls-tertiary">
                      <button
                        v-if="isCreator(activity.id)"
                        class="btn-toggle-solo"
                        @click="handleToggleSolo(activity.id, !(activity.solo ?? false))"
                      >
                        {{ activity.solo ? 'Make Public' : 'Make Solo' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="card">
          <div class="card-content">
            <div class="empty-state">
              <p class="empty-title">No proposals yet</p>
              <p class="empty-subtitle">Activities that can be committed will appear here</p>
            </div>
          </div>
        </div>
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
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="newAttraction.solo"
              />
              <span>Make this a solo activity (only visible to me)</span>
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="newAttraction.proposal"
                :checked="true"
              />
              <span>Start as proposal (can be committed later)</span>
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showAddDialog = false">
              Cancel
            </button>
            <button type="submit" class="btn-submit">Add Attraction</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Activity Dialog -->
    <div v-if="showEditDialog && editingActivity" class="dialog-overlay" @click="showEditDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">Edit Activity</h2>
          <p class="dialog-description">Update activity details</p>
        </div>
        <form @submit.prevent="handleSaveEdit" class="dialog-form">
          <div class="form-group">
            <label for="edit-title">Title</label>
            <input
              id="edit-title"
              v-model="editForm.title"
              type="text"
              required
              placeholder="Activity title"
            />
          </div>
          <div class="form-group">
            <label for="edit-description">Description</label>
            <textarea
              id="edit-description"
              v-model="editForm.description"
              placeholder="Activity description"
              rows="3"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="edit-start">Start Date & Time</label>
              <input
                id="edit-start"
                v-model="editForm.start"
                type="datetime-local"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-end">End Date & Time</label>
              <input
                id="edit-end"
                v-model="editForm.end"
                type="datetime-local"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label for="edit-cost">Cost per Person ($)</label>
            <input
              id="edit-cost"
              v-model.number="editForm.cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showEditDialog = false">
              Cancel
            </button>
            <button type="submit" class="btn-submit">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="dialog-overlay" @click="cancelConfirm">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-icon">⚠️</div>
        <h3 class="confirm-title">{{ confirmDialogConfig?.title }}</h3>
        <p class="confirm-message">{{ confirmDialogConfig?.message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="cancelConfirm">
            {{ confirmDialogConfig?.cancelText || 'Cancel' }}
          </button>
          <button class="btn-confirm" @click="confirmAction">
            {{ confirmDialogConfig?.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '../../stores/useAuth';
import { activityApi, ratingApi, invitationApi, userApi } from '../../services/api';
import type { ActivityWithDetails, Traveler } from '../../types/trip';

const props = defineProps<{
  activities: ActivityWithDetails[];
  travelers: Traveler[];
  tripId: string;
  organizerId?: string;
}>();

const emit = defineEmits<{
  (e: 'rate', activityId: string, rating: number): void;
  (e: 'toggle-attendance', activityId: string, travelerId: string): void;
  (e: 'add-activity', activity: ActivityWithDetails): void;
  (e: 'delete-activity', activityId: string): void;
  (e: 'refresh-activities'): void;
}>();

const { currentUser, getSession } = useAuth();
const currentUserId = computed(() => currentUser.value?.id || '');

// State
const activeView = ref<'mine' | 'group' | 'proposals'>('proposals');
const showAddDialog = ref(false);
const userRatings = ref<Record<string, number>>({});
const ratings = ref<Record<string, { rater: string; num: number; ratingId: string }[]>>({});
const optedInAttractions = ref<Set<string>>(new Set());
const activityInvitations = ref<Record<string, { invitation: string; accepted: "Yes" | "No" | "Maybe" }>>({});
const allActivityInvitations = ref<Record<string, Array<{ invitee: string; accepted: "Yes" | "No" | "Maybe" }>>>({});
const actualUserId = ref<string | null>(null);
const showConfirmDialog = ref(false);
const confirmDialogConfig = ref<{
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
} | null>(null);
const showEditDialog = ref(false);
const editingActivity = ref<ActivityWithDetails | null>(null);
const editForm = ref({
  title: '',
  description: '',
  start: '',
  end: '',
  cost: 0,
});

// Helper to get date from activity
function getActivityDate(activity: ActivityWithDetails): string {
  if (!activity.start) return '';
  return new Date(activity.start).toISOString().split('T')[0];
}

// Helper to get time from activity
function getActivityTime(activity: ActivityWithDetails): string {
  if (!activity.start) return '';
  return new Date(activity.start).toTimeString().slice(0, 5);
}

// Helper to get end time from activity
function getActivityEndTime(activity: ActivityWithDetails): string {
  if (!activity.end) return '';
  return new Date(activity.end).toTimeString().slice(0, 5);
}

// Check if two activities have overlapping time ranges
function hasTimeConflict(activity1: ActivityWithDetails, activity2: ActivityWithDetails): boolean {
  if (!activity1.start || !activity1.end || !activity2.start || !activity2.end) {
    return false; // Can't determine conflict without times
  }
  
  const start1 = new Date(activity1.start).getTime();
  const end1 = new Date(activity1.end).getTime();
  const start2 = new Date(activity2.start).getTime();
  const end2 = new Date(activity2.end).getTime();
  
  // Check for overlap: activities conflict if they overlap in time
  // Two ranges overlap if: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

// Get conflicts for a proposal (conflicts with My Events or Group Events)
function getProposalConflicts(proposal: ActivityWithDetails): Array<{ activity: ActivityWithDetails; type: 'my-event' | 'group-event' }> {
  const conflicts: Array<{ activity: ActivityWithDetails; type: 'my-event' | 'group-event' }> = [];
  
  // Get all committed events (myEvents and groupEvents) to check against
  const allCommittedEvents = [
    ...myEvents.value,
    ...groupEvents.value.filter(ge => !myEvents.value.some(me => me.id === ge.id)), // Avoid duplicates
  ];
  
  allCommittedEvents.forEach(event => {
    if (event.id !== proposal.id && hasTimeConflict(proposal, event)) {
      // Determine if it's a my-event or group-event
      const isMyEvent = myEvents.value.some(me => me.id === event.id);
      conflicts.push({ 
        activity: event, 
        type: isMyEvent ? 'my-event' : 'group-event' 
      });
    }
  });
  
  return conflicts;
}

// Get conflicts for My Events or Group Events (conflicts with each other, but not proposals)
function getCommittedEventConflicts(activity: ActivityWithDetails): Array<{ activity: ActivityWithDetails; type: 'my-event' | 'group-event' }> {
  const conflicts: Array<{ activity: ActivityWithDetails; type: 'my-event' | 'group-event' }> = [];
  
  // Check against other My Events
  myEvents.value.forEach(myEvent => {
    if (myEvent.id !== activity.id && hasTimeConflict(activity, myEvent)) {
      conflicts.push({ activity: myEvent, type: 'my-event' });
    }
  });
  
  // Check against Group Events (but not if it's already in myEvents to avoid duplicates)
  groupEvents.value.forEach(groupEvent => {
    if (groupEvent.id !== activity.id && 
        !myEvents.value.some(me => me.id === groupEvent.id) && 
        hasTimeConflict(activity, groupEvent)) {
      conflicts.push({ activity: groupEvent, type: 'group-event' });
    }
  });
  
  return conflicts;
}

// Filter activities by view
const myEvents = computed(() => {
  return props.activities
    .filter(activity => {
      // Backend already filters solo activities - if we see a solo activity, it's for us
      // Include solo events (backend ensures they're created by current user)
      if (activity.solo === true) {
        return true;
      }
      // Include committed group events where the user has accepted the invitation
      if (activity.proposal === false && !activity.solo) {
        // Check invitation status first (most reliable)
        const invitation = activityInvitations.value[activity.id];
        if (invitation && invitation.accepted === "Yes") {
          return true;
        }
        // Fallback to attendees array if invitation data not loaded yet
        if (activity.attendees?.includes(currentUserId.value)) {
          return true;
        }
      }
      return false;
    })
    .sort((a, b) => {
      if (!a.start || !b.start) return 0;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
});

const groupEvents = computed(() => {
  return props.activities
    .filter(activity => !activity.proposal && !activity.solo)
    .sort((a, b) => {
      if (!a.start || !b.start) return 0;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
});

// Calculate average happiness of current itinerary (committed group events)
function getCurrentItineraryHappiness(): number {
  const committedEvents = props.activities.filter(
    activity => !activity.proposal && !activity.solo
  );
  
  if (committedEvents.length === 0) return 0;
  
  let totalScore = 0;
  let totalVotes = 0;
  
  committedEvents.forEach(activity => {
    const activityRatings = ratings.value[activity.id] || [];
    const voteCount = activityRatings.length;
    const avgScore = getAverageScore(activity.id);
    
    if (voteCount > 0 && avgScore > 0) {
      totalScore += avgScore * voteCount; // Weight by number of votes
      totalVotes += voteCount;
    }
  });
  
  return totalVotes > 0 ? totalScore / totalVotes : 0;
}

// Determine if a proposal should be recommended
function isRecommended(activity: ActivityWithDetails): boolean {
  const proposalScore = getAverageScore(activity.id);
  const proposalVotes = getVoteCount(activity.id);
  const itineraryHappiness = getCurrentItineraryHappiness();
  
  // Recommend if:
  // 1. Proposal has a good rating (>= 7) with at least 2 votes
  // 2. Proposal is significantly better than current itinerary happiness
  // 3. Or if itinerary is low (< 6) and proposal is decent (>= 6)
  const hasGoodRating = proposalScore >= 7 && proposalVotes >= 2;
  const significantlyBetter = proposalScore >= itineraryHappiness + 1.5;
  const wouldImproveLowItinerary = itineraryHappiness < 6 && proposalScore >= 6 && proposalVotes >= 1;
  
  return hasGoodRating || significantlyBetter || wouldImproveLowItinerary;
}

// Generate recommendation reason
function getRecommendationReason(activity: ActivityWithDetails): string {
  const proposalScore = getAverageScore(activity.id);
  const proposalVotes = getVoteCount(activity.id);
  const itineraryHappiness = getCurrentItineraryHappiness();
  
  if (proposalScore >= 8 && proposalVotes >= 2) {
    return `Highly rated by ${proposalVotes} ${proposalVotes === 1 ? 'person' : 'people'} (${proposalScore.toFixed(1)}/10) - the group loves this idea!`;
  }
  
  if (proposalScore >= itineraryHappiness + 1.5) {
    const improvement = (proposalScore - itineraryHappiness).toFixed(1);
    return `Would significantly improve your itinerary! This activity is rated ${improvement} points higher than your current events.`;
  }
  
  if (itineraryHappiness < 6 && proposalScore >= 6) {
    return `Your current itinerary could use a boost (${itineraryHappiness.toFixed(1)}/10 avg). This proposal would add variety and excitement!`;
  }
  
  if (proposalVotes >= 3) {
    return `Popular choice with ${proposalVotes} ${proposalVotes === 1 ? 'vote' : 'votes'} - the group is interested!`;
  }
  
  return `Well-rated activity that the group would enjoy!`;
}

const proposals = computed(() => {
  const filtered = props.activities
    .filter(activity => activity.proposal && !activity.solo)
    .map(activity => ({
      ...activity,
      isRecommended: isRecommended(activity),
      recommendationReason: isRecommended(activity) ? getRecommendationReason(activity) : null,
    }));
  
  return filtered.sort((a, b) => {
    // Recommended proposals first
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    
    // Then sort by rating score descending
    const scoreA = getAverageScore(a.id);
    const scoreB = getAverageScore(b.id);
    if (Math.abs(scoreB - scoreA) > 0.1) {
      return scoreB - scoreA;
    }
    // If scores are similar, sort by date
    if (!a.start || !b.start) return 0;
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
});

// Get actual user ID from session (not username)
async function getActualUserId(): Promise<string | null> {
  const session = getSession();
  if (!session) {
    console.warn('No session available for getActualUserId');
    return null;
  }
  
  try {
    // Use the Sessioning API to get the actual user ID from the session
    const response = await userApi.getUserFromSession();
    if (response && response.user) {
      console.log('✅ getActualUserId success:', response.user);
      return response.user;
    }
    console.warn('getActualUserId: response missing user field:', response);
    return null;
  } catch (error) {
    console.error('Failed to get user ID from session:', error);
    return null;
  }
}

// Load ratings for all activities
async function loadRatings() {
  const session = getSession();
  if (!session) return;

  // Use cached actual user ID, or get it if not cached
  let userId = actualUserId.value;
  if (!userId) {
    userId = await getActualUserId();
    if (userId) {
      actualUserId.value = userId;
    }
  }

  try {
    for (const activity of props.activities) {
      // Skip loading ratings for solo events
      if (activity.solo) {
        continue;
      }
      
      try {
        const response = await ratingApi.getRatingsByItem({ item: activity.id });
        const allRatings = response.results || [];
        // Always store all ratings for average and vote count calculation
        ratings.value[activity.id] = allRatings;

        // Only try to find user's rating if we have a valid userId
        if (userId) {
          // Find current user's rating
          // Check both rater field and ensure it matches the actual user ID from session
          const userRating = allRatings.find(r => {
            const raterId = r.rater || (r as any).user;
            // Convert both to strings for comparison to handle any type mismatches
            return String(raterId) === String(userId);
          });
          
          if (userRating && typeof userRating.num === 'number' && userRating.num >= 1 && userRating.num <= 10) {
            // Use the actual rating from the backend
            userRatings.value[activity.id] = userRating.num;
          } else {
            // Explicitly clear if no rating exists
            if (userRatings.value[activity.id] !== undefined) {
              delete userRatings.value[activity.id];
            }
          }
        } else {
          // If we don't have userId, clear userRatings for this activity
          if (userRatings.value[activity.id] !== undefined) {
            delete userRatings.value[activity.id];
          }
        }
      } catch (e) {
        console.warn('Failed to load ratings for activity:', activity.id, e);
        // On error, don't set a default - buttons should remain unhighlighted
      }
    }
  } catch (error) {
    console.error('Error loading ratings:', error);
  }
}

// Load invitations for all activities
async function loadInvitations() {
  const session = getSession();
  if (!session) return;

  try {
    const response = await invitationApi.getMyInvitations();
    const myInvitations = response.results || [];
    
    // Reset all activity invitations
    allActivityInvitations.value = {};
    
    // Filter to only activity invitations (not trip invitations)
    // and map by activity ID
    myInvitations.forEach((inv: { invitation: string; event: string; acceptedStatus: "Yes" | "No" | "Maybe" }) => {
      // Map acceptedStatus to accepted for consistency
      const accepted = inv.acceptedStatus || (inv as any).accepted;
      // Check if this event is an activity (not a trip)
      const isActivity = props.activities.some(a => a.id === inv.event);
      if (isActivity) {
        // Store current user's invitation
        activityInvitations.value[inv.event] = {
          invitation: inv.invitation,
          accepted: accepted,
        };
        
        // Store in all invitations (we only have current user's for now)
        if (!allActivityInvitations.value[inv.event]) {
          allActivityInvitations.value[inv.event] = [];
        }
        allActivityInvitations.value[inv.event].push({
          invitee: currentUserId.value,
          accepted: accepted,
        });
        
        // Update opted-in status based on invitation
        if (accepted === "Yes") {
          optedInAttractions.value.add(inv.event);
        } else {
          optedInAttractions.value.delete(inv.event);
        }
      }
    });
  } catch (error) {
    console.error('Error loading invitations:', error);
  }
}

// Initialize opted-in attractions from activities (fallback)
function initializeOptedIn() {
  props.activities.forEach(activity => {
    // Only use attendees as fallback if we don't have invitation data
    if (activity.attendees?.includes(currentUserId.value) && !activityInvitations.value[activity.id]) {
      optedInAttractions.value.add(activity.id);
    }
  });
}

onMounted(async () => {
  // Wait a bit to ensure session is available
  await new Promise(resolve => setTimeout(resolve, 100));
  if (props.activities.length > 0) {
    await loadRatingsAndInvitationsIfReady();
  }
  initializeOptedIn();
});

// Helper to load ratings and invitations when both are ready
async function loadRatingsAndInvitationsIfReady() {
  // Get actual user ID if we don't have it cached
  if (!actualUserId.value) {
    actualUserId.value = await getActualUserId();
  }
  
  if (actualUserId.value && props.activities.length > 0) {
    await loadRatings();
    await loadInvitations();
  }
}

// Watch for when currentUserId becomes available
watch(currentUserId, async (newUserId, oldUserId) => {
  // Load when userId becomes available and we have activities
  if (newUserId && props.activities.length > 0) {
    await loadRatingsAndInvitationsIfReady();
  }
}, { immediate: true });

// Watch for when activities become available
watch(() => props.activities, async (newActivities, oldActivities) => {
  // Only reload ratings if activities actually changed (not just rating updates)
  const activityIdsChanged = 
    !oldActivities || 
    newActivities.length !== oldActivities.length ||
    newActivities.some((a, i) => !oldActivities[i] || a.id !== oldActivities[i].id);
  
  if (activityIdsChanged && newActivities.length > 0) {
    await loadRatingsAndInvitationsIfReady();
  }
  initializeOptedIn();
}, { deep: true, immediate: true });

// Helper functions
function getAverageScore(activityId: string): number {
  const activityRatings = ratings.value[activityId] || [];
  if (activityRatings.length === 0) {
    return 0;
  }
  const sum = activityRatings.reduce((acc, r) => {
    const ratingNum = r.num || (r as any).ratingNum || 0;
    return acc + ratingNum;
  }, 0);
  const average = sum / activityRatings.length;
  const result = isNaN(average) ? 0 : average;
  
  // Debug: log if we have ratings but average is 0
  if (activityRatings.length > 0 && result === 0) {
    console.warn('Average is 0 but ratings exist:', {
      activityId,
      ratings: activityRatings,
      sum,
      average,
      length: activityRatings.length
    });
  }
  
  return result;
}

function formatRating(score: number): string {
  if (isNaN(score) || score === 0) return '0.0';
  return score.toFixed(1);
}

function getVoteCount(activityId: string): number {
  return (ratings.value[activityId] || []).length;
}

function getOptedInCount(activityId: string): number {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return 0;
  
  // Only count invitations with accepted === "Yes"
  // Don't count the creator automatically - they must opt in like everyone else
  const invitations = allActivityInvitations.value[activityId] || [];
  const acceptedCount = invitations.filter(inv => inv.accepted === "Yes").length;
  
  // Return the count of people who have actually opted in
  // If we don't have invitation data yet, return 0 (not a fallback count)
  return acceptedCount;
}

function hasUserRating(activityId: string): boolean {
  const rating = userRatings.value[activityId];
  return rating !== undefined && rating !== null && rating !== 0;
}

function getUserRating(activityId: string): number {
  // Return the actual rating if it exists
  const rating = userRatings.value[activityId];
  if (rating !== undefined && rating !== null && rating !== 0) {
    return rating;
  }
  // Return 0 if no rating exists (buttons won't be highlighted)
  return 0;
}

function isOptedIn(activityId: string): boolean {
  return optedInAttractions.value.has(activityId);
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

function isCreator(activityId: string): boolean {
  const activity = props.activities.find(a => a.id === activityId);
  return activity?.createdBy === currentUserId.value;
}

function isOrganizer(): boolean {
  return props.organizerId === currentUserId.value;
}

function canDelete(activityId: string): boolean {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return false;
  
  // Solo activity: only creator can delete
  if (activity.solo) {
    return isCreator(activityId);
  }
  
  // Proposal activity: any trip member can delete
  if (activity.proposal) {
    return true;
  }
  
  // Committed activity: organizer only
  return isOrganizer();
}

// Handlers
async function handleRatingChange(activityId: string, rating: number) {
  const session = getSession();
  if (!session) return;

  // Store previous rating for potential rollback
  const previousRating = userRatings.value[activityId];
  
  // Update local state immediately for responsive UI
  userRatings.value[activityId] = rating;

  try {
    // Use setRating which creates or updates automatically
    await ratingApi.setRating({
      item: activityId,
      ratingNum: rating,
    });

    // Refresh ratings to get updated average
    const response = await ratingApi.getRatingsByItem({ item: activityId });
    ratings.value[activityId] = response.results || [];
    
    // Update user rating from response to ensure it matches what we just saved
    const userRating = response.results.find(r => r.rater === currentUserId.value);
    if (userRating && userRating.num !== undefined && userRating.num !== null) {
      // Update with the actual saved rating from backend
      userRatings.value[activityId] = userRating.num;
    }
    
    emit('rate', activityId, rating);
  } catch (error) {
    console.error(`Failed to save rating for ${activityId}:`, error);
    // Revert local state on error
    if (previousRating !== undefined) {
      userRatings.value[activityId] = previousRating;
    } else {
      delete userRatings.value[activityId];
    }
  }
}

async function handleToggleOptIn(activityId: string) {
  const session = getSession();
  if (!session) return;

  const invitation = activityInvitations.value[activityId];
  if (!invitation) {
    console.error('No invitation found for activity:', activityId);
    return;
  }

  try {
    const isCurrentlyOptedIn = invitation.accepted === "Yes";
    
    if (isCurrentlyOptedIn) {
      // Opt out: reject the invitation
      await invitationApi.rejectInvitation({ invitation: invitation.invitation });
      activityInvitations.value[activityId].accepted = "No";
      optedInAttractions.value.delete(activityId);
      
      // Update allActivityInvitations
      if (allActivityInvitations.value[activityId]) {
        const userInv = allActivityInvitations.value[activityId].find(inv => inv.invitee === currentUserId.value);
        if (userInv) {
          userInv.accepted = "No";
        }
      }
    } else {
      // Opt in: accept the invitation
      await invitationApi.acceptInvitation({ invitation: invitation.invitation });
      activityInvitations.value[activityId].accepted = "Yes";
      optedInAttractions.value.add(activityId);
      
      // Update allActivityInvitations
      if (allActivityInvitations.value[activityId]) {
        const userInv = allActivityInvitations.value[activityId].find(inv => inv.invitee === currentUserId.value);
        if (userInv) {
          userInv.accepted = "Yes";
        } else {
          // Add if doesn't exist
          if (!allActivityInvitations.value[activityId]) {
            allActivityInvitations.value[activityId] = [];
          }
          allActivityInvitations.value[activityId].push({
            invitee: currentUserId.value,
            accepted: "Yes",
          });
        }
      }
    }
    
    // Reload invitations to ensure we have the latest state from backend
    await loadInvitations();
    // Also refresh activities to get updated data
    emit('refresh-activities');
  } catch (error) {
    console.error('Error toggling opt-in:', error);
    alert('Failed to update attendance status');
  }
}

async function handleToggleSolo(activityId: string, solo: boolean) {
  const session = getSession();
  if (!session) return;

  try {
    await activityApi.modifySolo({
      activity: activityId,
      solo,
    });
    emit('refresh-activities');
  } catch (error) {
    console.error('Error toggling solo:', error);
    alert('Failed to update solo status');
  }
}

async function handleToggleProposal(activityId: string, proposal: boolean) {
  const session = getSession();
  if (!session) return;

  try {
    await activityApi.modifyProposal({
      activity: activityId,
      proposal,
    });
    
    // If committing a proposal (proposal: false), the backend creates invitations for all trip members
    // We need to reload invitations so the frontend knows about them
    if (!proposal) {
      // Wait a bit for the backend to create invitations, then reload
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadInvitations();
    }
    
    emit('refresh-activities');
  } catch (error) {
    console.error('Error toggling proposal:', error);
    alert('Failed to update proposal status');
  }
}

function handleDeleteProposal(activityId: string) {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return;

  showConfirmDialog.value = true;
  confirmDialogConfig.value = {
    title: 'Delete Proposal',
    message: `Are you sure you want to delete the proposal "${activity.title}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const session = getSession();
      if (!session) return;

      try {
        await activityApi.deleteActivity({
          activity: activityId,
        });
        emit('delete-activity', activityId);
        emit('refresh-activities');
      } catch (error) {
        console.error('Error deleting proposal:', error);
        alert('Failed to delete proposal');
      } finally {
        showConfirmDialog.value = false;
        confirmDialogConfig.value = null;
      }
    },
  };
}

function openEditDialog(activity: ActivityWithDetails) {
  editingActivity.value = activity;
  editForm.value = {
    title: activity.title || '',
    description: activity.description || '',
    start: activity.start ? new Date(activity.start).toISOString().slice(0, 16) : '',
    end: activity.end ? new Date(activity.end).toISOString().slice(0, 16) : '',
    cost: activity.cost || 0,
  };
  showEditDialog.value = true;
}

async function handleSaveEdit() {
  const session = getSession();
  if (!session || !editingActivity.value) {
    console.warn('Cannot save edit: no session or activity');
    return;
  }

  try {
    const activity = editingActivity.value;
    console.log('Saving edits for activity:', activity.id, editForm.value);
    
    // Update title if changed
    if (editForm.value.title !== activity.title) {
      console.log('Updating title:', activity.title, '->', editForm.value.title);
      await activityApi.modifyTitle({
        activity: activity.id,
        title: editForm.value.title,
      });
    }

    // Update duration if changed
    // Convert datetime-local to ISO string for comparison
    const newStart = editForm.value.start ? new Date(editForm.value.start).toISOString() : null;
    const newEnd = editForm.value.end ? new Date(editForm.value.end).toISOString() : null;
    
    // Compare dates (normalize to ISO strings for comparison)
    const currentStart = activity.start ? new Date(activity.start).toISOString() : null;
    const currentEnd = activity.end ? new Date(activity.end).toISOString() : null;
    
    if (newStart && newEnd && (newStart !== currentStart || newEnd !== currentEnd)) {
      console.log('Updating duration:', { currentStart, newStart, currentEnd, newEnd });
      await activityApi.modifyDuration({
        activity: activity.id,
        startDateTime: newStart,
        endDateTime: newEnd,
      });
    }

    // Update cost if changed (handle potential float precision issues)
    const costChanged = Math.abs((editForm.value.cost || 0) - (activity.cost || 0)) > 0.01;
    if (costChanged) {
      console.log('Updating cost:', activity.cost, '->', editForm.value.cost);
      await activityApi.modifyCost({
        activity: activity.id,
        newCost: editForm.value.cost,
      });
    }

    // Note: Description is not stored in backend, so we skip it
    // If you want to store description, you'd need to add a backend endpoint

    console.log('Edit saved successfully');
    showEditDialog.value = false;
    editingActivity.value = null;
    emit('refresh-activities');
  } catch (error) {
    console.error('Error saving activity edits:', error);
    alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function handleRevertToProposal(activityId: string) {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return;

  showConfirmDialog.value = true;
  confirmDialogConfig.value = {
    title: 'Convert to Proposal',
    message: `⚠️ Warning: Are you sure you want to convert "${activity.title}" back to a proposal?\n\nThis will:\n• Remove it from everyone's itinerary\n• Move it to the proposals tab\n• People will need to opt in again if it's committed later`,
    confirmText: 'Convert to Proposal',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const session = getSession();
      if (!session) return;

      try {
        await activityApi.modifyProposal({
          activity: activityId,
          proposal: true,
        });
        emit('refresh-activities');
      } catch (error) {
        console.error('Error converting to proposal:', error);
        alert('Failed to convert to proposal');
      } finally {
        showConfirmDialog.value = false;
        confirmDialogConfig.value = null;
      }
    },
  };
}

async function handleDeleteActivity(activityId: string) {
  const activity = props.activities.find(a => a.id === activityId);
  if (!activity) return;

  showConfirmDialog.value = true;
  confirmDialogConfig.value = {
    title: 'Delete Activity',
    message: `Are you sure you want to delete "${activity.title}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const session = getSession();
      if (!session) return;

      try {
        await activityApi.deleteActivity({
          activity: activityId,
        });
        emit('delete-activity', activityId);
        emit('refresh-activities');
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity');
      } finally {
        showConfirmDialog.value = false;
        confirmDialogConfig.value = null;
      }
    },
  };
}

function confirmAction() {
  if (confirmDialogConfig.value?.onConfirm) {
    confirmDialogConfig.value.onConfirm();
  }
}

function cancelConfirm() {
  showConfirmDialog.value = false;
  confirmDialogConfig.value = null;
}

async function handleAddAttraction() {
  const session = getSession();
  if (!session) return;

  try {
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
        const start = new Date(startDateTime);
        start.setHours(start.getHours() + 2);
        endDateTime = start.toISOString();
      } else {
        endDateTime = `${newAttraction.value.date}T23:59:59`;
      }
    } else {
      const now = new Date();
      startDateTime = now.toISOString();
      const end = new Date(now);
      end.setHours(end.getHours() + 2);
      endDateTime = end.toISOString();
    }

    const activity: ActivityWithDetails = {
      id: '',
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
      solo: newAttraction.value.solo,
      proposal: newAttraction.value.proposal,
      createdBy: currentUserId.value,
    };

    emit('add-activity', activity);

    newAttraction.value = {
      name: '',
      description: '',
      estimatedCost: 0,
      estimatedDuration: '',
      date: '',
      time: '',
      endTime: '',
      solo: false,
      proposal: true,
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
  solo: false,
  proposal: true,
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

.recommended-card {
  border: 3px solid #fbbf24;
  box-shadow: 0 4px 12px -1px rgba(251, 191, 36, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
}

.badge.recommended-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.4);
}

.badge.recommended-badge svg {
  width: 0.875rem;
  height: 0.875rem;
}

.recommendation-reason {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-left: 3px solid #fbbf24;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.5;
}

.recommendation-reason svg {
  flex-shrink: 0;
  margin-top: 0.125rem;
  color: #f59e0b;
}

.conflict-warning {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fee2e2;
  border-left: 3px solid #ef4444;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.conflict-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #991b1b;
}

.conflict-header svg {
  flex-shrink: 0;
  color: #ef4444;
}

.conflict-title {
  color: #991b1b;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.conflict-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7f1d1d;
  font-size: 0.8125rem;
}

.conflict-event-name {
  font-weight: 500;
}

.conflict-event-type {
  color: #991b1b;
  font-size: 0.75rem;
}

.card-gradient {
  height: 6px;
  background: linear-gradient(to right, #14b8a6, #ff7b6b, #f4c542);
}

.card-header {
  position: relative;
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

.btn-add-attraction {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #ff7b6b;
  color: white;
  border: none;
  border-radius: 0.5rem;
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

.tab-toggles-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.tab-toggles {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e0e0e0;
}

.toggle {
  flex: 1;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.toggle:hover {
  color: #1e3a5f;
  background: #f9fafb;
}

.toggle.active {
  color: #14b8a6;
  border-bottom-color: #14b8a6;
  font-weight: 600;
}

.attractions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attraction-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.attraction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
}

.recommended-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -3px rgba(251, 191, 36, 0.4), 0 8px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #f59e0b;
}

.attraction-card.opted-out {
  opacity: 0.7;
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

.badge.solo-badge {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.badge.proposal-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.badge.committed-badge {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.badge.opted-in-badge {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.badge.opted-out-badge {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.attraction-description {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-settings-small {
  padding: 0.375rem;
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-settings-small:hover {
  background: #bae6fd;
  transform: scale(1.1);
}

.btn-delete-small {
  padding: 0.375rem;
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete-small:hover {
  background: #fcc;
  transform: scale(1.1);
}

.card-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.attraction-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-green-600 {
  color: #16a34a;
}

.activity-stats {
  display: flex;
  gap: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  margin: 1rem 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e3a5f;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.rating-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.rating-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.rating-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-btn:hover {
  border-color: #14b8a6;
  color: #14b8a6;
  transform: scale(1.05);
  background: #f0fdfa;
}

.rating-btn.active {
  background: #14b8a6;
  border-color: #14b8a6;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
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

.activity-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.btn-toggle-proposal,
.btn-toggle-solo,
.btn-delete-activity {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-toggle-proposal {
  background: #3b82f6;
  color: white;
}

.btn-toggle-proposal:hover {
  background: #2563eb;
}

.btn-commit-proposal {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(20, 184, 166, 0.2);
}

.btn-commit-proposal:hover {
  background: #0d9488;
  box-shadow: 0 4px 8px rgba(20, 184, 166, 0.3);
  transform: translateY(-1px);
}

.activity-controls-secondary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.activity-controls-tertiary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-toggle-solo {
  background: #8b5cf6;
  color: white;
}

.btn-toggle-solo:hover {
  background: #7c3aed;
}

.btn-delete-activity {
  background: #ef4444;
  color: white;
}

.btn-delete-activity:hover {
  background: #dc2626;
}

.btn-delete-proposal {
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-delete-proposal:hover {
  background: #dc2626;
}

.btn-revert-to-proposal {
  background: #f59e0b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  width: 100%;
  margin-bottom: 0.5rem;
}

.btn-revert-to-proposal:hover {
  background: #d97706;
}

.confirm-dialog {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 0.75rem;
}

.confirm-message {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  white-space: pre-line;
  text-align: left;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-cancel {
  padding: 0.5rem 1.5rem;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  padding: 0.5rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background: #dc2626;
}


.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #64748b;
}

.empty-title {
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1e3a5f;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-submit {
  padding: 0.5rem 1rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background: #0d9488;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.text-yellow-500 {
  color: #eab308;
}

.fill-yellow-500 {
  fill: #eab308;
}
</style>
