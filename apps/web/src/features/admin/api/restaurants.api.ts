import { API_BASE, headers } from './_client';

export async function fetchRestaurants() {
  const res = await fetch(`${API_BASE}/admin/restaurants`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch restaurants');
  return res.json() as Promise<{ id: string; name: string; slug: string | null; role: string }[]>;
}

export type MenuDto = { id: string; name: string; sortOrder: number; isActive: boolean };

export async function fetchMenusAdmin() {
  const res = await fetch(`${API_BASE}/admin/menus`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch menus');
  return res.json() as Promise<MenuDto[]>;
}

export async function createMenu(body: { name: string; sortOrder?: number; isActive?: boolean }) {
  const res = await fetch(`${API_BASE}/admin/menus`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateMenu(id: string, body: { name?: string; sortOrder?: number; isActive?: boolean }) {
  const res = await fetch(`${API_BASE}/admin/menus/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteMenu(id: string) {
  const res = await fetch(`${API_BASE}/admin/menus/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
}
