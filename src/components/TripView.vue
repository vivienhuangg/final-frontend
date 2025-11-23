<template>
  <div class="trip-view" v-if="trip">
    <!-- Trip Header -->
    <div class="trip-header">
      <div class="trip-header-image" v-if="trip.headerImage">
        <img :src="trip.headerImage" :alt="trip.destination" />
      </div>
      <div class="trip-header-content">
        <div class="trip-header-info">
          <h1>{{ trip.title }}</h1>
          <p class="trip-destination">{{ trip.destination }}</p>
          <p class="trip-dates">
            {{ formatDate(trip.startDate) }} – {{ formatDate(trip.endDate) }}
          </p>
          <p class="trip-travelers-count">{{ trip.travelers.length }} travelers</p>
        </div>
        <button class="btn-secondary" @click="$emit('back')">← Back to Trips</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <OverviewTab
        v-if="activeTab === 'overview'"
        :trip="trip"
        @invite="handleInvite"
      />
      <DiscoverTab
        v-if="activeTab === 'discover'"
        :destination="trip.destination"
        :trip-id="trip.id"
        @add-activity="handleAddActivity"
      />
      <AttractionsTab
        v-if="activeTab === 'attractions'"
        :activities="activities"
        :travelers="trip.travelers"
        :trip-id="trip.id"
        @rate="handleRate"
        @toggle-attendance="handleToggleAttendance"
        @add-activity="handleAddActivity"
      />
      <CostsTab
        v-if="activeTab === 'costs'"
        :expenses="expenses"
        :travelers="trip.travelers"
        @add-expense="handleAddExpense"
      />
      <PackingTab
        v-if="activeTab === 'packing'"
        :items="packingItems"
        :travelers="trip.travelers"
        @toggle-item="handleToggleItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Trip, ActivityWithDetails, Expense, ChecklistItem } from '../types/trip';
import { mockActivities, mockExpenses, mockPackingItems } from '../data/mockData';
import OverviewTab from './tabs/OverviewTab.vue';
import DiscoverTab from './tabs/DiscoverTab.vue';
import AttractionsTab from './tabs/AttractionsTab.vue';
import CostsTab from './tabs/CostsTab.vue';
import PackingTab from './tabs/PackingTab.vue';

const props = defineProps<{
  trip: Trip;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const activeTab = ref('overview');
const activities = ref<ActivityWithDetails[]>([...mockActivities]);
const expenses = ref<Expense[]>([...mockExpenses]);
const packingItems = ref<ChecklistItem[]>([...mockPackingItems]);

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'discover', label: 'Discover' },
  { id: 'attractions', label: 'Itinerary' },
  { id: 'costs', label: 'Costs' },
  { id: 'packing', label: 'Packing' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function handleInvite(email: string) {
  console.log('Invite:', email);
  // Mock: Add traveler
}

function handleAddActivity(activity: ActivityWithDetails) {
  activities.value.push(activity);
}

function handleRate(activityId: string, rating: number) {
  const activity = activities.value.find(a => a.id === activityId);
  if (activity) {
    activity.rating = rating;
    activity.votes = (activity.votes || 0) + 1;
  }
}

function handleToggleAttendance(activityId: string, travelerId: string) {
  const activity = activities.value.find(a => a.id === activityId);
  if (activity) {
    if (!activity.attendees) activity.attendees = [];
    const index = activity.attendees.indexOf(travelerId);
    if (index > -1) {
      activity.attendees.splice(index, 1);
    } else {
      activity.attendees.push(travelerId);
    }
  }
}

function handleAddExpense(expense: Expense) {
  expenses.value.push(expense);
}

function handleToggleItem(itemId: string) {
  const item = packingItems.value.find(i => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
  }
}
</script>

<style scoped>
.trip-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.trip-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.trip-header-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #e0e0e0;
}

.trip-header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.trip-header-info h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.trip-destination {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.trip-dates {
  color: #888;
  margin-bottom: 0.5rem;
}

.trip-travelers-count {
  color: #42b983;
  font-weight: 500;
}

.tabs-container {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.tabs {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 0;
  padding: 0 2rem;
}

.tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #333;
  background: #f9f9f9;
}

.tab.active {
  color: #42b983;
  border-bottom-color: #42b983;
  font-weight: 500;
}

.tab-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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
</style>

