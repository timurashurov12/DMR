import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicMenuService } from './public-menu.service';
import { PublicRestaurantGuard } from '../common/guards/public-restaurant.guard';

@ApiTags('Menu (public)')
@Controller('menu')
@UseGuards(PublicRestaurantGuard)
export class PublicMenuMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Get()
  async getMenu(
    @Req() req: Express.Request,
    @Query('menuTypeId') menuTypeId?: string,
    @Query('type') typeCode?: string,
    @Query('locale') locale = 'ru',
  ) {
    const rid = req.publicRestaurantId!;
    if (menuTypeId) {
      return this.publicMenuService.getMenu(menuTypeId, locale, rid);
    }
    if (typeCode) {
      const data = await this.publicMenuService.getMenuByCode(typeCode, locale, rid);
      if (!data) return [];
      return data;
    }
    return [];
  }
}
