import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicMenuService } from './public-menu.service';
import { PublicRestaurantGuard } from '../common/guards/public-restaurant.guard';

@ApiTags('Menu Types (public)')
@Controller('menu-types')
@UseGuards(PublicRestaurantGuard)
export class PublicMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Get()
  getMenuTypes(@Req() req: Express.Request, @Query('locale') locale = 'ru') {
    return this.publicMenuService.getMenuTypes(locale, req.publicRestaurantId!);
  }
}
