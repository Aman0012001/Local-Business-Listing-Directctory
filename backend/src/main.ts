import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    
    // Initialize NestJS Application
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Use ConfigService for dynamic variables
    const configService = app.get(ConfigService);
    const port = process.env.PORT || configService.get<number>('PORT') || 3001;

    // Standard Middleware
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ 
        whitelist: true, 
        transform: true,
        forbidNonWhitelisted: true 
    }));

    // Dynamic CORS Configuration
    const corsOriginRaw = configService.get<string>('CORS_ORIGIN', '');
    const origins = corsOriginRaw.split(',').map(o => o.trim()).filter(o => o.length > 0);
    
    logger.log(`Setting up CORS with origins: ${JSON.stringify(origins)}`);
    
    app.enableCors({
        origin: origins.length > 0 ? origins : '*',
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
    });

    // Railway requires binding to 0.0.0.0
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Server is running on: http://0.0.0.0:${port}/api/v1`);
}
bootstrap();