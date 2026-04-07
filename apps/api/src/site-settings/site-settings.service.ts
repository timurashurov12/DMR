import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteSettingsService {
  constructor(private prisma: PrismaService) {}

  async getPublic(restaurantId: string) {
    let settings = await this.prisma.siteSettings.findUnique({
      where: { restaurantId },
    });
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: { restaurantId },
      });
    }
    return {
      logoPath: settings.logoPath,
      footerText: settings.footerText,
      siteName: settings.siteName,
      contactText: settings.contactText,
    };
  }

  async getAdmin(restaurantId: string) {
    let settings = await this.prisma.siteSettings.findUnique({
      where: { restaurantId },
    });
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: { restaurantId },
      });
    }
    return {
      logoPath: settings.logoPath,
      footerText: settings.footerText,
      siteName: settings.siteName,
      contactText: settings.contactText,
      ownerTelegramChatId: settings.ownerTelegramChatId,
      staffTelegramChatId: settings.staffTelegramChatId,
    };
  }

  async updateLogo(restaurantId: string, logoPath: string | null) {
    let settings = await this.prisma.siteSettings.findUnique({
      where: { restaurantId },
    });
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: { restaurantId, logoPath },
      });
    } else {
      settings = await this.prisma.siteSettings.update({
        where: { id: settings.id },
        data: { logoPath },
      });
    }
    return this.getAdmin(restaurantId);
  }

  async updateSettings(
    restaurantId: string,
    data: {
      logoPath?: string | null;
      footerText?: string | null;
      siteName?: string | null;
      contactText?: string | null;
      ownerTelegramChatId?: string | null;
      staffTelegramChatId?: string | null;
    },
  ) {
    let settings = await this.prisma.siteSettings.findUnique({
      where: { restaurantId },
    });
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: {
          restaurantId,
          logoPath: data.logoPath ?? null,
          footerText: data.footerText ?? null,
          siteName: data.siteName ?? null,
          contactText: data.contactText ?? null,
          ownerTelegramChatId: data.ownerTelegramChatId ?? null,
          staffTelegramChatId: data.staffTelegramChatId ?? null,
        },
      });
    } else {
      const update: Record<string, string | null | undefined> = {};
      if (data.logoPath !== undefined) update.logoPath = data.logoPath;
      if (data.footerText !== undefined) update.footerText = data.footerText;
      if (data.siteName !== undefined) update.siteName = data.siteName;
      if (data.contactText !== undefined) update.contactText = data.contactText;
      if (data.ownerTelegramChatId !== undefined) update.ownerTelegramChatId = data.ownerTelegramChatId;
      if (data.staffTelegramChatId !== undefined) update.staffTelegramChatId = data.staffTelegramChatId;
      settings = await this.prisma.siteSettings.update({
        where: { id: settings.id },
        data: update,
      });
    }
    return this.getAdmin(restaurantId);
  }
}
