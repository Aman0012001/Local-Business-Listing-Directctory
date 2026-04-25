import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => {
    const isProd = configService.get<string>('NODE_ENV') === 'production';

    const databaseUrl = configService.get<string>('DATABASE_URL');

    const ssl =
        configService.get<string>('DB_SSL') === 'true' || isProd
            ? { rejectUnauthorized: false }
            : false;

    const logging =
        !isProd && configService.get<string>('DB_LOGGING') === 'true'
            ? ['error', 'warn']
            : false;

    // ✅ Railway prefers DATABASE_URL
    if (databaseUrl) {
        console.log('✅ Using DATABASE_URL (Railway)');

        return {
            type: 'postgres',
            url: databaseUrl,

            autoLoadEntities: true, // 🔥 MUST (fixes EntityManager issues)
            synchronize: false,

            ssl,

            logging,

            retryAttempts: 10,
            retryDelay: 3000,

            extra: {
                max: 10,
                connectionTimeoutMillis: 30000,
                idleTimeoutMillis: 30000,
                keepAlive: true,
            },
        };
    }

    // 🔁 fallback (local/dev)
    console.log('⚠️ Using manual DB config');

    return {
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        autoLoadEntities: true,
        synchronize: false,

        ssl,
        logging,

        retryAttempts: 10,
        retryDelay: 3000,

        extra: {
            max: 10,
            connectionTimeoutMillis: 30000,
            idleTimeoutMillis: 30000,
            keepAlive: true,
        },
    };
};