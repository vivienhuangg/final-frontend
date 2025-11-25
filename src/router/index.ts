import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import Dashboard from '../views/Dashboard.vue';
import TripPage from '../views/TripPage.vue';
import { useAuthStore } from '../stores/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/auth', name: 'auth', component: LoginPage, meta: { public: true } },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/trip/:id', name: 'trip', component: TripPage, props: true },
  ],
});

router.beforeEach((to: RouteLocationNormalized) => {
  // Use Pinia store if available; fallback to localStorage to avoid timing issues
  let isAuthed = false;
  try {
    const store = useAuthStore();
    isAuthed = store.isAuthenticated;
  } catch (_) {
    const sid = localStorage.getItem('sessionId');
    isAuthed = !!sid;
  }

  if (!to.meta?.public && !isAuthed && to.name !== 'auth') {
    return { name: 'auth' };
  }
  if (to.name === 'auth' && isAuthed) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
