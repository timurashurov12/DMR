import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepartmentType } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId: string) {
    return this.prisma.department.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Отдел не найден');
    return dept;
  }

  async findActive(restaurantId: string) {
    return this.prisma.department.findMany({
      where: { restaurantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findByType(restaurantId: string, type: DepartmentType) {
    return this.prisma.department.findFirst({
      where: { restaurantId, type },
    });
  }

  async create(restaurantId: string, data: { name: string; type: DepartmentType; telegramChatId?: string; printerIp?: string; printerPort?: number; sortOrder?: number }) {
    return this.prisma.department.create({
      data: {
        restaurantId,
        name: data.name,
        type: data.type,
        telegramChatId: data.telegramChatId,
        printerIp: data.printerIp,
        printerPort: data.printerPort,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, data: { name?: string; type?: DepartmentType; telegramChatId?: string | null; printerIp?: string | null; printerPort?: number | null; isActive?: boolean; sortOrder?: number }) {
    return this.prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        telegramChatId: data.telegramChatId,
        printerIp: data.printerIp,
        printerPort: data.printerPort,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.department.delete({ where: { id } });
  }
}