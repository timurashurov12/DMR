import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { TelegramService } from './telegram.service';

/** Minimal Telegram Update shape for /start handling */
type TelegramMessage = {
  message_id?: number;
  chat?: { id: number; type?: string };
  from?: { id: number };
  text?: string;
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
};

@Injectable()
export class TelegramUpdatesService {
  private readonly log = new Logger(TelegramUpdatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly siteSettings: SiteSettingsService,
    private readonly telegram: TelegramService,
  ) {}

  async handleUpdate(raw: unknown): Promise<void> {
    const update = raw as TelegramUpdate;
    const msg = update.message ?? update.edited_message;
    if (!msg?.text) return;

    const text = msg.text.trim();
    if (!text.startsWith('/start')) return;

    const chatId = msg.chat?.id;
    if (chatId == null) return;

    const chatIdStr = String(chatId);
    const parts = text.split(/\s+/);
    const payload = parts[1];

    if (payload?.startsWith('owner_')) {
      const restaurantId = payload.slice('owner_'.length).trim();
      if (!restaurantId) {
        await this.safeReply(
          chatIdStr,
          'Некорректная ссылка. Откройте бота из раздела «Настройки» админки.',
        );
        return;
      }

      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        await this.safeReply(chatIdStr, 'Ресторан не найден. Проверьте ссылку из админки.');
        return;
      }

      await this.siteSettings.updateSettings(restaurantId, {
        ownerTelegramChatId: chatIdStr,
      });

      await this.safeReply(
        chatIdStr,
        [
          `✅ Этот чат привязан к ресторану «${restaurant.name}».`,
          '',
          'Сюда будут приходить уведомления о новых онлайн-заказах и бронях (текст чека).',
          'Chat ID сохранён автоматически — вводить его вручную в админке не обязательно.',
          '',
          'Вы всегда можете отвязать чат, очистив поле «Chat ID владельца» в настройках сайта.',
        ].join('\n'),
      );
      return;
    }

    await this.safeReply(
      chatIdStr,
      [
        '👋 Здравствуйте!',
        '',
        'Чтобы получать чеки заказов в этот чат, откройте ссылку «Подключить Telegram» в админ-панели ресторана (Настройки → Telegram) и нажмите Start в открывшемся диалоге с ботом.',
        '',
        'Либо вручную укажите Chat ID в настройках — его можно узнать у бота @userinfobot или аналога.',
      ].join('\n'),
    );
  }

  private async safeReply(chatId: string, text: string): Promise<void> {
    try {
      await this.telegram.sendMessage(chatId, text);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.log.warn(`Reply failed: ${msg}`);
    }
  }
}
