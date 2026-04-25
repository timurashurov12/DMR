import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Пользователь с таким email уже существует');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return user;
  }

  async update(id: string, dto: UpdateUserDto, requestingUserRole?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Пользователь с таким email уже существует');
    }
    const data: { email?: string; passwordHash?: string; role?: 'USER' | 'PLATFORM_OWNER' } = {};
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.password !== undefined) data.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.role !== undefined) {
      if (requestingUserRole !== 'PLATFORM_OWNER') {
        throw new ForbiddenException('Только PLATFORM_OWNER может изменять роль');
      }
      data.role = dto.role;
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    await this.prisma.user.delete({ where: { id } });
  }
}
