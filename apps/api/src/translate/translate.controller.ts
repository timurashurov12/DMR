import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiPropertyOptional } from '@nestjs/swagger';
import { TranslateService } from './translate.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BulkTranslateDto } from '../common/dto/bulk-translate.dto';

export class TranslateBodyDto {
  @ApiPropertyOptional({ description: 'Языки для перевода', type: [String] })
  targetLocales?: string[];
}

@ApiTags('Admin / Translate')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post('menu-types/bulk-translate')
  bulkTranslateMenuTypes(@Body() body: BulkTranslateDto) {
    return this.translateService.bulkTranslateMenuTypes(body.ids, body.targetLocales);
  }

  @Post('menu-types/:id/translate')
  translateMenuType(@Param('id') id: string, @Body() body?: TranslateBodyDto) {
    return this.translateService.translateMenuType(id, body?.targetLocales);
  }

  @Post('categories/bulk-translate')
  bulkTranslateCategories(@Body() body: BulkTranslateDto) {
    return this.translateService.bulkTranslateCategories(body.ids, body.targetLocales);
  }

  @Post('categories/:id/translate')
  translateCategory(@Param('id') id: string, @Body() body?: TranslateBodyDto) {
    return this.translateService.translateCategory(id, body?.targetLocales);
  }

  @Post('menu-items/bulk-translate')
  bulkTranslateMenuItems(@Body() body: BulkTranslateDto) {
    return this.translateService.bulkTranslateMenuItems(body.ids, body.targetLocales);
  }

  @Post('menu-items/:id/translate')
  translateMenuItem(@Param('id') id: string, @Body() body?: TranslateBodyDto) {
    return this.translateService.translateMenuItem(id, body?.targetLocales);
  }
}
