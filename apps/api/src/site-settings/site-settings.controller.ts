import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PublicRestaurantGuard } from '../common/guards/public-restaurant.guard';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AdminRestaurantId } from '../common/decorators/admin-restaurant.decorator';
import { SiteSettingsService } from './site-settings.service';

const UPLOAD_DIR = 'uploads';
const ALLOWED_MIMES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
];

export const multerLogoOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname) || '.png';
      cb(null, `logo-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (
    _req: unknown,
    file: { mimetype: string },
    cb: (arg0: BadRequestException | null, arg1: boolean) => void,
  ) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
    else
      cb(
        new BadRequestException(
          'Недопустимый тип файла. Разрешены: PNG, JPEG, SVG, WebP',
        ),
        false,
      );
  },
};

@ApiTags('Site Settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  @UseGuards(PublicRestaurantGuard)
  getPublic(@Req() req: Express.Request) {
    return this.siteSettingsService.getPublic(req.publicRestaurantId!);
  }

  @Patch()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RestaurantAccessGuard)
  updateSettings(
    @AdminRestaurantId() restaurantId: string,
    @Body()
    body: {
      logoPath?: string | null;
      footerText?: string | null;
      siteName?: string | null;
      contactText?: string | null;
      ownerTelegramChatId?: string | null;
      staffTelegramChatId?: string | null;
    },
  ) {
    return this.siteSettingsService.updateSettings(restaurantId, body);
  }

  @Post('logo')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RestaurantAccessGuard)
  @UseInterceptors(FileInterceptor('file', multerLogoOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async uploadLogo(
    @AdminRestaurantId() restaurantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Файл не загружен');
    const logoPath = `/${UPLOAD_DIR}/${file.filename}`;
    return this.siteSettingsService.updateLogo(restaurantId, logoPath);
  }
}
