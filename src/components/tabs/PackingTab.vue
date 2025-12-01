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

      <div class="card">
        <div class="card-gradient-blue"></div>

        <!-- Packing List Header Card -->
        <div class="card-header">
          <div>
            <h2 class="card-title">Packing List</h2>
            <p class="card-description">Track your packing list</p>
          </div>
          <div class="header-controls">
            <template v-if="assignedTotalCount > 0">
              <div class="progress-pill">
                <span class="progress-label">Progress</span>
                <span class="progress-value">{{ checkedCount }}/{{ assignedTotalCount }}</span>
              </div>
            </template>
            <button class="btn-add-manual" @click="showManualModal = true" :disabled="generating">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add item manually
            </button>

            <div class="ai-actions">
              <template v-if="assignedTotalCount > 0">
                <button class="btn-regenerate" @click="$emit('regenerate')" :disabled="generating">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ generating ? "Generating..." : "Regenerate List" }}
                </button>
              </template>
              <template v-else>
                <button class="btn-generate" @click="$emit('generate')" :disabled="generating">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {{ generating ? "Generating..." : "Generate List" }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="packing-grid">
        <!-- My Packing List (only items assigned to current user) -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">My Packing List</h2>
            <div class="header-controls">
              <template v-if="!selectingForShare && !selectingForDelete">
              </template>
              <template v-else-if="selectingForShare">
                <button
                  class="btn-primary"
                  @click="confirmMoveSelectedToShared"
                  :disabled="selectedCount === 0"
                  title="Confirm moving selected items to shared list"
                >
                  Confirm move<span v-if="selectedCount"> ({{ selectedCount }})</span>
                </button>
                <button
                  class="btn-secondary"
                  @click="cancelSelectingForShare"
                  title="Cancel selection"
                >
                  Cancel
                </button>
              </template>
              <template v-else>
                <button
                  class="btn-primary"
                  @click="confirmDeleteSelected"
                  :disabled="selectedDeleteCount === 0"
                  title="Confirm deleting selected items"
                >
                  Confirm delete<span v-if="selectedDeleteCount"> ({{ selectedDeleteCount }})</span>
                </button>
                <button
                  class="btn-secondary"
                  @click="cancelSelectingForDelete"
                  title="Cancel selection"
                >
                  Cancel
                </button>
              </template>
            </div>
          </div>
          <div class="card-content">
            <div v-if="myPersonalItems.length === 0 && myAssignedSharedItems.length === 0" class="empty-state">

              <p>No items assigned to you yet</p>
              <p class="text-sm mt-1">Add items or assign shared items to yourself to see them here.</p>
            </div>
            <div v-else class="packing-list">
              <!-- Personal items (grouped by category) -->
              <div v-for="category in categories" :key="category || 'uncategorized'" class="category-section">
                <template v-if="getPersonalItemsByCategory(category || '').length > 0">
                  <h3 class="category-title">{{ category || 'Uncategorized' }}</h3>
                  <div class="items-list">
                    <div
                      v-for="item in getPersonalItemsByCategory(category || '')"
                      :key="item.id"
                      class="packing-item"
                      :class="{
                        selecting: selectingForShare || selectingForDelete,
                        'selected-for-share': selectingForShare && isSelected(item.id),
                        'selected-for-delete': selectingForDelete && isDeleteSelected(item.id)
                      }"
                      @click="onRowClickPersonal(item.id)"
                    >
                      <label class="packing-item-label">
                        <input
                          type="checkbox"
                          :checked="item.finished"
                          :disabled="selectingForShare"
                          @click="handleCheckboxClick"
                          @change="toggleItem(item.id)"
                          title="Mark as packed"
                        />
                        <span :class="{ checked: item.finished }">{{ item.name }}</span>
                      </label>
                      <div class="quantity-controls">
                        <button type="button" @click.stop="handleQuantityChange(item.id, (item.quantity || 1) - 1)"
                          class="quantity-btn">
                          -
                        </button>
                        <span class="quantity-value">{{ item.quantity || 1 }}</span>
                        <button type="button" @click.stop="handleQuantityChange(item.id, (item.quantity || 1) + 1)"
                          class="quantity-btn">
                          +
                        </button>
                        <button
                          type="button"
                          class="quantity-btn"
                          title="Move to shared"
                          @click.stop="emit('move-items-to-shared', [item.id])"
                        >
                          🤝
                        </button>
                        <button
                          type="button"
                          class="delete-btn"
                          title="Remove item"
                          @click.stop="emit('delete-items', [item.id])"
                        >
                          <svg class="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Assigned shared items (flat list) -->
              <div v-if="myAssignedSharedItems.length > 0" class="category-section">
                <h3 class="category-title">Assigned Shared Items</h3>
                <div class="items-list">
                  <div
                    v-for="item in myAssignedSharedItems"
                    :key="item.id"
                    class="packing-item"
                    :class="{
                      selecting: selectingForDelete,
                      'selected-for-delete': selectingForDelete && isDeleteSelected(item.id)
                    }"
                    @click="onRowClickAssignedShared(item.id)"
                  >
                    <label class="packing-item-label">
                      <input type="checkbox" :checked="item.finished" :disabled="selectingForShare" @click="handleCheckboxClick" @change="toggleItem(item.id)" />
                      <span :class="{ checked: item.finished }">{{ item.name }}</span>
                    </label>
                    <div class="quantity-controls">
                      <button type="button" @click="handleQuantityChange(item.id, (item.quantity || 1) - 1)"
                        class="quantity-btn">
                        -
                      </button>
                      <span class="quantity-value">{{ item.quantity || 1 }}</span>
                      <button type="button" @click="handleQuantityChange(item.id, (item.quantity || 1) + 1)"
                        class="quantity-btn">
                        +
                      </button>
                      <button
                        type="button"
                        class="delete-btn"
                        title="Remove item"
                        @click.stop="emit('delete-items', [item.id])"
                      >
                        <svg class="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p>No shared items yet</p>
              <p class="text-sm mt-1">Mark items as "shared" to coordinate with your group</p>
            </div>
            <div v-else class="shared-items-list">
              <div v-for="item in sharedItems" :key="item.id" class="shared-item">
                <label class="shared-item-checkbox">
                  <input
                    type="checkbox"
                    :checked="item.finished"
                    @change="toggleItem(item.id)"
                    :disabled="Boolean(item.assignee) && String(item.assignee) !== currentUserId"
                    title="Only the assignee can check off this item"
                  />
                  <span :class="{ checked: item.finished }">{{ item.name }}</span>
                </label>
                <div class="quantity-controls">
                  <button
                    type="button"
                    @click.stop="handleQuantityChange(item.id, (item.quantity || 1) - 1)"
                    class="quantity-btn"
                  >
                    -
                  </button>
                  <span class="quantity-value">{{ item.quantity || 1 }}</span>
                  <button
                    type="button"
                    @click.stop="handleQuantityChange(item.id, (item.quantity || 1) + 1)"
                    class="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <div class="assigned-to">
                  <select class="assign-select" :value="String(item.assignee || '')" @change="onAssignChange(item.id, $event)">
                    <option value="" disabled>Select assignee</option>
                    <option v-for="traveler in travelers" :key="traveler.id" :value="String(traveler.id)">
                      {{ traveler.username || traveler.id }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="delete-btn"
                    title="Remove shared item"
                    @click.stop="emit('delete-items', [item.id])"
                  >
                    <svg class="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showManualModal" class="manual-modal-backdrop" @click.self="closeManualModal">
      <div class="manual-modal">
        <h3>Add manual item</h3>
        <p class="manual-modal-text">Type the item you want to track in your personal packing list.</p>
        <form class="manual-modal-form" @submit.prevent="submitNewItem">
          <input v-model="newItemName" class="manual-modal-input" type="text" placeholder="e.g. Sunscreen" autofocus />
          <input v-model.number="newItemQty" class="manual-modal-input" type="number" min="1" placeholder="Quantity (default 1)" />
          <label class="manual-modal-checkbox">
            <input type="checkbox" v-model="newItemShared" />
            <span>Add as shared item</span>
          </label>
          <div class="manual-modal-actions">
            <button type="button" class="btn-secondary" @click="closeManualModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="props.addingItem || !newItemName.trim()">
              <span v-if="props.addingItem" class="modal-spinner"></span>
              <span>{{ props.addingItem ? "Adding..." : "Add item" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useAuth } from "../../stores/useAuth";
import type { ChecklistItem, Traveler } from "../../types/trip";

const props = withDefaults(defineProps<{
  items: ChecklistItem[];
  travelers: Traveler[];
  generating?: boolean;
  generationStage?: string;
  generationProgress?: number;
  addingItem?: boolean;
}>(), {
  generating: false,
  generationStage: "",
  generationProgress: 0,
  addingItem: false,
});

const newItemName = ref("");
const newItemShared = ref(false);
const newItemQty = ref(1);
const showManualModal = ref(false);

function closeManualModal() {
  showManualModal.value = false;
  newItemName.value = "";
  newItemShared.value = false;
  newItemQty.value = 1;
}

function submitNewItem() {
  const name = newItemName.value.trim();
  if (!name || props.generating || props.addingItem) return;
  const qty = Math.max(1, Number(newItemQty.value) || 1);
  emit("add-item", name, newItemShared.value, qty);
  console.log("Submitting new item:", name, "Shared:", newItemShared.value);
  closeManualModal();
}
const emit = defineEmits<{
  (e: "add-item", itemName: string, isShared: boolean, quantity: number): void;
  (e: "toggle-item", itemId: string, isShared: boolean): void;
  (e: "quantity-change", itemId: string, quantity: number, isShared: boolean): void;
  (e: "regenerate"): void;
  (e: "generate"): void;
  (e: "assign-item", itemId: string, travelerId: string): void;
  (e: "move-items-to-shared", itemIds: string[]): void;
  (e: "delete-items", itemIds: string[]): void;
}>();

const { currentUser } = useAuth();

// reactive current user identifier (strictly server id only)
const currentUserId = computed(() => {
  return (currentUser.value?.id ?? "").toString();
});

// Personal items that belong to the current user (not shared and assigned to them)
const myPersonalItems = computed(() => {
  return props.items.filter((item) => {
    const assignee = item.assignee ? String(item.assignee) : "";
    return !item.isShared && assignee && assignee === currentUserId.value;
  });
});

// Shared items that are assigned to the current user
const myAssignedSharedItems = computed(() => {
  return props.items.filter((item) => {
    const assignee = item.assignee ? String(item.assignee) : "";
    return item.isShared && assignee && assignee === currentUserId.value;
  });
});

// All shared items (used for the Shared Items card)
const sharedItems = computed(() => {
  return props.items.filter((item) => item.isShared);
});

const checkedCount = computed(() => {
  const personalChecked = myPersonalItems.value.filter((item) => item.finished).length;
  const sharedChecked = myAssignedSharedItems.value.filter((item) => item.finished).length;
  return personalChecked + sharedChecked;
});

const assignedTotalCount = computed(() => {
  return myPersonalItems.value.length + myAssignedSharedItems.value.length;
});

const categories = computed(() => {
  const cats = new Set(myPersonalItems.value.map((item) => item.category || "Personal list"));
  return Array.from(cats).sort();
});

function getPersonalItemsByCategory(category: string) {
  return myPersonalItems.value.filter(
    (item) => (item.category || "Personal list") === category,
  );
}

function toggleItem(itemId: string) {
  // Do not toggle completion while in selection modes
  if (selectingForShare.value || selectingForDelete.value) return;
  const item = props.items.find((i) => i.id === itemId);
  const isSharedFlag = !!item?.isShared;
  emit("toggle-item", itemId, isSharedFlag);
}

function handleQuantityChange(itemId: string, quantity: number) {
  const item = props.items.find((i) => i.id === itemId);
  const isSharedFlag = !!item?.isShared;
  emit("quantity-change", itemId, quantity, isSharedFlag);
}

function onAssignChange(itemId: string, e: Event) {
  console.log("Assign change event for item:", itemId);
  const target = e.target as HTMLSelectElement | null;
  if (!target) return;
  const travelerId = target.value || "";
  console.log("Assigning item", itemId, "to traveler", travelerId);
  emit("assign-item", itemId, travelerId);
}

// Helper: build a unique, user-friendly label for a traveler
function getTravelerLabel(traveler: Traveler): string {
  // Packing assignee dropdown: show username only
  return traveler.username || traveler.id;
}

// Selection state for bulk move from personal to shared
const selectedPersonal = ref<Set<string>>(new Set());
const selectingForShare = ref(false);

const selectedCount = computed(() => selectedPersonal.value.size);

function isSelected(itemId: string): boolean {
  return selectedPersonal.value.has(itemId);
}

function toggleSelect(itemId: string, checked: boolean) {
  const set = new Set(selectedPersonal.value);
  if (checked) set.add(itemId);
  else set.delete(itemId);
  selectedPersonal.value = set;
}

function moveSelectedToShared() {
  if (selectedPersonal.value.size === 0) return;
  const ids = Array.from(selectedPersonal.value);
  emit("move-items-to-shared", ids);
  selectedPersonal.value = new Set();
}

function startSelectingForShare() {
  // turn off delete mode and clear its selections
  selectingForDelete.value = false;
  selectedForDelete.value = new Set();
  // reset share selection and enable share mode
  selectedPersonal.value = new Set();
  selectingForShare.value = true;
}

function cancelSelectingForShare() {
  selectingForShare.value = false;
  selectedPersonal.value = new Set();
}

function confirmMoveSelectedToShared() {
  if (selectedPersonal.value.size === 0) return;
  const ids = Array.from(selectedPersonal.value);
  emit("move-items-to-shared", ids);
  selectedPersonal.value = new Set();
  selectingForShare.value = false;
}

// Delete selection state (can include personal and assigned-shared items from My Packing List)
const selectedForDelete = ref<Set<string>>(new Set());
const selectingForDelete = ref(false);
const selectedDeleteCount = computed(() => selectedForDelete.value.size);

function isDeleteSelected(itemId: string): boolean {
  return selectedForDelete.value.has(itemId);
}

function toggleDeleteSelect(itemId: string, checked: boolean) {
  const set = new Set(selectedForDelete.value);
  if (checked) set.add(itemId);
  else set.delete(itemId);
  selectedForDelete.value = set;
}

function startSelectingForDelete() {
  // ensure share selection mode is off
  selectingForShare.value = false;
  selectedPersonal.value = new Set();
  selectingForDelete.value = true;
}

function cancelSelectingForDelete() {
  selectingForDelete.value = false;
  selectedForDelete.value = new Set();
}

function confirmDeleteSelected() {
  if (selectedForDelete.value.size === 0) return;
  const ids = Array.from(selectedForDelete.value);
  emit("delete-items", ids);
  selectedForDelete.value = new Set();
  selectingForDelete.value = false;
}

function onRowClickPersonal(itemId: string) {
  if (selectingForShare.value) {
    toggleSelect(itemId, !isSelected(itemId));
    return;
  }
  if (selectingForDelete.value) {
    toggleDeleteSelect(itemId, !isDeleteSelected(itemId));
  }
}

function onRowClickAssignedShared(itemId: string) {
  if (selectingForDelete.value) {
    toggleDeleteSelect(itemId, !isDeleteSelected(itemId));
  }
}

function handleCheckboxClick(event: Event) {
  if (selectingForShare.value || selectingForDelete.value) {
    // In selection mode, don't stop propagation so row click can handle selection
  } else {
    event.stopPropagation();
  }
}

// Keep selection consistent when personal items change
watch(
  () => myPersonalItems.value.map((i) => i.id),
  (ids) => {
    const keep = new Set(ids);
    const next = new Set<string>();
    selectedPersonal.value.forEach((id) => {
      if (keep.has(id)) next.add(id);
    });
    selectedPersonal.value = next;
  }
);

// Prune delete selection if items disappear from My Packing List scope
watch(
  () => [
    ...myPersonalItems.value.map((i) => i.id),
    ...myAssignedSharedItems.value.map((i) => i.id),
  ],
  (ids) => {
    const keep = new Set(ids);
    const next = new Set<string>();
    selectedForDelete.value.forEach((id) => {
      if (keep.has(id)) next.add(id);
    });
    selectedForDelete.value = next;
  }
);
</script>

<style scoped>
.packing-tab {
  width: 100%;
}

.space-y-6>*+* {
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

/* Tidy header controls layout: progress + regenerate align neatly */
.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.progress-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  background: rgba(123, 163, 209, 0.12);
}
.progress-pill .progress-label {
  margin: 0;
}
.progress-pill .progress-value {
  line-height: 1;
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

.packing-item.selecting {
  cursor: pointer;
}

.packing-item.selected-for-share {
  background: #eaf0f7;
  box-shadow: inset 0 0 0 2px #1e3a5f20;
}

.packing-item.selected-for-delete {
  background: #fbeaea;
  box-shadow: inset 0 0 0 2px #ef444440;
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

.packing-item input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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

.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.delete-btn:active {
  transform: scale(0.95);
}

.delete-icon {
  width: 18px;
  height: 18px;
  transition: all 0.2s ease;
}

.delete-btn:hover .delete-icon {
  transform: rotate(-10deg);
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
.shared-item-checkbox input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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

.assign-select {
  flex: 1;
  padding: 0.5rem 0.75rem;
  padding-right: 2.5rem;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #1e3a5f;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%237ba3d1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
}

.assign-select:hover {
  border-color: #7ba3d1;
  box-shadow: 0 0 0 3px rgba(123, 163, 209, 0.1);
}

.assign-select:focus {
  outline: none;
  border-color: #7ba3d1;
  box-shadow: 0 0 0 3px rgba(123, 163, 209, 0.15);
}

.assign-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.assign-select option {
  padding: 0.5rem;
  background: white;
  color: #1e3a5f;
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

  0%,
  100% {
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

.card-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-add-manual {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.2rem;
  border-radius: 9999px;
  border: 1px solid rgba(30, 58, 95, 0.15);
  background: white;
  color: #1e3a5f;
  font-weight: 600;
  cursor: pointer;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.btn-add-manual:hover:not(:disabled) {
  border-color: rgba(30, 58, 95, 0.4);
  box-shadow: 0 6px 12px rgba(30, 58, 95, 0.12);
}

.btn-add-manual:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.manual-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.manual-modal {
  width: min(420px, 92%);
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.18);
}

.manual-modal h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.manual-modal-text {
  margin-top: 0.35rem;
  margin-bottom: 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.manual-modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.manual-modal-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  border: 1px solid #cbd5f5;
  font-size: 0.95rem;
  color: #1e293b;
}

.manual-modal-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
}

.manual-modal-checkbox input {
  width: 18px;
  height: 18px;
}

.manual-modal-input:focus {
  outline: none;
  border-color: #7ba3d1;
  box-shadow: 0 0 0 3px rgba(123, 163, 209, 0.2);
}

.manual-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #cbd5f5;
}

.btn-primary {
  background: #1e3a5f;
  color: #f8fafc;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  background: #162b45;
}

.modal-spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(248, 250, 252, 0.6);
  border-top-color: #f8fafc;
  animation: modal-spin 0.8s linear infinite;
}

@keyframes modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
