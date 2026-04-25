import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { RequestMethod, Logger, ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS for frontend (Permissive for debugging)
  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // 2. Set global prefix to match frontend expectations
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  // 3. Global Pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT || 3005;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`Backend running on http://0.0.0.0:${port}/api/v1`);
}
bootstrap();
