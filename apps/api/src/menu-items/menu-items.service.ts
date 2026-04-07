import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  BulkUpdateMenuItemDto,
  BulkDeleteMenuItemDto,
} from './dto/menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMenuItemDto) {
    const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (cat) invalidateMenuCache(cat.menuTypeId);
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

  async findAll(categoryId?: string) {
    return this.prisma.menuItem.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const item = await this.findOne(id);
    const cat = await this.prisma.category.findUnique({
      where: { id: dto.categoryId ?? item.categoryId },
    });
    if (cat) invalidateMenuCache(cat.menuTypeId);
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(dto.categoryId != null && { categoryId: dto.categoryId }),
        ...(dto.price != null && { price: dto.price }),
        ...(dto.weightOrVolume != null && { weightOrVolume: dto.weightOrVolume }),
        ...(dto.sortOrder != null && { sortOrder: dto.sortOrder }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
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

  async remove(id: string) {
    const item = await this.findOne(id);
    const cat = await this.prisma.category.findUnique({ where: { id: item.categoryId } });
    if (cat) invalidateMenuCache(cat.menuTypeId);
    return this.prisma.menuItem.delete({ where: { id } });
  }

  async bulkUpdate(dto: BulkUpdateMenuItemDto) {
    const items = await this.prisma.menuItem.findMany({
      where: { id: { in: dto.ids } },
      include: { category: true },
    });
    if (items.length !== dto.ids.length) {
      const foundIds = new Set(items.map((i: (typeof items)[number]) => i.id));
      const missing = dto.ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Menu items not found: ${missing.join(', ')}`);
    }
    const menuTypeIds = new Set<string>();
    items.forEach((i: (typeof items)[number]) => i.category && menuTypeIds.add(i.category.menuTypeId));
    if (dto.categoryId) {
      const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (cat) menuTypeIds.add(cat.menuTypeId);
    }
    const data: { categoryId?: string; isActive?: boolean } = {};
    if (dto.categoryId != null) data.categoryId = dto.categoryId;
    if (dto.isActive != null) data.isActive = dto.isActive;
    if (Object.keys(data).length === 0) return { count: 0 };
    const result = await this.prisma.menuItem.updateMany({
      where: { id: { in: dto.ids } },
      data,
    });
    menuTypeIds.forEach((menuTypeId) => invalidateMenuCache(menuTypeId));
    return result;
  }

  async bulkDelete(dto: BulkDeleteMenuItemDto) {
    const items = await this.prisma.menuItem.findMany({
      where: { id: { in: dto.ids } },
      include: { category: true },
    });
    if (items.length !== dto.ids.length) {
      const foundIds = new Set(items.map((i: (typeof items)[number]) => i.id));
      const missing = dto.ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Menu items not found: ${missing.join(', ')}`);
    }
    const menuTypeIds = new Set<string>();
    items.forEach((i: (typeof items)[number]) => i.category && menuTypeIds.add(i.category.menuTypeId));
    const result = await this.prisma.menuItem.deleteMany({
      where: { id: { in: dto.ids } },
    });
    menuTypeIds.forEach((menuTypeId) => invalidateMenuCache(menuTypeId));
    return result;
  }
}
