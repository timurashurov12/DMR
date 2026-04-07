import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicMenuService } from './public-menu.service';

@ApiTags('Menu (public)')
@Controller('menu')
export class PublicMenuMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Get()
  async getMenu(
    @Query('menuTypeId') menuTypeId?: string,
    @Query('type') typeCode?: string,
    @Query('locale') locale = 'ru',
  ) {
    if (menuTypeId) {
      return this.publicMenuService.getMenu(menuTypeId, locale);
    }
    if (typeCode) {
      const data = await this.publicMenuService.getMenuByCode(typeCode, locale);
      if (!data) return [];
      return data;
    }
    return [];
  }
}
