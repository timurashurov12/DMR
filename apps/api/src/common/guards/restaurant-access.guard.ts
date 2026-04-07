import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RestaurantAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user;
    if (!user?.id) {
      throw new ForbiddenException();
    }
    const raw = req.headers['x-restaurant-id'] as string | undefined;
    const restaurantId = raw?.trim();
    if (!restaurantId) {
      throw new BadRequestException('Header X-Restaurant-Id is required');
    }
    const link = await this.prisma.userRestaurant.findUnique({
      where: {
        userId_restaurantId: { userId: user.id, restaurantId },
      },
    });
    if (!link) {
      throw new ForbiddenException('No access to this restaurant');
    }
    req.restaurantId = restaurantId;
    return true;
  }
}
