import { API_BASE, headers, getToken, RESTAURANT_STORAGE_KEY } from './_client';
import { TranslateResult, BulkTranslateResult } from './menuTypes.api';

export async function fetchCategoriesAdmin(menuTypeId?: string) {
  const url = menuTypeId
    ? `${API_BASE}/admin/categories?menuTypeId=${encodeURIComponent(menuTypeId)}`
    : `${API_BASE}/admin/categories`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function createCategory(body: unknown) {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCategory(id: string, body: unknown) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadCategoryImage(categoryId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const rid = localStorage.getItem(RESTAURANT_STORAGE_KEY);
  const rh: Record<string, string> = {};
  if (token) rh['Authorization'] = `Bearer ${token}`;
  if (rid) rh['X-Restaurant-Id'] = rid;
  const res = await fetch(
    `${API_BASE}/admin/categories/${encodeURIComponent(categoryId)}/image`,
    { method: 'POST', headers: rh, body: formData },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || 'Не удалось загрузить изображение',
    );
  }
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function bulkDeleteCategories(ids: string[]) {
  const res = await fetch(`${API_BASE}/admin/categories/bulk-delete`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ count: number }>;
}

export async function translateCategory(id: string, body?: { targetLocales?: string[] }) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}/translate`, {
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

export async function bulkTranslateCategories(body: { ids: string[]; targetLocales?: string[] }) {
  const res = await fetch(`${API_BASE}/admin/categories/bulk-translate`, {
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
