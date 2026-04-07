import { Global, Module } from '@nestjs/common';
import { RestaurantScopeService } from './restaurant-scope.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RestaurantAccessGuard } from '../guards/restaurant-access.guard';
import { PublicRestaurantGuard } from '../guards/public-restaurant.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RestaurantScopeService, RestaurantAccessGuard, PublicRestaurantGuard],
  exports: [RestaurantScopeService, RestaurantAccessGuard, PublicRestaurantGuard],
})
export class RestaurantScopeModule {}
