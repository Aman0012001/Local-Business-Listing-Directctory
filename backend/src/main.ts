import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // 1. Production-Ready CORS
    // Using origin: true as requested to avoid preflight 404s and match Netlify dynamically
    app.enableCors({
        origin: true, 
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
    });

    // 2. Global API Prefix
    app.setGlobalPrefix('api/v1');

    // 3. Global Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // 4. Port and Host for Railway
    const port = process.env.PORT || configService.get('PORT') || 3001;
    
    // Listening on 0.0.0.0 is mandatory for Railway
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 API is running on: http://0.0.0.0:${port}/api/v1`);
}

bootstrap();