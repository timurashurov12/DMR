import { IsIn } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED'])
  status!: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
