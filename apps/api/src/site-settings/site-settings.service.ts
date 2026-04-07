import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SiteSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: {},
      });
    }
    return {
      logoPath: settings.logoPath,
      footerText: settings.footerText,
      siteName: settings.siteName,
      contactText: settings.contactText,
    };
  }

  async updateLogo(logoPath: string | null) {
    let settings = await this.prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: { logoPath },
      });
    } else {
      settings = await this.prisma.siteSettings.update({
        where: { id: settings.id },
        data: { logoPath },
      });
    }
    return {
      logoPath: settings.logoPath,
      footerText: settings.footerText,
      siteName: settings.siteName,
      contactText: settings.contactText,
    };
  }

  async updateSettings(data: {
    logoPath?: string | null;
    footerText?: string | null;
    siteName?: string | null;
    contactText?: string | null;
  }) {
    let settings = await this.prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.siteSettings.create({
        data: {
          logoPath: data.logoPath ?? null,
          footerText: data.footerText ?? null,
          siteName: data.siteName ?? null,
          contactText: data.contactText ?? null,
        },
      });
    } else {
      const update: {
        logoPath?: string | null;
        footerText?: string | null;
        siteName?: string | null;
        contactText?: string | null;
      } = {};
      if (data.logoPath !== undefined) update.logoPath = data.logoPath;
      if (data.footerText !== undefined) update.footerText = data.footerText;
      if (data.siteName !== undefined) update.siteName = data.siteName;
      if (data.contactText !== undefined) update.contactText = data.contactText;
      settings = await this.prisma.siteSettings.update({
        where: { id: settings.id },
        data: update,
      });
    }
    return {
      logoPath: settings.logoPath,
      footerText: settings.footerText,
      siteName: settings.siteName,
      contactText: settings.contactText,
    };
  }
}
