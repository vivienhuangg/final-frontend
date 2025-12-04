import http from "./http";
import { useAuthStore } from "../stores/authStore";

function getSession(): string | null {
	try {
		return localStorage.getItem("sessionId");
	} catch {
		return null;
	}
}

function getCurrentUserId(): string | null {
	try {
		const store = useAuthStore();
		return store.currentUser?.id || null;
	} catch {
		return null;
	}
}

export interface Notification {
	notification: string;
	type: NotificationType;
	message: string;
	trip?: string;
	relatedEntity?: string;
	read: boolean;
	createdAt: string;
}

export type NotificationType =
	| "packing_list_change"
	| "packing_list_regenerate"
	| "packing_item_assigned"
	| "packing_item_unassigned"
	| "event_details_change"
	| "event_rating"
	| "expense_added"
	| "expense_edited"
	| "expense_debt"
	| "trip_invitation"
	| "trip_invitation_accepted"
	| "trip_joined"
	| "activity_proposal_created"
	| "activity_proposal_to_group"
	| "activity_details_changed"
	| "activity_opted_in"
	| "activity_opted_out"
	| "activity_deleted";

export async function getNotifications(includeRead: boolean = true): Promise<Notification[]> {
	const userId = getCurrentUserId();
	if (!userId) throw new Error("Not authenticated");
	
	const { data } = await http.post("/Notification/_getNotificationsByUser", {
		user: userId,
		includeRead,
	});
	console.log('=== API RESPONSE ===');
	console.log('Raw data:', data);
	console.log('Data type:', typeof data);
	console.log('Is array:', Array.isArray(data));
	console.log('Has results:', data && typeof data === 'object' && 'results' in data);
	if (data && typeof data === "object" && "error" in data && (data as any).error)
		throw new Error((data as any).error);
	
	// Backend returns { results: [...] } when using collectAs
	const results = (data as any)?.results;
	if (Array.isArray(results)) {
		console.log('Results array length:', results.length);
		results.forEach((item, index) => {
			console.log(`Notification ${index + 1}:`, item);
		});
		return results as Notification[];
	}
	
	// Fallback: if data is already an array, use it directly
	if (Array.isArray(data)) {
		console.log('Data is array, length:', data.length);
		return data as Notification[];
	}
	
	console.log('No results found, returning empty array');
	return [];
}

export async function getUnreadCount(): Promise<number> {
	const userId = getCurrentUserId();
	if (!userId) return 0;
	
	const { data } = await http.post("/Notification/_getUnreadCount", {
		user: userId,
	});
	if (data && typeof data === "object" && "error" in data && (data as any).error)
		throw new Error((data as any).error);
	// Backend returns { count: Array<{ count: number }> }
	const countData = (data as any)?.count as Array<{ count: number }> | undefined;
	return countData?.[0]?.count || 0;
}

export async function markAsRead(notification: string): Promise<void> {
	const userId = getCurrentUserId();
	if (!userId) throw new Error("Not authenticated");
	
	const { data } = await http.post("/Notification/markAsRead", {
		user: userId,
		notification,
	});
	if (data && typeof data === "object" && "error" in data && (data as any).error)
		throw new Error((data as any).error);
}

export async function markAllAsRead(): Promise<void> {
	const userId = getCurrentUserId();
	if (!userId) throw new Error("Not authenticated");
	
	const { data } = await http.post("/Notification/markAllAsRead", {
		user: userId,
	});
	if (data && typeof data === "object" && "error" in data && (data as any).error)
		throw new Error((data as any).error);
}

export async function deleteNotification(notification: string): Promise<void> {
	const userId = getCurrentUserId();
	if (!userId) throw new Error("Not authenticated");
	
	const { data } = await http.post("/Notification/deleteNotification", {
		user: userId,
		notification,
	});
	if (data && typeof data === "object" && "error" in data && (data as any).error)
		throw new Error((data as any).error);
}

