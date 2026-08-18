import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PublicRestaurant = {
  id: string;
  name: string;
  slug: string | null;
  domains: string[];
};

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

  async listPublic(): Promise<PublicRestaurant[]> {
    const restaurants = await this.prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
      include: {
        domains: { select: { host: true } },
      },
    });
    return restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      domains: r.domains.map((d) => d.host),
    }));
  }

  async getPublicById(restaurantId: string | null): Promise<PublicRestaurant | null> {
    if (!restaurantId) return null;
    const r = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { domains: { select: { host: true } } },
    });
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      domains: r.domains.map((d) => d.host),
    };
  }

  async getDomains(restaurantId: string) {
    const domains = await this.prisma.restaurantDomain.findMany({
      where: { restaurantId },
      orderBy: { host: 'asc' },
    });
    return domains.map((d) => d.host);
  }

  async addDomain(restaurantId: string, host: string) {
    const normalized = host.toLowerCase().trim();
    const existing = await this.prisma.restaurantDomain.findUnique({
      where: { host: normalized },
    });
    if (existing) {
      throw new NotFoundException('Domain already exists');
    }
    const currentDomains = await this.prisma.restaurantDomain.findMany({
      where: { restaurantId },
    });
    if (currentDomains.length > 0) {
      throw new NotFoundException('Restaurant already has a domain. Delete existing first.');
    }
    const domain = await this.prisma.restaurantDomain.create({
      data: { host: normalized, restaurantId },
    });
    return domain.host;
  }

  async removeDomain(restaurantId: string, host: string) {
    const normalized = host.toLowerCase().trim();
    const domain = await this.prisma.restaurantDomain.findFirst({
      where: { host: normalized, restaurantId },
    });
    if (!domain) {
      throw new NotFoundException('Domain not found');
    }
    await this.prisma.restaurantDomain.delete({
      where: { id: domain.id },
    });
    return { success: true };
  }
}
