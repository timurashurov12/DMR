import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

const LOCALE_NAMES: Record<string, string> = {
  ru: 'Russian',
  en: 'English',
  kk: 'Kazakh',
};

type TranslateProvider = 'groq' | 'gemini';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

@Injectable()
export class TranslateService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  /** Провайдер: TRANSLATE_PROVIDER=groq|gemini; по умолчанию Groq при наличии GROQ_API_KEY */
  private getProvider(): TranslateProvider {
    const force = this.config.get<string>('TRANSLATE_PROVIDER')?.trim()?.toLowerCase();
    if (force === 'groq' || force === 'gemini') return force as TranslateProvider;
    if (this.config.get<string>('GROQ_API_KEY')?.trim()) return 'groq';
    if (this.config.get<string>('GEMINI_API_KEY')?.trim()) return 'gemini';
    return 'groq';
  }

  private getGenAI(): GoogleGenerativeAI {
    if (this.genAI) return this.genAI;
    const key = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!key) {
      throw new BadRequestException(
        'Перевод недоступен: не задан GEMINI_API_KEY в .env',
      );
    }
    this.genAI = new GoogleGenerativeAI(key);
    return this.genAI;
  }

  private buildTranslatePrompt(sourceLang: string, targetLang: string, text: string): string {
    return `You are a restaurant menu translator. Translate the following text from ${sourceLang} to ${targetLang}. 
Keep the tone neutral and suitable for a menu. For dish names use established equivalents where they exist (e.g. Borscht), otherwise transliterate.
Return ONLY the translation, no explanations.

Text to translate:
${text}`;
  }

  private async translateViaGroq(text: string, sourceLocale: string, targetLocale: string): Promise<string> {
    const key = this.config.get<string>('GROQ_API_KEY')?.trim();
    if (!key) throw new BadRequestException('Перевод: задайте GROQ_API_KEY в .env (бесплатный ключ: console.groq.com)');
    const sourceLang = LOCALE_NAMES[sourceLocale] || sourceLocale;
    const targetLang = LOCALE_NAMES[targetLocale] || targetLocale;
    const prompt = this.buildTranslatePrompt(sourceLang, targetLang, text);
    const res = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Groq ${res.status}: ${body}`);
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim() ?? '';
    return content;
  }

  private async translateViaGemini(text: string, sourceLocale: string, targetLocale: string): Promise<string> {
    const genAI = this.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const sourceLang = LOCALE_NAMES[sourceLocale] || sourceLocale;
    const targetLang = LOCALE_NAMES[targetLocale] || targetLocale;
    const prompt = this.buildTranslatePrompt(sourceLang, targetLang, text);
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    const translated = result.response.text()?.trim() ?? '';
    return translated;
  }

  async translate(text: string, sourceLocale: string, targetLocale: string): Promise<string> {
    if (!text?.trim()) return '';

    const provider = this.getProvider();
    try {
      if (provider === 'groq') return await this.translateViaGroq(text, sourceLocale, targetLocale);
      return await this.translateViaGemini(text, sourceLocale, targetLocale);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Ошибка перевода (${provider}): ${msg}`);
    }
  }

  async translateMenuType(menuTypeId: string, restaurantId: string, targetLocales?: string[]) {
    const menuType = await this.prisma.menuType.findFirst({
      where: { id: menuTypeId, menu: { restaurantId } },
      include: { translations: true, menu: true },
    });
    if (!menuType) return { translated: 0, locales: [] };

    const languages = await this.prisma.language.findMany({ orderBy: { sortOrder: 'asc' } });
    const existingLocales = new Set(menuType.translations.map((t: (typeof menuType.translations)[number]) => t.locale));
    const firstTr = menuType.translations[0];
    if (!firstTr?.name?.trim()) return { translated: 0, locales: [] };
    const sourceLocale = firstTr.locale;
    const sourceName = firstTr.name;

    const targetLangs = targetLocales?.length
      ? languages.filter((l: (typeof languages)[number]) => targetLocales.includes(l.code) && !existingLocales.has(l.code))
      : languages.filter((l: (typeof languages)[number]) => !existingLocales.has(l.code));

    const translatedLocales: string[] = [];
    for (const lang of targetLangs) {
      const name = await this.translate(sourceName, sourceLocale, lang.code);
      await this.prisma.menuTypeTranslation.create({
        data: { menuTypeId, locale: lang.code, name },
      });
      translatedLocales.push(lang.code);
    }
    invalidateMenuCache(menuTypeId, restaurantId);
    return { translated: translatedLocales.length, locales: translatedLocales };
  }

  async translateCategory(categoryId: string, restaurantId: string, targetLocales?: string[]) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, menuType: { menu: { restaurantId } } },
      include: { translations: true, menuType: true },
    });
    if (!category) return { translated: 0, locales: [] };

    const languages = await this.prisma.language.findMany({ orderBy: { sortOrder: 'asc' } });
    const existingLocales = new Set(category.translations.map((t: (typeof category.translations)[number]) => t.locale));
    const sourceTr = category.translations[0];
    if (!sourceTr?.name?.trim()) return { translated: 0, locales: [] };
    const sourceLocale = sourceTr.locale;
    const sourceName = sourceTr.name;
    const sourceDesc = sourceTr.description ?? '';

    const targetLangs = targetLocales?.length
      ? languages.filter((l: (typeof languages)[number]) => targetLocales.includes(l.code) && !existingLocales.has(l.code))
      : languages.filter((l: (typeof languages)[number]) => !existingLocales.has(l.code));

    const translatedLocales: string[] = [];
    for (const lang of targetLangs) {
      const name = await this.translate(sourceName, sourceLocale, lang.code);
      const description = sourceDesc ? await this.translate(sourceDesc, sourceLocale, lang.code) : null;
      await this.prisma.categoryTranslation.create({
        data: { categoryId, locale: lang.code, name, description },
      });
      translatedLocales.push(lang.code);
    }
    invalidateMenuCache(category.menuTypeId, restaurantId);
    return { translated: translatedLocales.length, locales: translatedLocales };
  }

  async translateMenuItem(menuItemId: string, restaurantId: string, targetLocales?: string[]) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id: menuItemId, category: { menuType: { menu: { restaurantId } } } },
      include: { translations: true, category: { select: { menuTypeId: true } } },
    });
    if (!item) return { translated: 0, locales: [] };

    const languages = await this.prisma.language.findMany({ orderBy: { sortOrder: 'asc' } });
    const existingLocales = new Set(item.translations.map((t: (typeof item.translations)[number]) => t.locale));
    const sourceTr = item.translations[0];
    if (!sourceTr?.name?.trim()) return { translated: 0, locales: [] };
    const sourceLocale = sourceTr.locale;
    const sourceName = sourceTr.name;
    const sourceDesc = sourceTr.description ?? '';

    const targetLangs = targetLocales?.length
      ? languages.filter((l: (typeof languages)[number]) => targetLocales.includes(l.code) && !existingLocales.has(l.code))
      : languages.filter((l: (typeof languages)[number]) => !existingLocales.has(l.code));

    const translatedLocales: string[] = [];
    for (const lang of targetLangs) {
      const name = await this.translate(sourceName, sourceLocale, lang.code);
      const description = sourceDesc ? await this.translate(sourceDesc, sourceLocale, lang.code) : null;
      await this.prisma.menuItemTranslation.create({
        data: { menuItemId, locale: lang.code, name, description },
      });
      translatedLocales.push(lang.code);
    }
    invalidateMenuCache(item.category.menuTypeId, restaurantId);
    return { translated: translatedLocales.length, locales: translatedLocales };
  }

  async bulkTranslateMenuTypes(ids: string[], restaurantId: string, targetLocales?: string[]) {
    const errors: { message: string }[] = [];
    let totalNewLocales = 0;
    for (const id of ids) {
      try {
        const r = await this.translateMenuType(id, restaurantId, targetLocales);
        totalNewLocales += r.translated;
      } catch (e: unknown) {
        errors.push({
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }
    return { totalNewLocales, errors };
  }

  async bulkTranslateCategories(ids: string[], restaurantId: string, targetLocales?: string[]) {
    const errors: { message: string }[] = [];
    let totalNewLocales = 0;
    for (const id of ids) {
      try {
        const r = await this.translateCategory(id, restaurantId, targetLocales);
        totalNewLocales += r.translated;
      } catch (e: unknown) {
        errors.push({
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }
    return { totalNewLocales, errors };
  }

  async bulkTranslateMenuItems(ids: string[], restaurantId: string, targetLocales?: string[]) {
    const errors: { message: string }[] = [];
    let totalNewLocales = 0;
    for (const id of ids) {
      try {
        const r = await this.translateMenuItem(id, restaurantId, targetLocales);
        totalNewLocales += r.translated;
      } catch (e: unknown) {
        errors.push({
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }
    return { totalNewLocales, errors };
  }
}
