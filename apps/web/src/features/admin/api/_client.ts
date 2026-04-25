/** Shared API client utilities and constants */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const RESTAURANT_STORAGE_KEY = 'restaurant-admin-restaurant-id';

export function getToken(): string | null {
  return localStorage.getItem('restaurant-admin-token');
}

export function getSelectedRestaurantId(): string | null {
  return localStorage.getItem(RESTAURANT_STORAGE_KEY);
}

export function setSelectedRestaurantId(id: string) {
  localStorage.setItem(RESTAURANT_STORAGE_KEY, id);
}

export function headers(includeAuth = true): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (includeAuth && token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const rid = localStorage.getItem(RESTAURANT_STORAGE_KEY);
  if (includeAuth && token && rid) (h as Record<string, string>)['X-Restaurant-Id'] = rid;
  return h;
}

export async function handleErrorResponse(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.message || json.error || 'An error occurred';
  } catch {
    return await res.text();
  }
}
