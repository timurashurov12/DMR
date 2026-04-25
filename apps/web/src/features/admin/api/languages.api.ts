import { API_BASE, headers } from './_client';

export async function fetchLanguagesAdmin() {
  const res = await fetch(`${API_BASE}/languages`, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json() as Promise<{ id: string; code: string; name: string | null; sortOrder: number }[]>;
}

export async function createLanguage(body: { code: string; name?: string; sortOrder?: number }) {
  const res = await fetch(`${API_BASE}/admin/languages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateLanguage(id: string, body: { code?: string; name?: string; sortOrder?: number }) {
  const res = await fetch(`${API_BASE}/admin/languages/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteLanguage(id: string) {
  const res = await fetch(`${API_BASE}/admin/languages/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const err = JSON.parse(text) as { message?: string };
      throw new Error(err.message || text);
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
      throw new Error(text || 'Не удалось удалить язык');
    }
  }
}
