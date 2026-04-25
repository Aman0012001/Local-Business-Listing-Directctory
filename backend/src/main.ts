import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // 1. Enable CORS FIRST (with permissive settings for debugging)
    // This ensures preflight OPTIONS requests are handled before routing
    app.enableCors({
        origin: (origin, callback) => {
            // Log origin for debugging
            if (origin) logger.log(`Incoming request from origin: ${origin}`);
            
            // Allow all origins for now to resolve the blocking issue
            callback(null, true);
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

    // 4. Railway requirement: Listen on process.env.PORT and 0.0.0.0
    const port = process.env.PORT || 8080;
    
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 API is running on: http://0.0.0.0:${port}/api/v1`);
}

bootstrap();