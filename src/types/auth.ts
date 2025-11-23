export interface User {
  id: string;
  username: string;
  password?: string; // Only used during registration/login, not stored in session
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

