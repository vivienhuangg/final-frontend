import { computed, ref } from "vue";
import { ApiError, userApi } from "../services/api";
import type { User } from "../types/auth";

// Authentication state
const currentUser = ref<User | null>(null);
const sessionId = ref<string | null>(null);
const isAuthenticated = computed(
	() => currentUser.value !== null && sessionId.value !== null,
);

export function useAuth() {
	async function login(
		username: string,
		password: string,
	): Promise<{ success: boolean; error?: string }> {
		try {
			const response = await userApi.login({ username, password });

			// Store session ID
			sessionId.value = response.session;
			localStorage.setItem("sessionId", response.session);

			// Fetch user info (username from login, try to get name)
			const user: User = {
				id: username, // Use username as ID for now
				username,
			};

			// Try to get user's name if set
			try {
				const nameResponse = await userApi.getName({});
				user.firstName = nameResponse.firstName;
				user.lastName = nameResponse.lastName;
			} catch (e) {
				// Name not set yet, that's okay
			}

			currentUser.value = user;
			localStorage.setItem("currentUser", JSON.stringify(user));

			return { success: true };
		} catch (error: any) {
			const errorMessage =
				error instanceof ApiError
					? error.message
					: error.message || "Login failed";
			return { success: false, error: errorMessage };
		}
	}

	async function register(
		username: string,
		password: string,
		firstName: string,
		lastName: string,
	): Promise<{ success: boolean; error?: string }> {
		try {
			// Register user
			await userApi.register({ username, password });

			// Login to get session
			const loginResponse = await userApi.login({ username, password });
			sessionId.value = loginResponse.session;
			localStorage.setItem("sessionId", loginResponse.session);

			// Set user's name
			try {
				await userApi.setName({ firstName, lastName });
			} catch (e) {
				// Continue even if setting name fails
				console.warn("Failed to set user name:", e);
			}

			// Create user object
			const user: User = {
				id: username,
				username,
				firstName,
				lastName,
			};

			currentUser.value = user;
			localStorage.setItem("currentUser", JSON.stringify(user));

			return { success: true };
		} catch (error: any) {
			const errorMessage =
				error instanceof ApiError
					? error.message
					: error.message || "Registration failed";
			return { success: false, error: errorMessage };
		}
	}

	async function logout() {
		if (sessionId.value) {
			try {
				await userApi.logout(sessionId.value);
			} catch (e) {
				// Continue with logout even if API call fails
				console.warn("Logout API call failed:", e);
			}
		}

		currentUser.value = null;
		sessionId.value = null;
		localStorage.removeItem("currentUser");
		localStorage.removeItem("sessionId");
	}

	function getSession(): string | null {
		return sessionId.value;
	}

	async function initializeAuth() {
		// Check if session is stored in localStorage
		const storedSession = localStorage.getItem("sessionId");
		const storedUser = localStorage.getItem("currentUser");

		if (storedSession && storedUser) {
			try {
				sessionId.value = storedSession;
				currentUser.value = JSON.parse(storedUser);

				// Optionally verify session is still valid by fetching user name
				try {
					await userApi.getName({});
				} catch (e) {
					// Session might be invalid, clear it
					logout();
				}
			} catch (e) {
				// Invalid stored data, clear it
				localStorage.removeItem("currentUser");
				localStorage.removeItem("sessionId");
			}
		}
	}

	return {
		currentUser: computed(() => currentUser.value),
		isAuthenticated,
		login,
		register,
		logout,
		initializeAuth,
		getSession,
	};
}
