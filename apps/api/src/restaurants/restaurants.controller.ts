import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantsService } from './restaurants.service';
import { Req } from '@nestjs/common';
import type { Request } from 'express';

@ApiTags('Admin / Restaurants')
@ApiBearerAuth('JWT-auth')
@Controller('admin/restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  list(@Req() req: Request & { user: { id: string } }) {
    return this.restaurantsService.listForUser(req.user.id);
  }
}
