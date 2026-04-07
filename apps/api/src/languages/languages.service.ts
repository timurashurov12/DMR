import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/language.dto';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.language.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  create(dto: CreateLanguageDto) {
    return this.prisma.language.create({
      data: {
        code: dto.code,
        name: dto.name ?? null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  update(id: string, dto: UpdateLanguageDto) {
    return this.prisma.language.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  remove(id: string) {
    return this.prisma.language.delete({
      where: { id },
    });
  }
}
