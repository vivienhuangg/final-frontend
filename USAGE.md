# API Usage Guide

This guide demonstrates how to use the API services in your Vue components.

## Basic Setup

All API services are available through the main export:

```typescript
import { authService, tripService, activityService } from '@/api';
```

## Examples

### Authentication

```typescript
import { authService } from '@/api';
import type { UserType } from '@/api';

// Register a new user
const registerUser = async () => {
  try {
    const response = await authService.register({
      username: 'john_doe',
      password: 'secure_password'
    });
    const user: UserType = response.user;
    console.log('Registered user:', user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Authenticate a user
const loginUser = async () => {
  try {
    const response = await authService.authenticate({
      username: 'john_doe',
      password: 'secure_password'
    });
    const user: UserType = response.user;
    // Store user in state/store
    console.log('Logged in user:', user);
  } catch (error) {
    console.error('Authentication failed:', error);
  }
};
```

### Trip Management

```typescript
import { tripService } from '@/api';
import type { UserType, TripType } from '@/api';

// Create a new trip
const createTrip = async (user: UserType) => {
  try {
    const response = await tripService.newTrip({
      user,
      title: 'Summer Vacation 2024',
      startDate: '2024-07-01',
      endDate: '2024-07-14'
    });
    const trip: TripType = response.trip;
    console.log('Created trip:', trip);
  } catch (error) {
    console.error('Failed to create trip:', error);
  }
};

// Add a traveler to a trip
const addTraveler = async (user: UserType, trip: TripType) => {
  try {
    await tripService.addTraveller({
      user,
      trip
    });
    console.log('Traveler added successfully');
  } catch (error) {
    console.error('Failed to add traveler:', error);
  }
};
```

### Activities

```typescript
import { activityService } from '@/api';
import type { EventType, ActivityType } from '@/api';

// Create an activity
const createActivity = async (event: EventType) => {
  try {
    const response = await activityService.createActivity({
      title: 'Visit Eiffel Tower',
      startDateTime: '2024-07-05T10:00:00',
      endDateTime: '2024-07-05T12:00:00',
      cost: 25.00,
      event
    });
    const activity: ActivityType = response.activity;
    console.log('Created activity:', activity);
  } catch (error) {
    console.error('Failed to create activity:', error);
  }
};

// Modify activity cost
const updateActivityCost = async (activity: ActivityType, newCost: number) => {
  try {
    await activityService.modifyCost({
      activity,
      newCost
    });
    console.log('Activity cost updated');
  } catch (error) {
    console.error('Failed to update activity cost:', error);
  }
};
```

### Checklists

```typescript
import { checklistService } from '@/api';
import type { ChecklistType, ItemType } from '@/api';

// Create a checklist
const createChecklist = async () => {
  try {
    const response = await checklistService.createChecklist();
    const checklist: ChecklistType = response.checklist;
    console.log('Created checklist:', checklist);
    return checklist;
  } catch (error) {
    console.error('Failed to create checklist:', error);
  }
};

// Get AI suggestions for checklist items
const getChecklistSuggestions = async (context: string) => {
  try {
    const response = await checklistService.suggestChecklistItems({
      additionalInput: context
    });
    console.log('Suggested items:', response.suggestedItems);
    return response.suggestedItems;
  } catch (error) {
    console.error('Failed to get suggestions:', error);
  }
};
```

### Cost Tracking

```typescript
import { costTrackerService } from '@/api';
import type { UserType, ExpenseType } from '@/api';

// Create an equal split expense
const createEqualSplitExpense = async (users: UserType[], totalCost: number) => {
  try {
    // For money-based split
    await costTrackerService.createEqualSplitMoneyBasedExpense({
      expense: { id: '', totalCost, type: 'money', splits: [] }, // Expense object
      totalCost,
      users
    });
    console.log('Expense created');
  } catch (error) {
    console.error('Failed to create expense:', error);
  }
};
```

## Error Handling

All API calls throw errors that you can catch:

```typescript
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/api';

try {
  await authService.authenticate({ username: 'user', password: 'pass' });
} catch (error) {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse;
    console.error('API Error:', apiError?.error || error.message);
  }
}
```

## Vue Component Example

```vue
<template>
  <div>
    <button @click="login" :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authService } from '@/api';

const loading = ref(false);

const login = async () => {
  loading.value = true;
  try {
    const response = await authService.authenticate({
      username: 'john_doe',
      password: 'password'
    });
    // Handle successful login
    console.log('Logged in:', response.user);
  } catch (error) {
    // Handle error
    console.error('Login failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>
```

## Environment Configuration

Make sure to set your backend API URL in a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

The default is already set to `http://localhost:8000/api`. Replace with your actual backend URL if different.

