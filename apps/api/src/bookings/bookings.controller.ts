import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PublicRestaurantGuard } from '../common/guards/public-restaurant.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('Bookings')
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('bookings')
  @UseGuards(PublicRestaurantGuard)
  createPublic(@Req() req: Express.Request, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createPublic(req.publicRestaurantId!, dto);
  }

  @Get('admin/bookings')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RestaurantAccessGuard)
  findAll(@AdminRestaurantId() restaurantId: string) {
    return this.bookingsService.findAllForAdmin(restaurantId);
  }

  @Patch('admin/bookings/:id/status')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RestaurantAccessGuard)
  updateStatus(
    @AdminRestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(restaurantId, id, body.status);
  }
}
