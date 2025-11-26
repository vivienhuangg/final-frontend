// Types for trip data matching the concept specifications

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  organizer: string; // User ID
  travelers: Traveler[]; // Includes organizer
  headerImage?: string;
  /**
   * UI helper: resolved display name for organizer (first + last if available, else username, else ID)
   */
  organizerDisplayName?: string;
}

export interface Traveler {
  id: string; // User ID
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
}

export interface Activity {
  id: string;
  title: string;
  event: string; // Trip ID (event = trip in our case)
  start: string; // startDateTime
  end: string; // endDateTime
  cost: number;
  location?: string;
  duration?: string;
  groupSize?: string;
  pricePerPerson?: number;
  source?: 'discover' | 'manual';
  solo?: boolean; // If true, only creator can see it
  proposal?: boolean; // If true, it's a proposal; if false, committed
  createdBy?: string; // User ID of creator
}

export interface Invitation {
  id: string;
  invitee: string; // User ID
  event: string; // Activity ID or Trip ID
  accepted: 'Yes' | 'No' | 'Maybe';
}

export interface TripInvitation {
  id: string;
  tripId: string;
  invitee: string; // User ID
  inviter: string; // User ID who sent the invitation
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  trip: Trip; // Full trip data for display
}

export interface Rating {
  id: string;
  user: string; // User ID
  item: string; // Activity ID
  ratingNum: number; // 1-10
  isAnonymous: boolean;
}

export interface Expense {
  id: string;
  title: string;
  totalCost: number;
  paidBy: string; // User ID
  splitBetween: SplitUser[]; // Users with their split amounts
  date: string;
  splitType: 'money' | 'percentage';
}

export interface SplitUser {
  userId: string;
  cost?: number; // For money-based
  percentage?: number; // For percentage-based
}

export interface Checklist {
  id: string;
  trip: string; // Trip ID
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  finished: boolean;
  assignee?: string; // User ID (optional - if not set, it's a shared item)
  finishedBy?: string; // User ID (optional)
  category?: string;
  isShared: boolean; // Helper for UI
  quantity?: number; // Quantity of the item (defaults to 1)
}

export interface MemberBalance {
  travelerId: string;
  balance: number; // positive = owed money, negative = owes money
}

// UI-specific types
export interface ActivityWithDetails extends Activity {
  rating?: number; // Average rating
  votes?: number; // Number of ratings
  tags?: string[];
  attendees?: string[]; // User IDs who accepted invitation
  invitations?: Invitation[]; // All invitations for this activity
  description?: string; // Activity description
  image?: string; // Image URL for the activity
}

export interface PackingItem extends ChecklistItem {
  category: string;
}
