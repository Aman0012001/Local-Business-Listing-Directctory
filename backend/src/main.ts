import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });
    const configService = app.get(ConfigService);

    // Global prefix
    app.setGlobalPrefix(configService.get('API_PREFIX') || 'api');

    // API Versioning
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    // CORS
    app.enableCors({
        origin: configService.get('CORS_ORIGIN'),
        credentials: configService.get('CORS_CREDENTIALS') === 'true',
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
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
