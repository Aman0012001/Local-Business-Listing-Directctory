import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // 1. Robust CORS Configuration
    const corsOrigins = configService.get<string>('CORS_ORIGIN') || '*';
    const originList = corsOrigins === '*' 
        ? '*' 
        : corsOrigins.split(',').map(origin => origin.trim().replace(/\/$/, ''));

    logger.log(`Setting up CORS with origins: ${JSON.stringify(originList)}`);

    app.enableCors({
        origin: (origin, callback) => {
            // If no origin (like mobile apps or curl), allow it
            if (!origin) return callback(null, true);

            // In development or if set to *, allow all
            if (originList === '*' || process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }

            // Check if incoming origin is in our allowed list
            const normalizedOrigin = origin.replace(/\/$/, '');
            const isAllowed = originList.includes(normalizedOrigin) || 
                             normalizedOrigin.endsWith('.netlify.app') || 
                             normalizedOrigin.endsWith('.railway.app');
            
            if (isAllowed) {
                callback(null, true);
            } else {
                logger.warn(`CORS blocked for origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
        preflightContinue: false,
        optionsSuccessStatus: 204,
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
        const entityManager = app.get('EntityManager');
        await entityManager.query('SELECT 1');
        logger.log('✅ Database connection verified successfully.');
    } catch (err) {
        logger.error(`❌ Database connection failed: ${err.message}`);
    }

    // 5. Listen on PORT (Railway requirement)
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 API is running on: http://0.0.0.0:${port}/api/v1`);
}

bootstrap();