import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    logger.log('--- APP STARTING ---');

    // Create App
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);

    const port =
        process.env.PORT ||
        configService.get<number>('PORT') ||
        3001;

    // Global Prefix
    app.setGlobalPrefix('api/v1');

    // Validation Pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // ============================
    // ✅ CORS FIX (IMPORTANT)
    // ============================

    const corsOriginRaw = configService.get<string>('CORS_ORIGIN', '');

    const allowedOrigins = corsOriginRaw
        .split(',')
        .map(origin => origin.trim().replace(/\/$/, '')) // remove trailing slash
        .filter(origin => origin.length > 0);

    logger.log(`Allowed CORS Origins: ${JSON.stringify(allowedOrigins)}`);

    app.enableCors({
        origin: (origin, callback) => {
            // allow requests with no origin (Postman, mobile apps)
            if (!origin) {
                return callback(null, true);
            }

            const cleanOrigin = origin.replace(/\/$/, '');

            if (allowedOrigins.includes(cleanOrigin)) {
                return callback(null, true);
            }

            logger.error(`❌ CORS blocked for origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders:
            'Content-Type, Accept, Authorization, X-Requested-With, Origin',
    });

    // ============================
    // 🚀 START SERVER
    // ============================

    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 Server running on: http://0.0.0.0:${port}/api/v1`);

    // Log all routes for debugging 404 issues
    const server = app.getHttpServer();
    const router = server._events?.request?._router || (app as any).getHttpAdapter().getInstance()._router;

    logger.log('--- REGISTERED ROUTES ---');
    if (router && router.stack) {
        router.stack.forEach((layer: any) => {
            if (layer.route) {
                const path = layer.route.path;
                const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
                logger.log(`Route: ${methods} ${path}`);
            }
        });
    }
}

bootstrap();