import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  BulkUpdateMenuItemDto,
  BulkDeleteMenuItemDto,
} from './dto/menu-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin / Menu Items')
@ApiBearerAuth('JWT-auth')
@Controller('admin/menu-items')
@UseGuards(JwtAuthGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuItemsService.create(dto);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.menuItemsService.findAll(categoryId);
  }

  @Patch('bulk')
  bulkUpdate(@Body() dto: BulkUpdateMenuItemDto) {
    return this.menuItemsService.bulkUpdate(dto);
  }

  @Post('bulk-delete')
  bulkDelete(@Body() dto: BulkDeleteMenuItemDto) {
    return this.menuItemsService.bulkDelete(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuItemsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }
}
