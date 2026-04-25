import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ✅ GLOBAL PREFIX
    app.setGlobalPrefix('api/v1');

    // 🔥 ONLY THIS CORS (NO middleware)
    app.enableCors({
        origin: [
            'https://lucent-yeot-3d8455.netlify.app',
            'http://localhost:3000',
        ],
        credentials: true,
    });

    const port = parseInt(process.env.PORT || '8080', 10);

    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Server running on port ${port}`);
}

bootstrap();