import { defineStore } from 'pinia';
import type { User } from '../types/auth';
import { loginUser, registerUser, setUserName, getUserName, logoutUser } from '../api/users';
import http, { setSessionToken } from '../api/http';

interface AuthState {
  currentUser: User | null;
  sessionId: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    sessionId: null,
  }),
  getters: {
    isAuthenticated: (state) => state.currentUser !== null && state.sessionId !== null,
  },
  actions: {
    async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
      try {
        const response = await loginUser(username, password);
        this.sessionId = response.session;
        localStorage.setItem('sessionId', response.session);
        // Bridge to axios layer for any EXCLUDED routes that expect sessionToken wrapping
        try { setSessionToken(this.sessionId); } catch {}

        const user: User = { id: username, username };
        try {
          const name = await getUserName();
          user.firstName = name.firstName;
          user.lastName = name.lastName;
        } catch {}

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e?.message || 'Login failed' };
      }
    },

    async register(username: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> {
      try {
        await registerUser(username, password);
        const loginResp = await loginUser(username, password);
        this.sessionId = loginResp.session;
        localStorage.setItem('sessionId', loginResp.session);
  try { setSessionToken(this.sessionId); } catch {}
        try { await setUserName(firstName, lastName); } catch (e) { console.warn('Failed to set user name:', e); }

        const user: User = { id: username, username, firstName, lastName };
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e?.message || 'Registration failed' };
      }
    },

    async logout(): Promise<void> {
      if (this.sessionId) {
        try { await logoutUser(this.sessionId); } catch (e) { console.warn('Logout API call failed:', e); }
      }
      this.currentUser = null;
      this.sessionId = null;
      localStorage.removeItem('currentUser');
      localStorage.removeItem('sessionId');
      try { setSessionToken(null); } catch {}
    },

    getSession(): string | null { return this.sessionId; },

    async initializeAuth(): Promise<void> {
      const storedSession = localStorage.getItem('sessionId');
      const storedUser = localStorage.getItem('currentUser');
      if (storedSession && storedUser) {
        try {
          this.sessionId = storedSession;
          this.currentUser = JSON.parse(storedUser);
          try { setSessionToken(this.sessionId); } catch {}
          try { await getUserName(); } catch { this.logout(); }
        } catch {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('sessionId');
        }
      }
    }
  }
});
