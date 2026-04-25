import { existsSync } from 'fs';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantScopeModule } from './common/scope/restaurant-scope.module';
import { AuthModule } from './auth/auth.module';
import { MenuTypesModule } from './menu-types/menu-types.module';
import { CategoriesModule } from './categories/categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { LanguagesModule } from './languages/languages.module';
import { PublicMenuModule } from './public-menu/public-menu.module';
import { TranslateModule } from './translate/translate.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenusModule } from './menus/menus.module';
import { BookingsModule } from './bookings/bookings.module';
import { TelegramModule } from './telegram/telegram.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { DepartmentsModule } from './departments/departments.module';

const cwd = process.cwd();
const envCandidates = [
  join(cwd, '..', '..', '.env'),
  join(cwd, '.env'),
  join(cwd, '..', '.env'),
];
const envFilePath = envCandidates.find((p) => existsSync(p));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    PrismaModule,
    RestaurantScopeModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    MenusModule,
    LanguagesModule,
    MenuTypesModule,
    CategoriesModule,
    MenuItemsModule,
    PublicMenuModule,
    TranslateModule,
    SiteSettingsModule,
    BookingsModule,
    TelegramModule,
    SubscriptionsModule,
    DepartmentsModule,
  ],
})
export class AppModule {}