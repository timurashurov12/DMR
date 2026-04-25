import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { DepartmentsService } from '../departments/departments.service';

describe('BookingsService', () => {
  let service: BookingsService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let telegram: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let departments: any;

  const mockDepartment = {
    id: 'dept-1',
    restaurantId: 'rest-1',
    name: 'Кухня',
    type: 'KITCHEN',
    telegramChatId: '123456',
    isActive: true,
  };

  const mockRestaurant = {
    id: 'rest-1',
    name: 'Test Restaurant',
  };

  const mockBooking = {
    id: 'booking-1',
    restaurantId: 'rest-1',
    orderNumber: 'ABC12',
    guestName: 'John Doe',
    phone: '+79001234567',
    status: 'PENDING',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockPrismaService: any = {
      restaurant: {
        findUnique: jest.fn(),
      },
      booking: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockTelegramService: any = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockDepartmentsService: any = {
      findActive: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TelegramService, useValue: mockTelegramService },
        { provide: DepartmentsService, useValue: mockDepartmentsService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get(PrismaService);
    telegram = module.get(TelegramService);
    departments = module.get(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPublic', () => {
    const validDto = {
      guestName: 'John Doe',
      phone: '+79001234567',
    };

    it('should create booking and send to departments', async () => {
      prisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      prisma.booking.findUnique.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue(mockBooking);
      departments.findActive.mockResolvedValue([mockDepartment]);

      const result = await service.createPublic('rest-1', validDto);

      expect(result.id).toBe('booking-1');
      expect(result.orderNumber).toBe('ABC12');
      expect(result.receiptText).toBeDefined();
      expect(departments.findActive).toHaveBeenCalledWith('rest-1');
    });

    it('should skip departments when no active departments', async () => {
      prisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      prisma.booking.findUnique.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue(mockBooking);
      departments.findActive.mockResolvedValue([]);

      const result = await service.createPublic('rest-1', validDto);

      expect(result.departmentsSent).toEqual({});
      expect(telegram.sendMessage).not.toHaveBeenCalled();
    });

    it('should track failed telegram sends', async () => {
      prisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      prisma.booking.findUnique.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue(mockBooking);
      departments.findActive.mockResolvedValue([mockDepartment]);
      telegram.sendMessage.mockRejectedValue(new Error('Failed'));

      const result = await service.createPublic('rest-1', validDto);

      expect(result.departmentsSent?.kitchen).toBe(false);
    });

    it('should throw when restaurant missing', async () => {
      jest.clearAllMocks();
      prisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.createPublic('rest-1', validDto),
      ).rejects.toThrow('Restaurant missing');
    });
  });

  describe('findAllForAdmin', () => {
    it('should return bookings for restaurant', async () => {
      const bookings = [mockBooking];
      prisma.booking.findMany.mockResolvedValue(bookings);

      const result = await service.findAllForAdmin('rest-1');

      expect(result).toEqual(bookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: { restaurantId: 'rest-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update booking status', async () => {
      prisma.booking.update.mockResolvedValue({ ...mockBooking, status: 'CONFIRMED' });

      const result = await service.updateStatus('rest-1', 'booking-1', 'CONFIRMED');

      expect(result.status).toBe('CONFIRMED');
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1', restaurantId: 'rest-1' },
        data: { status: 'CONFIRMED' },
      });
    });
  });
});