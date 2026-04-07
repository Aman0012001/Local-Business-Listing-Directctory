import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });

    app.use(compression());

    // Enable shutdown hooks
    app.enableShutdownHooks();

    const configService = app.get(ConfigService);

    // Global prefix
    app.setGlobalPrefix(configService.get('API_PREFIX') || 'api');

    // API Versioning
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    // CORS
    const corsOrigin = configService.get('CORS_ORIGIN');
    const allowedOrigins = corsOrigin ? corsOrigin.split(',').map(o => o.trim()).filter(Boolean) : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Requested-With',
            'X-HTTP-Method-Override',
            'Content-Range',
            'Range',
            'Origin',
        ],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
    });

    // Global validation pipe
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

    // Global interceptor for virtual properties (@Expose)
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // Swagger documentation
    if (configService.get('NODE_ENV') !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Local Business Discovery Platform API')
            .setDescription('Hyperlocal business discovery platform API documentation')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth', 'Authentication endpoints')
            .addTag('users', 'User management')
            .addTag('vendors', 'Vendor management')
            .addTag('businesses', 'Business listings')
            .addTag('categories', 'Category management')
            .addTag('reviews', 'Reviews and ratings')
            .addTag('leads', 'Lead generation')
            .addTag('subscriptions', 'Subscription management')
            .addTag('search', 'Search functionality')
            .addTag('admin', 'Admin operations')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    const port = configService.get('PORT') || 3001;
    await app.listen(port, '0.0.0.0');
}

bootstrap();
