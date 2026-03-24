import { NestFactory } from '@nestjs/core';
// Force reload for ai-summary route registration
import {
    ValidationPipe,
    VersioningType,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });

    app.use(compression());
    app.use(helmet());

    app.enableShutdownHooks();

    const configService = app.get(ConfigService);

    /**
     * -----------------------
     * GLOBAL API PREFIX
     * -----------------------
     */

    const apiPrefix = configService.get('API_PREFIX') || 'api';
    app.setGlobalPrefix(apiPrefix);

    /**
     * -----------------------
     * API VERSIONING
     * -----------------------
     */

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
            if (!origin) {
                return callback(null, true);
            }

            const isAllowed = allowedOrigins.some((allowed) => {
                if (allowed === '*') return true;
                if (allowed === origin) return true;
                
                // Allow all local development origins dynamically
                if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                    return true;
                }

                if (
                    allowed.includes('up.railway.app') &&
                    origin.endsWith('up.railway.app')
                ) {
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

    app.useGlobalFilters(new HttpExceptionFilter());

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
     * SWAGGER SETUP
     * -----------------------
     */

    const showSwaggerEnv = configService.get('SHOW_SWAGGER');
    const nodeEnv = configService.get('NODE_ENV');

    const showSwagger =
        showSwaggerEnv === 'true' ||
        showSwaggerEnv === true ||
        nodeEnv !== 'production';

    console.log(
        `🔍 Swagger Diagnosis → SHOW_SWAGGER=${showSwaggerEnv} | NODE_ENV=${nodeEnv} | Enabled=${showSwagger}`,
    );

    if (showSwagger) {
        const swaggerConfig = new DocumentBuilder()
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
            .addServer('http://localhost:3001', 'Local development server')
            .addServer(
                'https://local-business-listing-directctory-production.up.railway.app',
                'Production server',
            )
            .build();

        const document = SwaggerModule.createDocument(app, swaggerConfig);

        SwaggerModule.setup('docs', app, document, {
            useGlobalPrefix: true,
            swaggerOptions: {
                persistAuthorization: true,
            },
        });

        console.log(`✅ Swagger UI initialized at /${apiPrefix}/docs`);
    } else {
        console.log('⚠️ Swagger disabled');
    }

    /**
     * -----------------------
     * SERVER START
     * -----------------------
     */

    const port = configService.get('PORT') || 3001;

    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Server running on port ${port}`);
    console.log(`📄 Swagger Docs → http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
