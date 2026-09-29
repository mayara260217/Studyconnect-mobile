import { getItem } from '@/utils/storage';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api/v1';

export const TOKEN_KEY = 'studyconnect_token';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getItem(TOKEN_KEY);
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
