import { Module } from '@nestjs/common';
import { MenuTypesController } from './menu-types.controller';
import { MenuTypesService } from './menu-types.service';

@Module({
  controllers: [MenuTypesController],
  providers: [MenuTypesService],
  exports: [MenuTypesService],
})
export class MenuTypesModule {}
