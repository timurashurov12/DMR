import { existsSync } from 'fs';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MenuTypesModule } from './menu-types/menu-types.module';
import { CategoriesModule } from './categories/categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { LanguagesModule } from './languages/languages.module';
import { PublicMenuModule } from './public-menu/public-menu.module';
import { TranslateModule } from './translate/translate.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { UsersModule } from './users/users.module';

// Корневой .env: при cwd=apps/api — cwd/../../.env, при cwd=корень — cwd/.env
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
    AuthModule,
    UsersModule,
    LanguagesModule,
    MenuTypesModule,
    CategoriesModule,
    MenuItemsModule,
    PublicMenuModule,
    TranslateModule,
    SiteSettingsModule,
  ],
})
export class AppModule {}
