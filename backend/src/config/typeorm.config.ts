import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => {
    const url = configService.get('DATABASE_URL');
    const host = configService.get('DB_HOST');
    const port = parseInt(configService.get('DB_PORT') ?? '5432');

    console.log('--- Database Connection Config ---');
    if (url) {
        console.log('Using DATABASE_URL:', url.replace(/:[^:]+@/, ':****@'));
        return {
            type: 'postgres',
            url,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
            logging: configService.get('DB_LOGGING') === 'true',
            ssl: { rejectUnauthorized: false },
            extra: {
                max: 20,
                connectionTimeoutMillis: 30000,
                keepalives: true,
                keepalives_idle: 60,
            },
        };
    }

    console.log(`Using individual fields - Host: ${host}, Port: ${port}`);
    return {
        type: 'postgres',
        host,
        port,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
        ssl: configService.get('DB_SSL') === 'true' || configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        extra: {
            max: 20,
            connectionTimeoutMillis: 30000,
        },
    };
};
