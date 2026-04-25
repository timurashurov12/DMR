import { API_BASE, headers, getToken, RESTAURANT_STORAGE_KEY } from './_client';
import { TranslateResult, BulkTranslateResult } from './menuTypes.api';

export type MenuItemsListParams = {
  categoryId?: string;
  menuTypeId?: string;
  active?: 'active' | 'inactive';
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

export type MenuItemsListResponse = {
  items: unknown[];
  total: number;
};

export async function fetchMenuItemsAdmin(
  params: MenuItemsListParams = {},
): Promise<MenuItemsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.menuTypeId) searchParams.set('menuTypeId', params.menuTypeId);
  if (params.active) searchParams.set('active', params.active);
  if (params.search?.trim()) searchParams.set('search', params.search.trim());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
  const qs = searchParams.toString();
  const url = qs
    ? `${API_BASE}/admin/menu-items?${qs}`
    : `${API_BASE}/admin/menu-items`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json() as Promise<MenuItemsListResponse>;
}

export async function createMenuItem(body: unknown) {
  const res = await fetch(`${API_BASE}/admin/menu-items`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateMenuItem(id: string, body: unknown) {
  const res = await fetch(`${API_BASE}/admin/menu-items/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadMenuItemImage(menuItemId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const rid = localStorage.getItem(RESTAURANT_STORAGE_KEY);
  const rh: Record<string, string> = {};
  if (token) rh['Authorization'] = `Bearer ${token}`;
  if (rid) rh['X-Restaurant-Id'] = rid;
  const res = await fetch(
    `${API_BASE}/admin/menu-items/${encodeURIComponent(menuItemId)}/image`,
    {
      method: 'POST',
      headers: rh,
      body: formData,
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || 'Не удалось загрузить изображение',
    );
  }
  return res.json();
}

export async function deleteMenuItem(id: string) {
  const res = await fetch(`${API_BASE}/admin/menu-items/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function bulkUpdateMenuItems(body: { ids: string[]; categoryId?: string; isActive?: boolean }) {
  const res = await fetch(`${API_BASE}/admin/menu-items/bulk`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ count: number }>;
}

export async function bulkDeleteMenuItems(ids: string[]) {
  const res = await fetch(`${API_BASE}/admin/menu-items/bulk-delete`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ count: number }>;
}

export async function translateMenuItem(id: string, body?: { targetLocales?: string[] }) {
  const res = await fetch(`${API_BASE}/admin/menu-items/${id}/translate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      // use text as is
    }
    throw new Error(msg);
  }
  return res.json() as Promise<TranslateResult>;
}

export async function bulkTranslateMenuItems(body: { ids: string[]; targetLocales?: string[] }) {
  const res = await fetch(`${API_BASE}/admin/menu-items/bulk-translate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      // use text as is
    }
    throw new Error(msg);
  }
  return res.json() as Promise<BulkTranslateResult>;
}
