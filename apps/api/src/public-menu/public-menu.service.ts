import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type MenuTypePublicDto = {
  id: string;
  code: string;
  sortOrder: number;
  name: string;
  imagePath: string | null;
};
export type MenuItemPublicDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  weightOrVolume: string | null;
  imagePath: string | null;
};
export type MenuCategoryPublicDto = {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  items: MenuItemPublicDto[];
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) return undefined;
  return entry.data as T;
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

/** Invalidate menu cache for a menu type, a whole restaurant, or everything */
export function invalidateMenuCache(menuTypeId?: string, restaurantId?: string) {
  if (menuTypeId) {
    for (const k of cache.keys()) {
      if (k.includes(`:${menuTypeId}:`) || k.includes(`:${menuTypeId}`)) cache.delete(k);
    }
  } else if (restaurantId) {
    for (const k of cache.keys()) {
      if (k.includes(`:${restaurantId}:`)) cache.delete(k);
    }
  } else {
    cache.clear();
  }
}

@Injectable()
export class PublicMenuService {
  constructor(private prisma: PrismaService) {}

  async getMenuTypes(locale: string, restaurantId: string): Promise<MenuTypePublicDto[]> {
    const key = `mt:${restaurantId}:${locale}`;
    const cached = getCached<MenuTypePublicDto[]>(key);
    if (cached) return cached;

    const types = await this.prisma.menuType.findMany({
      where: {
        isActive: true,
        menu: { restaurantId, isActive: true },
      },
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
    const result = types.map((t: (typeof types)[number]) => {
      const tr =
        t.translations.find((r: (typeof t.translations)[number]) => r.locale === locale) || t.translations[0];
      return {
        id: t.id,
        code: t.code,
        sortOrder: t.sortOrder,
        name: tr?.name ?? t.code,
        imagePath: t.imagePath ?? null,
      };
    });
    setCache(key, result);
    return result;
  }

  async getMenu(
    menuTypeId: string,
    locale: string,
    restaurantId: string,
  ): Promise<MenuCategoryPublicDto[]> {
    const key = `menu:${restaurantId}:${menuTypeId}:${locale}`;
    const cached = getCached<MenuCategoryPublicDto[]>(key);
    if (cached) return cached;

    const mt = await this.prisma.menuType.findFirst({
      where: { id: menuTypeId, menu: { restaurantId } },
    });
    if (!mt) return [];

    const categories = await this.prisma.category.findMany({
      where: { menuTypeId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: true,
        menuItems: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: { translations: true },
        },
      },
    });

    const result = categories.map((cat: (typeof categories)[number]) => {
      const catTr =
        cat.translations.find((r: (typeof cat.translations)[number]) => r.locale === locale) || cat.translations[0];
      return {
        id: cat.id,
        name: catTr?.name ?? '',
        description: catTr?.description ?? null,
        imagePath: cat.imagePath ?? null,
        items: cat.menuItems.map((item: (typeof cat.menuItems)[number]) => {
          const itemTr =
            item.translations.find((r: (typeof item.translations)[number]) => r.locale === locale) ||
            item.translations[0];
          return {
            id: item.id,
            name: itemTr?.name ?? '',
            description: itemTr?.description ?? null,
            price: Number(item.price),
            weightOrVolume: item.weightOrVolume,
            imagePath: item.imagePath ?? null,
          };
        }),
      };
    });
    setCache(key, result);
    return result;
  }

  async getMenuByCode(
    code: string,
    locale: string,
    restaurantId: string,
  ): Promise<MenuCategoryPublicDto[] | null> {
    const type = await this.prisma.menuType.findFirst({
      where: {
        code,
        isActive: true,
        menu: { restaurantId, isActive: true },
      },
    });
    if (!type) return null;
    return this.getMenu(type.id, locale, restaurantId);
  }
}
