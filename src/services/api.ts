const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

class ApiError extends Error {
	constructor(
		message: string,
		public status?: number,
		public code?: string,
		public details?: unknown,
	) {
		super(message);
		this.name = "ApiError";
	}
}

// Retry configuration
interface RetryConfig {
	maxRetries: number;
	baseDelay: number;
	maxDelay: number;
	backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxRetries: 3,
	baseDelay: 1000,
	maxDelay: 10000,
	backoffMultiplier: 2,
};

// Utility function to check if error is retryable
function isRetryableError(error: ApiError): boolean {
	if (!error.status) return true; // Network errors are retryable
	return error.status >= 500 || error.status === 429; // Server errors and rate limiting
}

// Utility function to calculate delay with exponential backoff
function calculateDelay(attempt: number, config: RetryConfig): number {
	const delay = config.baseDelay * config.backoffMultiplier ** (attempt - 1);
	return Math.min(delay, config.maxDelay);
}

// Utility function to sleep
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest<T>(
	endpoint: string,
	data: unknown,
	method: "POST" = "POST",
	retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<T> {
	let lastError: ApiError = new ApiError("Unknown error");

	for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
		try {
			// Automatically inject session token into request body if available
			const sessionToken = getSessionToken();

			const requestData =
				sessionToken && typeof data === "object" && data !== null
					? { session: sessionToken, ...data }
					: data;

			const response = await fetch(`${API_BASE_URL}${endpoint}`, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestData),
			});

			const result = await response.json();

			if (!response.ok || result.error) {
				const error = new ApiError(
					result.error || `Request failed with status ${response.status}`,
					response.status,
					result.code,
					result.details,
				);

				// If it's not retryable or this is the last attempt, throw immediately
				if (!isRetryableError(error) || attempt === retryConfig.maxRetries) {
					throw error;
				}

				lastError = error;
				await sleep(calculateDelay(attempt, retryConfig));
				continue;
			}

			return result;
		} catch (error) {
			if (error instanceof ApiError) {
				// If it's not retryable or this is the last attempt, throw immediately
				if (!isRetryableError(error) || attempt === retryConfig.maxRetries) {
					throw error;
				}

				lastError = error;
				await sleep(calculateDelay(attempt, retryConfig));
				continue;
			}

			// Network error - retryable
			const networkError = new ApiError("Network error occurred");
			if (attempt === retryConfig.maxRetries) {
				throw networkError;
			}

			lastError = networkError;
			await sleep(calculateDelay(attempt, retryConfig));
		}
	}

	throw lastError;
}

// Session token management
function getSessionToken(): string | null {
	return localStorage.getItem("sessionId");
}

// User API
export const userApi = {
	// Register - public endpoint
	async register(data: {
		username: string;
		password: string;
	}): Promise<{ user: string }> {
		return apiRequest<{ user: string }>("/users/register", data);
	},

	// Login - public endpoint, returns session token
	async login(data: {
		username: string;
		password: string;
	}): Promise<{ session: string }> {
		return apiRequest<{ session: string }>("/users/login", data);
	},

	// Logout - destroys session
	async logout(session: string): Promise<{ message: string }> {
		return apiRequest<{ message: string }>("/users/logout", { session });
	},

	// Set user's name
	async setName(data: {
		firstName: string;
		lastName: string;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/user/setName", data);
	},

	// Get user's name
	async getName(data: {
		targetUser?: string;
	}): Promise<{ firstName: string; lastName: string }> {
		return apiRequest<{ firstName: string; lastName: string }>(
			"/user/getName",
			data,
		);
	},

	// Get user ID from session
	async getUserFromSession(): Promise<{ user: string }> {
		return apiRequest<{ user: string }>("/Sessioning/_getUser", {});
	},

	// Delete user's name
	async deleteName(): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/user/deleteName", {});
	},
};

// Trip API
export const tripApi = {
	// Create trip
	async createTrip(data: {
		title: string;
		startDate: string;
		endDate: string;
	}): Promise<{ trip: string }> {
		return apiRequest<{ trip: string }>("/trips/new", data);
	},

	// Modify trip
	async modifyTrip(data: {
		trip: string;
		title: string;
		startDate: string;
		endDate: string;
	}): Promise<{ trip: string }> {
		return apiRequest<{ trip: string }>("/trips/modify", data);
	},

	// Delete trip
	async deleteTrip(data: { trip: string }): Promise<{ trip: string }> {
		return apiRequest<{ trip: string }>("/trips/delete", data);
	},

	// Get trip details
	async getTrip(data: { trip: string }): Promise<{
		trip: {
			_id: string;
			title: string;
			startDate: string;
			endDate: string;
			organizer: string;
			travellers: string[];
		};
	}> {
		return apiRequest("/trips/get", data);
	},

	// Get all trips for authenticated user
	async getMyTrips(): Promise<{
		results: Array<{
			trip: {
				_id: string;
				title: string;
				startDate: string;
				endDate: string;
				organizer: string;
				travellers: string[];
			};
		}>;
	}> {
		return apiRequest("/trips/my", {});
	},

	// Add traveller to trip
	async addTraveller(data: {
		trip: string;
		travellerUser: string;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/trips/addTraveller", data);
	},

	// Remove traveller from trip
	async deleteTraveller(data: {
		trip: string;
		deleteTravellerUser: string;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/trips/deleteTraveller", data);
	},
};

// Invitation API
export const invitationApi = {
	// Invite user to trip
	async inviteUserToTrip(data: {
		trip: string;
		inviteeId: string;
	}): Promise<{ invitation: string }> {
		return apiRequest<{ invitation: string }>("/Trip/invite", data);
	},

	// Accept invitation
	async acceptInvitation(data: {
		invitation: string;
	}): Promise<{ status: "accepted" }> {
		return apiRequest<{ status: "accepted" }>("/Invitation/accept", data);
	},

	// Reject invitation
	async rejectInvitation(data: {
		invitation: string;
	}): Promise<{ status: "rejected" }> {
		return apiRequest<{ status: "rejected" }>("/Invitation/reject", data);
	},

	// Delete invitation
	async deleteInvitation(data: {
		invitation: string;
	}): Promise<{ status: "deleted" }> {
		return apiRequest<{ status: "deleted" }>("/Invitation/delete", data);
	},

	// Get all invitations for authenticated user
	async getMyInvitations(): Promise<{
		results: Array<{
			invitation: string;
			event: string;
			acceptedStatus: "Yes" | "No" | "Maybe";
		}>;
	}> {
		return apiRequest("/Invitation/myInvitations", {});
	},

	// Get all invitations for a trip
	async getTripInvitations(data: { trip: string }): Promise<{
		results: Array<{
			invitation: string;
			invitee: string;
			accepted: "Yes" | "No" | "Maybe";
		}>;
	}> {
		return apiRequest("/Trip/invitations", data);
	},
};

// Activity API
export const activityApi = {
	// Create activity
	async createActivity(data: {
		title: string;
		startDateTime: string;
		endDateTime: string;
		cost: number;
		trip: string;
		solo?: boolean;
		proposal?: boolean;
	}): Promise<{ activity: string }> {
		return apiRequest<{ activity: string }>("/activities/create", data);
	},

	// Delete activity
	async deleteActivity(data: {
		activity: string;
	}): Promise<{ activity: string }> {
		return apiRequest<{ activity: string }>("/activities/delete", data);
	},

	// Modify proposal flag
	async modifyProposal(data: {
		activity: string;
		proposal: boolean;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/activities/modifyProposal", data);
	},

	// Modify solo flag
	async modifySolo(data: {
		activity: string;
		solo: boolean;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/activities/modifySolo", data);
	},

	// Modify title
	async modifyTitle(data: {
		activity: string;
		title: string;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/activities/modifyTitle", data);
	},

	// Modify duration (start and end times)
	async modifyDuration(data: {
		activity: string;
		startDateTime: string;
		endDateTime: string;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/activities/modifyDuration", data);
	},

	// Modify cost
	async modifyCost(data: {
		activity: string;
		newCost: number;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/activities/modifyCost", data);
	},

	// Get all activities for a trip
	async getActivitiesByTrip(data: { trip: string }): Promise<{
		results: Array<{
			activity: {
				_id: string;
				title: string;
				start: string;
				end: string;
				cost: number;
				solo: boolean;
				proposal: boolean;
				createdBy: string;
			};
		}>;
	}> {
		return apiRequest("/activities/byTrip", data);
	},

	// Get activity details
	async getActivityDetails(data: { activity: string }): Promise<{
		activity: {
			_id: string;
			title: string;
			trip: string;
			start: string;
			end: string;
			cost: number;
			solo: boolean;
			proposal: boolean;
			createdBy: string;
		};
	}> {
		return apiRequest("/activities/details", data);
	},
};

// Packing List API
export const packingListApi = {
	// Create packing list
	async createPackingList(data: {
		trip: string;
		regenerate?: boolean;
	}): Promise<{ packinglist: string }> {
		return apiRequest<{ packinglist: string }>("/packinglists/create", data);
	},

	// Add item to packing list
	async addItem(data: {
		packinglist: string;
		name: string;
		assignee?: string;
	}): Promise<{ message: string }> {
		return apiRequest<{ message: string }>("/packinglists/addItem", data);
	},

	// Delete item from packing list
	async deleteItem(data: {
		packinglist: string;
		item: string;
	}): Promise<{ message: string }> {
		return apiRequest<{ message: string }>("/packinglists/deleteItem", data);
	},

	// Delete packing list
	async deletePackingList(data: {
		packinglist: string;
	}): Promise<{ message: string }> {
		return apiRequest<{ message: string }>("/packinglists/delete", data);
	},

	// Toggle item completion
	async toggleCompletion(data: {
		packinglist: string;
		item: string;
		finishedFlag: boolean;
	}): Promise<{ message: string }> {
		return apiRequest<{ message: string }>(
			"/packinglists/toggleCompletion",
			data,
		);
	},

	// Request AI suggestions
	async requestSuggestions(data: {
		packinglist: string;
		additionalInput: string;
	}): Promise<{ requestId: string; message: string }> {
		return apiRequest("/packinglists/suggest", data);
	},

	// Add generated items
	async addGeneratedItems(data: {
		packinglist: string;
		itemNames: string[];
		assignee?: string;
	}): Promise<{ message: string }> {
		return apiRequest<{ message: string }>(
			"/packinglists/addGeneratedItems",
			data,
		);
	},

	// Get all items in packing list
	async getItems(data: { packinglist: string }): Promise<{
		results: Array<{
			item: {
				_id: string;
				name: string;
				finished: boolean;
				assignee?: string;
				finishedBy?: string;
				quantity?: number;
			};
		}>;
	}> {
		return apiRequest("/packinglists/items", data);
	},
};

// Cost Tracker API
export const costTrackerApi = {
	// Create equal split percentage expense
	async createEqualSplitPercentageExpense(data: {
		totalCost: number;
		users: string[];
	}): Promise<{ expense: string }> {
		return apiRequest<{ expense: string }>(
			"/costtracker/equal-split-percentage",
			data,
		);
	},

	// Create equal split money expense
	async createEqualSplitMoneyExpense(data: {
		totalCost: number;
		users: string[];
	}): Promise<{ expense: string }> {
		return apiRequest<{ expense: string }>(
			"/costtracker/equal-split-money",
			data,
		);
	},

	// Create percentage expense with custom splits
	async createPercentageExpense(data: {
		totalCost: number;
		users: string[];
		percentages: number[];
	}): Promise<{ expense: string }> {
		return apiRequest<{ expense: string }>(
			"/costtracker/percentage-expense",
			data,
		);
	},

	// Create money expense with custom splits
	async createMoneyExpense(data: {
		totalCost: number;
		users: string[];
		costs: number[];
	}): Promise<{ expense: string }> {
		return apiRequest<{ expense: string }>("/costtracker/money-expense", data);
	},

	// Convert expense to money-based
	async convertExpenseToMoney(data: {
		expense: string;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/costtracker/to-money", data);
	},

	// Convert expense to percentage-based
	async convertExpenseToPercentage(data: {
		expense: string;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/costtracker/to-percentage", data);
	},

	// Modify money expense fully
	async modifyMoneyExpenseFull(data: {
		expense: string;
		newTotalCost: number;
		users: string[];
		costs: number[];
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>(
			"/costtracker/modify-money-full",
			data,
		);
	},

	// Modify percentage expense fully
	async modifyPercentageExpenseFull(data: {
		expense: string;
		newTotalCost: number;
		users: string[];
		percentages: number[];
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>(
			"/costtracker/modify-percentage-full",
			data,
		);
	},

	// Modify percentage expense total cost only
	async modifyPercentageExpenseTotalCost(data: {
		expense: string;
		newTotalCost: number;
	}): Promise<{ status: string }> {
		return apiRequest<{ status: string }>(
			"/costtracker/modify-total-cost",
			data,
		);
	},

	// Delete expense
	async deleteExpense(data: { expense: string }): Promise<{ status: string }> {
		return apiRequest<{ status: string }>("/costtracker/delete", data);
	},

	// Get percentage expense details
	async getPercentageExpenseDetails(data: { expense: string }): Promise<{
		totalCost: number;
		users: Array<{ user: string; percentage: number }>;
	}> {
		return apiRequest("/costtracker/percentage-details", data);
	},

	// Get money expense details
	async getMoneyExpenseDetails(data: { expense: string }): Promise<{
		totalCost: number;
		users: Array<{ user: string; cost: number }>;
	}> {
		return apiRequest("/costtracker/money-details", data);
	},

	// List all percentage expenses
	async listPercentageExpenses(): Promise<{
		listedExpenses: Array<{ expense: string; totalCost: number }>;
	}> {
		return apiRequest("/costtracker/percentage-expenses", {});
	},

	// List all money expenses
	async listMoneyExpenses(): Promise<{
		listedExpenses: Array<{ expense: string; totalCost: number }>;
	}> {
		return apiRequest("/costtracker/money-expenses", {});
	},
};

// Rating API
export const ratingApi = {
	// Add rating
	async addRating(data: {
		item: string;
		ratingNum: number;
	}): Promise<{ rating: string }> {
		return apiRequest<{ rating: string }>("/ratings/item/add", data);
	},

	// Change rating
	async changeRating(data: {
		rating: string;
		ratingNum: number;
	}): Promise<{ rating: string }> {
		return apiRequest<{ rating: string }>("/ratings/item/change", data);
	},

	// Set rating (creates if doesn't exist, updates if it does)
	async setRating(data: {
		item: string;
		ratingNum: number;
	}): Promise<{ rating: string }> {
		return apiRequest<{ rating: string }>("/ratings/item/set", data);
	},

	// Remove rating
	async removeRating(data: { rating: string }): Promise<{ message: string }> {
		return apiRequest<{ message: string }>("/ratings/item/remove", data);
	},

	// Get rating details
	async getRating(data: {
		rating: string;
	}): Promise<{ user: string; item: string; ratingNum: number }> {
		return apiRequest("/ratings/item/get", data);
	},

	// Get all ratings for an item
	async getRatingsByItem(data: { item: string }): Promise<{
		results: Array<{ rater: string; num: number; ratingId: string }>;
	}> {
		return apiRequest("/ratings/item/list", data);
	},

	// Get all ratings by a user
	async getRatingsByUser(data: { user: string }): Promise<{
		results: Array<{ item: string; ratingNum: number; rating: string }>;
	}> {
		return apiRequest("/ratings/user/list", data);
	},
};

export { ApiError };
