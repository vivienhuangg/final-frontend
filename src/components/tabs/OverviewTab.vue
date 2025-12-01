<template>
  <div class="overview-tab">
    <div class="space-y-6">
      <!-- Trip Members Card -->
      <div class="card">
        <div class="card-gradient"></div>
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <svg class="w-5 h-5 text-coral inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Trip Members
            </h2>
            <p class="card-description">People going on this trip</p>
          </div>
          <button class="btn-invite" @click="showInviteDialog = true">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Invite
          </button>
        </div>
        <div class="card-content">
          <div class="members-list">
            <div
              v-for="(traveler, index) in trip.travelers"
              :key="traveler.id"
              class="member-item"
            >
              <div
                class="member-avatar"
                :style="{ backgroundColor: getAvatarColor(index) }"
              >
                {{ (traveler.username || traveler.id).charAt(0).toUpperCase() }}
              </div>
              <div class="member-info">
                <p class="member-name">{{ traveler.username || traveler.id }}</p>
                <p class="member-username">{{ traveler.username || traveler.id }}</p>
              </div>
              <!-- traveler.role doesn't exist in Trip/Traveler types; derive ownership from trip.organizer -->
              <span v-if="traveler.id === trip.organizer" class="owner-badge">Owner</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Invite Dialog -->
    <div v-if="showInviteDialog" class="dialog-overlay" @click="showInviteDialog = false">
      <div class="dialog" @click.stop>
        <h2>Invite Travelers</h2>
        <form @submit.prevent="sendInvite">
          <div class="form-group">
            <label>Username</label>
            <input
              v-model="inviteUsername"
              type="text"
              required
              placeholder="friend_username"
            />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showInviteDialog = false">
              Cancel
            </button>
            <button type="submit" class="btn-primary">Send Invite</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Trip } from '../../types/trip';

const props = defineProps<{
  trip: Trip;
}>();

const emit = defineEmits<{
  (e: 'invite', username: string): void;
}>();

const showInviteDialog = ref(false);
const inviteUsername = ref('');
const settings = ref({
  anonymousVoting: false,
  hiddenGemsBoost: false,
});

function sendInvite() {
  emit('invite', inviteUsername.value.trim());
  inviteUsername.value = '';
  showInviteDialog.value = false;
}

function getAvatarColor(index: number): string {
  const colors = ['#14b8a6', '#ff7b6b', '#7ba3d1', '#f4c542', '#8ba888'];
  return colors[index % colors.length];
}
</script>

<style scoped>
.overview-tab {
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

.card-gradient {
  height: 6px;
  background: #ff7b6b;
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
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.card-description {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.text-coral {
  color: #ff7b6b;
}

.w-5 {
  width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}

.inline {
  display: inline;
}

.mr-2 {
  margin-right: 0.5rem;
}

.btn-invite {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-invite:hover {
  background: #0d9488;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.card-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  transition: box-shadow 0.2s;
}

.member-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #1e3a5f;
  margin-bottom: 0.25rem;
}

.member-username {
  font-size: 0.875rem;
  color: #64748b;
}

.owner-badge {
  font-size: 0.75rem;
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.setting-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.setting-description {
  margin-top: 0.5rem;
  margin-left: 2rem;
  font-size: 0.9rem;
  color: #666;
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
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dialog h2 {
  margin-bottom: 0.5rem;
  color: #1e3a5f;
  font-size: 1.125rem;
  font-weight: 600;
}

.dialog p {
  margin-bottom: 1.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1e3a5f;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #faf8f6;
}

.form-group input:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-primary {
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

.btn-primary:hover {
  background: #0d9488;
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
</style>
