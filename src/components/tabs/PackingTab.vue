<template>
  <div class="packing-tab">
    <div class="packing-grid">
      <!-- My Packing List -->
      <div class="card">
        <div class="card-header">
          <h2>My Packing List</h2>
          <div class="progress-indicator">
            {{ checkedCount }}/{{ personalItems.length }}
          </div>
        </div>
        <div class="packing-list">
          <div
            v-for="category in categories"
            :key="category"
            class="category-section"
          >
            <h3 class="category-title">{{ category }}</h3>
            <div class="items-list">
              <label
                v-for="item in getPersonalItemsByCategory(category)"
                :key="item.id"
                class="packing-item"
              >
                <input
                  type="checkbox"
                  :checked="item.finished"
                  @change="toggleItem(item.id)"
                />
                <span :class="{ checked: item.finished }">{{ item.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Shared Items -->
      <div class="card">
        <div class="card-header">
          <h2>Shared Items</h2>
          <div class="progress-indicator">
            {{ checkedSharedCount }}/{{ sharedItems.length }}
          </div>
        </div>
        <div class="shared-items-list">
          <div
            v-for="item in sharedItems"
            :key="item.id"
            class="shared-item"
          >
            <label class="shared-item-checkbox">
                <input
                  type="checkbox"
                  :checked="item.finished"
                  @change="toggleItem(item.id)"
                />
                <span :class="{ checked: item.finished }">{{ item.name }}</span>
            </label>
            <div class="assigned-to" v-if="item.assignedTo">
              <span class="assigned-label">Assigned to:</span>
              <span class="assigned-name">{{ getTravelerName(item.assignedTo) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChecklistItem, Traveler } from '../../types/trip';

const props = defineProps<{
  items: ChecklistItem[];
  travelers: Traveler[];
}>();

const emit = defineEmits<{
  (e: 'toggle-item', itemId: string): void;
}>();

const personalItems = computed(() => {
  return props.items.filter(item => !item.isShared);
});

const sharedItems = computed(() => {
  return props.items.filter(item => item.isShared);
});

const checkedCount = computed(() => {
  return personalItems.value.filter(item => item.finished).length;
});

const checkedSharedCount = computed(() => {
  return sharedItems.value.filter(item => item.finished).length;
});

const categories = computed(() => {
  const cats = new Set(personalItems.value.map(item => item.category));
  return Array.from(cats).sort();
});

function getPersonalItemsByCategory(category: string) {
  return personalItems.value.filter(item => item.category === category);
}

function getTravelerName(travelerId: string): string {
  return props.travelers.find(t => t.id === travelerId)?.name || 'Unknown';
}

function toggleItem(itemId: string) {
  emit('toggle-item', itemId);
}
</script>

<style scoped>
.packing-tab {
  width: 100%;
}

.packing-grid {
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

.progress-indicator {
  background: #e8f5e9;
  color: #42b983;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.packing-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.packing-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.packing-item:hover {
  background: #f0f0f0;
}

.packing-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.packing-item span {
  flex: 1;
  color: #333;
  transition: all 0.2s;
}

.packing-item span.checked {
  text-decoration: line-through;
  color: #888;
}

.shared-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shared-item {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #42b983;
}

.shared-item-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.shared-item-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.shared-item-checkbox span {
  font-weight: 500;
  color: #333;
  transition: all 0.2s;
}

.shared-item-checkbox span.checked {
  text-decoration: line-through;
  color: #888;
}

.assigned-to {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.assigned-label {
  font-size: 0.85rem;
  color: #666;
}

.assigned-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #42b983;
}
</style>

