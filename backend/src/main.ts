import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    logger.log('--- 🚀 APP STARTING (PRODUCTION READY) ---');

    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = process.env.PORT || configService.get<number>('PORT') || 3001;

    // 1. Global Prefix
    app.setGlobalPrefix('api/v1');

    // 2. Request Logging Middleware (for debugging production 404s/CORS)
    app.use((req, res, next) => {
        if (req.method !== 'OPTIONS') {
            logger.debug(`[Request] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'None'}`);
        }
        next();
    });

    // 3. Validation Pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // 4. Swagger Setup (at multiple paths for safety)
    const config = new DocumentBuilder()
        .setTitle('Business SAAS API')
        .setDescription('API documentation for the Discovery Platform.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);
    SwaggerModule.setup('api/docs', app, document);

    // 5. CORS Configuration
    const corsOriginRaw = configService.get<string>('CORS_ORIGIN', '');
    const allowedOrigins = corsOriginRaw
        .split(',')
        .map(origin => origin.trim().replace(/\/$/, ''))
        .filter(origin => origin.length > 0);

    // Always allow common dev/prod domains
    const baseAllowed = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'https://lucent-ywot-3d8455.netlify.app'
    ];

    const finalAllowed = [...new Set([...allowedOrigins, ...baseAllowed])];
    logger.log(`✅ Allowed CORS Origins: ${JSON.stringify(finalAllowed)}`);

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            
            const cleanOrigin = origin.replace(/\/$/, '');
            
            if (finalAllowed.includes(cleanOrigin) || 
                cleanOrigin.endsWith('.netlify.app') || 
                cleanOrigin.endsWith('.up.railway.app')) {
                return callback(null, true);
            }

            logger.error(`❌ CORS blocked for origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
    });

    // 6. Start Server
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Server running on: http://0.0.0.0:${port}/api/v1`);
}

bootstrap();