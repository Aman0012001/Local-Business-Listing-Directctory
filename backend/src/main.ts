import { NestFactory } from '@nestjs/core';
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

        const nodeEnv = process.env.NODE_ENV || 'development';

        /**
         * -----------------------
         * GLOBAL PREFIX
         * -----------------------
         */
        const apiPrefix = configService.get('API_PREFIX') || 'api';
        app.setGlobalPrefix(apiPrefix);

        /**
         * -----------------------
         * VERSIONING
         * -----------------------
         */
        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: '1',
        });

        /**
         * -----------------------
         * 🔥 CORS FIX (FINAL)
         * -----------------------
         */
        app.use((req, res, next) => {
            const origin = req.headers.origin;

            const allowedOrigins = [
                "https://lucent-yeot-3d8455.netlify.app",
                "https://willowy-fox-96ff5f.netlify.app"
            ];

            if (origin && allowedOrigins.includes(origin)) {
                res.header("Access-Control-Allow-Origin", origin);
            }

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

        /**
         * -----------------------
         * VALIDATION
         * -----------------------
         */
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        app.useGlobalFilters(new HttpExceptionFilter());

        app.useGlobalInterceptors(
            new ClassSerializerInterceptor(app.get(Reflector)),
        );

        /**
         * -----------------------
         * SECURITY
         * -----------------------
         */
        app.use(
            helmet({
                crossOriginResourcePolicy: { policy: "cross-origin" },
                contentSecurityPolicy: false,
            }),
        );

        /**
         * -----------------------
         * SWAGGER
         * -----------------------
         */
        if (nodeEnv !== 'production') {
            const config = new DocumentBuilder()
                .setTitle('API')
                .setDescription('API Docs')
                .setVersion('1.0')
                .build();

            const document = SwaggerModule.createDocument(app, config);
            SwaggerModule.setup('docs', app, document);
        }

        /**
         * -----------------------
         * SERVER START
         * -----------------------
         */
        const port = parseInt(process.env.PORT || '8080', 10);

        await app.listen(port, '0.0.0.0');

        console.log(`🚀 Server running on port ${port}`);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
}

bootstrap();