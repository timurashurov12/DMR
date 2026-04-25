import { API_BASE, headers } from './_client';

export type BookingAdminRow = {
  id: string;
  orderNumber: string;
  guestName: string;
  phone: string;
  email: string | null;
  scheduledAt: string | null;
  partySize: number;
  comment: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  receiptText: string | null;
  /** Saved order lines when guest added positions (shape: `{ lines: { name, quantity, unitPrice }[] }`) */
  itemsJson: unknown | null;
  createdAt: string;
};

export type BookingsPaginationResponse = {
  data: BookingAdminRow[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
};

export async function fetchBookingsAdmin(page = 1, pageSize = 50) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(Math.min(pageSize, 100)));
  const url = `${API_BASE}/admin/bookings?${params.toString()}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json() as Promise<BookingsPaginationResponse>;
}

export async function updateBookingStatusAdmin(
  id: string,
  status: BookingAdminRow['status'],
) {
  const res = await fetch(`${API_BASE}/admin/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
