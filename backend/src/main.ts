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

        const allowedPatterns = [
            /^https?:\/\/.*\.netlify\.app$/i,    // All Netlify dynamic domains
            /^https?:\/\/.*\.railway\.app$/i,    // All Railway dynamic domains
            /^https?:\/\/localhost(:\d+)?$/i,     // localhost with any port
            /^https?:\/\/127\.0.0\.1(:\d+)?$/i,   // 127.0.0.1 with any port
        ];

        app.enableCors({
            origin: [
                'https://lucent-yeot-3d8455.netlify.app',
                'http://localhost:3000',
                'http://localhost:3001',
                /\.netlify\.app$/,
                /\.railway\.app$/,
            ],
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With,Origin,X-CSRF-Token,Apollo-Require-Preflight,sentry-trace,baggage',
            optionsSuccessStatus: 204,
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
                    'https://local-business-listing-directory-production.up.railway.app',
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

        const port = parseInt(process.env.PORT || '8080', 10);
        console.log("PORT:", port);
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
