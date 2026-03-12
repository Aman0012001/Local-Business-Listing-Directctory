import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const sharedPoolOptions = {
    // Pool size: keep it moderate for a remote DB
    max: 15,
    min: 2,
    // Kill idle connections after 30s to avoid hitting remote DB limits
    idleTimeoutMillis: 30000,
    // Wait up to 10s for a free connection from the pool
    connectionTimeoutMillis: 10000,
    // TCP keepalive: prevents connections from being silently dropped by the remote server
    keepAlives: 1,
    keepAlivesIdle: 30,
    keepAlivesInterval: 5,
    keepAlivesCount: 5,
    // Automatically re-establish connections that have been closed by the server
    allowExitOnIdle: false,
};

export const typeOrmConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => {
    const url = configService.get('DATABASE_URL');
    const host = configService.get('DB_HOST');
    const port = parseInt(configService.get('DB_PORT') ?? '5432');
    const sync = configService.get('DB_SYNCHRONIZE') === 'true';
    const ssl = configService.get('DB_SSL') === 'true' || configService.get('NODE_ENV') === 'production';
    const sslConfig = ssl ? { rejectUnauthorized: false } : false;
    // Only enable logging in development AND when explicitly set — too costly with remote DB
    const logging = configService.get('NODE_ENV') !== 'production' && configService.get('DB_LOGGING') === 'true'
        ? ['error', 'warn'] as any
        : false;

    if (url) {
        console.log('🔌 DB: Using DATABASE_URL');
        return {
            type: 'postgres',
            url,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: sync,
            logging,
            ssl: sslConfig,
            retryAttempts: 10,
            retryDelay: 3000,
            extra: sharedPoolOptions,
        };
    }

    console.log(`🔌 DB: Connecting to ${host}:${port}`);
    return {
        type: 'postgres',
        host,
        port,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: sync,
        logging,
        ssl: sslConfig,
        retryAttempts: 10,
        retryDelay: 3000,
        extra: sharedPoolOptions,
    };
};
