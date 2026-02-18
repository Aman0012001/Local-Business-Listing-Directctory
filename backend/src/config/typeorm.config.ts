import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: configService.get('DATABASE_URL'),
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT') ?? '5432'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
    logging: configService.get('DB_LOGGING') === 'true',
    ssl: configService.get('DB_SSL') === 'true' || configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
        max: 20,
        connectionTimeoutMillis: 10000,
    },
});
