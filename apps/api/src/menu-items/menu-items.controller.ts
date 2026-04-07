import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuItemsService } from './menu-items.service';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  BulkUpdateMenuItemDto,
  BulkDeleteMenuItemDto,
  QueryMenuItemsDto,
} from './dto/menu-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { multerImageOptions } from '../common/upload/multer-image.config';

@ApiTags('Admin / Menu Items')
@ApiBearerAuth('JWT-auth')
@Controller('admin/menu-items')
@UseGuards(JwtAuthGuard, RestaurantAccessGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  create(@AdminRestaurantId() restaurantId: string, @Body() dto: CreateMenuItemDto) {
    return this.menuItemsService.create(restaurantId, dto);
  }

  @Get()
  findAll(@AdminRestaurantId() restaurantId: string, @Query() query: QueryMenuItemsDto) {
    return this.menuItemsService.findAllPaginated(restaurantId, query);
  }

  @Patch('bulk')
  bulkUpdate(@AdminRestaurantId() restaurantId: string, @Body() dto: BulkUpdateMenuItemDto) {
    return this.menuItemsService.bulkUpdate(restaurantId, dto);
  }

  @Post('bulk-delete')
  bulkDelete(@AdminRestaurantId() restaurantId: string, @Body() dto: BulkDeleteMenuItemDto) {
    return this.menuItemsService.bulkDelete(restaurantId, dto);
  }

  @Get(':id')
  findOne(@AdminRestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.menuItemsService.findOne(id, restaurantId);
  }

  @Patch(':id')
  update(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, restaurantId, dto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', multerImageOptions('menu-item')))
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
    return this.menuItemsService.setImagePath(id, restaurantId, imagePath);
  }

  @Delete(':id')
  remove(@AdminRestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.menuItemsService.remove(id, restaurantId);
  }
}
