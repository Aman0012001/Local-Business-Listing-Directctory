import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // 1. Set global prefix (All routes will start with /api/v1)
    app.setGlobalPrefix('api/v1');

    // 2. Configure CORS correctly using NestJS native method
    // This handles the preflight OPTIONS requests automatically
    app.enableCors({
        origin: true, // Dynamically allow the origin of the request (safe for debugging Netlify/Local issues)
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
        preflightContinue: false,
        optionsSuccessStatus: 204, // Return 204 No Content for preflight
    });

    // 3. Global Pipes
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // 4. Railway requirement: Listen on process.env.PORT and 0.0.0.0
    const port = process.env.PORT || 8080;
    
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 API is running on: http://0.0.0.0:${port}/api/v1`);
}

bootstrap();