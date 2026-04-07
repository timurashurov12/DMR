import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantScopeService } from '../common/scope/restaurant-scope.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import { BulkDeleteByIdsDto } from '../common/dto/bulk-delete.dto';
import { CreateMenuTypeDto, UpdateMenuTypeDto } from './dto/menu-type.dto';

@Injectable()
export class MenuTypesService {
  constructor(
    private prisma: PrismaService,
    private scope: RestaurantScopeService,
  ) {}

  async create(restaurantId: string, dto: CreateMenuTypeDto) {
    await this.scope.assertMenuInRestaurant(dto.menuId, restaurantId);
    invalidateMenuCache(undefined, restaurantId);
    return this.prisma.menuType.create({
      data: {
        menuId: dto.menuId,
        code: dto.code,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        translations: dto.translations?.length
          ? {
              create: dto.translations.map((t) => ({
                locale: t.locale,
                name: t.name,
              })),
            }
          : undefined,
      },
      include: { translations: true },
    });
  }

  async findAll(restaurantId: string, menuId?: string) {
    return this.prisma.menuType.findMany({
      where: {
        menu: {
          restaurantId,
          ...(menuId ? { id: menuId } : {}),
        },
      },
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const item = await this.prisma.menuType.findFirst({
      where: { id, menu: { restaurantId } },
      include: { translations: true },
    });
    if (!item) throw new NotFoundException('Menu type not found');
    return item;
  }

  async update(id: string, restaurantId: string, dto: UpdateMenuTypeDto) {
    await this.findOne(id, restaurantId);
    invalidateMenuCache(id, restaurantId);
    return this.prisma.menuType.update({
      where: { id },
      data: {
        ...(dto.code != null && { code: dto.code }),
        ...(dto.sortOrder != null && { sortOrder: dto.sortOrder }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
        ...(dto.imagePath !== undefined && { imagePath: dto.imagePath }),
        ...(dto.translations?.length != null && {
          translations: {
            deleteMany: {},
            create: dto.translations.map((t) => ({
              locale: t.locale,
              name: t.name,
            })),
          },
        }),
      },
      include: { translations: true },
    });
  }

  async setImagePath(id: string, restaurantId: string, imagePath: string | null) {
    await this.findOne(id, restaurantId);
    invalidateMenuCache(id, restaurantId);
    return this.prisma.menuType.update({
      where: { id },
      data: { imagePath },
      include: { translations: true },
    });
  }

  async remove(id: string, restaurantId: string) {
    await this.findOne(id, restaurantId);
    invalidateMenuCache(id, restaurantId);
    return this.prisma.menuType.delete({ where: { id } });
  }

  async bulkRemove(restaurantId: string, dto: BulkDeleteByIdsDto) {
    const items = await this.prisma.menuType.findMany({
      where: {
        id: { in: dto.ids },
        menu: { restaurantId },
      },
    });
    if (items.length !== dto.ids.length) {
      const foundIds = new Set(items.map((i) => i.id));
      const missing = dto.ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Menu types not found: ${missing.join(', ')}`);
    }
    invalidateMenuCache(undefined, restaurantId);
    return this.prisma.menuType.deleteMany({ where: { id: { in: dto.ids } } });
  }
}
