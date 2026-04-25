import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 🔥 FIX: CORS + OPTIONS middleware (MUST be inside bootstrap)
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
        res.header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );

        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        }

        next();
    });

    // ✅ Global prefix
    app.setGlobalPrefix('api/v1');

    // ✅ CORS
    app.enableCors({
        origin: true,
        credentials: true,
    });

    // ✅ Port
    const port = parseInt(process.env.PORT || '8080', 10);

    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Server running on port ${port}`);
}

bootstrap();