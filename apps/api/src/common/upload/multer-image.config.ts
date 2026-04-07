import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

const UPLOAD_DIR = 'uploads';
const ALLOWED_MIMES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
];

export function multerImageOptions(prefix: string) {
  return {
    storage: diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname) || '.png';
        cb(null, `${prefix}-${Date.now()}${ext}`);
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (
      _req: unknown,
      file: { mimetype: string },
      cb: (err: BadRequestException | null, accept: boolean) => void,
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
}
