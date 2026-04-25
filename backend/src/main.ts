import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEntityManagerToken } from '@nestjs/typeorm';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // 1. Robust CORS Configuration
    const corsOrigins = configService.get<string>('CORS_ORIGIN') || '*';
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://naampata.com',
        'https://www.naampata.com',
        'https://naampata-admin.netlify.app',
        'https://naampata-frontend.netlify.app',
        ...(corsOrigins === '*' ? [] : (Array.isArray(corsOrigins) ? corsOrigins : [corsOrigins]))
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

    // 2. Set global prefix
    app.setGlobalPrefix('api/v1');

    // 3. Global Pipes
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // 4. Database Connectivity Check (Proactive Logging)
    try {
        const entityManagerToken = getEntityManagerToken();
        const entityManager = app.get(entityManagerToken, { strict: false });
        await entityManager.query('SELECT 1');
        logger.log('✅ Database connection verified successfully.');
    } catch (err) {
        logger.error(`❌ Database connection failed or EntityManager not found: ${err.message}`);
        // Do NOT crash the app here, let it try to recover or stay up for health checks
    }

    // 5. Listen on PORT (Railway requirement)
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 API is running on: http://0.0.0.0:${port}/api/v1`);
}

bootstrap();