import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PublicRestaurantGuard } from '../common/guards/public-restaurant.guard';
import { RestaurantsService } from './restaurants.service';
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

  @Get(':restaurantId/domains')
  getDomains(@Param('restaurantId') restaurantId: string) {
    return this.restaurantsService.getDomains(restaurantId);
  }

  @Post(':restaurantId/domains')
  addDomain(
    @Param('restaurantId') restaurantId: string,
    @Body() body: { host: string },
  ) {
    return this.restaurantsService.addDomain(restaurantId, body.host);
  }

  @Delete(':restaurantId/domains/:host')
  removeDomain(
    @Param('restaurantId') restaurantId: string,
    @Param('host') host: string,
  ) {
    return this.restaurantsService.removeDomain(restaurantId, host);
  }
}

@ApiTags('Restaurants (public)')
@Controller('restaurants')
@UseGuards(PublicRestaurantGuard)
export class PublicRestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  list() {
    return this.restaurantsService.listPublic();
  }

  @Get('current')
  getCurrent(@Req() req: Request & { publicRestaurantId: string | null }) {
    return this.restaurantsService.getPublicById(req.publicRestaurantId);
  }
}
