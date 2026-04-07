import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuTypesService } from './menu-types.service';
import { BulkDeleteByIdsDto } from '../common/dto/bulk-delete.dto';
import { CreateMenuTypeDto, UpdateMenuTypeDto } from './dto/menu-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { multerImageOptions } from '../common/upload/multer-image.config';

@ApiTags('Admin / Menu Types')
@ApiBearerAuth('JWT-auth')
@Controller('admin/menu-types')
@UseGuards(JwtAuthGuard, RestaurantAccessGuard)
export class MenuTypesController {
  constructor(private readonly menuTypesService: MenuTypesService) {}

  @Post()
  create(@AdminRestaurantId() restaurantId: string, @Body() dto: CreateMenuTypeDto) {
    return this.menuTypesService.create(restaurantId, dto);
  }

  @Get()
  findAll(@AdminRestaurantId() restaurantId: string, @Query('menuId') menuId?: string) {
    return this.menuTypesService.findAll(restaurantId, menuId);
  }

  @Post('bulk-delete')
  bulkDelete(@AdminRestaurantId() restaurantId: string, @Body() dto: BulkDeleteByIdsDto) {
    return this.menuTypesService.bulkRemove(restaurantId, dto);
  }

  @Get(':id')
  findOne(@AdminRestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.menuTypesService.findOne(id, restaurantId);
  }

  @Patch(':id')
  update(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuTypeDto,
  ) {
    return this.menuTypesService.update(id, restaurantId, dto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', multerImageOptions('menu-type')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  async uploadImage(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Файл не загружен');
    const imagePath = `/uploads/${file.filename}`;
    return this.menuTypesService.setImagePath(id, restaurantId, imagePath);
  }

  @Delete(':id')
  remove(@AdminRestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.menuTypesService.remove(id, restaurantId);
  }
}
