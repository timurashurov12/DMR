import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiPropertyOptional } from '@nestjs/swagger';
import { TranslateService } from './translate.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { BulkTranslateDto } from '../common/dto/bulk-translate.dto';

export class TranslateBodyDto {
  @ApiPropertyOptional({ description: 'Языки для перевода', type: [String] })
  targetLocales?: string[];
}

@ApiTags('Admin / Translate')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RestaurantAccessGuard)
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post('menu-types/bulk-translate')
  bulkTranslateMenuTypes(
    @AdminRestaurantId() restaurantId: string,
    @Body() body: BulkTranslateDto,
  ) {
    return this.translateService.bulkTranslateMenuTypes(body.ids, restaurantId, body.targetLocales);
  }

  @Post('menu-types/:id/translate')
  translateMenuType(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body?: TranslateBodyDto,
  ) {
    return this.translateService.translateMenuType(id, restaurantId, body?.targetLocales);
  }

  @Post('categories/bulk-translate')
  bulkTranslateCategories(
    @AdminRestaurantId() restaurantId: string,
    @Body() body: BulkTranslateDto,
  ) {
    return this.translateService.bulkTranslateCategories(body.ids, restaurantId, body.targetLocales);
  }

  @Post('categories/:id/translate')
  translateCategory(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body?: TranslateBodyDto,
  ) {
    return this.translateService.translateCategory(id, restaurantId, body?.targetLocales);
  }

  @Post('menu-items/bulk-translate')
  bulkTranslateMenuItems(
    @AdminRestaurantId() restaurantId: string,
    @Body() body: BulkTranslateDto,
  ) {
    return this.translateService.bulkTranslateMenuItems(body.ids, restaurantId, body.targetLocales);
  }

  @Post('menu-items/:id/translate')
  translateMenuItem(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body?: TranslateBodyDto,
  ) {
    return this.translateService.translateMenuItem(id, restaurantId, body?.targetLocales);
  }
}
