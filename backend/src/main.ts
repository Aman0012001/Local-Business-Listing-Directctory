import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // ✅ ROBUST CORS CONFIGURATION
    const corsOrigins = configService.get('CORS_ORIGIN');
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://naampata.com',
        'https://www.naampata.com',
        'https://naampata-admin.netlify.app',
        'https://naampata-frontend.netlify.app',
        ...(corsOrigins ? (corsOrigins.includes(',') ? corsOrigins.split(',') : [corsOrigins]) : [])
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

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    const port = process.env.PORT || configService.get('PORT') || 3001;
    
    // Binding to 0.0.0.0 is mandatory for Railway
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Server is running on: http://0.0.0.0:${port}/api/v1`);
}
bootstrap();