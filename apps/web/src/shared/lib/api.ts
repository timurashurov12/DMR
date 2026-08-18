const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function publicUploadUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  const trimmed = imagePath.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_BASE.replace(/\/$/, '')}${path}`;
}

export type PublicRestaurant = {
  id: string;
  name: string;
  slug: string | null;
  domains: string[];
};

export async function fetchRestaurantsPublic() {
  const res = await fetch(`${API_BASE}/restaurants`);
  if (!res.ok) throw new Error('Failed to fetch restaurants');
  return res.json() as Promise<PublicRestaurant[]>;
}

export async function fetchCurrentRestaurant() {
  const res = await fetch(`${API_BASE}/restaurants/current`);
  if (!res.ok) throw new Error('Failed to fetch current restaurant');
  return res.json() as Promise<PublicRestaurant | null>;
}

export async function fetchMenuTypes(locale: string) {
  const res = await fetch(`${API_BASE}/menu-types?locale=${encodeURIComponent(locale)}`);
  if (!res.ok) throw new Error('Failed to fetch menu types');
  return res.json() as Promise<
    { id: string; code: string; name: string; sortOrder: number; imagePath: string | null }[]
  >;
}

export async function fetchMenu(menuTypeId: string, locale: string) {
  const res = await fetch(
    `${API_BASE}/menu?menuTypeId=${encodeURIComponent(menuTypeId)}&locale=${encodeURIComponent(locale)}`,
  );
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json() as Promise<
    {
      id: string;
      name: string;
      description: string | null;
      imagePath: string | null;
      items: MenuItemDto[];
    }[]
  >;
}

export type MenuItemDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  weightOrVolume: string | null;
  imagePath: string | null;
};

export type CreateBookingPayload = {
  guestName: string;
  phone: string;
  email?: string;
  scheduledAt?: string;
  partySize?: number;
  comment?: string;
  lines?: { name: string; quantity: number; unitPrice: number }[];
};

export type CreateBookingResponse = {
  id: string;
  orderNumber: string;
  receiptText: string;
};

export async function createBooking(body: CreateBookingPayload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text) as { message?: string | string[] };
      if (Array.isArray(j.message)) msg = j.message.join(', ');
      else if (j.message) msg = String(j.message);
    } catch {
      // keep text
    }
    throw new Error(msg || 'Booking failed');
  }
  return res.json() as Promise<CreateBookingResponse>;
}

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
