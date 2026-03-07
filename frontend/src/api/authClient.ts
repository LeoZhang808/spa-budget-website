import client from './client';

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  const resp = await client.post('/auth/register', {
    email,
    password,
    display_name: displayName,
  });
  return resp.data.data;
}

export async function login(email: string, password: string): Promise<User> {
  const resp = await client.post('/auth/login', { email, password });
  return resp.data.data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const resp = await client.get('/auth/me');
  return resp.data.data;
}

export async function updateProfile(profileData: {
  email?: string;
  display_name?: string;
}): Promise<User> {
  const resp = await client.patch('/auth/me', profileData);
  return resp.data.data;
}
