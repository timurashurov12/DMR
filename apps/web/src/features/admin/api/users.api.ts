import { API_BASE, headers } from './_client';

export async function fetchUsersAdmin() {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json() as Promise<{ id: string; email: string; createdAt: string; updatedAt: string }[]>;
}

export async function createUserAdmin(body: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Не удалось создать пользователя');
  }
  return res.json();
}

export async function updateUserAdmin(id: string, body: { email?: string; password?: string }) {
  const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Не удалось обновить');
  }
  return res.json();
}

export async function deleteUserAdmin(id: string) {
  const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Не удалось удалить');
  }
}
