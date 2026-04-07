import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantScopeService } from '../common/scope/restaurant-scope.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import { BulkDeleteByIdsDto } from '../common/dto/bulk-delete.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private scope: RestaurantScopeService,
  ) {}

  async create(restaurantId: string, dto: CreateCategoryDto) {
    await this.scope.assertMenuTypeInRestaurant(dto.menuTypeId, restaurantId);
    invalidateMenuCache(undefined, restaurantId);
    return this.prisma.category.create({
      data: {
        menuTypeId: dto.menuTypeId,
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

  async findAll(restaurantId: string, menuTypeId?: string) {
    return this.prisma.category.findMany({
      where: {
        menuType: menuTypeId
          ? { id: menuTypeId, menu: { restaurantId } }
          : { menu: { restaurantId } },
      },
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const item = await this.prisma.category.findFirst({
      where: {
        id,
        menuType: { menu: { restaurantId } },
      },
      include: { translations: true },
    });
    if (!item) throw new NotFoundException('Category not found');
    return item;
  }

  async update(id: string, restaurantId: string, dto: UpdateCategoryDto) {
    const cat = await this.findOne(id, restaurantId);
    if (dto.menuTypeId) {
      await this.scope.assertMenuTypeInRestaurant(dto.menuTypeId, restaurantId);
    }
    invalidateMenuCache(cat.menuTypeId, restaurantId);
    if (dto.menuTypeId && dto.menuTypeId !== cat.menuTypeId) {
      invalidateMenuCache(dto.menuTypeId, restaurantId);
    }
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.menuTypeId != null && { menuTypeId: dto.menuTypeId }),
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
    const cat = await this.findOne(id, restaurantId);
    invalidateMenuCache(cat.menuTypeId, restaurantId);
    return this.prisma.category.update({
      where: { id },
      data: { imagePath },
      include: { translations: true },
    });
  }

  async remove(id: string, restaurantId: string) {
    const cat = await this.findOne(id, restaurantId);
    invalidateMenuCache(cat.menuTypeId, restaurantId);
    return this.prisma.category.delete({ where: { id } });
  }

  async bulkRemove(restaurantId: string, dto: BulkDeleteByIdsDto) {
    const items = await this.prisma.category.findMany({
      where: {
        id: { in: dto.ids },
        menuType: { menu: { restaurantId } },
      },
    });
    if (items.length !== dto.ids.length) {
      const foundIds = new Set(items.map((i) => i.id));
      const missing = dto.ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Categories not found: ${missing.join(', ')}`);
    }
    for (const c of items) {
      invalidateMenuCache(c.menuTypeId, restaurantId);
    }
    return this.prisma.category.deleteMany({ where: { id: { in: dto.ids } } });
  }
}
