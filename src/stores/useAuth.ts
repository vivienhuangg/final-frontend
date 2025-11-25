import { computed } from 'vue';
import { useAuthStore } from './authStore';

export function useAuth() {
  const store = useAuthStore();
  return {
    currentUser: computed(() => store.currentUser),
    isAuthenticated: computed(() => store.isAuthenticated),
    login: store.login,
    register: store.register,
    logout: store.logout,
    initializeAuth: store.initializeAuth,
    getSession: store.getSession,
  };
}
