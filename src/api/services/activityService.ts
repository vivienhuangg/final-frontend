import apiClient from '../client';
import type {
  CreateActivityRequest,
  CreateActivityResponse,
  DeleteActivityRequest,
  DeleteActivityResponse,
  ModifyActivityTitleRequest,
  ModifyActivityDurationRequest,
  ModifyActivityCostRequest,
} from '../../types/api';

export const activityService = {
  /**
   * Creates and returns a new activity for a specific event
   */
  async createActivity(
    data: CreateActivityRequest
  ): Promise<CreateActivityResponse> {
    const response = await apiClient.post<CreateActivityResponse>(
      '/Activities/createActivity',
      data
    );
    return response.data;
  },

  /**
   * Deletes an existing activity
   */
  async deleteActivity(
    data: DeleteActivityRequest
  ): Promise<DeleteActivityResponse> {
    const response = await apiClient.post<DeleteActivityResponse>(
      '/Activities/deleteActivity',
      data
    );
    return response.data;
  },

  /**
   * Changes the title of an activity
   */
  async modifyTitle(data: ModifyActivityTitleRequest): Promise<void> {
    await apiClient.post('/Activities/modifyTitle', data);
  },

  /**
   * Changes the start and end times of an activity
   */
  async modifyDuration(data: ModifyActivityDurationRequest): Promise<void> {
    await apiClient.post('/Activities/modifyDuration', data);
  },

  /**
   * Changes the cost of an activity
   */
  async modifyCost(data: ModifyActivityCostRequest): Promise<void> {
    await apiClient.post('/Activities/modifyCost', data);
  },
};

