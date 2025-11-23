import apiClient from '../client';
import type {
  AddRatingRequest,
  AddRatingResponse,
  ChangeRatingRequest,
  ChangeRatingResponse,
  RemoveRatingRequest,
} from '../../types/api';

export const ratingService = {
  /**
   * Adds a new rating for an item by a user
   */
  async addRating(data: AddRatingRequest): Promise<AddRatingResponse> {
    const response = await apiClient.post<AddRatingResponse>(
      '/RatingSystem/addRating',
      data
    );
    return response.data;
  },

  /**
   * Changes an existing rating for an item
   */
  async changeRating(data: ChangeRatingRequest): Promise<ChangeRatingResponse> {
    const response = await apiClient.post<ChangeRatingResponse>(
      '/RatingSystem/changeRating',
      data
    );
    return response.data;
  },

  /**
   * Deletes an existing rating
   */
  async removeRating(data: RemoveRatingRequest): Promise<void> {
    await apiClient.post('/RatingSystem/removeRating', data);
  },
};

