<template>
  <div class="trip-view" v-if="trip">
    <div class="container mx-auto p-6 max-w-6xl">
      <!-- Back Button -->
      <button 
        class="btn-back"
        @click="$emit('back')"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <!-- Hero Header with Destination Photo -->
      <div class="hero-header">
        <img 
          v-if="trip.headerImage" 
          :src="trip.headerImage" 
          :alt="trip.destination"
          class="hero-image"
        />
        <div v-else class="hero-image-placeholder"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-info">
            <div class="hero-location">
              <svg class="w-8 h-8 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 class="hero-title">{{ trip.destination }}</h1>
            <div class="hero-meta">
              <div class="hero-meta-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
              </div>
              <div class="hero-meta-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{{ trip.travelers.length }} travelers</span>
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <button class="btn-settings">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button class="btn-export">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs-list">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-trigger', { active: activeTab === tab.id }]"
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
          :generating="generatingPackingList"
          :generation-stage="generationStage"
          :generation-progress="generationProgress"
          @toggle-item="handleToggleItem"
          @quantity-change="handleQuantityChange"
          @regenerate="handleRegeneratePackingList"
          @generate="handleGeneratePackingList"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
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
const generatingPackingList = ref(false);
const generationStage = ref("");
const generationProgress = ref(0);

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
		// Get or create packing list for this user and trip
		// The API will return existing list if it exists, or create a new one
		if (!packingListId.value) {
			try {
				const createResponse = await packingListApi.createPackingList({
					trip: props.trip.id,
				});
				packingListId.value = createResponse.packinglist;
			} catch (e: any) {
				console.error("Failed to get or create packing list:", e);
				return;
			}
		}

		if (packingListId.value) {
			const response = await packingListApi.getItems({
				packinglist: packingListId.value,
			});

			if (!response.results || !Array.isArray(response.results)) {
				packingItems.value = [];
				return;
			}
			
			// Transform items and deduplicate by name to prevent duplicates
			const transformedItems = response.results
				.map((result) => {
					if (!result.item) return null;
					return transformApiPackingItemToChecklistItem(result.item);
				})
				.filter((item): item is ChecklistItem => item !== null);
			
			// Deduplicate by name (keep the first occurrence)
			const seenNames = new Set<string>();
			packingItems.value = transformedItems.filter((item) => {
				if (seenNames.has(item.name.toLowerCase())) {
					return false; // Duplicate, skip it
				}
				seenNames.add(item.name.toLowerCase());
				return true;
			});
		}
	} catch (error: any) {
		console.error("Failed to load packing items:", error);
	}
}

const tabs = [
	{ id: "overview", label: "Overview" },
	{ id: "discover", label: "Discover" },
	{ id: "attractions", label: "Attractions" },
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

function handleQuantityChange(itemId: string, newQuantity: number) {
	if (newQuantity < 1) return;
	
	const item = packingItems.value.find((i) => i.id === itemId);
	if (!item) return;

	// Update local state
	// Note: Backend API doesn't support quantity updates yet, so we only update local state
	// When API support is added, we can call an update endpoint here
	item.quantity = newQuantity;
}

async function generatePackingList(regenerate: boolean = false) {
	const session = getSession();
	if (!session || !props.trip.id) return;

	try {
		generatingPackingList.value = true;
		generationProgress.value = 0;
		generationStage.value = "Preparing...";
		
		// Clear local state when regenerating or when starting fresh generation
		packingItems.value = [];
		
		// Reload activities to ensure we have the latest data (only for regenerate)
		if (regenerate) {
			generationStage.value = "Loading latest activities...";
			generationProgress.value = 10;
			await loadActivities();
			
			// Reset packing list ID when regenerating to force creation of new list
			// (backend will delete old one and create new one)
			packingListId.value = null;
		}
		
		// For regeneration, always create a new list (backend will delete old one)
		// For first-time generation, create if doesn't exist, otherwise use existing
		if (!packingListId.value || regenerate) {
			try {
				generationStage.value = regenerate ? "Regenerating packing list..." : "Creating packing list...";
				generationProgress.value = regenerate ? 20 : 10;
				const createResponse = await packingListApi.createPackingList({
					trip: props.trip.id,
					...(regenerate && { regenerate: true }),
				});
				packingListId.value = createResponse.packinglist;
				
				// After creating/regenerating, clear local items to ensure fresh start
				packingItems.value = [];
			} catch (e: any) {
				console.error("Failed to get or create packing list:", e);
				alert("Failed to get or create packing list. Please try again.");
				return;
			}
		} else {
			// If list exists and we're generating (not regenerating), clear existing items first
			// to prevent duplicates. We'll delete all items from the existing list.
			generationStage.value = "Clearing existing items...";
			generationProgress.value = 15;
			
			// Delete all existing items to prevent duplicates
			const itemsToDelete = [...packingItems.value];
			packingItems.value = []; // Clear local state immediately
			
			// Delete all items in parallel for better performance
			await Promise.allSettled(
				itemsToDelete.map((item) =>
					packingListApi.deleteItem({
						packinglist: packingListId.value,
						item: item.id,
					}).catch((e) => {
						console.warn("Failed to delete item:", e);
						return null; // Continue even if some deletions fail
					})
				)
			);
		}

		if (!packingListId.value) {
			alert("Failed to get or create packing list");
			return;
		}

		// Build additionalInput with trip details including duration for quantity suggestions
		generationStage.value = "Analyzing trip details...";
		generationProgress.value = regenerate ? 30 : 20;
		const startDate = new Date(props.trip.startDate);
		const endDate = new Date(props.trip.endDate);
		const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
		const tripInfo = `Trip: ${props.trip.title || props.trip.destination} from ${formatDate(props.trip.startDate)} to ${formatDate(props.trip.endDate)} (${nights} ${nights === 1 ? 'night' : 'nights'}). Destination: ${props.trip.destination}.`;
		const activitiesInfo = activities.value.length > 0 
			? `Activities: ${activities.value.map(a => a.title).join(", ")}.`
			: "";
		const quantityHint = `Please suggest appropriate quantities for items based on the trip duration. For example, for a ${nights}-night trip, suggest ${nights} pairs of underwear, ${nights} pairs of socks, etc.`;
		const additionalInput = `${tripInfo} ${activitiesInfo} ${quantityHint}`;

		// Request suggestions from LLM
		generationStage.value = "Requesting AI suggestions...";
		generationProgress.value = regenerate ? 40 : 30;
		await packingListApi.requestSuggestions({
			packinglist: packingListId.value,
			additionalInput: additionalInput,
		});

		// Poll for items with progress updates
		generationStage.value = "Generating items...";
		generationProgress.value = 50;
		
		const maxAttempts = 30;
		const pollInterval = 1000;
		let attempts = 0;
		
		while (attempts < maxAttempts) {
			await new Promise(resolve => setTimeout(resolve, pollInterval));
			attempts++;
			
			generationProgress.value = 50 + Math.min(40, (attempts / maxAttempts) * 40);
			
			try {
				const response = await packingListApi.getItems({
					packinglist: packingListId.value,
				});
				
				if (response.results && response.results.length > 0) {
					generationStage.value = "Finalizing...";
					generationProgress.value = 95;
					
					packingItems.value = response.results
						.map((result) => {
							if (!result.item) return null;
							return transformApiPackingItemToChecklistItem(result.item);
						})
						.filter((item): item is ChecklistItem => item !== null);
					
					generationProgress.value = 100;
					generationStage.value = "Complete!";
					await new Promise(resolve => setTimeout(resolve, 500));
					break;
				}
			} catch (e) {
				// Continue polling on error
			}
		}
		
		if (attempts >= maxAttempts) {
			generationStage.value = "Loading items...";
			await loadPackingItems();
		}
	} catch (error: any) {
		console.error(`Failed to ${regenerate ? 'regenerate' : 'generate'} packing list:`, error);
		const errorMessage =
			error instanceof Error ? error.message : `Failed to ${regenerate ? 'regenerate' : 'generate'} packing list`;
		alert(errorMessage);
		generationStage.value = "Error occurred";
	} finally {
		await new Promise(resolve => setTimeout(resolve, 1000));
		generatingPackingList.value = false;
		generationProgress.value = 0;
		generationStage.value = "";
	}
}

async function handleRegeneratePackingList() {
	await generatePackingList(true);
}

async function handleGeneratePackingList() {
	await generatePackingList(false);
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
  background: #f5f1ed;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.p-6 {
  padding: 1.5rem;
}

.max-w-6xl {
  max-width: 72rem;
}

.btn-back {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: 9999px;
  color: #14b8a6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.btn-back:hover {
  background: rgba(20, 184, 166, 0.1);
  transform: scale(1.05);
}

.hero-header {
  position: relative;
  height: 16rem;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
}

.hero-info {
  flex: 1;
}

.hero-location {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.hero-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-settings,
.btn-export {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #1e3a5f;
}

.btn-settings:hover,
.btn-export:hover {
  background: white;
  transform: scale(1.05);
}

.tabs-container {
  margin-bottom: 1.5rem;
}

.tabs-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 0.375rem;
  gap: 0.375rem;
}

.tab-trigger {
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-trigger:hover {
  background: rgba(20, 184, 166, 0.1);
}

.tab-trigger.active {
  background: #14b8a6;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tab-content {
  margin-top: 1.5rem;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.w-8 {
  width: 2rem;
}

.h-8 {
  height: 2rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.text-white {
  color: white;
}

.opacity-80 {
  opacity: 0.8;
}
</style>

