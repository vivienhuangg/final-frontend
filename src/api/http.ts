import axios from 'axios';

// Session token for EXCLUDED routes (set from auth store)
let sessionToken: string | null = null;
export function setSessionToken(token: string | null) {
  sessionToken = token || null;
}

// EXCLUDED routes: backend intercepts and expects { sessionToken, payload }
// Keep the list focused on routes actually used by this frontend.
const EXCLUDED_ROUTES = new Set<string>([
  // User Authentication
  "UserAuthentication/authenticate",
  "UserAuthentication/register",
  // Sessioning
  "Sessioning/create",
  "Sessioning/delete",
  "Sessioning/_getUser",
  // User
  "User/setName",
  "User/_getName",
  "User/deleteName",
  // Trip Management
  "Trip/newTrip",
  "Trip/modifyTrip",
  "Trip/deleteTrip",
  "Trip/addTraveller",
  "Trip/deleteTraveller",
  "Trip/_getTrip",
  "Trip/_getTripsByUser",
  // Activities
  "Activities/createActivity",
  "Activities/modifyTitle",
  "Activities/modifyDuration",
  "Activities/modifyCost",
  "Activities/deleteActivity",
  "Activities/_getActivitiesByTrip",
  "Activities/_getActivityDetails",
  // Invitation
  "Invitation/createInvitation",
  "Invitation/acceptInvitation",
  "Invitation/rejectInvitation",
  "Invitation/deleteInvitation",
  "Invitation/_getInvitation",
  "Invitation/_getInvitationsByInvitee",
  "Invitation/_getInvitationsByEvent",
  // PackingList
  "PackingList/createPackingList",
  "PackingList/addItem",
  "PackingList/deleteItem",
  "PackingList/deletePackingList",
  "PackingList/toggleCompletion",
  "PackingList/requestPackingListSuggestions",
  "PackingList/addGeneratedItems",
  "PackingList/unassignSharedItem",
  "PackingList/_getPackingListByTrip",
  "PackingList/_getPackingListByTripAndUser",
  "PackingList/_getTripForPackingList",
  "PackingList/_getPackingListItems",
  "PackingList/_getPackingListItem",
  // CostTracker
  "CostTracker/createEqualSplitPercentageExpense",
  "CostTracker/createEqualSplitMoneyBasedExpense",
  "CostTracker/createPercentageExpense",
  "CostTracker/createMoneyBasedExpense",
  "CostTracker/changeExpenseToMoneyBased",
  "CostTracker/changeExpenseToPercentageBased",
  "CostTracker/modifyMoneyBasedExpenseFull",
  "CostTracker/modifyPercentageBasedExpenseFull",
  "CostTracker/modifyPercentageBasedExpenseTotalCost",
  "CostTracker/deleteExpense",
  "CostTracker/_getPercentageExpense",
  "CostTracker/_getMoneyExpense",
  "CostTracker/_listPercentageExpenses",
  "CostTracker/_listMoneyExpenses",
  "CostTracker/_existsAny", // Private helper method, not meant to be exposed
  // RatingSystem
  "RatingSystem/removeRating",
  "RatingSystem/_getRating",
  "RatingSystem/_getRatingsByItem",
  "RatingSystem/_getRatingsByUser",
]);

// Resolve API base URL.
// In production (Render), set VITE_API_BASE_URL to your deployed backend URL (e.g., https://your-backend.onrender.com).
// Locally we fall back to '/api' so Vite dev server proxy rewrites to localhost:8000.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const http = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  // Increase timeout to accommodate LLM suggestion generation/parsing
  timeout: 60000,
});

function maskSensitive(v: any) {
  try {
    const obj = typeof v === 'string' ? JSON.parse(v) : v;
    if (!obj || typeof obj !== 'object') return v;
    const clone: any = Array.isArray(obj) ? [...obj] : { ...obj };
    const maskKeys = ['password', 'pass', 'token', 'sessiontoken'];
    for (const k of Object.keys(clone)) {
      if (maskKeys.includes(k.toLowerCase())) clone[k] = '***';
    }
    return clone;
  } catch {
    return v;
  }
}

// Wrap EXCLUDED route bodies as { sessionToken, payload }
http.interceptors.request.use((config) => {
  try {
    const method = (config.method || 'get').toUpperCase();
    if (method !== 'POST') return config;
    // Normalize to Concept/Action without leading slash
    let url = String(config.url || '').trim();
    if (!url) return config;
    if (url.startsWith('/')) url = url.slice(1);
    // If someone accidentally included base path inside url, strip it
    if (url.startsWith('api/')) url = url.slice(4);
    if (!EXCLUDED_ROUTES.has(url)) return config; // included routes: send original body

    const alreadyWrapped = config.data && typeof config.data === 'object' && 'payload' in (config.data as any) && 'sessionToken' in (config.data as any);
    if (alreadyWrapped) return config;

    const original = config.data ?? {};
    (config as any).data = { sessionToken: sessionToken ?? undefined, payload: original };
    return config;
  } catch {
    return config;
  }
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    // Centralized error logging; surface to UI at call-site
    const msg = error?.response?.data?.error || error?.message || 'API error';
    const method = (error?.config?.method || 'GET').toUpperCase();
    const url = error?.config?.url || '(unknown URL)';
    const status = error?.response?.status;
    const payload = maskSensitive(error?.config?.data);
    console.error('[API]', msg, { method, url, status, payload, response: error?.response });
    return Promise.reject(error);
  }
);

export default http;
