import { API_BASE, headers, getToken, RESTAURANT_STORAGE_KEY } from './_client';

export async function fetchMenuTypesAdmin(menuId?: string) {
  const q = menuId ? `?menuId=${encodeURIComponent(menuId)}` : '';
  const res = await fetch(`${API_BASE}/admin/menu-types${q}`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function createMenuType(body: unknown) {
  const res = await fetch(`${API_BASE}/admin/menu-types`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateMenuType(id: string, body: unknown) {
  const res = await fetch(`${API_BASE}/admin/menu-types/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadMenuTypeImage(menuTypeId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const rid = localStorage.getItem(RESTAURANT_STORAGE_KEY);
  const rh: Record<string, string> = {};
  if (token) rh['Authorization'] = `Bearer ${token}`;
  if (rid) rh['X-Restaurant-Id'] = rid;
  const res = await fetch(
    `${API_BASE}/admin/menu-types/${encodeURIComponent(menuTypeId)}/image`,
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

export async function deleteMenuType(id: string) {
  const res = await fetch(`${API_BASE}/admin/menu-types/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function bulkDeleteMenuTypes(ids: string[]) {
  const res = await fetch(`${API_BASE}/admin/menu-types/bulk-delete`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ count: number }>;
}

export type TranslateResult = { translated: number; locales: string[] };

export function getTranslateResultMessage(r: TranslateResult): string {
  if (r.translated === 0) return 'Переводы уже есть для всех языков.';
  const word = r.translated === 1 ? 'язык' : r.translated < 5 ? 'языка' : 'языков';
  return `Переведено на ${r.translated} ${word}: ${r.locales.join(', ')}.`;
}

export async function translateMenuType(id: string, body?: { targetLocales?: string[] }) {
  const res = await fetch(`${API_BASE}/admin/menu-types/${id}/translate`, {
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

export type BulkTranslateResult = { totalNewLocales: number; errors: { message: string }[] };

export async function bulkTranslateMenuTypes(body: { ids: string[]; targetLocales?: string[] }) {
  const res = await fetch(`${API_BASE}/admin/menu-types/bulk-translate`, {
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
