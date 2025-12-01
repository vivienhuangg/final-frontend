<template>
	<div class="trip-view" v-if="trip">
		<div class="container mx-auto p-6 max-w-6xl">
			<!-- Back Button -->
			<button class="btn-back" @click="$emit('back')">
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Dashboard
			</button>

			<!-- Hero Header with Destination Photo -->
			<div class="hero-header">
				<img v-if="trip.headerImage" :src="trip.headerImage" :alt="trip.destination" class="hero-image" />
				<div v-else class="hero-image-placeholder"></div>
				<div class="hero-overlay"></div>
				<div class="hero-content">
					<div class="hero-info">
						<div class="hero-location">
							<svg class="w-8 h-8 text-white opacity-80" fill="none" stroke="currentColor"
								viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<h1 class="hero-title">{{ trip.destination }}</h1>
						<div class="hero-meta">
							<div class="hero-meta-item">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
							</div>
							<div class="hero-meta-item">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
								<span>{{ trip.travelers.length }} travelers</span>
							</div>
						</div>
					</div>
					<div class="hero-actions">
						<button class="btn-export">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			<!-- Tabs -->
			<div class="tabs-container">
				<div class="tabs-list">
					<button v-for="tab in tabs" :key="tab.id" :class="['tab-trigger', { active: activeTab === tab.id }]"
						@click="activeTab = tab.id">
						{{ tab.label }}
					</button>
				</div>
			</div>

			<!-- Tab Content -->
			<div class="tab-content">
				<OverviewTab v-if="activeTab === 'overview'" :trip="trip" @invite="handleInvite" />
				<!-- Discover tab removed per UI request -->
				<AttractionsTab v-if="activeTab === 'attractions'" :activities="activities" :travelers="trip.travelers"
					:trip-id="trip.id" :organizer-id="trip.organizer" @rate="handleRate"
					@toggle-attendance="handleToggleAttendance" @add-activity="handleAddActivity"
					@delete-activity="handleDeleteActivity" @refresh-activities="loadActivities" />
				<CostsTab v-if="activeTab === 'costs'" :expenses="expenses" :travelers="trip.travelers"
					@add-expense="handleAddExpense" @delete-expense="handleDeleteExpense" />
				<PackingTab v-if="activeTab === 'packing'" :items="packingItems" :travelers="trip.travelers"
					:generating="generatingPackingList" :generation-stage="generationStage"
					:generation-progress="generationProgress" :adding-item="addingPackingItem" @add-item="handleAddItem"
					@toggle-item="handleToggleItem" @quantity-change="handleQuantityChange"
					@assign-item="handleAssignItem" @move-items-to-shared="handleMoveItemsToShared" @delete-items="handleDeleteItems"
					@regenerate="handleRegeneratePackingList" @generate="handleGeneratePackingList" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import * as Activities from "../api/activities";
import * as CostTracker from "../api/costtracker";
import * as PackingLists from "../api/packinglists";
import * as Invitations from "../api/invitations";
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
import DiscoverTab from "./tabs/DiscoverTab.vue";
import OverviewTab from "./tabs/OverviewTab.vue";
import PackingTab from "./tabs/PackingTab.vue";

const props = defineProps<{
	trip: Trip;
}>();

const emit = defineEmits<(e: "back") => void>();

const { currentUser, getSession } = useAuth();
const activeTab = ref("overview");
const activities = ref<ActivityWithDetails[]>([]);
const expenses = ref<Expense[]>([]);
const packingItems = ref<ChecklistItem[]>([]);
const packingListId = ref<string | null>(null);
const loading = ref(false);
const generatingPackingList = ref(false);
const generationStage = ref("");
const generationProgress = ref(0);
const addingPackingItem = ref(false);

// Load data when trip changes
watch(
	() => props.trip.id,
	() => {
		if (props.trip.id) {
			// Restore persisted active tab for this trip
			try {
				const key = `trip_active_tab_${props.trip.id}`;
				const saved = localStorage.getItem(key);
				if (saved && ["overview","discover","attractions","costs","packing"].includes(saved)) {
					activeTab.value = saved;
				}
			} catch {}
			loadTripData();
		}
	},
	{ immediate: true },
);

// Persist active tab selection per trip
watch(
	() => activeTab.value,
	(tab) => {
		if (!props.trip?.id) return;
		try {
			const key = `trip_active_tab_${props.trip.id}`;
			localStorage.setItem(key, tab);
		} catch {}
	},
);

async function loadTripData() {
	await Promise.all([loadActivities(), loadExpenses(), loadPackingItems()]);
}

async function loadActivities() {
	const session = getSession();
	if (!session || !props.trip.id) return;

	try {
		const response = await Activities.getActivitiesByTrip(props.trip.id);

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
	if (!session || !props.trip.id) return;

	try {
		// Load trip-specific expenses
		const [percentageExpenses, moneyExpenses] = await Promise.all([
			CostTracker.listPercentageExpensesByTrip(props.trip.id),
			CostTracker.listMoneyExpensesByTrip(props.trip.id),
		]);

		const allExpenses: Expense[] = [];

		// Process percentage expenses
		for (const { expense: expenseId, totalCost, title } of percentageExpenses.listedExpenses) {
			try {
				const details = await CostTracker.getPercentageExpenseDetails(expenseId);
				allExpenses.push({
					id: expenseId,
					title: title || details.title || `Expense ${expenseId}`,
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
		for (const { expense: expenseId, totalCost, title } of moneyExpenses.listedExpenses) {
			try {
				const details = await CostTracker.getMoneyExpenseDetails(expenseId);
				allExpenses.push({
					id: expenseId,
					title: title || details.title || `Expense ${expenseId}`,
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
				const createResponse = await PackingLists.createPackingList(props.trip.id);
				packingListId.value = createResponse.packinglist;
			} catch (e: any) {
				console.error("Failed to get or create packing list:", e);
				return;
			}
		}

		if (packingListId.value) {
			const response = await PackingLists.getItems(packingListId.value);
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
			const deduped = transformedItems.filter((item) => {
				if (seenNames.has(item.name.toLowerCase())) {
					return false; // Duplicate, skip it
				}
				seenNames.add(item.name.toLowerCase());
				return true;
			});

			// Apply client-persisted quantities from localStorage
			const qKey = packingListId.value ? `packing_qty_${packingListId.value}` : null;
			let qtyMap: Record<string, number> = {};
			if (qKey) {
				try {
					const raw = localStorage.getItem(qKey);
					if (raw) qtyMap = JSON.parse(raw);
				} catch {}
			}

			packingItems.value = deduped.map((item) => {
				const key = item.name.toLowerCase();
				const persistedQty = qtyMap[key];
				return { ...item, quantity: persistedQty ?? item.quantity ?? 1 };
			});
		}
	} catch (error: any) {
		console.error("Failed to load packing items:", error);
	}
}

const tabs = [
	{ id: "overview", label: "Overview" },
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

async function handleInvite(username: string) {
	const session = getSession();
	if (!session || !props.trip.id) return;

	try {
		loading.value = true;
		await Invitations.inviteUserToTrip(props.trip.id, username);
		alert(`Invitation sent to ${username}`);
	} catch (error: any) {
		console.error("Failed to send invitation:", error);
		// Show a clear, user-friendly message instead of a generic failure
		const rawMsg = (error?.message || "").toString();
		if (/already\s*invited/i.test(rawMsg)) {
			alert("This user is already invited to the trip.");
		} else {
			alert("Username not found. Ask them to create an account, then try again.");
		}
	} finally {
		loading.value = false;
	}
}

async function handleAddActivity(activity: ActivityWithDetails) {
	const session = getSession();
	if (!session || !props.trip.id) return;

	try {
		loading.value = true;
		await Activities.createActivity(
			activity.title,
			activity.start,
			activity.end,
			activity.cost,
			props.trip.id,
			{ solo: activity.solo, proposal: activity.proposal, description: activity.description }
		);

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

		let createdId: string | null = null;
		if (expense.splitType === "money") {
			const users = expense.splitBetween.map((s) => s.userId);
			const costs = expense.splitBetween.map((s) => s.cost || 0);
			const result = await CostTracker.createMoneyExpense(
				expense.totalCost,
				users,
				costs,
				expense.title,
				props.trip.id,
			);
			createdId = result.expense;
		} else {
			const users = expense.splitBetween.map((s) => s.userId);
			const percentages = expense.splitBetween.map((s) => s.percentage || 0);
			const result = await CostTracker.createPercentageExpense(
				expense.totalCost,
				users,
				percentages,
				expense.title,
				props.trip.id,
			);
			createdId = result.expense;
		}

		if (createdId) {
			expenses.value.push({
				id: createdId,
				title: expense.title,
				totalCost: expense.totalCost,
				paidBy: expense.paidBy,
				splitBetween: expense.splitBetween,
				date: expense.date,
				splitType: expense.splitType,
			});
		} else {
			await loadExpenses();
		}
	} catch (error: any) {
		console.error("Failed to add expense:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to add expense";
		alert(errorMessage);
	} finally {
		loading.value = false;
	}
}

async function handleDeleteExpense(expenseId: string) {
	const session = getSession();
	if (!session) return;

	try {
		loading.value = true;
		await CostTracker.deleteExpense(expenseId);
		await loadExpenses();
	} catch (error: any) {
		console.error("Failed to delete expense:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete expense";
		alert(errorMessage);
	} finally {
		loading.value = false;
	}
}

// Packing List Functions
async function handleToggleItem(itemId: string) {
	const session = getSession();
	if (!session || !packingListId.value) return;

	const item = packingItems.value.find((i) => i.id === itemId);
	if (!item) return;

	try {
		await PackingLists.toggleCompletion(
			packingListId.value,
			itemId,
			!item.finished,
		);

		// Update local state
		item.finished = !item.finished;
	} catch (error: any) {
		console.error("Failed to toggle item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to toggle item";
		alert(errorMessage);
	}
}

async function handleAddItem(itemName: string, isShared: boolean, quantity: number = 1) {
	const session = getSession();
	if (!session || !props.trip.id) return;

	const trimmedName = itemName.trim();
	if (!trimmedName) return;

	// If item already exists, increment its quantity locally instead of erroring
	const existing = packingItems.value.find(
		(item) => item.name.toLowerCase() === trimmedName.toLowerCase(),
	);
	if (existing) {
		const increment = Math.max(1, Number(quantity) || 1);
		const newQty = (existing.quantity || 1) + increment;
		existing.quantity = newQty;
		// Persist to backend if possible
		try {
			if (packingListId.value) {
				await PackingLists.updateQuantity(packingListId.value, existing.id, newQty);
			}
		} catch (e) {
			// Fallback: persist locally
			if (packingListId.value) {
				const qKey = `packing_qty_${packingListId.value}`;
				try {
					const raw = localStorage.getItem(qKey);
					const map = raw ? JSON.parse(raw) : {};
					map[existing.name.toLowerCase()] = newQty;
					localStorage.setItem(qKey, JSON.stringify(map));
				} catch {}
			}
		}
		return;
	}

	try {
		addingPackingItem.value = true;

		if (!packingListId.value) {
			const createResponse = await PackingLists.createPackingList(props.trip.id);
			packingListId.value = createResponse.packinglist;
		}

		if (!packingListId.value) {
			throw new Error("Unable to create packing list");
		}

		// If the item is not shared, assign it to the current user by id
		const assignee = !isShared
			? (currentUser.value?.id ?? "").toString()
			: undefined;

		await PackingLists.addItem(
			packingListId.value,
			trimmedName,
			assignee,
			isShared
		);

		await loadPackingItems();

		// If a quantity greater than 1 was specified, persist it
		if (quantity && quantity > 1) {
			const added = packingItems.value.find((i) => i.name.toLowerCase() === trimmedName.toLowerCase());
			if (added) {
				added.quantity = quantity;
				try {
					await PackingLists.updateQuantity(packingListId.value, added.id, quantity);
				} catch {
					const qKey = `packing_qty_${packingListId.value}`;
					try {
						const raw = localStorage.getItem(qKey);
						const map = raw ? JSON.parse(raw) : {};
						map[added.name.toLowerCase()] = quantity;
						localStorage.setItem(qKey, JSON.stringify(map));
					} catch {}
				}
			}
		}
	} catch (error: any) {
		console.error("Failed to add packing item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to add packing item";
		alert(errorMessage);
	} finally {
		addingPackingItem.value = false;
	}
}

function handleQuantityChange(itemId: string, newQuantity: number) {
	const item = packingItems.value.find((i) => i.id === itemId);
	if (!item) return;

	// If quantity goes to 0, delete the item
	if (newQuantity <= 0) {
		(async () => {
			try {
				if (packingListId.value) {
					const isSharedFlag = !!item.isShared;
					if (isSharedFlag) {
						await PackingLists.deleteItem(packingListId.value, itemId, true);
					} else {
						await PackingLists.deleteItem(packingListId.value, itemId);
					}
				}
			} catch {}
			// Remove from local state
			const idx = packingItems.value.findIndex((i) => i.id === itemId);
			if (idx !== -1) packingItems.value.splice(idx, 1);

			// Clean localStorage persisted quantity
			if (packingListId.value) {
				const qKey = `packing_qty_${packingListId.value}`;
				try {
					const raw = localStorage.getItem(qKey);
					const map = raw ? JSON.parse(raw) : {};
					delete map[item.name.toLowerCase()];
					localStorage.setItem(qKey, JSON.stringify(map));
				} catch {}
			}
		})();
		return;
	}

	// Update local state for positive quantities
	item.quantity = newQuantity;

	// Persist to backend; fallback to localStorage
	(async () => {
		try {
			if (packingListId.value) {
				await PackingLists.updateQuantity(packingListId.value, itemId, newQuantity);
				return; // success
			}
		} catch {}
		if (packingListId.value) {
			const qKey = `packing_qty_${packingListId.value}`;
			try {
				const raw = localStorage.getItem(qKey);
				const map = raw ? JSON.parse(raw) : {};
				map[item.name.toLowerCase()] = newQuantity;
				localStorage.setItem(qKey, JSON.stringify(map));
			} catch {}
		}
	})();
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
				const createResponse = await PackingLists.createPackingList(props.trip.id);
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
					PackingLists.deleteItem(packingListId.value || "", item.id).catch((e) => {
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
		await PackingLists.requestSuggestions(packingListId.value, additionalInput);

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
				const response = await PackingLists.getItems(packingListId.value);

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
		await Activities.deleteActivity(activityId);

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

async function handleAssignItem(itemId: string, travelerId: string | undefined) {
	const session = getSession();
	if (!session || !packingListId.value) return;

	const item = packingItems.value.find((i) => i.id === itemId);
	if (!item) return;

	try {
		// Optimistically update local state
		item.assignee = travelerId || undefined;

		// Persist the assignee change via the packing lists API.
		// Use the centralized `PackingLists` import directly.
		const isSharedFlag = !!item.isShared;
		const assigneeParam = travelerId && travelerId.length > 0 ? travelerId : null;
		await PackingLists.assignItem(packingListId.value, itemId, assigneeParam, isSharedFlag);
	} catch (error: any) {
		console.error("Failed to assign item:", error);
		const errorMessage = error instanceof Error ? error.message : "Failed to assign item";
		alert(errorMessage);
		// Reload to discard optimistic local change if persistence failed
		try {
			await loadPackingItems();
		} catch (_) {
			// ignore
		}
	}
}

// Move selected personal items to the shared list by re-creating them as shared
// and deleting the originals. Then reload the list.
async function handleMoveItemsToShared(itemIds: string[]) {
	const session = getSession();
	if (!session || !packingListId.value || !itemIds?.length) return;

	try {
		// Prepare operations: add shared then delete original
		const ops: Promise<any>[] = [];
		for (const id of itemIds) {
			const item = packingItems.value.find((i) => i.id === id);
			if (!item) continue;
			if (item.isShared) continue; // already shared, skip

			// Add new shared item with same name
			ops.push(PackingLists.addItem(packingListId.value, item.name, undefined, true));
			// Delete original personal item (omit isShared for personal)
			ops.push(PackingLists.deleteItem(packingListId.value, id));
		}

		if (ops.length === 0) return;
		await Promise.allSettled(ops);

		// Reload to reflect changes
		await loadPackingItems();
	} catch (error: any) {
		console.error("Failed to move items to shared:", error);
		const errorMessage = error instanceof Error ? error.message : "Failed to move items to shared";
		alert(errorMessage);
		// Best effort reload
		try { await loadPackingItems(); } catch {}
	}
}

// Delete selected items (supports personal and assigned-shared items from My Packing List scope)
async function handleDeleteItems(itemIds: string[]) {
	const session = getSession();
	if (!session || !packingListId.value || !itemIds?.length) return;

	try {
		const ops: Promise<any>[] = [];
		for (const id of itemIds) {
			const item = packingItems.value.find((i) => i.id === id);
			const isSharedFlag = !!item?.isShared;
			// Only pass isShared if true; omit for personal items
			if (isSharedFlag) {
				ops.push(PackingLists.deleteItem(packingListId.value, id, true));
			} else {
				ops.push(PackingLists.deleteItem(packingListId.value, id));
			}
		}
		await Promise.allSettled(ops);
		await loadPackingItems();
	} catch (error: any) {
		console.error("Failed to delete items:", error);
		const errorMessage = error instanceof Error ? error.message : "Failed to delete items";
		alert(errorMessage);
		try { await loadPackingItems(); } catch {}
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
	/* Adjust columns to match visible tabs (Overview, Attractions, Costs, Packing) */
	grid-template-columns: repeat(4, 1fr);
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
