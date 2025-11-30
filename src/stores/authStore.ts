import { defineStore } from "pinia";
import type { User } from "../types/auth";
import {
  loginUser,
  registerUser,
  setUserName,
  getUserName,
  logoutUser,
} from "../api/users";
import http, { setSessionToken } from "../api/http";
import { userApi } from "../services/api";

interface AuthState {
  currentUser: User | null;
  sessionId: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    currentUser: null,
    sessionId: null,
  }),
  getters: {
    isAuthenticated: (state) =>
      state.currentUser !== null && state.sessionId !== null,
  },
  actions: {
    async login(
      username: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> {
      try {
        const response = await loginUser(username, password);
        this.sessionId = response.session;
        localStorage.setItem("sessionId", response.session);
        // Bridge to axios layer for any EXCLUDED routes that expect sessionToken wrapping
        try {
          setSessionToken(this.sessionId);
        } catch {}

        // attempt to get canonical user id from server session
        let serverUserId;
        try {
          const resp = await userApi.getUserFromSession();
          serverUserId = resp?.user;
        } catch (e) {
          console.warn("Failed to fetch server user id after login:", e);
        }

        const user: User = { id: serverUserId, username };
        try {
          const name = await getUserName();
          user.firstName = name.firstName;
          user.lastName = name.lastName;
        } catch {}

        this.currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(user));
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e?.message || "Login failed" };
      }
    },

    async register(
      username: string,
      password: string,
      firstName: string,
      lastName: string
    ): Promise<{ success: boolean; error?: string }> {
      try {
        await registerUser(username, password);
        const loginResp = await loginUser(username, password);
        this.sessionId = loginResp.session;
        localStorage.setItem("sessionId", loginResp.session);
        try {
          setSessionToken(this.sessionId);
        } catch {}
        try {
          await setUserName(firstName, lastName);
        } catch (e) {
          console.warn("Failed to set user name:", e);
        }

        // try to get canonical user id from server
        let serverUserId: string | undefined;
        try {
          const resp = await userApi.getUserFromSession();
          serverUserId = resp?.user;
        } catch (e) {
          console.warn("Failed to fetch server user id after register:", e);
        }

        const user: User = {
          id: serverUserId || username,
          username,
          firstName,
          lastName,
        };
        this.currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(user));
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e?.message || "Registration failed" };
      }
    },

    async logout(): Promise<void> {
      if (this.sessionId) {
        try {
          await logoutUser(this.sessionId);
        } catch (e) {
          console.warn("Logout API call failed:", e);
        }
      }
      this.currentUser = null;
      this.sessionId = null;
      localStorage.removeItem("currentUser");
      localStorage.removeItem("sessionId");
      try {
        setSessionToken(null);
      } catch {}
    },

    getSession(): string | null {
      return this.sessionId;
    },

    async initializeAuth(): Promise<void> {
      const storedSession = localStorage.getItem("sessionId");
      const storedUser = localStorage.getItem("currentUser");
      if (storedSession && storedUser) {
        try {
          this.sessionId = storedSession;
          this.currentUser = JSON.parse(storedUser);
          try {
            setSessionToken(this.sessionId);
          } catch {}
          // Attempt to refresh server-provided user id and display name; do not force logout on failure
          try {
            const resp = await userApi.getUserFromSession();
            if (resp?.user) {
              this.currentUser = {
                ...(this.currentUser as User),
                id: resp.user,
              };
              localStorage.setItem(
                "currentUser",
                JSON.stringify(this.currentUser)
              );
            }
          } catch (e) {
            console.warn(
              "Failed to refresh server user id during initializeAuth:",
              e
            );
          }
          try {
            await getUserName();
          } catch (e) {
            console.warn("Name refresh failed; preserving session:", e);
          }
        } catch {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("sessionId");
        }
      }
    },
  },
});
