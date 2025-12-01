import http from './http';

function getSession(): string | null {
  try {
    return localStorage.getItem('sessionId');
  } catch {
    return null;
  }
}

export async function registerUser(username: string, password: string): Promise<{ user: string }> {
  const { data } = await http.post('/users/register', { username, password });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { user: string };
}

export async function loginUser(username: string, password: string): Promise<{ session: string }> {
  const { data } = await http.post('/users/login', { username, password });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { session: string };
}

export async function logoutUser(session?: string): Promise<{ message: string }> {
  const effectiveSession = session || getSession();
  const { data } = await http.post('/users/logout', { session: effectiveSession });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { message: string };
}

export async function setUserName(firstName: string, lastName: string): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/user/setName', { session, firstName, lastName });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}

export async function getUserName(targetUser?: string): Promise<{ firstName: string; lastName: string }> {
  const session = getSession();
  const payload: any = { session };
  if (targetUser) payload.targetUser = targetUser;
  const { data } = await http.post('/user/getName', payload);
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { firstName: string; lastName: string };
}

// Convenience: resolve first/last name by username (instead of user id)
export async function getUserNameByUsername(username: string): Promise<{ firstName?: string; lastName?: string }> {
  // Backend `getName` accepts `targetUser`; many implementations allow username or user id.
  // We pass the username directly; caller should handle missing names.
  try {
    const resp = await getUserName(username);
    return { firstName: resp.firstName, lastName: resp.lastName };
  } catch {
    return { firstName: undefined, lastName: undefined };
  }
}

export async function getUsername(user: string): Promise<{ username: string }> {
  // Direct concept endpoint; no wrapping needed
  const { data } = await http.post('/UserAuthentication/getUsername', { user });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { username: string };
}

export async function deleteUserName(): Promise<{ status: string }> {
  const session = getSession();
  const { data } = await http.post('/user/deleteName', { session });
  if (data && typeof data === 'object' && 'error' in data && (data as any).error) throw new Error((data as any).error);
  return data as { status: string };
}
