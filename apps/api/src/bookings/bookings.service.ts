import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
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

  private formatReceipt(params: {
    restaurantName: string;
    orderNumber: string;
    dto: CreateBookingDto;
    createdAt: Date;
  }): string {
    const { restaurantName, orderNumber, dto, createdAt } = params;
    const lines: string[] = [];
    lines.push(`Новый заказ №${orderNumber}`);
    lines.push(`Ресторан: ${restaurantName}`);
    lines.push(`Дата: ${createdAt.toLocaleString('ru-RU')}`);
    lines.push(`Гость: ${dto.guestName}`);
    lines.push(`Телефон: ${dto.phone}`);
    if (dto.email) lines.push(`Email: ${dto.email}`);
    if (dto.scheduledAt) lines.push(`Время: ${new Date(dto.scheduledAt).toLocaleString('ru-RU')}`);
    lines.push(`Гостей: ${dto.partySize ?? 1}`);
    if (dto.comment) lines.push(`Комментарий: ${dto.comment}`);
    if (dto.lines?.length) {
      lines.push('');
      lines.push('Позиции:');
      let sum = 0;
      for (const l of dto.lines) {
        const lineSum = l.quantity * l.unitPrice;
        sum += lineSum;
        lines.push(`• ${l.name} × ${l.quantity} = ${lineSum}`);
      }
      lines.push(`Итого: ${sum}`);
    }
    return lines.join('\n');
  }

  async createPublic(restaurantId: string, dto: CreateBookingDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new Error('Restaurant missing');

    const orderNumber = await this.nextOrderNumber(restaurantId);
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    const itemsJson: Prisma.InputJsonValue | undefined = dto.lines?.length
      ? ({ lines: dto.lines.map((l) => ({ ...l })) } as Prisma.InputJsonValue)
      : undefined;

    const receiptText = this.formatReceipt({
      restaurantName: restaurant.name,
      orderNumber,
      dto,
      createdAt: new Date(),
    });

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
        itemsJson,
        receiptText,
      },
    });

    const settings = await this.prisma.siteSettings.findUnique({
      where: { restaurantId },
    });

    const send = async (chatId: string | null | undefined) => {
      if (!chatId?.trim()) return;
      try {
        await this.telegram.sendMessage(chatId.trim(), receiptText);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`Telegram send failed for restaurant ${restaurantId}: ${msg}`);
      }
    };

    await send(settings?.ownerTelegramChatId);
    await send(settings?.staffTelegramChatId);

    return {
      id: booking.id,
      orderNumber: booking.orderNumber,
      receiptText,
    };
  }

  async findAllForAdmin(restaurantId: string) {
    return this.prisma.booking.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async updateStatus(
    restaurantId: string,
    id: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  ) {
    return this.prisma.booking.updateMany({
      where: { id, restaurantId },
      data: { status },
    });
  }
}
