import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    const links = await this.prisma.userRestaurant.findMany({
      where: { userId },
      include: { restaurant: true },
      orderBy: { restaurant: { name: 'asc' } },
    });
    return links.map((l) => ({
      id: l.restaurant.id,
      name: l.restaurant.name,
      slug: l.restaurant.slug,
      role: l.role,
    }));
  }
}
