
# API Specification: UserAuthentication Concept

**Purpose:** Tracks users and their login information

---

## API Endpoints

### POST /api/UserAuthentication/authenticate

**Description:** Authenticates a user with a given username and password.

**Requirements:**
- the username and password pair exist

**Effects:**
- returns true if the pair exists, false otherwise

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "{UserType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a unique username and password.

**Requirements:**
- the username does not already exist

**Effects:**
- the username and password pair are registered

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "{UserType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: User Concept

**Purpose:** Tracks users and their real names

---

## API Endpoints

### POST /api/User/setName

**Description:** Associates first and last names with a specific user.

**Requirements:**
- true

**Effects:**
- associates `firstName` and `lastName` with the user

**Request Body:**
```json
{
  "user": "{UserType}",
  "firstName": "string",
  "lastName": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/User/getName

**Description:** Retrieves the first and last name associated with a user.

**Requirements:**
- the user already has set their name

**Effects:**
- returns the first and last name of the user

**Request Body:**
```json
{
  "user": "{UserType}"
}
```

**Success Response Body (Action):**
```json
{
  "firstName": "string",
  "lastName": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/User/deleteName

**Description:** Deletes the associated name for a user.

**Requirements:**
- the user exists

**Effects:**
- deletes the user’s associated name

**Request Body:**
```json
{
  "user": "{UserType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Trip Concept

**Purpose:** Tracks a set of trips

---

## API Endpoints

### POST /api/Trip/newTrip

**Description:** Creates and returns a new trip organized by the specified user.

**Requirements:**
- true

**Effects:**
- creates and returns a new trip

**Request Body:**
```json
{
  "user": "{UserType}",
  "title": "string",
  "startDate": "string",
  "endDate": "string"
}
```

**Success Response Body (Action):**
```json
{
  "trip": "{TripType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Trip/modifyTrip

**Description:** Modifies an existing trip's details. (Note: The specific trip to modify is not explicitly an argument in the signature, leading to ambiguity in identifying which trip is being modified.)

**Requirements:**
- the trip exists and `user` is in the trip

**Effects:**
- modifies and returns the trip

**Request Body:**
```json
{
  "user": "{UserType}",
  "title": "string",
  "startDate": "string",
  "endDate": "string"
}
```

**Success Response Body (Action):**
```json
{
  "trip": "{TripType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Trip/deleteTrip

**Description:** Deletes an existing trip.

**Requirements:**
- the trip exists

**Effects:**
- deletes and returns the trip

**Request Body:**
```json
{
  "trip": "{TripType}"
}
```

**Success Response Body (Action):**
```json
{
  "trip": "{TripType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Trip/addTraveller

**Description:** Adds a user to a trip.

**Requirements:**
- the user is not already in the trip (as organizer or traveler)

**Effects:**
- adds the user to the trip

**Request Body:**
```json
{
  "user": "{UserType}",
  "trip": "{TripType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Trip/deleteTraveller

**Description:** Removes a user from a trip, with authorization checks.

**Requirements:**
- `deleteUser` is in the trip but not the organizer
- `user` is either the organizer or the same as `deleteUser`

**Effects:**
- deletes `deleteUser` from the trip

**Request Body:**
```json
{
  "deleteUser": "{UserType}",
  "trip": "{TripType}",
  "user": "{UserType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Invitation Concept

**Purpose:** Tracks a set of invitations

---

## API Endpoints

### POST /api/Invitation/createInvitation

**Description:** Creates a new invitation for a user to an event.

**Requirements:**
- no existing invitation for this event and invitee

**Effects:**
- creates a new Invitation with `accepted = "Maybe"`

**Request Body:**
```json
{
  "invitee": "{UserType}",
  "event": "{EventType}"
}
```

**Success Response Body (Action):**
```json
{
  "invitation": "{InvitationType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Invitation/deleteInvitation

**Description:** Deletes an existing invitation.

**Requirements:**
- the invitation exists

**Effects:**
- deletes the invitation

**Request Body:**
```json
{
  "invitation": "{InvitationType}"
}
```

**Success Response Body (Action):**
```json
{
  "invitation": "{InvitationType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Invitation/acceptInvitation

**Description:** Marks an invitation as accepted by the invitee.

**Requirements:**
- the invitation exists and `user` is the invitee

**Effects:**
- sets `accepted = "Yes"` for this invitation

**Request Body:**
```json
{
  "user": "{UserType}",
  "invitation": "{InvitationType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Invitation/rejectInvitation

**Description:** Marks an invitation as rejected by the invitee.

**Requirements:**
- the invitation exists and `user` is the invitee

**Effects:**
- sets `accepted = "No"` for this invitation

**Request Body:**
```json
{
  "user": "{UserType}",
  "invitation": "{InvitationType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Activities Concept

**Purpose:** Let users share activities of an event

---

## API Endpoints

### POST /api/Activities/createActivity

**Description:** Creates and returns a new activity for a specific event.

**Requirements:**
- true

**Effects:**
- creates and returns a new Activity

**Request Body:**
```json
{
  "title": "string",
  "startDateTime": "string",
  "endDateTime": "string",
  "cost": "number",
  "event": "{EventType}"
}
```

**Success Response Body (Action):**
```json
{
  "activity": "{ActivityType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Activities/deleteActivity

**Description:** Deletes an existing activity.

**Requirements:**
- true

**Effects:**
- deletes and returns the activity

**Request Body:**
```json
{
  "activity": "{ActivityType}"
}
```

**Success Response Body (Action):**
```json
{
  "activity": "{ActivityType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Activities/modifyTitle

**Description:** Changes the title of an activity.

**Requirements:**
- `activity` exists

**Effects:**
- changes `title` to specified title for `activity`

**Request Body:**
```json
{
  "activity": "{ActivityType}",
  "title": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Activities/modifyDuration

**Description:** Changes the start and end times of an activity.

**Requirements:**
- `activity` exists

**Effects:**
- changes `start` and `end` of `activity` to `startDateTime` and `endDateTime`

**Request Body:**
```json
{
  "activity": "{ActivityType}",
  "startDateTime": "string",
  "endDateTime": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Activities/modifyCost

**Description:** Changes the cost of an activity.

**Requirements:**
- `activity` exists

**Effects:**
- changes `cost` of `activity` to `newCost`

**Request Body:**
```json
{
  "activity": "{ActivityType}",
  "newCost": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: Checklist Concept

**Purpose:** Lets users keep track of todos

---

## API Endpoints

### POST /api/Checklist/createChecklist

**Description:** Creates and returns a new checklist.

**Requirements:**
- true

**Effects:**
- creates and returns a new Checklist

**Request Body:**
```json
{}
```

**Success Response Body (Action):**
```json
{
  "checklist": "{ChecklistType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Checklist/addItem

**Description:** Adds an item to a checklist, optionally assigning it to a user.

**Requirements:**
- `checklist` exists

**Effects:**
- adds `item` to `checklist`, associates it with `assignee = user` if provided, sets `finished = false`

**Request Body:**
```json
{
  "checklist": "{ChecklistType}",
  "item": "{ItemType}",
  "user": "{UserType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Checklist/deleteItem

**Description:** Deletes an item from a checklist.

**Requirements:**
- `checklist` exists and `item` exists within that checklist

**Effects:**
- deletes `item` from `checklist`

**Request Body:**
```json
{
  "checklist": "{ChecklistType}",
  "item": "{ItemType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Checklist/deleteChecklist

**Description:** Deletes an entire checklist.

**Requirements:**
- `checklist` exists

**Effects:**
- deletes `checklist`

**Request Body:**
```json
{
  "checklist": "{ChecklistType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Checklist/toggleCompletion

**Description:** Toggles the completion status of a checklist item.

**Requirements:**
- `checklist` exists and `item` exists within that checklist

**Effects:**
- sets the `finished` flag for `item` to `finishedFlag`. If `finishedFlag` is true, sets `finishedBy = user`

**Request Body:**
```json
{
  "checklist": "{ChecklistType}",
  "item": "{ItemType}",
  "finishedFlag": "boolean",
  "user": "{UserType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Checklist/suggestChecklistItemsWithLLM

**Description:** Uses an LLM to suggest new checklist items based on additional context.

**Requirements:**
- true

**Effects:**
- uses `additionalInput` as context to suggest new checklist items

**Request Body:**
```json
{
  "additionalInput": "string"
}
```

**Success Response Body (Action):**
```json
{
  "suggestedItems": [
    "string"
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: CostTracker Concept

**Purpose:** Lets users split the costs of specific expenses

---

## API Endpoints

### POST /api/CostTracker/createEqualSplitPercentageExpense

**Description:** Creates a new percentage-based expense split equally among specified users.

**Requirements:**
- `users` is nonempty

**Effects:**
- adds a new percentage-based expense split equally among `users`

**Request Body:**
```json
{
  "expense": "{ExpenseType}",
  "totalCost": "number",
  "users": [
    "{UserType}"
  ]
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/createEqualSplitMoneyBasedExpense

**Description:** Creates a new money-based expense split equally among specified users.

**Requirements:**
- `users` is nonempty

**Effects:**
- adds a new money-based expense split equally among `users`

**Request Body:**
```json
{
  "expense": "{ExpenseType}",
  "totalCost": "number",
  "users": [
    "{UserType}"
  ]
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/createPercentageExpense

**Description:** Creates and returns a new percentage-based expense with custom splits.

**Requirements:**
- sum of all `percentage` in `users` is exactly `100`

**Effects:**
- creates and returns a new percentage-based expense

**Request Body:**
```json
{
  "totalCost": "number",
  "users": [
    {
      "user": "{UserType}",
      "percentage": "number"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "expense": "{ExpenseType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/createMoneyBasedExpense

**Description:** Creates and returns a new money-based expense with custom splits.

**Requirements:**
- sum of all `cost` in `users` is exactly `totalCost`

**Effects:**
- creates and returns a new money-based expense

**Request Body:**
```json
{
  "totalCost": "number",
  "users": [
    {
      "user": "{UserType}",
      "cost": "number"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "expense": "{ExpenseType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/changeExpenseToMoneyBased

**Description:** Converts a percentage-based expense to a money-based expense.

**Requirements:**
- `expense` is in the percentage category

**Effects:**
- converts it to money-based, converting each user's `percentage` to an appropriate `cost` value (based on `totalCost`)

**Request Body:**
```json
{
  "expense": "{ExpenseType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/changeExpenseToPercentageBased

**Description:** Converts a money-based expense to a percentage-based expense.

**Requirements:**
- `expense` is in the money-based category

**Effects:**
- converts it to percentage-based, converting each user's `cost` to an appropriate `percentage` (out of `totalCost`)

**Request Body:**
```json
{
  "expense": "{ExpenseType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/modifyMoneyBasedExpenseFull

**Description:** Fully modifies a money-based expense, including total cost and user splits.

**Requirements:**
- `expense` is money-based and sum of `cost` in `users` equals `newTotalCost`

**Effects:**
- sets `totalCost = newTotalCost` and updates each user's `cost`

**Request Body:**
```json
{
  "expense": "{ExpenseType}",
  "newTotalCost": "number",
  "users": [
    {
      "user": "{UserType}",
      "cost": "number"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/modifyPercentageBasedExpenseFull

**Description:** Fully modifies a percentage-based expense, including total cost and user splits.

**Requirements:**
- `expense` is percentage-based and sum of `percentage` in `users` equals `100`

**Effects:**
- sets `totalCost = newTotalCost` and updates each user's `percentage`

**Request Body:**
```json
{
  "expense": "{ExpenseType}",
  "newTotalCost": "number",
  "users": [
    {
      "user": "{UserType}",
      "percentage": "number"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/modifyPercentageBasedExpenseTotalCost

**Description:** Modifies only the total cost of a percentage-based expense.

**Requirements:**
- `expense` is in the percentage-based category

**Effects:**
- updates `totalCost` to `newTotalCost`

**Request Body:**
```json
{
  "expense": "{ExpenseType}",
  "newTotalCost": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/CostTracker/deleteExpense

**Description:** Deletes an existing expense.

**Requirements:**
- `expense` exists in state

**Effects:**
- deletes the expense

**Request Body:**
```json
{
  "expense": "{ExpenseType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: RatingSystem Concept

**Purpose:** Allows users to rate items from 1–10

---

## API Endpoints

### POST /api/RatingSystem/addRating

**Description:** Adds a new rating for an item by a user.

**Requirements:**
- no Rating already exists for `user` + `item`
- `ratingNum` must be an integer between 1 and 10

**Effects:**
- creates and returns a new Rating with the specified parameters

**Request Body:**
```json
{
  "user": "{UserType}",
  "item": "{ItemType}",
  "ratingNum": "number",
  "isAnonymous": "boolean"
}
```

**Success Response Body (Action):**
```json
{
  "rating": "{RatingType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/RatingSystem/changeRating

**Description:** Changes an existing rating for an item.

**Requirements:**
- `rating` exists and is owned by `user`
- `ratingNum` must be an integer between 1 and 10
- If the original anonymous flag is True, isAnonymous can only be changed to True.

**Effects:**
- updates and returns the Rating

**Request Body:**
```json
{
  "rating": "{RatingType}",
  "user": "{UserType}",
  "ratingNum": "number",
  "isAnonymous": "boolean"
}
```

**Success Response Body (Action):**
```json
{
  "rating": "{RatingType}"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/RatingSystem/removeRating

**Description:** Deletes an existing rating.

**Requirements:**
- `rating` exists

**Effects:**
- deletes the rating

**Request Body:**
```json
{
  "rating": "{RatingType}"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---