import http from './http';

function getSession(): string | null {
  try {
    return localStorage.getItem('sessionId');
  } catch {
    return null;
  }
}

export async function setRating(item: string, ratingNum: number): Promise<{ rating: string }> {
  if (typeof ratingNum !== 'number' || ratingNum < 1 || ratingNum > 10) throw new Error('ratingNum must be 1..10');
  const session = getSession();
  const { data } = await http.post('/ratings/item/set', { session, item, ratingNum });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { rating: string };
}

export async function removeRating(rating: string): Promise<{ message: string }> {
  const session = getSession();
  const { data } = await http.post('/ratings/item/remove', { session, rating });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { message: string };
}

export async function getRating(rating: string): Promise<{ user: string; item: string; ratingNum: number }> {
  const session = getSession();
  const { data } = await http.post('/ratings/item/get', { session, rating });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { user: string; item: string; ratingNum: number };
}

export async function getRatingsByItem(item: string): Promise<{ results: Array<{ user?: string; rater?: string; rating?: string; num?: number; ratingNum?: number }> }> {
  const session = getSession();
  const { data } = await http.post('/ratings/item/list', { session, item });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { results: Array<{ user?: string; rater?: string; rating?: string; num?: number; ratingNum?: number }> };
}

export async function getRatingsByUser(user: string): Promise<{ results: Array<{ item: string; ratingNum: number; rating: string }> }> {
  const session = getSession();
  const { data } = await http.post('/ratings/user/list', { session, user });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { results: Array<{ item: string; ratingNum: number; rating: string }> };
}
