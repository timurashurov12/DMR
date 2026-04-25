import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const mockDepartment = {
    id: 'dept-1',
    restaurantId: 'rest-1',
    name: 'Кухня',
    type: 'KITCHEN' as const,
    telegramChatId: '123456',
    printerIp: null,
    printerPort: null,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockPrismaService: any = {
      department: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all departments for restaurant', async () => {
      prisma.department.findMany.mockResolvedValue([mockDepartment]);

      const result = await service.findAll('rest-1');

      expect(result).toEqual([mockDepartment]);
      expect(prisma.department.findMany).toHaveBeenCalledWith({
        where: { restaurantId: 'rest-1' },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findActive', () => {
    it('should return only active departments', async () => {
      prisma.department.findMany.mockResolvedValue([mockDepartment]);

      const result = await service.findActive('rest-1');

      expect(result).toEqual([mockDepartment]);
      expect(prisma.department.findMany).toHaveBeenCalledWith({
        where: { restaurantId: 'rest-1', isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return department when found', async () => {
      prisma.department.findUnique.mockResolvedValue(mockDepartment);

      const result = await service.findOne('dept-1');

      expect(result).toEqual(mockDepartment);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.department.findUnique.mockResolvedValue(null);

      await expect(service.findOne('dept-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create department', async () => {
      const createDto = { name: 'Бар', type: 'BAR' as const };
      prisma.department.create.mockResolvedValue({ ...mockDepartment, ...createDto });

      const result = await service.create('rest-1', createDto);

      expect(result).toEqual(expect.objectContaining(createDto));
    });
  });

  describe('update', () => {
    it('should update department', async () => {
      const updateDto = { name: 'Обновлённая кухня' };
      prisma.department.update.mockResolvedValue({ ...mockDepartment, ...updateDto });

      const result = await service.update('dept-1', updateDto);

      expect(result).toEqual(expect.objectContaining(updateDto));
    });
  });

  describe('remove', () => {
    it('should delete department', async () => {
      prisma.department.delete.mockResolvedValue(mockDepartment);

      await service.remove('dept-1');

      expect(prisma.department.delete).toHaveBeenCalledWith({ where: { id: 'dept-1' } });
    });
  });
});