import { Module } from '@nestjs/common';
import { PublicMenuController } from './public-menu.controller';
import { PublicMenuMenuController } from './public-menu-menu.controller';
import { PublicMenuService } from './public-menu.service';

@Module({
  controllers: [PublicMenuController, PublicMenuMenuController],
  providers: [PublicMenuService],
})
export class PublicMenuModule {}
