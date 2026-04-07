import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@ApiTags('Admin / Menus')
@ApiBearerAuth('JWT-auth')
@Controller('admin/menus')
@UseGuards(JwtAuthGuard, RestaurantAccessGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  findAll(@AdminRestaurantId() restaurantId: string) {
    return this.menusService.findAll(restaurantId);
  }

  @Get(':id')
  findOne(@AdminRestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.menusService.findOne(id, restaurantId);
  }

  @Post()
  create(@AdminRestaurantId() restaurantId: string, @Body() dto: CreateMenuDto) {
    return this.menusService.create(restaurantId, dto);
  }

  @Patch(':id')
  update(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menusService.update(id, restaurantId, dto);
  }

  @Delete(':id')
  remove(@AdminRestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.menusService.remove(id, restaurantId);
  }
}
