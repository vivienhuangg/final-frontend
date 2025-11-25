import http from './http';

function getSession(): string | null {
  try {
    return localStorage.getItem('sessionId');
  } catch {
    return null;
  }
}

export type ActivitySummary = {
  _id: string;
  title: string;
  start: string;
  end: string;
  cost: number;
  solo: boolean;
  proposal: boolean;
  createdBy: string;
};

export type ActivityDetail = ActivitySummary & { trip: string };

export async function createActivity(
  title: string,
  startDateTime: string,
  endDateTime: string,
  cost: number,
  trip: string
): Promise<{ activity: string }> {
  const session = getSession();
  const { data } = await http.post('/activities/create', { session, title, startDateTime, endDateTime, cost, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { activity: string };
}

export async function deleteActivity(activity: string): Promise<{ activity: string }> {
  const session = getSession();
  const { data } = await http.post('/activities/delete', { session, activity });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { activity: string };
}

export async function getActivitiesByTrip(trip: string): Promise<{ results: Array<{ activity: ActivitySummary }> }> {
  const session = getSession();
  const { data } = await http.post('/activities/byTrip', { session, trip });
  if (data && typeof data === 'object' && 'results' in (data as any) && Array.isArray((data as any).results)) {
    return data as { results: Array<{ activity: ActivitySummary }> };
  }
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return { results: [] };
}

export async function getActivityDetails(activity: string): Promise<{ activity: ActivityDetail }> {
  const session = getSession();
  const { data } = await http.post('/activities/details', { session, activity });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { activity: ActivityDetail };
}
