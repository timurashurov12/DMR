import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import { BulkDeleteByIdsDto } from '../common/dto/bulk-delete.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    invalidateMenuCache(dto.menuTypeId);
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

  async findAll(menuTypeId?: string) {
    return this.prisma.category.findMany({
      where: menuTypeId ? { menuTypeId } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!item) throw new NotFoundException('Category not found');
    return item;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.findOne(id);
    invalidateMenuCache(cat.menuTypeId);
    if (dto.menuTypeId && dto.menuTypeId !== cat.menuTypeId) invalidateMenuCache(dto.menuTypeId);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.menuTypeId != null && { menuTypeId: dto.menuTypeId }),
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
    const cat = await this.findOne(id);
    invalidateMenuCache(cat.menuTypeId);
    return this.prisma.category.delete({ where: { id } });
  }

  async bulkRemove(dto: BulkDeleteByIdsDto) {
    const cats = await this.prisma.category.findMany({ where: { id: { in: dto.ids } } });
    if (cats.length !== dto.ids.length) {
      const foundIds = new Set(cats.map((c) => c.id));
      const missing = dto.ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Categories not found: ${missing.join(', ')}`);
    }
    const menuTypeIds = new Set(cats.map((c) => c.menuTypeId));
    menuTypeIds.forEach((menuTypeId) => invalidateMenuCache(menuTypeId));
    return this.prisma.category.deleteMany({ where: { id: { in: dto.ids } } });
  }
}
