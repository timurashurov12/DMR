import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

function normalizeHost(raw: string | undefined): string | null {
  if (!raw) return null;
  const h = raw.split(':')[0]?.trim().toLowerCase();
  return h || null;
}

@Injectable()
export class PublicRestaurantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const raw = (req.headers['x-forwarded-host'] || req.headers.host) as string | undefined;
    const host = normalizeHost(raw);
    if (!host) {
      throw new NotFoundException('Host header missing');
    }
    const row = await this.prisma.restaurantDomain.findUnique({
      where: { host },
    });
    if (!row) {
      throw new NotFoundException('Restaurant not found for this host');
    }
    req.publicRestaurantId = row.restaurantId;
    return true;
  }
}
