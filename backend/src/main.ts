import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // 1. CORS Configuration
    const corsOrigins = configService.get<string>('CORS_ORIGIN') || '*';
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://naampata.com',
        'https://www.naampata.com',
        'https://naampata-admin.netlify.app',
        'https://naampata-frontend.netlify.app',
        ...(corsOrigins === '*' ? [] : (corsOrigins.includes(',') ? corsOrigins.split(',') : [corsOrigins]))
    ];

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app') || origin.endsWith('.railway.app')) {
                callback(null, true);
            } else {
                logger.warn(`CORS blocked for origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
    });

    // 2. Global Configurations
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // 3. Start Server (Railway compatibility)
    const port = process.env.PORT || configService.get('PORT') || 3001;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 API is running on: http://0.0.0.0:${port}/api/v1`);
}

bootstrap();