<template>
  <div>
    <button class="help-fab" @click="open = true" aria-label="How it works">
      ?
    </button>
    <div v-if="open" class="help-overlay" @click.self="open = false">
      <div class="help-dialog">
        <div class="help-header">
          <h2>How TripSync Works</h2>
          <button class="help-close" @click="open = false" aria-label="Close">×</button>
        </div>
        <div class="help-content">
          <div class="feature-grid">
            <div class="feature">
              <div class="icon" aria-hidden="true">🏠</div>
              <div class="text">
                <h3>Dashboard</h3>
                <p>Create trips, see upcoming/past, manage invites.</p>
              </div>
            </div>
            <div class="feature">
              <div class="icon" aria-hidden="true">👥</div>
              <div class="text">
                <h3>Overview</h3>
                <p>View members, invite by username, owner marked.</p>
              </div>
            </div>
            <div class="feature">
              <div class="icon" aria-hidden="true">📍</div>
              <div class="text">
                <h3>Attractions</h3>
                <p>Add activities, rate ideas, track attendance.</p>
              </div>
            </div>
            <div class="feature">
              <div class="icon" aria-hidden="true">💸</div>
              <div class="text">
                <h3>Costs</h3>
                <p>Split by equal, % or amount; balances per user.</p>
              </div>
            </div>
            <div class="feature">
              <div class="icon" aria-hidden="true">🧳</div>
              <div class="text">
                <h3>Packing</h3>
                <p>Create personal and shared lists, adjust quantities, and assign items.</p>
              </div>
            </div>
            <div class="feature">
              <div class="icon" aria-hidden="true">📅</div>
              <div class="text">
                <h3>Calendar Export</h3>
                <p>Click the download icon on any activity to get an .ics file and add it to your calendar.</p>
              </div>
            </div>
          </div>

        </div>
        <div class="help-actions">
          <button class="help-ok" @click="open = false">Got it</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const open = ref(false);
</script>

<style scoped>
.help-fab {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #1e3a5f;
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
.help-fab:hover { background: #162b45; }

.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.help-dialog {
  width: min(680px, 92%);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}
.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}
.help-header h2 { margin: 0; font-size: 1.25rem; color: #1e3a5f; }
.help-close {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
}
.help-content {
  padding: 1rem 1.25rem;
  color: #334155;
}
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1rem;
}
.feature {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem;
}
.feature .icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}
.feature .text h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #1e3a5f;
}
.feature .text p {
  margin: 0.15rem 0 0 0;
  font-size: 0.85rem;
  color: #475569;
}

.help-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 1.25rem 1rem;
}
.help-ok {
  border: none;
  border-radius: 9999px;
  background: #1e3a5f;
  color: #f8fafc;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}
.help-ok:hover { background: #162b45; }
</style>
