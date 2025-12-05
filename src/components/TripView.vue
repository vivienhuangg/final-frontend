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
				<img v-if="trip.headerImage" :src="trip.headerImage" :alt="trip.title" class="hero-image" />
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
						<h1 class="hero-title">{{ trip.title }}</h1>
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
						@click="handleTabClick(tab.id)">
						{{ tab.label }}
					</button>
				</div>
			</div>

			<!-- Tab Content -->
			<div class="tab-content">
				<OverviewTab v-if="activeTab === 'overview'" :trip="trip" @invite="handleInvite" />
				<!-- Discover tab removed per UI request -->
				<AttractionsTab 
					v-if="activeTab === 'attractions'"
					:activities="activities" 
					:travelers="trip.travelers"
					:trip-id="trip.id" 
					:organizer-id="trip.organizer" 
					:trip-start-date="trip.startDate" 
					:trip-end-date="trip.endDate"
					@rate="handleRate" 
					@toggle-attendance="handleToggleAttendance" 
					@add-activity="handleAddActivity"
					@delete-activity="handleDeleteActivity" 
					@refresh-activities="loadActivities" />
				<CostsTab 
					v-if="activeTab === 'costs'"
					:expenses="expenses" 
					:travelers="trip.travelers"
					@add-expense="handleAddExpense" 
					@delete-expense="handleDeleteExpense" />
				<PackingTab 
					v-if="activeTab === 'packing'"
					:items="packingItems" 
					:travelers="trip.travelers"
					:generating="generatingPackingList" 
					:generation-stage="generationStage"
					:generation-progress="generationProgress" 
					:adding-item="addingPackingItem" 
					@add-item="handleAddItem"
					@toggle-item="handleToggleItem" 
					@quantity-change="handleQuantityChange"
					@assign-item="handleAssignItem" 
					@move-items-to-shared="handleMoveItemsToShared" 
					@delete-items="handleDeleteItems"
					@unassign-shared-item="handleUnassignSharedItem"
					@regenerate="handleRegeneratePackingList" 
					@generate="handleGeneratePackingList" />
			</div>

			<!-- AI Suggestions Modal -->
			<div v-if="showSuggestionsModal" class="dialog-overlay" @click="showSuggestionsModal = false">
				<div class="dialog" @click.stop>
					<div class="dialog-header">
						<h2 class="dialog-title">AI Packing Suggestions</h2>
						<p class="dialog-description">Pick the items you want to add to your packing list</p>
					</div>
					<div class="suggestions-list">
						<div v-if="suggestions.length === 0" class="empty-state">No suggestions available.</div>
						<div v-for="s in (showAllSuggestions ? suggestions : suggestions.slice(0, 20))" :key="s.id" class="suggestion-row">
							<label class="suggestion-item">
								<input type="checkbox" v-model="selectedSuggestionIds" :value="s.id" />
								<span class="name">{{ s.name }}</span>
								<span class="meta" v-if="s.quantity">x{{ s.quantity }}</span>
								<span class="badge" v-if="s.isShared">Shared</span>
							</label>
						</div>
						<button v-if="suggestions.length > 20" class="btn-secondary" @click="showAllSuggestions = !showAllSuggestions">
							{{ showAllSuggestions ? 'Show less' : 'Show more' }}
						</button>
					</div>
					<div class="dialog-actions">
						<button class="btn-secondary" @click="showSuggestionsModal = false">Cancel</button>
						<button class="btn-primary" :disabled="selectedSuggestionIds.length === 0" @click="confirmSelectedSuggestions">Add Selected</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as Activities from "../api/activities";
import * as CostTracker from "../api/costtracker";
import * as Invitations from "../api/invitations";
import * as PackingLists from "../api/packinglists";
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

const route = useRoute();
const router = useRouter();
const { currentUser, getSession } = useAuth();

// Initialize activeTab from URL query parameter or default to "overview"
const getInitialTab = (tripId?: string): string => {
	const tabFromUrl = route.query.tab as string;
	if (
		tabFromUrl &&
		["overview", "discover", "attractions", "costs", "packing"].includes(
			tabFromUrl,
		)
	) {
		return tabFromUrl;
	}
	// Fallback to localStorage for backward compatibility
	if (tripId) {
		try {
			const key = `trip_active_tab_${tripId}`;
			const saved = localStorage.getItem(key);
			if (
				saved &&
				["overview", "discover", "attractions", "costs", "packing"].includes(
					saved,
				)
			) {
				return saved;
			}
		} catch {}
	}
	return "overview";
};

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
// AI suggestions selection modal state
const showSuggestionsModal = ref(false);
// Background suggestion readiness indicator (unused when generation is user-initiated only)
const suggestionsReady = ref(false);
type SuggestedItem = {
	id: string;
	name: string;
	quantity?: number;
	isShared?: boolean;
};
const suggestions = ref<SuggestedItem[]>([]);
const selectedSuggestionIds = ref<string[]>([]);
const showAllSuggestions = ref(false);
// Snapshot existing items to guard against backend side-effects
const existingItemsSnapshot = ref<ChecklistItem[]>([]);
// Defer heavy JSON parsing to confirmation to avoid timeouts
const rawSuggestionsJson = ref<string | null>(null);

// Track which tabs have been loaded to avoid reloading unnecessarily
const loadedTabs = ref<Set<string>>(new Set());

// Update URL when tab changes
watch(
	() => activeTab.value,
	(tab) => {
		if (!props.trip?.id) return;

		// Update URL query parameter
		router.replace({
			query: { ...route.query, tab },
		});

		// Persist to localStorage for backward compatibility
		try {
			const key = `trip_active_tab_${props.trip.id}`;
			localStorage.setItem(key, tab);
		} catch {}

		// Load data for the active tab if not already loaded
		loadTabData(tab);
	},
);

// Watch for URL changes (e.g., browser back/forward)
watch(
	() => route.query.tab,
	(tabFromUrl) => {
		if (tabFromUrl && typeof tabFromUrl === "string") {
			if (
				["overview", "discover", "attractions", "costs", "packing"].includes(
					tabFromUrl,
				)
			) {
				if (activeTab.value !== tabFromUrl) {
					activeTab.value = tabFromUrl;
				}
			}
		}
	},
);

// Load data when trip changes - only load overview tab initially
watch(
	() => props.trip.id,
	() => {
		if (props.trip.id) {
			// Initialize tab from URL or localStorage
			const initialTab = getInitialTab(props.trip.id);
			activeTab.value = initialTab;
			loadedTabs.value.clear();

			// Update URL if it doesn't match
			if (route.query.tab !== initialTab) {
				router.replace({
					query: { ...route.query, tab: initialTab },
				});
			}

			// Load data for the initial tab
			loadTabData(initialTab);
		}
	},
	{ immediate: true },
);

// Load data only for the specified tab - only when tab becomes active
async function loadTabData(tab: string) {
	// Don't load if already loaded
	if (loadedTabs.value.has(tab)) {
		return; // Already loaded
	}

	switch (tab) {
		case "attractions":
			// Only load activities when attractions tab is actually opened
			await loadActivities();
			loadedTabs.value.add("attractions");
			break;
		case "costs":
			// Only load expenses when costs tab is actually opened
			await loadExpenses();
			loadedTabs.value.add("costs");
			break;
		case "packing":
			// Only load packing items when packing tab is actually opened
			await loadPackingItems();
			loadedTabs.value.add("packing");
			break;
		case "overview":
		case "discover":
			// Overview and discover tabs don't need specific data loading
			loadedTabs.value.add(tab);
			break;
	}
}

// Legacy function - kept for backward compatibility but now delegates to loadTabData
async function loadTripData() {
	// Load data for the currently active tab
	await loadTabData(activeTab.value);
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
		for (const {
			expense: expenseId,
			totalCost,
			title,
		} of percentageExpenses.listedExpenses) {
			try {
				const details =
					await CostTracker.getPercentageExpenseDetails(expenseId);
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
		for (const {
			expense: expenseId,
			totalCost,
			title,
		} of moneyExpenses.listedExpenses) {
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
				const createResponse = await PackingLists.createPackingList(
					props.trip.id,
				);
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

			// Deduplicate by unique key: id is unique, but if items somehow have same id+name+assignee+isShared combo, keep first
			// Use item ID as the primary unique key since each item should have a unique database ID
			const seenIds = new Set<string>();
			const deduped = transformedItems.filter((item) => {
				if (seenIds.has(item.id)) {
					return false; // Duplicate ID, skip it
				}
				seenIds.add(item.id);
				return true;
			});

			// Apply client-persisted quantities from localStorage
			const qKey = packingListId.value
				? `packing_qty_${packingListId.value}`
				: null;
			let qtyMap: Record<string, number> = {};
			if (qKey) {
				try {
					const raw = localStorage.getItem(qKey);
					if (raw) qtyMap = JSON.parse(raw);
				} catch {}
			}

			// Sanitize assignees: if an item is assigned to a user who is no longer in the trip,
			// treat it as unassigned so the UI shows an empty selection.
			const validTravelerIds = new Set<string>(
				props.trip.travelers.map((t) => t.id),
			);
			packingItems.value = deduped.map((item) => {
				const key = item.name.toLowerCase();
				const persistedQty = qtyMap[key];
				const assignee =
					item.assignee && validTravelerIds.has(String(item.assignee))
						? item.assignee
						: undefined;
				return {
					...item,
					quantity: persistedQty ?? item.quantity ?? 1,
					assignee,
				};
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

function handleTabClick(tabId: string) {
	if (activeTab.value !== tabId) {
		activeTab.value = tabId;
	}
}

// (Debug destination helpers removed)

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
			alert(
				"Username not found. Ask them to create an account, then try again.",
			);
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
			{
				solo: activity.solo,
				proposal: activity.proposal,
				description: activity.description,
				location: activity.location,
			},
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

	// Enforce: only assignee can check off a shared item that has an assignee
	if (
		item.isShared &&
		item.assignee &&
		String(item.assignee) !== String(currentUser.value?.id ?? "")
	) {
		alert("Only the assignee can check off this shared item.");
		return;
	}

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

async function handleAddItem(
	itemName: string,
	isShared: boolean,
	quantity: number = 1,
) {
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
				await PackingLists.updateQuantity(
					packingListId.value,
					existing.id,
					newQty,
				);
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
			const createResponse = await PackingLists.createPackingList(
				props.trip.id,
			);
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
			isShared,
			quantity,
		);

		await loadPackingItems();

		// If a quantity greater than 1 was specified, persist it
		if (quantity && quantity > 1) {
			const added = packingItems.value.find(
				(i) => i.name.toLowerCase() === trimmedName.toLowerCase(),
			);
			if (added) {
				added.quantity = quantity;
				try {
					await PackingLists.updateQuantity(
						packingListId.value,
						added.id,
						quantity,
					);
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
				await PackingLists.updateQuantity(
					packingListId.value,
					itemId,
					newQuantity,
				);
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

async function generatePackingList(
	regenerate: boolean = false,
	openModal: boolean = true,
) {
	const session = getSession();
	if (!session || !props.trip.id) return;

	try {
		generatingPackingList.value = true;
		generationProgress.value = 0;
		generationStage.value = "Preparing...";

		// Keep existing items; suggestions will be collected separately

		// Snapshot current items to restore if needed
		existingItemsSnapshot.value = packingItems.value.map((i) => ({ ...i }));

		// Reload activities to ensure we have the latest data (only for regenerate)
		if (regenerate) {
			generationStage.value = "Loading latest activities...";
			generationProgress.value = 10;
			await loadActivities();

			// Do not reset packing list; keep existing items and add suggestions
		}

		// Ensure list exists; do not recreate on regenerate
		if (!packingListId.value) {
			try {
				generationStage.value = "Creating packing list...";
				generationProgress.value = 10;
				const createResponse = await PackingLists.createPackingList(
					props.trip.id,
				);
				packingListId.value = createResponse.packinglist;

				// Keep existing items separate from suggestions
			} catch (e: any) {
				console.error("Failed to get or create packing list:", e);
				alert("Failed to get or create packing list. Please try again.");
				return;
			}
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
		const nights = Math.ceil(
			(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
		);
		// Prompt compression: minimal inputs to reduce generation time
		const tripInfo = `Nights:${nights};`;
		const activitiesInfo =
			activities.value.length > 0
				? `Activities:${activities.value.map((a) => a.title).join("|")};`
				: "Activities:;";
		const quantityHint = `Rules: return explicit numeric quantities (no 'x1'); infer quantities from nights and activities; set shared=true for communal items; avoid duplicates.`;
		const capHint = `Limit: max 20 suggestions.`;
		const formatHint = `Output: ONLY JSON array of {name,quantity,shared}. If a carrier is needed, insert ONE item named __PACKING_SUGGESTIONS_JSON__ containing that JSON.`;
		const exampleHint = `Example:[{"name":"Underwear","quantity":${nights},"shared":false},{"name":"First aid kit","quantity":1,"shared":true}]`;
		const additionalInput = `${tripInfo} ${activitiesInfo} ${quantityHint} ${capHint} ${formatHint} ${exampleHint}`;

		// New flow: fetch raw JSON suggestions from backend without creating items
		generationStage.value = "Requesting AI suggestions...";
		generationProgress.value = regenerate ? 40 : 30;
		const raw = await PackingLists.getRawSuggestions(
			packingListId.value,
			additionalInput,
		);
		const arr = Array.isArray(raw?.suggestions) ? raw.suggestions : [];
		rawSuggestionsJson.value = JSON.stringify(arr);
		const existingNames = new Set(
			packingItems.value.map((i) => i.name.trim().toLowerCase()),
		);
		suggestions.value = arr
			.filter((s) => s?.name && !existingNames.has(s.name.trim().toLowerCase()))
			.map((s) => ({
				id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
				name: s.name.trim(),
				quantity:
					Number.isFinite(s.quantity) && s.quantity! > 0
						? s.quantity
						: undefined,
				isShared: typeof s.shared === "boolean" ? s.shared : false,
			}));

		// Open modal only if requested by user action
		suggestionsReady.value = true;
		if (openModal) showSuggestionsModal.value = true;

		generationProgress.value = 100;
		generationStage.value = "Complete!";
	} catch (error: any) {
		console.error(
			`Failed to ${regenerate ? "regenerate" : "generate"} packing list:`,
			error,
		);
		const errorMessage =
			error instanceof Error
				? error.message
				: `Failed to ${regenerate ? "regenerate" : "generate"} packing list`;
		alert(errorMessage);
		generationStage.value = "Error occurred";
	} finally {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		generatingPackingList.value = false;
		generationProgress.value = 0;
		generationStage.value = "";
	}
}

async function confirmSelectedSuggestions() {
	if (!packingListId.value || selectedSuggestionIds.value.length === 0) {
		showSuggestionsModal.value = false;
		return;
	}
	const chosen = suggestions.value.filter((s) =>
		selectedSuggestionIds.value.includes(s.id),
	);
	try {
		// Parse raw JSON once and map by normalized name
		const detailsByName: Record<
			string,
			{ quantity?: number; shared?: boolean }
		> = {};
		if (rawSuggestionsJson.value) {
			try {
				const arr = JSON.parse(rawSuggestionsJson.value);
				if (Array.isArray(arr)) {
					for (const obj of arr) {
						if (obj && typeof obj.name === "string") {
							const nameKey = obj.name.trim().toLowerCase();
							detailsByName[nameKey] = {
								quantity: Number.isFinite(obj.quantity)
									? Number(obj.quantity)
									: undefined,
								shared:
									typeof obj.shared === "boolean" ? obj.shared : undefined,
							};
						}
					}
				}
			} catch (e) {
				console.warn("Failed to parse suggestion JSON on confirm:", e);
			}
		}

		// Add each chosen item back to packing list with correct shared/quantity and assignee for personal items
		for (const s of chosen) {
			const key = s.name.trim().toLowerCase();
			const det = detailsByName[key] || {};
			const isShared =
				det.shared !== undefined ? !!det.shared : s.isShared || false;
			const assignee = isShared
				? undefined
				: (currentUser.value?.id ?? "").toString();
			// Use quantity from suggestion object first, fallback to detailsByName
			const qty =
				s.quantity && s.quantity > 0
					? s.quantity
					: det.quantity && det.quantity > 0
						? det.quantity
						: undefined;
			await PackingLists.addItem(
				packingListId.value,
				s.name,
				assignee,
				isShared,
				qty,
			);
		}
		await loadPackingItems();

		// Restore any existing items that vanished due to backend side-effects
		const currentNames = new Set(
			packingItems.value.map((i) => i.name.trim().toLowerCase()),
		);
		const missing = existingItemsSnapshot.value.filter(
			(i) => !currentNames.has(i.name.trim().toLowerCase()),
		);
		if (missing.length > 0) {
			for (const m of missing) {
				const assignee = m.isShared
					? undefined
					: m.assignee
						? String(m.assignee)
						: (currentUser.value?.id ?? "").toString();
				await PackingLists.addItem(
					packingListId.value,
					m.name,
					assignee,
					!!m.isShared,
				);
				if (m.quantity && m.quantity > 1) {
					await loadPackingItems();
					const readded = packingItems.value.find(
						(i) => i.name.toLowerCase() === m.name.toLowerCase(),
					);
					if (readded) {
						try {
							await PackingLists.updateQuantity(
								packingListId.value,
								readded.id,
								m.quantity,
							);
						} catch {}
					}
				}
			}
			await loadPackingItems();
		}
	} catch (e) {
		console.error("Failed to add selected suggestions:", e);
		alert("Failed to add some suggestions. Please try again.");
	} finally {
		showSuggestionsModal.value = false;
		selectedSuggestionIds.value = [];
		suggestions.value = [];
		existingItemsSnapshot.value = [];
		rawSuggestionsJson.value = null;
	}
}

async function handleRegeneratePackingList() {
	suggestionsReady.value = false;
	await generatePackingList(true, true);
}

async function handleGeneratePackingList() {
	// User-initiated generation only
	suggestionsReady.value = false;
	await generatePackingList(false, true);
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

async function handleAssignItem(
	itemId: string,
	travelerId: string | undefined,
) {
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
		const assigneeParam =
			travelerId && travelerId.length > 0 ? travelerId : null;
		await PackingLists.assignItem(
			packingListId.value,
			itemId,
			assigneeParam,
			isSharedFlag,
		);
	} catch (error: any) {
		console.error("Failed to assign item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to assign item";
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

			// Preserve quantity when moving to shared
			const quantity =
				item.quantity && item.quantity > 0 ? item.quantity : undefined;

			// Add new shared item with same name and quantity
			ops.push(
				PackingLists.addItem(
					packingListId.value,
					item.name,
					undefined,
					true,
					quantity,
				),
			);
			// Delete original personal item (omit isShared for personal)
			ops.push(PackingLists.deleteItem(packingListId.value, id));
		}

		if (ops.length === 0) return;
		await Promise.allSettled(ops);

		// Reload to reflect changes
		await loadPackingItems();
	} catch (error: any) {
		console.error("Failed to move items to shared:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to move items to shared";
		alert(errorMessage);
		// Best effort reload
		try {
			await loadPackingItems();
		} catch {}
	}
}

// Unassign shared item and distribute to all trip members
async function handleUnassignSharedItem(itemId: string) {
	console.log("[handleUnassignSharedItem] Called with itemId:", itemId);
	const session = getSession();
	if (!session || !packingListId.value) {
		console.log("[handleUnassignSharedItem] Missing session or packingListId");
		return;
	}

	const item = packingItems.value.find((i) => i.id === itemId);
	console.log("[handleUnassignSharedItem] Found item:", item);
	if (!item) {
		console.log("[handleUnassignSharedItem] Item not found");
		return;
	}

	if (!item.isShared) {
		console.log("[handleUnassignSharedItem] Item is not shared");
		alert("Only shared items can be unassigned to all members.");
		return;
	}

	try {
		console.log("[handleUnassignSharedItem] Calling API with:", {
			packingListId: packingListId.value,
			itemId,
		});
		await PackingLists.unassignSharedItem(packingListId.value, itemId);
		console.log("[handleUnassignSharedItem] API call successful");
		
		// Reload packing items to show the newly created individual items
		await loadPackingItems();
		console.log("[handleUnassignSharedItem] Reloaded packing items");
		console.log("[handleUnassignSharedItem] Current user ID:", currentUser.value?.id);
		console.log("[handleUnassignSharedItem] All items:", packingItems.value.length);
		console.log("[handleUnassignSharedItem] Personal items:", packingItems.value.filter(i => !i.isShared && i.assignee === currentUser.value?.id));
		console.log("[handleUnassignSharedItem] Shared items:", packingItems.value.filter(i => i.isShared));
	} catch (error: any) {
		console.error("Failed to unassign shared item:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to unassign shared item";
		alert(errorMessage);
		// Best effort reload
		try {
			await loadPackingItems();
		} catch {}
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
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete items";
		alert(errorMessage);
		try {
			await loadPackingItems();
		} catch {}
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

/* Removed hero-destination - trips no longer have destinations */

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

.tab-badge {
	margin-left: 0.5rem;
	background: #e2f8f6;
	color: #0d9488;
	padding: 2px 8px;
	border-radius: 9999px;
	font-size: 0.75rem;
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

/* Modal styles reused from Dashboard */
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
	max-width: 560px;
	max-height: 90vh;
	overflow-y: auto;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dialog-header { margin-bottom: 1rem; }
.dialog-title { font-size: 1.25rem; font-weight: 600; color: #1e3a5f; }
.dialog-description { color: #64748b; font-size: 0.9rem; }

.suggestions-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
.suggestion-row { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #faf8f6; }
.suggestion-item { display: flex; align-items: center; gap: 0.5rem; }
.suggestion-item .name { font-weight: 500; color: #1e293b; }
.suggestion-item .meta { color: #475569; font-size: 0.85rem; }
.suggestion-item .badge { margin-left: auto; background: #e2f8f6; color: #0d9488; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; }

.dialog-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
.btn-primary { background: #42b983; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }
.btn-secondary { background: #f0f0f0; color: #333; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }
</style>
