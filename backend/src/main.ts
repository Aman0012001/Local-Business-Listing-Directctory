import { NestFactory } from '@nestjs/core';
import {
    ValidationPipe,
    VersioningType,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });

    app.use(compression());
    app.use(helmet());

    // Enable shutdown hooks
    app.enableShutdownHooks();

    const configService = app.get(ConfigService);

    // API prefix
    app.setGlobalPrefix(configService.get('API_PREFIX') || 'api');

    // API Versioning
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    /**
     * -----------------------
     * CORS CONFIGURATION
     * -----------------------
     */

    const corsOrigin = configService.get<string>('CORS_ORIGIN');

    const allowedOrigins = corsOrigin
        ? corsOrigin.split(',').map((o) => o.trim())
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
        ];

    app.enableCors({
        origin: (origin, callback) => {
            // allow mobile apps / curl / postman
            if (!origin) {
                return callback(null, true);
            }

            // Check if origin matches exactly or is a valid subdomain of the production URL (if configured)
            const isAllowed = allowedOrigins.some(allowed => {
                if (allowed === '*') return true;
                if (allowed === origin) return true;
                // Add logic for dynamic railway subdomains if needed
                if (allowed.includes('up.railway.app') && origin.endsWith('up.railway.app')) {
                   return true;
                }
                return false;
            });

            if (isAllowed) {
                return callback(null, true);
            }

            console.warn(`❌ Blocked by CORS: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Requested-With',
            'Origin',
            'X-CSRF-Token',
        ],
        exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
    });

    /**
     * -----------------------
     * GLOBAL VALIDATION
     * -----------------------
     */

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    /**
     * -----------------------
     * SERIALIZER INTERCEPTOR
     * -----------------------
     */

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    /**
     * -----------------------
     * SWAGGER (DEV ONLY)
     * -----------------------
     */

    if (configService.get('NODE_ENV') !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Local Business Discovery Platform API')
            .setDescription(
                'Hyperlocal business discovery platform API documentation',
            )
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth')
            .addTag('users')
            .addTag('vendors')
            .addTag('businesses')
            .addTag('categories')
            .addTag('reviews')
            .addTag('leads')
            .addTag('subscriptions')
            .addTag('search')
            .addTag('admin')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    /**
     * -----------------------
     * SERVER START
     * -----------------------
     */

    const port = configService.get('PORT') || 3001;

    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Server running on port ${port}`);
}

bootstrap();