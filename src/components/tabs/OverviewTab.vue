<template>
  <div class="overview-tab">
    <div class="overview-grid">
      <!-- Trip Members Card -->
      <div class="card">
        <div class="card-header">
          <h2>Trip Members</h2>
          <button class="btn-primary" @click="showInviteDialog = true">
            Invite
          </button>
        </div>
        <div class="members-list">
          <div
            v-for="traveler in trip.travelers"
            :key="traveler.id"
            class="member-item"
          >
            <div class="member-avatar">
              {{ traveler.name.charAt(0) }}
            </div>
            <div class="member-info">
              <p class="member-name">{{ traveler.name }}</p>
              <p class="member-email">{{ traveler.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trip Settings Card -->
      <div class="card">
        <div class="card-header">
          <h2>Trip Settings</h2>
        </div>
        <div class="settings-list">
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.anonymousVoting" />
              Anonymous Voting
            </label>
            <p class="setting-description">Hide individual ratings to reduce peer pressure</p>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.hiddenGemsBoost" />
              Hidden Gems Boost
            </label>
            <p class="setting-description">Give more weight to lesser-known but highly rated attractions</p>
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
            <label>Email Address</label>
            <input
              v-model="inviteEmail"
              type="email"
              required
              placeholder="friend@example.com"
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
  (e: 'invite', email: string): void;
}>();

const showInviteDialog = ref(false);
const inviteEmail = ref('');
const settings = ref({
  anonymousVoting: false,
  hiddenGemsBoost: false,
});

function sendInvite() {
  emit('invite', inviteEmail.value);
  inviteEmail.value = '';
  showInviteDialog.value = false;
}
</script>

<style scoped>
.overview-tab {
  width: 100%;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-size: 1.25rem;
  color: #333;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #42b983;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.member-email {
  font-size: 0.85rem;
  color: #666;
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

.btn-primary {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
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
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
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
  max-width: 400px;
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

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>

