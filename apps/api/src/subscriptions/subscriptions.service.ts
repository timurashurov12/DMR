import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getSubscription(restaurantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { restaurantId },
    });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    return subscription;
  }

  async updatePlan(restaurantId: string, plan: SubscriptionPlan) {
    return this.prisma.subscription.update({
      where: { restaurantId },
      data: { plan },
    });
  }

  async activateTrial(restaurantId: string, days: number = 14) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + days);

    return this.prisma.subscription.update({
      where: { restaurantId },
      data: {
        trialEndsAt,
        plan: 'FREE',
      },
    });
  }
}