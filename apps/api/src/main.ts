import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, Logger, ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'; // ✅ IMPORTANT

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // ✅ 1. GLOBAL PREFIX
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  // ✅ 2. CORS (FINAL WORKING)
  app.enableCors({
    origin: true, // 🔥 auto allow Netlify domains
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // ✅ 3. FORCE OPTIONS (CORS FIX)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS'
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Accept, Authorization'
      );
      return res.sendStatus(204);
    }
    next();
  });

  // ✅ 4. VALIDATION PIPE
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ✅ 5. PORT (Railway compatible)
  const port = parseInt(process.env.PORT || '8080', 10);

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Server running on http://0.0.0.0:${port}/api/v1`);
}

bootstrap();