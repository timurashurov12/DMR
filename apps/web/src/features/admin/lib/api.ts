const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const RESTAURANT_STORAGE_KEY = 'restaurant-admin-restaurant-id';

function getToken(): string | null {
  return localStorage.getItem('restaurant-admin-token');
}

export function getSelectedRestaurantId(): string | null {
  return localStorage.getItem(RESTAURANT_STORAGE_KEY);
}

export function setSelectedRestaurantId(id: string) {
  localStorage.setItem(RESTAURANT_STORAGE_KEY, id);
}

function headers(includeAuth = true): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (includeAuth && token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const rid = localStorage.getItem(RESTAURANT_STORAGE_KEY);
  if (includeAuth && token && rid) (h as Record<string, string>)['X-Restaurant-Id'] = rid;
  return h;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Login failed');
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

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

// Menu types
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

// Categories
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

// Menu items (пагинация, фильтры и сортировка на сервере)
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

// Languages: список — публичный GET /languages (без авторизации), создание/изменение/удаление — /admin/languages с JWT
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

// Site settings (logo, footer, siteName, contactText)
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

// Admin users
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

export async function fetchBookingsAdmin() {
  const res = await fetch(`${API_BASE}/admin/bookings`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json() as Promise<BookingAdminRow[]>;
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
