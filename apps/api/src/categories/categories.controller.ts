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
import { CategoriesService } from './categories.service';
import { BulkDeleteByIdsDto } from '../common/dto/bulk-delete.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { multerImageOptions } from '../common/upload/multer-image.config';

@ApiTags('Admin / Categories')
@ApiBearerAuth('JWT-auth')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RestaurantAccessGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@AdminRestaurantId() restaurantId: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(restaurantId, dto);
  }

  @Get()
  findAll(@AdminRestaurantId() restaurantId: string, @Query('menuTypeId') menuTypeId?: string) {
    return this.categoriesService.findAll(restaurantId, menuTypeId);
  }

  @Post('bulk-delete')
  bulkDelete(@AdminRestaurantId() restaurantId: string, @Body() dto: BulkDeleteByIdsDto) {
    return this.categoriesService.bulkRemove(restaurantId, dto);
  }

  @Get(':id')
  findOne(@AdminRestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.categoriesService.findOne(id, restaurantId);
  }

  @Patch(':id')
  update(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, restaurantId, dto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', multerImageOptions('category')))
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
    return this.categoriesService.setImagePath(id, restaurantId, imagePath);
  }

  @Delete(':id')
  remove(@AdminRestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.categoriesService.remove(id, restaurantId);
  }
}
