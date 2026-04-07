import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantScopeService } from '../common/scope/restaurant-scope.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  BulkUpdateMenuItemDto,
  BulkDeleteMenuItemDto,
  QueryMenuItemsDto,
} from './dto/menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    private prisma: PrismaService,
    private scope: RestaurantScopeService,
  ) {}

  async create(restaurantId: string, dto: CreateMenuItemDto) {
    const cat = await this.scope.assertCategoryInRestaurant(dto.categoryId, restaurantId);
    invalidateMenuCache(cat.menuTypeId, restaurantId);
    return this.prisma.menuItem.create({
      data: {
        categoryId: dto.categoryId,
        price: dto.price,
        weightOrVolume: dto.weightOrVolume,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        translations: dto.translations?.length
          ? {
              create: dto.translations.map((t) => ({
                locale: t.locale,
                name: t.name,
                description: t.description,
              })),
            }
          : undefined,
      },
      include: { translations: true },
    });
  }

  private buildMenuItemsWhereSql(restaurantId: string, dto: QueryMenuItemsDto): Prisma.Sql {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`m."restaurantId" = ${restaurantId}`,
    ];
    if (dto.categoryId) {
      conditions.push(Prisma.sql`c.id = ${dto.categoryId}`);
    }
    if (dto.menuTypeId) {
      conditions.push(Prisma.sql`c."menuTypeId" = ${dto.menuTypeId}`);
    }
    if (dto.active === 'active') {
      conditions.push(Prisma.sql`mi."isActive" = true`);
    } else if (dto.active === 'inactive') {
      conditions.push(Prisma.sql`mi."isActive" = false`);
    }
    if (dto.search?.trim()) {
      const needle = dto.search.trim();
      conditions.push(
        Prisma.sql`EXISTS (
          SELECT 1 FROM "MenuItemTranslation" trs
          WHERE trs."menuItemId" = mi.id
          AND (
            POSITION(LOWER(${needle}) IN LOWER(trs.name)) > 0
            OR POSITION(LOWER(${needle}) IN LOWER(COALESCE(trs.description, ''))) > 0
          )
        )`,
      );
    }
    return Prisma.join(conditions, ' AND ');
  }

  private buildMenuItemsOrderSql(sortBy: string, sortDir: 'asc' | 'desc'): Prisma.Sql {
    const dir = Prisma.raw(sortDir === 'desc' ? 'DESC' : 'ASC');
    switch (sortBy) {
      case 'name':
        return Prisma.sql`ORDER BY tr.name ${dir} NULLS LAST, mi.id ASC`;
      case 'category':
        return Prisma.sql`ORDER BY ctr.name ${dir} NULLS LAST, mi.id ASC`;
      case 'menuType':
        return Prisma.sql`ORDER BY mtt.name ${dir} NULLS LAST, mi.id ASC`;
      case 'price':
        return Prisma.sql`ORDER BY mi.price ${dir}, mi.id ASC`;
      case 'weightOrVolume':
        return Prisma.sql`ORDER BY mi."weightOrVolume" ${dir} NULLS LAST, mi.id ASC`;
      case 'isActive':
        return Prisma.sql`ORDER BY mi."isActive" ${dir}, mi.id ASC`;
      default:
        return Prisma.sql`ORDER BY tr.name ASC NULLS LAST, mi.id ASC`;
    }
  }

  async findAllPaginated(restaurantId: string, dto: QueryMenuItemsDto) {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 10;
    const sortBy = dto.sortBy ?? 'name';
    const sortDir = dto.sortDir ?? 'asc';
    const offset = (page - 1) * pageSize;
    const whereSql = this.buildMenuItemsWhereSql(restaurantId, dto);
    const orderSql = this.buildMenuItemsOrderSql(sortBy, sortDir);

    const countRows = await this.prisma.$queryRaw<[{ cnt: bigint }]>(Prisma.sql`
      SELECT COUNT(*)::bigint as cnt
      FROM "MenuItem" mi
      INNER JOIN "Category" c ON c.id = mi."categoryId"
      INNER JOIN "MenuType" mt ON mt.id = c."menuTypeId"
      INNER JOIN "Menu" m ON m.id = mt."menuId"
      WHERE ${whereSql}
    `);
    const total = Number(countRows[0].cnt);

    if (total === 0) {
      return { items: [], total: 0 };
    }

    const idRows = await this.prisma.$queryRaw<[{ id: string }]>(Prisma.sql`
      SELECT mi.id
      FROM "MenuItem" mi
      INNER JOIN "Category" c ON c.id = mi."categoryId"
      INNER JOIN "MenuType" mt ON mt.id = c."menuTypeId"
      INNER JOIN "Menu" m ON m.id = mt."menuId"
      LEFT JOIN "MenuItemTranslation" tr ON tr."menuItemId" = mi.id AND tr.locale = 'ru'
      LEFT JOIN "CategoryTranslation" ctr ON ctr."categoryId" = c.id AND ctr.locale = 'ru'
      LEFT JOIN "MenuTypeTranslation" mtt ON mtt."menuTypeId" = mt.id AND mtt.locale = 'ru'
      WHERE ${whereSql}
      ${orderSql}
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    const ids = idRows.map((r) => r.id);
    if (ids.length === 0) {
      return { items: [], total };
    }

    const items = await this.prisma.menuItem.findMany({
      where: { id: { in: ids } },
      include: { translations: true },
    });
    const orderMap = new Map(ids.map((id, i) => [id, i]));
    items.sort((a, b) => (orderMap.get(a.id)! - orderMap.get(b.id)!));
    return { items, total };
  }

  async findOne(id: string, restaurantId: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: {
        id,
        category: { menuType: { menu: { restaurantId } } },
      },
      include: { translations: true },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async update(id: string, restaurantId: string, dto: UpdateMenuItemDto) {
    const item = await this.findOne(id, restaurantId);
    if (dto.categoryId) {
      await this.scope.assertCategoryInRestaurant(dto.categoryId, restaurantId);
    }
    const catOld = await this.prisma.category.findUnique({
      where: { id: item.categoryId },
    });
    if (catOld) invalidateMenuCache(catOld.menuTypeId, restaurantId);
    if (dto.categoryId && dto.categoryId !== item.categoryId) {
      const catNew = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (catNew) invalidateMenuCache(catNew.menuTypeId, restaurantId);
    }
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(dto.categoryId != null && { categoryId: dto.categoryId }),
        ...(dto.price != null && { price: dto.price }),
        ...(dto.weightOrVolume != null && { weightOrVolume: dto.weightOrVolume }),
        ...(dto.sortOrder != null && { sortOrder: dto.sortOrder }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
        ...(dto.imagePath !== undefined && { imagePath: dto.imagePath }),
        ...(dto.translations?.length != null && {
          translations: {
            deleteMany: {},
            create: dto.translations.map((t) => ({
              locale: t.locale,
              name: t.name,
              description: t.description,
            })),
          },
        }),
      },
      include: { translations: true },
    });
  }

  async setImagePath(id: string, restaurantId: string, imagePath: string | null) {
    const item = await this.findOne(id, restaurantId);
    const cat = await this.prisma.category.findUnique({ where: { id: item.categoryId } });
    if (cat) invalidateMenuCache(cat.menuTypeId, restaurantId);
    return this.prisma.menuItem.update({
      where: { id },
      data: { imagePath },
      include: { translations: true },
    });
  }

  async remove(id: string, restaurantId: string) {
    const item = await this.findOne(id, restaurantId);
    const cat = await this.prisma.category.findUnique({ where: { id: item.categoryId } });
    if (cat) invalidateMenuCache(cat.menuTypeId, restaurantId);
    return this.prisma.menuItem.delete({ where: { id } });
  }

  async bulkUpdate(restaurantId: string, dto: BulkUpdateMenuItemDto) {
    const items = await this.prisma.menuItem.findMany({
      where: {
        id: { in: dto.ids },
        category: { menuType: { menu: { restaurantId } } },
      },
      include: { category: true },
    });
    if (items.length !== dto.ids.length) {
      const foundIds = new Set(items.map((i: (typeof items)[number]) => i.id));
      const missing = dto.ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Menu items not found: ${missing.join(', ')}`);
    }
    const menuTypeIds = new Set<string>();
    items.forEach((i: (typeof items)[number]) => menuTypeIds.add(i.category.menuTypeId));
    if (dto.categoryId) {
      const cat = await this.scope.assertCategoryInRestaurant(dto.categoryId, restaurantId);
      menuTypeIds.add(cat.menuTypeId);
    }
    const data: { categoryId?: string; isActive?: boolean } = {};
    if (dto.categoryId != null) data.categoryId = dto.categoryId;
    if (dto.isActive != null) data.isActive = dto.isActive;
    if (Object.keys(data).length === 0) return { count: 0 };
    const result = await this.prisma.menuItem.updateMany({
      where: { id: { in: dto.ids } },
      data,
    });
    menuTypeIds.forEach((menuTypeId) => invalidateMenuCache(menuTypeId, restaurantId));
    return result;
  }

  async bulkDelete(restaurantId: string, dto: BulkDeleteMenuItemDto) {
    const items = await this.prisma.menuItem.findMany({
      where: {
        id: { in: dto.ids },
        category: { menuType: { menu: { restaurantId } } },
      },
      include: { category: true },
    });
    if (items.length !== dto.ids.length) {
      const foundIds = new Set(items.map((i: (typeof items)[number]) => i.id));
      const missing = dto.ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Menu items not found: ${missing.join(', ')}`);
    }
    const menuTypeIds = new Set<string>();
    items.forEach((i: (typeof items)[number]) => menuTypeIds.add(i.category.menuTypeId));
    const result = await this.prisma.menuItem.deleteMany({
      where: { id: { in: dto.ids } },
    });
    menuTypeIds.forEach((menuTypeId) => invalidateMenuCache(menuTypeId, restaurantId));
    return result;
  }
}
