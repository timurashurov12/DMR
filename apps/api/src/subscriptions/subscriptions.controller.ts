import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RestaurantAccessGuard)
@Controller('admin/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить информацию о подписке' })
  async getSubscription(@AdminRestaurantId() restaurantId: string) {
    return this.subscriptionsService.getSubscription(restaurantId);
  }

  @Patch('plan')
  @ApiOperation({ summary: 'Обновить план подписки' })
  async updatePlan(
    @AdminRestaurantId() restaurantId: string,
    @Body() body: { plan: 'FREE' | 'STARTER' | 'PRO' },
  ) {
    return this.subscriptionsService.updatePlan(restaurantId, body.plan);
  }

  @Patch('trial')
  @ApiOperation({ summary: 'Активировать trial' })
  async activateTrial(
    @AdminRestaurantId() restaurantId: string,
    @Body() body: { days?: number },
  ) {
    return this.subscriptionsService.activateTrial(restaurantId, body.days);
  }
}