import type { Trip, ActivityWithDetails, Expense, ChecklistItem, Traveler } from '../types/trip';

// Mock travelers
export const mockTravelers: Traveler[] = [
  { 
    id: '1', 
    name: 'Alex Smith',
    email: 'alex@example.com',
    firstName: 'Alex',
    lastName: 'Smith',
  },
  { 
    id: '2', 
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    firstName: 'Jordan',
    lastName: 'Lee',
  },
  { 
    id: '3', 
    name: 'Sam Johnson',
    email: 'sam@example.com',
    firstName: 'Sam',
    lastName: 'Johnson',
  },
  { 
    id: '4', 
    name: 'Morgan Brown',
    email: 'morgan@example.com',
    firstName: 'Morgan',
    lastName: 'Brown',
  },
];

// Mock trips
export const mockTrips: Trip[] = [
  {
    id: '1',
    title: 'Spring Break Miami',
    destination: 'Miami, FL',
    startDate: '2025-03-20',
    endDate: '2025-03-24',
    organizer: '1', // Alex is the organizer
    travelers: mockTravelers.slice(0, 4),
    headerImage: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=1200&h=400&fit=crop',
  },
];

// Mock activities (matching Activity concept structure)
export const mockActivities: ActivityWithDetails[] = [
  {
    id: '1',
    title: 'Art Deco Walking Tour',
    event: '1', // Trip ID
    start: '2025-03-20T10:00:00',
    end: '2025-03-20T12:00:00',
    cost: 35,
    location: 'South Beach',
    duration: '2 hours',
    groupSize: 'Up to 12',
    pricePerPerson: 35,
    rating: 8.5,
    votes: 12,
    tags: ['Hidden Gem'],
    source: 'discover',
    attendees: ['1', '2', '3'],
  },
  {
    id: '2',
    title: 'South Beach',
    event: '1',
    start: '2025-03-21T09:00:00',
    end: '2025-03-21T17:00:00',
    cost: 0,
    location: 'Miami Beach',
    duration: 'Full day',
    pricePerPerson: 0,
    rating: 9.2,
    votes: 15,
    tags: ['Beach'],
    source: 'manual',
    attendees: ['1', '2', '3', '4'],
  },
  {
    id: '3',
    title: 'Wynwood Walls',
    event: '1',
    start: '2025-03-22T14:00:00',
    end: '2025-03-22T17:00:00',
    cost: 12,
    location: 'Wynwood',
    duration: '2-3 hours',
    pricePerPerson: 12,
    rating: 8.8,
    votes: 10,
    tags: ['Art', 'Hidden Gem'],
    source: 'manual',
    attendees: ['1', '3'],
  },
  {
    id: '4',
    title: 'Boat Party',
    event: '1',
    start: '2025-03-21T18:00:00',
    end: '2025-03-21T22:00:00',
    cost: 75,
    location: 'Biscayne Bay',
    duration: '4 hours',
    groupSize: 'Up to 50',
    pricePerPerson: 75,
    rating: 7.5,
    votes: 8,
    tags: ['Nightlife'],
    source: 'discover',
    attendees: ['2', '3', '4'],
  },
];

// Mock expenses (matching CostTracker concept structure)
export const mockExpenses: Expense[] = [
  {
    id: '1',
    title: 'Airbnb – Beachfront Condo',
    totalCost: 1200,
    paidBy: '1',
    splitBetween: [
      { userId: '1', cost: 300 },
      { userId: '2', cost: 300 },
      { userId: '3', cost: 300 },
      { userId: '4', cost: 300 },
    ],
    date: '2025-03-15',
    splitType: 'money',
  },
  {
    id: '2',
    title: 'Rental Car',
    totalCost: 300,
    paidBy: '2',
    splitBetween: [
      { userId: '1', cost: 75 },
      { userId: '2', cost: 75 },
      { userId: '3', cost: 75 },
      { userId: '4', cost: 75 },
    ],
    date: '2025-03-16',
    splitType: 'money',
  },
  {
    id: '3',
    title: 'Dinner at Joe\'s Stone Crab',
    totalCost: 180,
    paidBy: '1',
    splitBetween: [
      { userId: '1', cost: 60 },
      { userId: '2', cost: 60 },
      { userId: '3', cost: 60 },
    ],
    date: '2025-03-20',
    splitType: 'money',
  },
  {
    id: '4',
    title: 'Jet Ski Rental',
    totalCost: 200,
    paidBy: '3',
    splitBetween: [
      { userId: '1', cost: 66.67 },
      { userId: '3', cost: 66.67 },
      { userId: '4', cost: 66.66 },
    ],
    date: '2025-03-22',
    splitType: 'money',
  },
];

// Mock packing items (matching Checklist concept structure)
export const mockPackingItems: ChecklistItem[] = [
  { id: '1', name: 'Toothbrush', category: 'Toiletries', finished: true, isShared: false },
  { id: '2', name: 'Sunscreen SPF 50', category: 'Toiletries', finished: false, isShared: false },
  { id: '3', name: 'Swimsuits', category: 'Clothing', finished: true, isShared: false },
  { id: '4', name: 'Sunglasses', category: 'Accessories', finished: false, isShared: false },
  { id: '5', name: 'Flip flops', category: 'Footwear', finished: true, isShared: false },
  { id: '6', name: 'Beach umbrella', category: 'Shared Items', finished: false, isShared: true, assignee: '1' },
  { id: '7', name: 'Cooler', category: 'Shared Items', finished: false, isShared: true, assignee: '2' },
  { id: '8', name: 'Bluetooth speaker', category: 'Shared Items', finished: false, isShared: true, assignee: '3' },
  { id: '9', name: 'First aid kit', category: 'Shared Items', finished: false, isShared: true, assignee: '4' },
];
