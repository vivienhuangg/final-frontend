import apiClient from '../client';
import type {
  SetNameRequest,
  GetNameRequest,
  GetNameResponse,
  DeleteNameRequest,
} from '../../types/api';

export const userService = {
  /**
   * Associates first and last names with a specific user
   */
  async setName(data: SetNameRequest): Promise<void> {
    await apiClient.post('/User/setName', data);
  },

  /**
   * Retrieves the first and last name associated with a user
   */
  async getName(data: GetNameRequest): Promise<GetNameResponse> {
    const response = await apiClient.post<GetNameResponse>(
      '/User/getName',
      data
    );
    return response.data;
  },

  /**
   * Deletes the associated name for a user
   */
  async deleteName(data: DeleteNameRequest): Promise<void> {
    await apiClient.post('/User/deleteName', data);
  },
};

