import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicMenuService } from './public-menu.service';

@ApiTags('Menu Types (public)')
@Controller('menu-types')
export class PublicMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Get()
  getMenuTypes(@Query('locale') locale = 'ru') {
    return this.publicMenuService.getMenuTypes(locale);
  }
}
