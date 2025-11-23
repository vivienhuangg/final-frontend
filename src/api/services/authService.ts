import apiClient from '../client';
import type {
  AuthenticateRequest,
  AuthenticateResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../types/api';

export const authService = {
  /**
   * Authenticates a user with username and password
   */
  async authenticate(data: AuthenticateRequest): Promise<AuthenticateResponse> {
    const response = await apiClient.post<AuthenticateResponse>(
      '/UserAuthentication/authenticate',
      data
    );
    return response.data;
  },

  /**
   * Registers a new user with username and password
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      '/UserAuthentication/register',
      data
    );
    return response.data;
  },
};

