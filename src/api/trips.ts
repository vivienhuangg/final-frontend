import http from './http';

function getSession(): string | null {
  try {
    return localStorage.getItem('sessionId');
  } catch {
    return null;
  }
}

export type TripSummary = {
  _id: string;
  title: string;
  destination?: string;
  startDate: string;
  endDate: string;
  organizer: string;
  travellers: string[];
};

export async function createTrip(title: string, startDate: string, endDate: string, destination?: string): Promise<{ trip: string }> {
  const session = getSession();
  const { data } = await http.post('/trips/new', { session, title, destination, startDate, endDate });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { trip: string };
}

export async function modifyTrip(trip: string, title: string, startDate: string, endDate: string, destination?: string): Promise<{ trip: string }> {
  const session = getSession();
  const { data } = await http.post('/trips/modify', { session, trip, title, destination, startDate, endDate });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { trip: string };
}

export async function deleteTrip(trip: string): Promise<{ trip: string }> {
  const session = getSession();
  const { data } = await http.post('/trips/delete', { session, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { trip: string };
}

export async function addTraveller(trip: string, travellerUser: string): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/trips/addTraveller', { session, trip, travellerUser });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function deleteTraveller(trip: string, deleteTravellerUser: string): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/trips/deleteTraveller', { session, trip, deleteTravellerUser });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function getTrip(trip: string): Promise<{ trip: TripSummary }> {
  const session = getSession();
  const { data } = await http.post('/trips/get', { session, trip });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { trip: TripSummary };
}

export async function getMyTrips(): Promise<{ results: Array<{ trip: TripSummary }> }> {
  const session = getSession();
  const { data } = await http.post('/trips/my', { session });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { results: Array<{ trip: TripSummary }> };
}
