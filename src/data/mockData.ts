import type { Trip, ActivityWithDetails, Expense, ChecklistItem, Traveler, TripInvitation } from '../types/trip';

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
  { 
    id: '5', 
    name: 'Hola User',
    email: 'hola@example.com',
    firstName: 'Hola',
    lastName: 'User',
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
  {
    id: '2',
    title: 'Summer Road Trip',
    destination: 'California Coast',
    startDate: '2027-07-15',
    endDate: '2027-07-22',
    organizer: '1', // Alex is the organizer
    travelers: [mockTravelers[0], mockTravelers[1]],
    headerImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'New York City Weekend',
    destination: 'New York, NY',
    startDate: '2024-12-10',
    endDate: '2024-12-12',
    organizer: '2', // Jordan is the organizer
    travelers: [mockTravelers[1], mockTravelers[2]],
    headerImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=400&fit=crop',
  },
];

// Mock trip invitations
export const mockTripInvitations: TripInvitation[] = [
  {
    id: 'inv-1',
    tripId: '4',
    invitee: '1', // Alex is invited
    inviter: '2', // Jordan sent the invitation
    status: 'pending',
    createdAt: '2025-01-15T10:00:00',
    trip: {
      id: '4',
      title: 'Ski Trip to Aspen',
      destination: 'Aspen, CO',
      startDate: '2025-02-10',
      endDate: '2025-02-15',
      organizer: '2',
      travelers: [mockTravelers[1], mockTravelers[2], mockTravelers[3]],
      headerImage: 'https://images.unsplash.com/photo-1551524164-6cf77f5e1d66?w=1200&h=400&fit=crop',
    },
  },
  {
    id: 'inv-2',
    tripId: '5',
    invitee: '1', // Alex is invited
    inviter: '3', // Sam sent the invitation
    status: 'pending',
    createdAt: '2025-01-18T14:30:00',
    trip: {
      id: '5',
      title: 'Beach House Getaway',
      destination: 'Outer Banks, NC',
      startDate: '2025-06-01',
      endDate: '2025-06-07',
      organizer: '3',
      travelers: [mockTravelers[2], mockTravelers[3]],
      headerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop',
    },
  },
  {
    id: 'inv-3',
    tripId: '2',
    invitee: '1', // Alex is invited to the Summer Road Trip
    inviter: '2', // Jordan sent the invitation
    status: 'pending',
    createdAt: '2025-01-20T09:00:00',
    trip: {
      id: '2',
      title: 'Summer Road Trip',
      destination: 'California Coast',
      startDate: '2025-07-15',
      endDate: '2025-07-22',
      organizer: '1', // Alex is the organizer, but this is an invitation from Jordan
      travelers: [mockTravelers[0], mockTravelers[1]],
      headerImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    },
  },
  {
    id: 'inv-4',
    tripId: '1',
    invitee: '5', // Hola is invited
    inviter: '1', // Alex sent the invitation
    status: 'pending',
    createdAt: '2025-01-21T11:00:00',
    trip: {
      id: '1',
      title: 'Spring Break Miami',
      destination: 'Miami, FL',
      startDate: '2025-03-20',
      endDate: '2025-03-24',
      organizer: '1',
      travelers: mockTravelers.slice(0, 4),
      headerImage: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=1200&h=400&fit=crop',
    },
  },
];

// Mock activities (matching Activity concept structure)
export const mockActivities: ActivityWithDetails[] = [
  // Solo Events (manually created by user)
  {
    id: 'solo-1',
    title: 'Morning Coffee at Local Café',
    event: '1', // Trip ID
    start: '2025-03-20T08:00:00',
    end: '2025-03-20T09:30:00',
    cost: 8,
    location: 'Little Havana',
    duration: '1.5 hours',
    pricePerPerson: 8,
    rating: 0,
    votes: 0,
    tags: ['Food & Drink'],
    source: 'manual',
    attendees: ['1'], // Only the creator (Alex)
    description: 'Start the day with authentic Cuban coffee and pastries at a local café. A perfect way to experience Miami\'s vibrant culture.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=400&fit=crop',
  },
  {
    id: 'solo-2',
    title: 'Sunset Photography Session',
    event: '1',
    start: '2025-03-21T18:00:00',
    end: '2025-03-21T19:30:00',
    cost: 0,
    location: 'Key Biscayne',
    duration: '1.5 hours',
    pricePerPerson: 0,
    rating: 0,
    votes: 0,
    tags: ['Photography', 'Nature'],
    source: 'manual',
    attendees: ['1'], // Only the creator (Alex)
    description: 'Capture the beautiful Miami sunset with a photography session at Key Biscayne. Bring your camera and enjoy the golden hour.',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=400&fit=crop',
  },
  // Group Events (from discover or shared)
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
    description: 'Explore the iconic Art Deco architecture of South Beach with a knowledgeable local guide. Discover the history and stories behind these beautiful buildings from the 1920s and 1930s.',
    image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800&h=400&fit=crop',
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
    description: 'Spend a relaxing day at the world-famous South Beach. Enjoy the white sand, turquoise waters, and vibrant atmosphere. Perfect for swimming, sunbathing, and people-watching.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
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
    description: 'Immerse yourself in Miami\'s vibrant street art scene at Wynwood Walls. This outdoor museum features large-scale murals by world-renowned artists, transforming the neighborhood into a colorful canvas.',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
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
    description: 'Join an exciting boat party on Biscayne Bay with music, drinks, and stunning views of the Miami skyline. Dance the night away as you cruise along the coast.',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=400&fit=crop',
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
