<template>
  <div class="packing-tab">
    <!-- Generation Overlay -->
    <div v-if="generating" class="generation-overlay">
      <div class="generation-modal">
        <div class="generation-header">
          <div class="spinner"></div>
          <h3 class="generation-title">Generating Your Packing List</h3>
          <p class="generation-stage">{{ generationStage }}</p>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${generationProgress}%` }"></div>
          </div>
          <p class="progress-text">{{ generationProgress }}%</p>
        </div>
        <div class="generation-steps">
          <div class="step" :class="{ active: generationProgress >= 10, completed: generationProgress > 10 }">
            <div class="step-icon">✓</div>
            <span>Preparing</span>
          </div>
          <div class="step" :class="{ active: generationProgress >= 30, completed: generationProgress > 30 }">
            <div class="step-icon">✓</div>
            <span>Requesting AI</span>
          </div>
          <div class="step" :class="{ active: generationProgress >= 50, completed: generationProgress > 50 }">
            <div class="step-icon">✓</div>
            <span>Generating Items</span>
          </div>
          <div class="step" :class="{ active: generationProgress >= 95, completed: generationProgress >= 100 }">
            <div class="step-icon">✓</div>
            <span>Finalizing</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="space-y-6">
      <!-- Packing List Header Card -->
      <div class="card">
        <div class="card-gradient-blue"></div>
        <div class="card-header">
          <div>
            <h2 class="card-title">Packing List</h2>
            <p class="card-description">AI-generated based on your trip details</p>
          </div>
          <div v-if="personalItems.length > 0" class="progress-section">
            <div class="progress-badge">
              <p class="progress-label">Progress</p>
              <p class="progress-value">{{ checkedCount }}/{{ personalItems.length }}</p>
            </div>
            <button class="btn-regenerate" @click="$emit('regenerate')" :disabled="generating">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ generating ? 'Generating...' : 'Regenerate List' }}
            </button>
          </div>
          <button v-else class="btn-generate" @click="$emit('generate')" :disabled="generating">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            {{ generating ? 'Generating...' : 'Generate List' }}
          </button>
        </div>
      </div>

      <div class="packing-grid" v-if="personalItems.length > 0">
        <!-- My Packing List -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">My Packing List</h2>
          </div>
          <div class="card-content">
            <div class="packing-list">
              <div
                v-for="category in categories"
                :key="category || 'uncategorized'"
                class="category-section"
              >
                <h3 class="category-title">{{ category || 'Uncategorized' }}</h3>
                <div class="items-list">
                  <div
                    v-for="item in getPersonalItemsByCategory(category || '')"
                    :key="item.id"
                    class="packing-item"
                  >
                    <label class="packing-item-label">
                      <input
                        type="checkbox"
                        :checked="item.finished"
                        @change="toggleItem(item.id)"
                      />
                      <span :class="{ checked: item.finished }">{{ item.name }}</span>
                    </label>
                    <div class="quantity-controls">
                      <button
                        type="button"
                        @click="handleQuantityChange(item.id, (item.quantity || 1) - 1)"
                        class="quantity-btn"
                        :disabled="(item.quantity || 1) <= 1"
                      >
                        -
                      </button>
                      <span class="quantity-value">{{ item.quantity || 1 }}</span>
                      <button
                        type="button"
                        @click="handleQuantityChange(item.id, (item.quantity || 1) + 1)"
                        class="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shared Items -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Shared Items</h2>
            <p class="card-description">Group coordination to avoid duplicates</p>
          </div>
          <div class="card-content">
            <div v-if="sharedItems.length === 0" class="empty-state">
              <svg class="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p>No shared items yet</p>
              <p class="text-sm mt-1">Mark items as "shared" to coordinate with your group</p>
            </div>
            <div v-else class="shared-items-list">
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
                <div class="assigned-to" v-if="item.assignee">
                  <select class="assign-select" :value="item.assignee">
                    <option v-for="traveler in travelers" :key="traveler.id" :value="traveler.id">
                      {{ traveler.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ChecklistItem, Traveler } from "../../types/trip";

const props = withDefaults(defineProps<{
	items: ChecklistItem[];
	travelers: Traveler[];
	generating?: boolean;
	generationStage?: string;
	generationProgress?: number;
}>(), {
	generating: false,
	generationStage: "",
	generationProgress: 0,
});

const emit = defineEmits<{
	(e: "toggle-item", itemId: string): void;
	(e: "quantity-change", itemId: string, quantity: number): void;
	(e: "regenerate"): void;
	(e: "generate"): void;
}>();

const personalItems = computed(() => {
	return props.items.filter((item) => !item.isShared);
});

const sharedItems = computed(() => {
	return props.items.filter((item) => item.isShared);
});

const checkedCount = computed(() => {
	return personalItems.value.filter((item) => item.finished).length;
});

const categories = computed(() => {
	const cats = new Set(
		personalItems.value.map((item) => item.category || "Uncategorized"),
	);
	return Array.from(cats).sort();
});

function getPersonalItemsByCategory(category: string) {
	return personalItems.value.filter(
		(item) => (item.category || "Uncategorized") === category,
	);
}

function toggleItem(itemId: string) {
	emit("toggle-item", itemId);
}

function handleQuantityChange(itemId: string, quantity: number) {
	if (quantity < 1) return;
	emit("quantity-change", itemId, quantity);
}
</script>

<style scoped>
.packing-tab {
  width: 100%;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.packing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.card {
  position: relative;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 0;
}

.card-gradient-blue {
  height: 6px;
  background: #7ba3d1;
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

.card-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-badge {
  text-align: right;
  background: rgba(123, 163, 209, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
}

.progress-label {
  font-size: 0.875rem;
  color: #64748b;
}

.progress-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7ba3d1;
}

.btn-generate {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #7ba3d1;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}


.btn-regenerate {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-regenerate:hover:not(:disabled) {
  background: #36a372;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-regenerate:disabled,
.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-generate:hover:not(:disabled) {
  background: #6a92c0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.w-12 {
  width: 3rem;
}

.h-12 {
  height: 3rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.opacity-20 {
  opacity: 0.2;
}

.mr-2 {
  margin-right: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.mt-1 {
  margin-top: 0.25rem;
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
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
  transition: background 0.2s;
}

.packing-item:hover {
  background: #f0f0f0;
}

.packing-item-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  cursor: pointer;
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

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(123, 163, 209, 0.1);
  border-radius: 9999px;
  padding: 0.125rem 0.25rem;
}

.quantity-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #7ba3d1;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: rgba(123, 163, 209, 0.2);
}

.quantity-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-value {
  min-width: 24px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e3a5f;
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

/* Generation Overlay */
.generation-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.generation-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.generation-header {
  text-align: center;
  margin-bottom: 2rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e0e0e0;
  border-top-color: #7ba3d1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.generation-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 0.5rem;
}

.generation-stage {
  font-size: 1rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.progress-container {
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7ba3d1, #42b983);
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

.generation-steps {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  opacity: 0.4;
}

.step.active {
  opacity: 1;
  background: rgba(123, 163, 209, 0.1);
}

.step.completed .step-icon {
  background: #42b983;
  color: white;
}

.step-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  transition: all 0.3s;
}

.step.active .step-icon {
  background: #7ba3d1;
  color: white;
}

.step span {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  font-weight: 500;
}

.step.active span {
  color: #1e3a5f;
}
</style>

