import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { SiteSettingsService } from './site-settings.service';

@ApiTags('Admin / Site Settings')
@ApiBearerAuth('JWT-auth')
@Controller('admin/site-settings')
@UseGuards(JwtAuthGuard, RestaurantAccessGuard)
export class SiteSettingsAdminController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  getAdmin(@AdminRestaurantId() restaurantId: string) {
    return this.siteSettingsService.getAdmin(restaurantId);
  }
}
