# Travel Planner Frontend

A collaborative travel planning application built with Vue.js 3, TypeScript, and Vite.

## Features

- 🔐 User authentication and registration
- ✈️ Trip creation and management
- 👥 Collaborative trip planning with multiple travelers
- 📅 Event and activity scheduling
- ✅ Checklist management with AI suggestions
- 💰 Cost tracking and expense splitting
- ⭐ Rating system for activities
- 📨 Invitation system for trip collaboration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure the backend API URL:

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Replace `http://localhost:8000/api` with your backend API URL if different.

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Preview production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/                    # API client and services
│   ├── client.ts          # Axios instance configuration
│   ├── services/          # Service modules for each API concept
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── tripService.ts
│   │   ├── invitationService.ts
│   │   ├── activityService.ts
│   │   ├── checklistService.ts
│   │   ├── costTrackerService.ts
│   │   └── ratingService.ts
│   └── index.ts           # Central export point
├── types/
│   └── api.ts             # TypeScript types for API requests/responses
├── App.vue                # Main application component
└── main.ts                # Application entry point
```

## API Usage

All API services are exported from `src/api/index.ts`. Import them in your components:

```typescript
import { authService, tripService } from '@/api';

// Example: Authenticate a user
const response = await authService.authenticate({
  username: 'john_doe',
  password: 'password123'
});

// Example: Create a new trip
const tripResponse = await tripService.newTrip({
  user: currentUser,
  title: 'Summer Vacation',
  startDate: '2024-07-01',
  endDate: '2024-07-14'
});
```

### Available Services

- **authService** - User authentication and registration
- **userService** - User profile management (name, etc.)
- **tripService** - Trip CRUD operations and traveler management
- **invitationService** - Invitation creation and management
- **activityService** - Activity creation and modification
- **checklistService** - Checklist and todo item management
- **costTrackerService** - Expense tracking and splitting
- **ratingService** - Rating system for activities

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Typed JavaScript for better development experience
- **Vite** - Next generation frontend tooling
- **Axios** - HTTP client for API requests
- **shadcn/ui** - UI component library (in `ui-from-figma/` directory)

## API Configuration

The API client is configured in `src/api/client.ts` with:

- Automatic error handling
- Request/response interceptors
- Configurable base URL from environment variables
- 10-second request timeout

To customize the API configuration, modify `src/api/client.ts`.
