import apiClient from '../client';
import type {
  CreateInvitationRequest,
  CreateInvitationResponse,
  DeleteInvitationRequest,
  DeleteInvitationResponse,
  AcceptInvitationRequest,
  RejectInvitationRequest,
} from '../../types/api';

export const invitationService = {
  /**
   * Creates a new invitation for a user to an event
   */
  async createInvitation(
    data: CreateInvitationRequest
  ): Promise<CreateInvitationResponse> {
    const response = await apiClient.post<CreateInvitationResponse>(
      '/Invitation/createInvitation',
      data
    );
    return response.data;
  },

  /**
   * Deletes an existing invitation
   */
  async deleteInvitation(
    data: DeleteInvitationRequest
  ): Promise<DeleteInvitationResponse> {
    const response = await apiClient.post<DeleteInvitationResponse>(
      '/Invitation/deleteInvitation',
      data
    );
    return response.data;
  },

  /**
   * Marks an invitation as accepted by the invitee
   */
  async acceptInvitation(data: AcceptInvitationRequest): Promise<void> {
    await apiClient.post('/Invitation/acceptInvitation', data);
  },

  /**
   * Marks an invitation as rejected by the invitee
   */
  async rejectInvitation(data: RejectInvitationRequest): Promise<void> {
    await apiClient.post('/Invitation/rejectInvitation', data);
  },
};

