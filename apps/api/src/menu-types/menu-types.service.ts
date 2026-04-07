import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import { BulkDeleteByIdsDto } from '../common/dto/bulk-delete.dto';
import { CreateMenuTypeDto, UpdateMenuTypeDto } from './dto/menu-type.dto';

@Injectable()
export class MenuTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMenuTypeDto) {
    invalidateMenuCache();
    return this.prisma.menuType.create({
      data: {
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

  async findAll() {
    return this.prisma.menuType.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.menuType.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!item) throw new NotFoundException('Menu type not found');
    return item;
  }

  async update(id: string, dto: UpdateMenuTypeDto) {
    await this.findOne(id);
    invalidateMenuCache();
    return this.prisma.menuType.update({
      where: { id },
      data: {
        ...(dto.code != null && { code: dto.code }),
        ...(dto.sortOrder != null && { sortOrder: dto.sortOrder }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
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

  async remove(id: string) {
    await this.findOne(id);
    invalidateMenuCache();
    return this.prisma.menuType.delete({ where: { id } });
  }

  async bulkRemove(dto: BulkDeleteByIdsDto) {
    const items = await this.prisma.menuType.findMany({ where: { id: { in: dto.ids } } });
    if (items.length !== dto.ids.length) {
      const foundIds = new Set(items.map((i) => i.id));
      const missing = dto.ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Menu types not found: ${missing.join(', ')}`);
    }
    invalidateMenuCache();
    return this.prisma.menuType.deleteMany({ where: { id: { in: dto.ids } } });
  }
}
