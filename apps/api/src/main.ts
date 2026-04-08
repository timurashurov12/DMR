import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Корневой .env: при cwd=apps/api загружаем корень (cwd/../../.env), иначе cwd/.env
const cwd = process.cwd();
const rootFromApi = join(cwd, '..', '..', '.env');
const rootFromRoot = join(cwd, '.env');
if (existsSync(rootFromRoot)) config({ path: rootFromRoot });
// при запуске из apps/api подгружаем корень репо, чтобы GEMINI_API_KEY и др. были доступны
if (cwd.includes('apps/api') && existsSync(rootFromApi)) config({ path: rootFromApi, override: true });

// На Vercel (serverless) каталог деплоя только на чтение; пишем только в /tmp.
const UPLOADS_DIR =
  process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? join('/tmp', 'dmr-uploads')
    : join(process.cwd(), 'uploads');

async function bootstrap() {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads/' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const defaultOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
  ];
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }
      if (defaultOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(null, true);
    },
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DMR API')
    .setDescription('Digital Menu Restaurant — API для меню и настроек')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT || process.env.API_PORT || 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/api`);
  if (process.env.TRANSLATE_PROVIDER?.trim()) {
    console.log(`Translate: ${process.env.TRANSLATE_PROVIDER}`);
  } else if (process.env.GROQ_API_KEY?.trim()) {
    console.log('Translate: Groq');
  } else if (process.env.GEMINI_API_KEY?.trim()) {
    console.log('Translate: Gemini');
  } else {
    console.log('Translate: задайте GROQ_API_KEY или GEMINI_API_KEY');
  }
}
bootstrap();
