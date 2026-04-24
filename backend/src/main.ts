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
    try {
        const app = await NestFactory.create(AppModule, { rawBody: true });

        app.use(compression());

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
        const allowedOrigins = corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : [];
        const nodeEnv = configService.get('NODE_ENV');

        app.enableCors({
            origin: (origin, callback) => {
                // Allow if no origin (Postman, mobile apps, server-to-server)
                if (!origin) return callback(null, true);

                // 1. Check explicit allowed origins from ENV
                if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                    return callback(null, true);
                }

                // 2. Allow dynamic subdomains via Regex
        const allowedPatterns = [
            /^https:\/\/.*\.netlify\.app$/,      // All Netlify dynamic domains
            /^https:\/\/.*\.railway\.app$/,      // All Railway dynamic domains
            /https:\/\/endearing-taffy-91a2c6\.netlify\.app/, // User's specific Netlify domain
            /https:\/\/singular-melomakarona-8c3308\.netlify\.app/, // Legacy Netlify domain
            /^http:\/\/localhost(:\d+)?$/,        // localhost with any port
            /^http:\/\/127\.0.0\.1(:\d+)?$/,    // 127.0.0.1 with any port
        ];

        app.enableCors({
            origin: (origin, callback) => {
                // Allow if no origin (Postman, mobile apps, server-to-server)
                if (!origin) return callback(null, true);

                // 1. Check explicit allowed origins from ENV
                if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                    return callback(null, true);
                }

                const isMatchingPattern = allowedPatterns.some(pattern => {
                    if (pattern instanceof RegExp) {
                        return pattern.test(origin);
                    }
                    return pattern === origin;
                });

                if (isMatchingPattern) {
                    return callback(null, true);
                }

                // Fallback for development
                if (nodeEnv !== 'production' || origin.includes('localhost') || origin.includes('127.0.0.1')) {
                    return callback(null, true);
                }

                console.warn(`❌ CORS Blocked: origin ${origin} not allowed`);
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
                'Apollo-Require-Preflight',
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

        const showSwagger =
            showSwaggerEnv === 'true' ||
            showSwaggerEnv === true ||
            nodeEnv !== 'production';

        if (nodeEnv === 'production') {
            app.use(helmet({
                crossOriginResourcePolicy: { policy: "cross-origin" },
                // ContentSecurityPolicy can still be enabled if needed, but let's disable it for debugging connectivity
                contentSecurityPolicy: false,
            }));
        } else {
            // Basic helmet for dev
            app.use(helmet({
                hsts: false,
                contentSecurityPolicy: false,
                crossOriginResourcePolicy: { policy: "cross-origin" },
            }));
        }

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
                .addTag('qa')
                .addTag('business-setup')
                .addTag('cities')
                .addTag('demand')
                .addTag('analytics')
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

        console.log(`🚀 Starting server on port ${port}...`);
        await app.listen(port, '0.0.0.0');

        console.log(`🚀 Server running on port ${port}`);
        console.log(`📄 Swagger Docs → http://localhost:${port}/${apiPrefix}/docs`);
        console.log(`🚀 API is ready to accept connections on port ${port}`);
    } catch (error) {
        console.error('❌ FATAL ERROR DURING STARTUP:', error);
        // Log more detail if it's a DB connection error
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Connection')) {
            console.error('💡 TIP: Check if your Railway Postgres service is running and DATABASE_URL is correct.');
        }
        process.exit(1);
    }
}

bootstrap();
