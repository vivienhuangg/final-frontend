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
        @delete-activity="handleDeleteActivity"
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
import { computed, onMounted, ref, watch } from "vue";
import { activityApi, costTrackerApi, packingListApi } from "../services/api";
import { useAuth } from "../stores/useAuth";
import type {
	ActivityWithDetails,
	ChecklistItem,
	Expense,
	Trip,
} from "../types/trip";
import {
	transformApiActivityToActivity,
	transformApiPackingItemToChecklistItem,
} from "../utils/dataTransformers";
import AttractionsTab from "./tabs/AttractionsTab.vue";
import CostsTab from "./tabs/CostsTab.vue";
import OverviewTab from "./tabs/OverviewTab.vue";
import PackingTab from "./tabs/PackingTab.vue";

const props = defineProps<{
	trip: Trip;
}>();

const emit = defineEmits<(e: "back") => void>();

const { getSession } = useAuth();
const activeTab = ref("overview");
const activities = ref<ActivityWithDetails[]>([]);
const expenses = ref<Expense[]>([]);
const packingItems = ref<ChecklistItem[]>([]);
const packingListId = ref<string | null>(null);
const loading = ref(false);

// Load data when trip changes
watch(
	() => props.trip.id,
	() => {
		if (props.trip.id) {
			loadTripData();
		}
	},
	{ immediate: true },
);

onMounted(() => {
	loadTripData();
});

async function loadTripData() {
	await Promise.all([loadActivities(), loadExpenses(), loadPackingItems()]);
}

async function loadActivities() {
	const session = getSession();
	if (!session || !props.trip.id) return;

	try {
		const response = await activityApi.getActivitiesByTrip({
			trip: props.trip.id,
		});

		activities.value = response.results.map(({ activity }) => {
			const transformed = transformApiActivityToActivity(activity);
			transformed.event = props.trip.id;
			return transformed;
		});
	} catch (error: any) {
		console.error("Failed to load activities:", error);
	}
}

async function loadExpenses() {
	const session = getSession();
	if (!session) return;

	try {
		// Load both percentage and money expenses
		const [percentageExpenses, moneyExpenses] = await Promise.all([
			costTrackerApi.listPercentageExpenses(),
			costTrackerApi.listMoneyExpenses(),
		]);

		// Transform to component Expense type
		// Note: The API doesn't associate expenses with trips, so we'll show all expenses
		// In a real app, you'd want to add trip association to expenses
		const allExpenses: Expense[] = [];

		// Process percentage expenses
		for (const {
			expense: expenseId,
			totalCost,
		} of percentageExpenses.listedExpenses) {
			try {
				const details = await costTrackerApi.getPercentageExpenseDetails({
					expense: expenseId,
				});
				allExpenses.push({
					id: expenseId,
					title: `Expense ${expenseId}`,
					totalCost,
					paidBy: details.users[0]?.user || "",
					splitBetween: details.users.map((u) => ({
						userId: u.user,
						percentage: u.percentage,
					})),
					date: new Date().toISOString().split("T")[0],
					splitType: "percentage",
				});
			} catch (e) {
				console.warn("Failed to load expense details:", e);
			}
		}

		// Process money expenses
		for (const {
			expense: expenseId,
			totalCost,
		} of moneyExpenses.listedExpenses) {
			try {
				const details = await costTrackerApi.getMoneyExpenseDetails({
					expense: expenseId,
				});
				allExpenses.push({
					id: expenseId,
					title: `Expense ${expenseId}`,
					totalCost,
					paidBy: details.users[0]?.user || "",
					splitBetween: details.users.map((u) => ({
						userId: u.user,
						cost: u.cost,
					})),
					date: new Date().toISOString().split("T")[0],
					splitType: "money",
				});
			} catch (e) {
				console.warn("Failed to load expense details:", e);
			}
		}

		expenses.value = allExpenses;
	} catch (error: any) {
		console.error("Failed to load expenses:", error);
	}
}

async function loadPackingItems() {
	const session = getSession();
	if (!session || !props.trip.id) return;

	try {
		// First, try to create a packing list if it doesn't exist
		// Note: The API doesn't have a way to get packing list by trip,
		// so we'll create one if we don't have an ID stored
		if (!packingListId.value) {
			try {
				const createResponse = await packingListApi.createPackingList({
					trip: props.trip.id,
				});
				packingListId.value = createResponse.packinglist;
			} catch (e: any) {
				// Packing list might already exist, try to load items anyway
				console.warn("Failed to create packing list (might already exist):", e);
			}
		}

		if (packingListId.value) {
			const response = await packingListApi.getItems({
				packinglist: packingListId.value,
			});

			packingItems.value = response.results.map(({ item }) =>
				transformApiPackingItemToChecklistItem(item),
			);
		}
	} catch (error: any) {
		console.error("Failed to load packing items:", error);
	}
}

const tabs = [
	{ id: "overview", label: "Overview" },
	{ id: "discover", label: "Discover" },
	{ id: "attractions", label: "Itinerary" },
	{ id: "costs", label: "Costs" },
	{ id: "packing", label: "Packing" },
];

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

async function handleInvite(email: string) {
	const session = getSession();
	if (!session || !props.trip.id) return;

	// Note: The API requires inviteeId (username), not email
	// In a real app, you'd need to look up username from email or have users enter username
	console.log("Invite:", email);
	alert("Please use the username to invite. Email lookup not implemented.");
}

async function handleAddActivity(activity: ActivityWithDetails) {
	const session = getSession();
	if (!session || !props.trip.id) return;

	try {
		loading.value = true;
		await activityApi.createActivity({
			title: activity.title,
			startDateTime: activity.start,
			endDateTime: activity.end,
			cost: activity.cost,
			trip: props.trip.id,
		});

		// Reload activities
		await loadActivities();
	} catch (error: any) {
		console.error("Failed to add activity:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to add activity";
		alert(errorMessage);
	} finally {
		loading.value = false;
	}
}

function handleRate(activityId: string, rating: number) {
	// Rating functionality would need ratingService integration
	const activity = activities.value.find((a) => a.id === activityId);
	if (activity) {
		activity.rating = rating;
		activity.votes = (activity.votes || 0) + 1;
	}
}

function handleToggleAttendance(activityId: string, travelerId: string) {
	// Attendance functionality not in API spec
	const activity = activities.value.find((a) => a.id === activityId);
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

async function handleAddExpense(expense: Expense) {
	const session = getSession();
	if (!session) return;

	try {
		loading.value = true;

		if (expense.splitType === "money") {
			const users = expense.splitBetween.map((s) => s.userId);
			const costs = expense.splitBetween.map((s) => s.cost || 0);

			await costTrackerApi.createMoneyExpense({
				totalCost: expense.totalCost,
				users,
				costs,
			});
		} else {
			const users = expense.splitBetween.map((s) => s.userId);
			const percentages = expense.splitBetween.map((s) => s.percentage || 0);

			await costTrackerApi.createPercentageExpense({
				totalCost: expense.totalCost,
				users,
				percentages,
			});
		}

		// Reload expenses
		await loadExpenses();
	} catch (error: any) {
		console.error("Failed to add expense:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to add expense";
		alert(errorMessage);
	} finally {
		loading.value = false;
	}
}

async function handleToggleItem(itemId: string) {
	const session = getSession();
	if (!session || !packingListId.value) return;

	const item = packingItems.value.find((i) => i.id === itemId);
	if (!item) return;

	try {
		await packingListApi.toggleCompletion({
			packinglist: packingListId.value,
			item: itemId,
			finishedFlag: !item.finished,
		});

		// Update local state
		item.finished = !item.finished;
	} catch (error: any) {
		console.error("Failed to toggle item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to toggle item";
		alert(errorMessage);
	}
}

async function handleDeleteActivity(activityId: string) {
	const session = getSession();
	if (!session) return;

	try {
		loading.value = true;
		await activityApi.deleteActivity({
			activity: activityId,
		});

		// Remove from local state
		const index = activities.value.findIndex((a) => a.id === activityId);
		if (index > -1) {
			activities.value.splice(index, 1);
		}
	} catch (error: any) {
		console.error("Failed to delete activity:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete activity";
		alert(errorMessage);
	} finally {
		loading.value = false;
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

