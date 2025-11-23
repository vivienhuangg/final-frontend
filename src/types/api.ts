// API Types based on the API specification

export interface UserType {
  id: string;
  username: string;
}

export interface TripType {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  organizer: UserType;
  travellers: UserType[];
}

export interface EventType {
  id: string;
  trip: TripType;
  title?: string;
}

export interface InvitationType {
  id: string;
  invitee: UserType;
  event: EventType;
  accepted: "Yes" | "No" | "Maybe";
}

export interface ActivityType {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  cost: number;
  event: EventType;
}

export interface ChecklistType {
  id: string;
}

export interface ItemType {
  id: string;
  description: string;
  finished: boolean;
  assignee?: UserType;
  finishedBy?: UserType;
}

export interface ExpenseType {
  id: string;
  totalCost: number;
  type: "percentage" | "money";
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  user: UserType;
  percentage?: number;
  cost?: number;
}

export interface RatingType {
  id: string;
  user: UserType;
  item: ItemType;
  ratingNum: number;
  isAnonymous: boolean;
}

// API Request/Response Types

export interface ApiErrorResponse {
  error: string;
}

export interface AuthenticateRequest {
  username: string;
  password: string;
}

export interface AuthenticateResponse {
  user: UserType;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  user: UserType;
}

export interface SetNameRequest {
  user: UserType;
  firstName: string;
  lastName: string;
}

export interface GetNameRequest {
  user: UserType;
}

export interface GetNameResponse {
  firstName: string;
  lastName: string;
}

export interface DeleteNameRequest {
  user: UserType;
}

export interface NewTripRequest {
  user: UserType;
  title: string;
  startDate: string;
  endDate: string;
}

export interface NewTripResponse {
  trip: TripType;
}

export interface ModifyTripRequest {
  user: UserType;
  title: string;
  startDate: string;
  endDate: string;
}

export interface ModifyTripResponse {
  trip: TripType;
}

export interface DeleteTripRequest {
  trip: TripType;
}

export interface DeleteTripResponse {
  trip: TripType;
}

export interface AddTravellerRequest {
  user: UserType;
  trip: TripType;
}

export interface DeleteTravellerRequest {
  deleteUser: UserType;
  trip: TripType;
  user: UserType;
}

export interface CreateInvitationRequest {
  invitee: UserType;
  event: EventType;
}

export interface CreateInvitationResponse {
  invitation: InvitationType;
}

export interface DeleteInvitationRequest {
  invitation: InvitationType;
}

export interface DeleteInvitationResponse {
  invitation: InvitationType;
}

export interface AcceptInvitationRequest {
  user: UserType;
  invitation: InvitationType;
}

export interface RejectInvitationRequest {
  user: UserType;
  invitation: InvitationType;
}

export interface CreateActivityRequest {
  title: string;
  startDateTime: string;
  endDateTime: string;
  cost: number;
  event: EventType;
}

export interface CreateActivityResponse {
  activity: ActivityType;
}

export interface DeleteActivityRequest {
  activity: ActivityType;
}

export interface DeleteActivityResponse {
  activity: ActivityType;
}

export interface ModifyActivityTitleRequest {
  activity: ActivityType;
  title: string;
}

export interface ModifyActivityDurationRequest {
  activity: ActivityType;
  startDateTime: string;
  endDateTime: string;
}

export interface ModifyActivityCostRequest {
  activity: ActivityType;
  newCost: number;
}

export interface CreateChecklistResponse {
  checklist: ChecklistType;
}

export interface AddItemRequest {
  checklist: ChecklistType;
  item: ItemType;
  user?: UserType;
}

export interface DeleteItemRequest {
  checklist: ChecklistType;
  item: ItemType;
}

export interface DeleteChecklistRequest {
  checklist: ChecklistType;
}

export interface ToggleCompletionRequest {
  checklist: ChecklistType;
  item: ItemType;
  finishedFlag: boolean;
  user: UserType;
}

export interface SuggestChecklistItemsRequest {
  additionalInput: string;
}

export interface SuggestChecklistItemsResponse {
  suggestedItems: string[];
}

export interface CreateEqualSplitPercentageExpenseRequest {
  expense: ExpenseType;
  totalCost: number;
  users: UserType[];
}

export interface CreateEqualSplitMoneyBasedExpenseRequest {
  expense: ExpenseType;
  totalCost: number;
  users: UserType[];
}

export interface CreatePercentageExpenseRequest {
  totalCost: number;
  users: {
    user: UserType;
    percentage: number;
  }[];
}

export interface CreatePercentageExpenseResponse {
  expense: ExpenseType;
}

export interface CreateMoneyBasedExpenseRequest {
  totalCost: number;
  users: {
    user: UserType;
    cost: number;
  }[];
}

export interface CreateMoneyBasedExpenseResponse {
  expense: ExpenseType;
}

export interface ChangeExpenseTypeRequest {
  expense: ExpenseType;
}

export interface ModifyMoneyBasedExpenseFullRequest {
  expense: ExpenseType;
  newTotalCost: number;
  users: {
    user: UserType;
    cost: number;
  }[];
}

export interface ModifyPercentageBasedExpenseFullRequest {
  expense: ExpenseType;
  newTotalCost: number;
  users: {
    user: UserType;
    percentage: number;
  }[];
}

export interface ModifyPercentageBasedExpenseTotalCostRequest {
  expense: ExpenseType;
  newTotalCost: number;
}

export interface DeleteExpenseRequest {
  expense: ExpenseType;
}

export interface AddRatingRequest {
  user: UserType;
  item: ItemType;
  ratingNum: number;
  isAnonymous: boolean;
}

export interface AddRatingResponse {
  rating: RatingType;
}

export interface ChangeRatingRequest {
  rating: RatingType;
  user: UserType;
  ratingNum: number;
  isAnonymous: boolean;
}

export interface ChangeRatingResponse {
  rating: RatingType;
}

export interface RemoveRatingRequest {
  rating: RatingType;
}

