import { ref, computed } from 'vue';
import type { User } from '../types/auth';

// Mock authentication state
const currentUser = ref<User | null>(null);
const isAuthenticated = computed(() => currentUser.value !== null);

// Mock users database (in real app, this would be API calls)
const mockUsers: User[] = [
  {
    id: '1',
    username: 'alex',
    password: 'password', // In real app, this would be hashed
    firstName: 'Alex',
    lastName: 'Smith',
  },
];

export function useAuth() {
  function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === username && u.password === password
        );
        
        if (user) {
          // Don't store password in session
          const { password: _, ...userWithoutPassword } = user;
          currentUser.value = userWithoutPassword;
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Invalid username or password' });
        }
      }, 500);
    });
  }

  function register(username: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if username exists
        if (mockUsers.some(u => u.username === username)) {
          resolve({ success: false, error: 'Username already exists' });
          return;
        }

        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          username,
          password, // In real app, this would be hashed
          firstName,
          lastName,
        };
        mockUsers.push(newUser);
        
        // Auto-login after registration
        const { password: _, ...userWithoutPassword } = newUser;
        currentUser.value = userWithoutPassword;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        resolve({ success: true });
      }, 500);
    });
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem('currentUser');
  }

  function initializeAuth() {
    // Check if user is stored in localStorage
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        currentUser.value = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem('currentUser');
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
  };
}

