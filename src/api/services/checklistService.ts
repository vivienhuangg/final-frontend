import apiClient from '../client';
import type {
  CreateChecklistResponse,
  AddItemRequest,
  DeleteItemRequest,
  DeleteChecklistRequest,
  ToggleCompletionRequest,
  SuggestChecklistItemsRequest,
  SuggestChecklistItemsResponse,
} from '../../types/api';

export const checklistService = {
  /**
   * Creates and returns a new checklist
   */
  async createChecklist(): Promise<CreateChecklistResponse> {
    const response = await apiClient.post<CreateChecklistResponse>(
      '/Checklist/createChecklist',
      {}
    );
    return response.data;
  },

  /**
   * Adds an item to a checklist, optionally assigning it to a user
   */
  async addItem(data: AddItemRequest): Promise<void> {
    await apiClient.post('/Checklist/addItem', data);
  },

  /**
   * Deletes an item from a checklist
   */
  async deleteItem(data: DeleteItemRequest): Promise<void> {
    await apiClient.post('/Checklist/deleteItem', data);
  },

  /**
   * Deletes an entire checklist
   */
  async deleteChecklist(data: DeleteChecklistRequest): Promise<void> {
    await apiClient.post('/Checklist/deleteChecklist', data);
  },

  /**
   * Toggles the completion status of a checklist item
   */
  async toggleCompletion(data: ToggleCompletionRequest): Promise<void> {
    await apiClient.post('/Checklist/toggleCompletion', data);
  },

  /**
   * Uses an LLM to suggest new checklist items based on additional context
   */
  async suggestChecklistItems(
    data: SuggestChecklistItemsRequest
  ): Promise<SuggestChecklistItemsResponse> {
    const response = await apiClient.post<SuggestChecklistItemsResponse>(
      '/Checklist/suggestChecklistItemsWithLLM',
      data
    );
    return response.data;
  },
};

