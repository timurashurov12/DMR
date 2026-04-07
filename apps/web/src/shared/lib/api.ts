const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchMenuTypes(locale: string) {
  const res = await fetch(`${API_BASE}/menu-types?locale=${encodeURIComponent(locale)}`);
  if (!res.ok) throw new Error('Failed to fetch menu types');
  return res.json() as Promise<{ id: string; code: string; name: string; sortOrder: number }[]>;
}

export async function fetchMenu(menuTypeId: string, locale: string) {
  const res = await fetch(
    `${API_BASE}/menu?menuTypeId=${encodeURIComponent(menuTypeId)}&locale=${encodeURIComponent(locale)}`,
  );
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json() as Promise<
    { id: string; name: string; description: string | null; items: MenuItemDto[] }[]
  >;
}

export type MenuItemDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  weightOrVolume: string | null;
};

export async function fetchLanguages() {
  const res = await fetch(`${API_BASE}/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json() as Promise<{ id: string; code: string; name: string | null }[]>;
}

export async function fetchSiteSettings() {
  const res = await fetch(`${API_BASE}/site-settings`);
  if (!res.ok) throw new Error('Failed to fetch site settings');
  return res.json() as Promise<{
    logoPath: string | null;
    footerText: string | null;
    siteName: string | null;
    contactText: string | null;
  }>;
}
