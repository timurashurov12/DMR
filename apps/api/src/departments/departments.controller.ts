import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { DepartmentsService } from './departments.service';
import { DepartmentType } from '@prisma/client';

@ApiTags('Admin / Departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RestaurantAccessGuard)
@Controller('admin/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll(@AdminRestaurantId() restaurantId: string) {
    return this.departmentsService.findAll(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  create(
    @AdminRestaurantId() restaurantId: string,
    @Body() body: { name: string; type: DepartmentType; telegramChatId?: string; printerIp?: string; printerPort?: number },
  ) {
    return this.departmentsService.create(restaurantId, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; type?: DepartmentType; telegramChatId?: string; isActive?: boolean; sortOrder?: number },
  ) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}