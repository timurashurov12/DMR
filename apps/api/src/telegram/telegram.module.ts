import { Module } from '@nestjs/common';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { TelegramService } from './telegram.service';
import { TelegramUpdatesService } from './telegram-updates.service';
import { TelegramWebhookController } from './telegram-webhook.controller';

@Module({
  imports: [SiteSettingsModule],
  controllers: [TelegramWebhookController],
  providers: [TelegramService, TelegramUpdatesService],
  exports: [TelegramService],
})
export class TelegramModule {}
