import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { DepartmentsService } from '../departments/departments.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, Department } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
    private departmentsService: DepartmentsService,
  ) {}

  private async nextOrderNumber(restaurantId: string): Promise<string> {
    for (let i = 0; i < 8; i++) {
      const num =
        Date.now().toString(36).toUpperCase().slice(-5) +
        Math.random().toString(36).substring(2, 6).toUpperCase();
      const exists = await this.prisma.booking.findUnique({
        where: {
          restaurantId_orderNumber: { restaurantId, orderNumber: num },
        },
      });
      if (!exists) return num;
    }
    throw new Error('Could not allocate order number');
  }

  async createPublic(restaurantId: string, dto: CreateBookingDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new Error('Restaurant missing');
    return this.create(restaurantId, dto);
  }

  async create(restaurantId: string, dto: CreateBookingDto) {
    const orderNumber = await this.nextOrderNumber(restaurantId);
    const receiptText = this.buildReceipt(dto);
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    const itemsJson = dto.lines && dto.lines.length > 0 ? { lines: dto.lines } : null;

    const booking = await this.prisma.booking.create({
      data: {
        restaurantId,
        orderNumber,
        guestName: dto.guestName,
        phone: dto.phone,
        email: dto.email ?? null,
        scheduledAt,
        partySize: dto.partySize ?? 1,
        comment: dto.comment ?? null,
        itemsJson: itemsJson as any,
        receiptText,
      },
    });

    const departmentsSent: Record<string, boolean> = {};
    const departments = await this.departmentsService.findActive(restaurantId);

    for (const dept of departments) {
      const sent = await this.sendToDepartment(dept, receiptText);
      departmentsSent[dept.type.toLowerCase()] = sent;
    }

    if (Object.keys(departmentsSent).length > 0) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { departmentsSent: JSON.stringify(departmentsSent) },
      });
    }

    return {
      id: booking.id,
      orderNumber: booking.orderNumber,
      receiptText,
      departmentsSent,
    };
  }

  async findAllForAdmin(restaurantId: string) {
    return this.prisma.booking.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(restaurantId: string, id: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id, restaurantId },
      data: { status },
    });
  }

  private async sendToDepartment(dept: Department, receiptText: string): Promise<boolean> {
    if (dept.telegramChatId?.trim()) {
      try {
        await this.telegram.sendMessage(dept.telegramChatId.trim(), receiptText);
        return true;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`Telegram send to department ${dept.id}: ${msg}`);
        return false;
      }
    }
    if (dept.printerIp) {
      console.log(`[PRINTER] Would send to ${dept.printerIp}:${dept.printerPort}`);
      return true;
    }
    return false;
  }

  private buildReceipt(dto: CreateBookingDto): string {
    const lines: string[] = [];
    lines.push(`Заказ #${Date.now().toString(36).toUpperCase()}`);
    lines.push('');
    if (dto.guestName) lines.push(`Гость: ${dto.guestName}`);
    if (dto.phone) lines.push(`Тел: ${dto.phone}`);
    if (dto.email) lines.push(`Email: ${dto.email}`);
    if (dto.partySize) lines.push(`Гостей: ${dto.partySize}`);
    if (dto.scheduledAt) lines.push(`Дата: ${new Date(dto.scheduledAt).toLocaleString('ru')}`);
    if (dto.comment) lines.push(`Комментарий: ${dto.comment}`);
    if (dto.lines && dto.lines.length > 0) {
      lines.push('');
      lines.push('Заказ:');
      for (const item of dto.lines) {
        lines.push(`${item.quantity} x ${item.name} — ${item.unitPrice} ₸`);
      }
      const total = dto.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
      lines.push('');
      lines.push(`Итого: ${total} ₸`);
    }
    return lines.join('\n');
  }
}