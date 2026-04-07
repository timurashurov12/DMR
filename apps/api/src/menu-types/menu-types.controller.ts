import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MenuTypesService } from './menu-types.service';
import { BulkDeleteByIdsDto } from '../common/dto/bulk-delete.dto';
import { CreateMenuTypeDto, UpdateMenuTypeDto } from './dto/menu-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin / Menu Types')
@ApiBearerAuth('JWT-auth')
@Controller('admin/menu-types')
@UseGuards(JwtAuthGuard)
export class MenuTypesController {
  constructor(private readonly menuTypesService: MenuTypesService) {}

  @Post()
  create(@Body() dto: CreateMenuTypeDto) {
    return this.menuTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.menuTypesService.findAll();
  }

  @Post('bulk-delete')
  bulkDelete(@Body() dto: BulkDeleteByIdsDto) {
    return this.menuTypesService.bulkRemove(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuTypeDto) {
    return this.menuTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuTypesService.remove(id);
  }
}
