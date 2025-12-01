import type {
	ActivityWithDetails,
	ChecklistItem,
	Traveler,
	Trip,
	TripInvitation,
} from "../types/trip";

/**
 * Transform API trip response to component Trip type
 */
export function transformApiTripToTrip(
	apiTrip: {
		_id: string;
		title: string;
		startDate: string;
		endDate: string;
		organizer: string;
		travellers: string[];
		destination?: string; // Q*: is there a diff btw destination and location?
		location?: string;
	},
	organizerName?: string,
	travelerNames?: Map<
		string,
		{ firstName?: string; lastName?: string; username: string }
	>,
): Trip {
	// Build travelers array
	const travelers: Traveler[] = apiTrip.travellers.map((userId) => {
		const nameInfo = travelerNames?.get(userId);
		const name = nameInfo
			? nameInfo.firstName && nameInfo.lastName
				? `${nameInfo.firstName} ${nameInfo.lastName}`
				: nameInfo.username
			: userId;

		return {
			id: userId,
			name,
			email: `${userId}@example.com`, // Q*: remove email?
			firstName: nameInfo?.firstName,
			lastName: nameInfo?.lastName,
			username: nameInfo?.username || userId,
		};
	});

	return {
		id: apiTrip._id,
		title: apiTrip.title,
		// Prefer explicit destination/location fields; fallback to title only if absent
		destination: apiTrip.destination || apiTrip.location || apiTrip.title,
		startDate: apiTrip.startDate,
		endDate: apiTrip.endDate,
		organizer: apiTrip.organizer,
		organizerDisplayName: (() => {
			// Prefer explicitly provided organizerName override
			if (organizerName) return organizerName;
			const info = travelerNames?.get(apiTrip.organizer);
			if (!info) return apiTrip.organizer;
			if (info.firstName && info.lastName) return `${info.firstName} ${info.lastName}`;
			return info.username || apiTrip.organizer;
		})(),
		travelers,
	};
}

/**
 * Transform API invitation response to component TripInvitation type
 */
export function transformApiInvitationToTripInvitation(
	apiInvitation: {
		invitation: string;
		event: string;
		accepted: "Yes" | "No" | "Maybe";
	},
	trip: Trip,
	inviterId?: string,
	inviterName?: string,
): TripInvitation {
	const status: TripInvitation["status"] =
		apiInvitation.accepted === "Yes"
			? "accepted"
			: apiInvitation.accepted === "No"
				? "declined"
				: "pending"; // Maybe

	return {
		id: apiInvitation.invitation,
		tripId: apiInvitation.event,
		invitee: "", // Will be set later
		inviter: inviterId || "",
		status,
		createdAt: new Date().toISOString(),
		trip,
	};
}

/**
 * Transform API activity response to component ActivityWithDetails type
 */
export function transformApiActivityToActivity(apiActivity: {
	_id: string;
	title: string;
	start: string;
	end: string;
	cost: number;
	solo?: boolean;
	proposal?: boolean;
	createdBy?: string;
	description?: string;
}): ActivityWithDetails {
	return {
		id: apiActivity._id,
		title: apiActivity.title,
		event: "", // Will be set from context
		start: apiActivity.start,
		end: apiActivity.end,
		cost: apiActivity.cost,
		source: "manual",
		attendees: [],
		solo: apiActivity.solo ?? false,
		proposal: apiActivity.proposal ?? true,
		createdBy: apiActivity.createdBy,
		description: apiActivity.description,
	};
}

/**
 * Transform API packing list item to component ChecklistItem type
 */
export function transformApiPackingItemToChecklistItem(apiItem: {
	_id: string;
	name: string;
	finished: boolean;
	assignee?: string;
	finishedBy?: string;
	quantity?: number;
	isShared?: boolean;
}): ChecklistItem {
	// Items without assignee are personal items (not shared)
	// Items with assignee are shared/assigned items
	return {
		id: apiItem._id,
		name: apiItem.name,
		finished: apiItem.finished,
		assignee: apiItem.assignee,
		finishedBy: apiItem.finishedBy,
		isShared: apiItem.isShared ?? false,
		category: undefined, // Category not provided by API, will default to "Uncategorized" in UI
		quantity: apiItem.quantity ?? 1, // Default to 1 if not provided
	};
}
 ``