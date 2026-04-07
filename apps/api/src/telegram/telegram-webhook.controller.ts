import {
  Body,
  Controller,
  ForbiddenException,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { TelegramUpdatesService } from './telegram-updates.service';

@ApiExcludeController()
@Controller('telegram')
export class TelegramWebhookController {
  private readonly log = new Logger(TelegramWebhookController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly updates: TelegramUpdatesService,
  ) {}

  /**
   * Telegram Bot API sends POST with Update JSON.
   * Optional: set webhook with secret_token and TELEGRAM_WEBHOOK_SECRET in env.
   */
  @Post('webhook')
  async webhook(@Req() req: Request, @Body() body: Record<string, unknown>) {
    const expected = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET')?.trim();
    if (expected) {
      const got = req.headers['x-telegram-bot-api-secret-token'];
      const token = typeof got === 'string' ? got : Array.isArray(got) ? got[0] : '';
      if (token !== expected) {
        this.log.warn('Webhook rejected: invalid secret token');
        throw new ForbiddenException();
      }
    }

    try {
      await this.updates.handleUpdate(body);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.log.error(`Webhook handler error: ${msg}`);
    }

    return { ok: true };
  }
}
