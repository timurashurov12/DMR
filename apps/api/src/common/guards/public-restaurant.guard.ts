import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

declare global {
  namespace Express {
    interface Request {
      publicRestaurantId?: string | null;
    }
  }
}

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
      req.publicRestaurantId = null;
      return true;
    }
    const row = await this.prisma.restaurantDomain.findUnique({
      where: { host },
    });
    if (row) {
      req.publicRestaurantId = row.restaurantId;
    } else {
      req.publicRestaurantId = null;
    }
    return true;
  }
}
