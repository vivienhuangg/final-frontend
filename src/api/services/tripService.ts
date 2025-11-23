import apiClient from '../client';
import type {
  NewTripRequest,
  NewTripResponse,
  ModifyTripRequest,
  ModifyTripResponse,
  DeleteTripRequest,
  DeleteTripResponse,
  AddTravellerRequest,
  DeleteTravellerRequest,
} from '../../types/api';

export const tripService = {
  /**
   * Creates and returns a new trip organized by the specified user
   */
  async newTrip(data: NewTripRequest): Promise<NewTripResponse> {
    const response = await apiClient.post<NewTripResponse>(
      '/Trip/newTrip',
      data
    );
    return response.data;
  },

  /**
   * Modifies an existing trip's details
   */
  async modifyTrip(data: ModifyTripRequest): Promise<ModifyTripResponse> {
    const response = await apiClient.post<ModifyTripResponse>(
      '/Trip/modifyTrip',
      data
    );
    return response.data;
  },

  /**
   * Deletes an existing trip
   */
  async deleteTrip(data: DeleteTripRequest): Promise<DeleteTripResponse> {
    const response = await apiClient.post<DeleteTripResponse>(
      '/Trip/deleteTrip',
      data
    );
    return response.data;
  },

  /**
   * Adds a user to a trip
   */
  async addTraveller(data: AddTravellerRequest): Promise<void> {
    await apiClient.post('/Trip/addTraveller', data);
  },

  /**
   * Removes a user from a trip
   */
  async deleteTraveller(data: DeleteTravellerRequest): Promise<void> {
    await apiClient.post('/Trip/deleteTraveller', data);
  },
};

