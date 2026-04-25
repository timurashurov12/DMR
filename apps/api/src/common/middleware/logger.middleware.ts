import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, path } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      if (statusCode < 400) {
        this.logger.log(`${method} ${path} → ${statusCode} (${duration}ms)`);
      } else if (statusCode < 500) {
        this.logger.warn(`${method} ${path} → ${statusCode} (${duration}ms)`);
      } else {
        this.logger.error(`${method} ${path} → ${statusCode} (${duration}ms)`);
      }
    });

    next();
  }
}
