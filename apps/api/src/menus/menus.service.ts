import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId: string) {
    return this.prisma.menu.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string, restaurantId: string) {
    const m = await this.prisma.menu.findFirst({
      where: { id, restaurantId },
    });
    if (!m) throw new NotFoundException('Menu not found');
    return m;
  }

  async create(restaurantId: string, dto: CreateMenuDto) {
    invalidateMenuCache(undefined, restaurantId);
    return this.prisma.menu.create({
      data: {
        restaurantId,
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, restaurantId: string, dto: UpdateMenuDto) {
    await this.findOne(id, restaurantId);
    invalidateMenuCache(undefined, restaurantId);
    return this.prisma.menu.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.sortOrder != null && { sortOrder: dto.sortOrder }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string, restaurantId: string) {
    await this.findOne(id, restaurantId);
    invalidateMenuCache(undefined, restaurantId);
    return this.prisma.menu.delete({ where: { id } });
  }
}
