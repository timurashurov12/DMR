import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { TelegramModule } from '../telegram/telegram.module';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [TelegramModule, DepartmentsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}