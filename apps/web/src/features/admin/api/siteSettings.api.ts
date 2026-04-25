import { API_BASE, headers, getToken, RESTAURANT_STORAGE_KEY } from './_client';

export type SiteSettingsDto = {
  logoPath: string | null;
  footerText: string | null;
  siteName: string | null;
  contactText: string | null;
  ownerTelegramChatId?: string | null;
  staffTelegramChatId?: string | null;
};

export async function fetchSiteSettings() {
  const res = await fetch(`${API_BASE}/site-settings`);
  if (!res.ok) throw new Error('Failed to fetch site settings');
  return res.json() as Promise<SiteSettingsDto>;
}

export async function fetchSiteSettingsAdmin() {
  const res = await fetch(`${API_BASE}/admin/site-settings`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch site settings');
  return res.json() as Promise<SiteSettingsDto>;
}

export async function updateSiteSettings(body: {
  logoPath?: string | null;
  footerText?: string | null;
  siteName?: string | null;
  contactText?: string | null;
  ownerTelegramChatId?: string | null;
  staffTelegramChatId?: string | null;
}) {
  const res = await fetch(`${API_BASE}/site-settings`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<SiteSettingsDto>;
}

export async function uploadLogo(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const rid = localStorage.getItem(RESTAURANT_STORAGE_KEY);
  const rh: Record<string, string> = {};
  if (token) rh['Authorization'] = `Bearer ${token}`;
  if (rid) rh['X-Restaurant-Id'] = rid;
  const res = await fetch(`${API_BASE}/site-settings/logo`, {
    method: 'POST',
    headers: rh,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Upload failed');
  }
  return res.json() as Promise<{ logoPath: string }>;
}
