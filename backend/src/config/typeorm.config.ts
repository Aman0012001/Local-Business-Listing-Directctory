import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => {
    const isProd = configService.get<string>('NODE_ENV') === 'production';
    const databaseUrl = configService.get<string>('DATABASE_URL');

    console.log(`--- DEBUG: TypeORM Config - Environment: ${configService.get('NODE_ENV')} ---`);
    console.log(`--- DEBUG: TypeORM Config - Database URL exists: ${!!databaseUrl} ---`);

    // Railway and most production PostgreSQL providers require SSL
    const ssl = isProd || configService.get<string>('DB_SSL') === 'true'
        ? { rejectUnauthorized: false }
        : false;

    const commonOptions: Partial<TypeOrmModuleOptions> = {
        type: 'postgres',
        autoLoadEntities: true, // Fixes EntityManager/Repository injection issues
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true', // Always false in prod usually
        logging: !isProd && configService.get<string>('DB_LOGGING') === 'true' ? ['error', 'warn'] : false,
        retryAttempts: 10,
        retryDelay: 3000,
        ssl,
        extra: {
            ssl,
            max: 20,
            connectionTimeoutMillis: 30000,
            idleTimeoutMillis: 30000,
            keepAlive: true,
        },
    };

    if (databaseUrl) {
        return {
            ...commonOptions,
            url: databaseUrl,
        } as TypeOrmModuleOptions;
    }

    return {
        ...commonOptions,
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
    } as TypeOrmModuleOptions;
};