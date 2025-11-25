import http from './http';

function getSession(): string | null {
  try {
    return localStorage.getItem('sessionId');
  } catch {
    return null;
  }
}

export async function createEqualSplitPercentageExpense(totalCost: number, users: string[], title?: string, trip?: string): Promise<{ expense: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/equal-split-percentage', { session, totalCost, users, title, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { expense: string };
}

export async function createEqualSplitMoneyExpense(totalCost: number, users: string[], title?: string, trip?: string): Promise<{ expense: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/equal-split-money', { session, totalCost, users, title, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { expense: string };
}

export async function createPercentageExpense(totalCost: number, users: string[], percentages: number[], title?: string, trip?: string): Promise<{ expense: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/percentage-expense', { session, totalCost, users, percentages, title, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { expense: string };
}

export async function createMoneyExpense(totalCost: number, users: string[], costs: number[], title?: string, trip?: string): Promise<{ expense: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/money-expense', { session, totalCost, users, costs, title, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { expense: string };
}

export async function convertExpenseToMoney(expense: string): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/to-money', { session, expense });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function convertExpenseToPercentage(expense: string): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/to-percentage', { session, expense });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function modifyMoneyExpenseFull(expense: string, newTotalCost: number, users: string[], costs: number[]): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/modify-money-full', { session, expense, newTotalCost, users, costs });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function modifyPercentageExpenseFull(expense: string, newTotalCost: number, users: string[], percentages: number[]): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/modify-percentage-full', { session, expense, newTotalCost, users, percentages });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function modifyPercentageExpenseTotalCost(expense: string, newTotalCost: number): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/modify-total-cost', { session, expense, newTotalCost });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function deleteExpense(expense: string): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/delete', { session, expense });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function getPercentageExpenseDetails(expense: string): Promise<{ totalCost: number; users: Array<{ user: string; percentage: number }>; title?: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/percentage-details', { session, expense });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { totalCost: number; users: Array<{ user: string; percentage: number }>; title?: string };
}

export async function getMoneyExpenseDetails(expense: string): Promise<{ totalCost: number; users: Array<{ user: string; cost: number }>; title?: string }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/money-details', { session, expense });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { totalCost: number; users: Array<{ user: string; cost: number }>; title?: string };
}

export async function listPercentageExpenses(): Promise<{ listedExpenses: Array<{ expense: string; totalCost: number; title: string }> }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/percentage-expenses', { session });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { listedExpenses: Array<{ expense: string; totalCost: number; title: string }> };
}

export async function listMoneyExpenses(): Promise<{ listedExpenses: Array<{ expense: string; totalCost: number; title: string }> }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/money-expenses', { session });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { listedExpenses: Array<{ expense: string; totalCost: number; title: string }> };
}

export async function listPercentageExpensesByTrip(trip: string): Promise<{ listedExpenses: Array<{ expense: string; totalCost: number; title: string }> }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/percentage-expenses-by-trip', { session, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { listedExpenses: Array<{ expense: string; totalCost: number; title: string }> };
}

export async function listMoneyExpensesByTrip(trip: string): Promise<{ listedExpenses: Array<{ expense: string; totalCost: number; title: string }> }> {
  const session = getSession();
  const { data } = await http.post('/costtracker/money-expenses-by-trip', { session, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { listedExpenses: Array<{ expense: string; totalCost: number; title: string }> };
}
