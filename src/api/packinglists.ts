import http from './http';

function getSession(): string | null {
  try {
    return localStorage.getItem('sessionId');
  } catch {
    return null;
  }
}

export type PackingListItem = {
  _id: string;
  name: string;
  finished: boolean;
  assignee?: string;
  finishedBy?: string;
  quantity?: number;
};

export async function createPackingList(trip: string): Promise<{ packinglist: string }> {
  const session = getSession();
  const { data } = await http.post('/packinglists/create', { session, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { packinglist: string };
}

export async function addItem(packinglist: string, name: string, assignee?: string): Promise<{ message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist, name };
  if (assignee) payload.assignee = assignee;
  const { data } = await http.post('/packinglists/addItem', payload);
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { message: string };
}

export async function deleteItem(packinglist: string, item: string): Promise<{ message: string }> {
  const session = getSession();
  const { data } = await http.post('/packinglists/deleteItem', { session, packinglist, item });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { message: string };
}

export async function deletePackingList(packinglist: string): Promise<{ message: string }> {
  const session = getSession();
  const { data } = await http.post('/packinglists/delete', { session, packinglist });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { message: string };
}

export async function toggleCompletion(packinglist: string, item: string, finishedFlag: boolean): Promise<{ message: string }> {
  const session = getSession();
  const { data } = await http.post('/packinglists/toggleCompletion', { session, packinglist, item, finishedFlag });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { message: string };
}

export async function requestSuggestions(packinglist: string, additionalInput: string): Promise<{ requestId: string; message: string }> {
  const session = getSession();
  const { data } = await http.post('/packinglists/suggest', { session, packinglist, additionalInput });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { requestId: string; message: string };
}

export async function addGeneratedItems(packinglist: string, itemNames: string[], assignee?: string): Promise<{ message: string }> {
  const session = getSession();
  const payload: any = { session, packinglist, itemNames };
  if (assignee) payload.assignee = assignee;
  const { data } = await http.post('/packinglists/addGeneratedItems', payload);
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { message: string };
}

export async function getItems(packinglist: string): Promise<{ results: Array<{ item: PackingListItem }> }> {
  const session = getSession();
  const { data } = await http.post('/packinglists/items', { session, packinglist });
  if (data && typeof data === 'object' && 'results' in (data as any)) return data as { results: Array<{ item: PackingListItem }> };
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return { results: [] };
}
