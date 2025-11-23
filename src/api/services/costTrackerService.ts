import apiClient from '../client';
import type {
  CreateEqualSplitPercentageExpenseRequest,
  CreateEqualSplitMoneyBasedExpenseRequest,
  CreatePercentageExpenseRequest,
  CreatePercentageExpenseResponse,
  CreateMoneyBasedExpenseRequest,
  CreateMoneyBasedExpenseResponse,
  ChangeExpenseTypeRequest,
  ModifyMoneyBasedExpenseFullRequest,
  ModifyPercentageBasedExpenseFullRequest,
  ModifyPercentageBasedExpenseTotalCostRequest,
  DeleteExpenseRequest,
} from '../../types/api';

export const costTrackerService = {
  /**
   * Creates a new percentage-based expense split equally among specified users
   */
  async createEqualSplitPercentageExpense(
    data: CreateEqualSplitPercentageExpenseRequest
  ): Promise<void> {
    await apiClient.post(
      '/CostTracker/createEqualSplitPercentageExpense',
      data
    );
  },

  /**
   * Creates a new money-based expense split equally among specified users
   */
  async createEqualSplitMoneyBasedExpense(
    data: CreateEqualSplitMoneyBasedExpenseRequest
  ): Promise<void> {
    await apiClient.post(
      '/CostTracker/createEqualSplitMoneyBasedExpense',
      data
    );
  },

  /**
   * Creates and returns a new percentage-based expense with custom splits
   */
  async createPercentageExpense(
    data: CreatePercentageExpenseRequest
  ): Promise<CreatePercentageExpenseResponse> {
    const response = await apiClient.post<CreatePercentageExpenseResponse>(
      '/CostTracker/createPercentageExpense',
      data
    );
    return response.data;
  },

  /**
   * Creates and returns a new money-based expense with custom splits
   */
  async createMoneyBasedExpense(
    data: CreateMoneyBasedExpenseRequest
  ): Promise<CreateMoneyBasedExpenseResponse> {
    const response = await apiClient.post<CreateMoneyBasedExpenseResponse>(
      '/CostTracker/createMoneyBasedExpense',
      data
    );
    return response.data;
  },

  /**
   * Converts a percentage-based expense to a money-based expense
   */
  async changeExpenseToMoneyBased(
    data: ChangeExpenseTypeRequest
  ): Promise<void> {
    await apiClient.post('/CostTracker/changeExpenseToMoneyBased', data);
  },

  /**
   * Converts a money-based expense to a percentage-based expense
   */
  async changeExpenseToPercentageBased(
    data: ChangeExpenseTypeRequest
  ): Promise<void> {
    await apiClient.post('/CostTracker/changeExpenseToPercentageBased', data);
  },

  /**
   * Fully modifies a money-based expense, including total cost and user splits
   */
  async modifyMoneyBasedExpenseFull(
    data: ModifyMoneyBasedExpenseFullRequest
  ): Promise<void> {
    await apiClient.post('/CostTracker/modifyMoneyBasedExpenseFull', data);
  },

  /**
   * Fully modifies a percentage-based expense, including total cost and user splits
   */
  async modifyPercentageBasedExpenseFull(
    data: ModifyPercentageBasedExpenseFullRequest
  ): Promise<void> {
    await apiClient.post('/CostTracker/modifyPercentageBasedExpenseFull', data);
  },

  /**
   * Modifies only the total cost of a percentage-based expense
   */
  async modifyPercentageBasedExpenseTotalCost(
    data: ModifyPercentageBasedExpenseTotalCostRequest
  ): Promise<void> {
    await apiClient.post(
      '/CostTracker/modifyPercentageBasedExpenseTotalCost',
      data
    );
  },

  /**
   * Deletes an existing expense
   */
  async deleteExpense(data: DeleteExpenseRequest): Promise<void> {
    await apiClient.post('/CostTracker/deleteExpense', data);
  },
};

