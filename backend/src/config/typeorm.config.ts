import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
    const dbUrl = process.env.DATABASE_URL || configService.get<string>('DATABASE_URL');
    
    console.log('--- DEBUG: TYPEORM CONFIG START ---');
    console.log('DATABASE_URL present:', !!dbUrl);
    if (dbUrl) {
        console.log('DATABASE_URL length:', dbUrl.length);
    }
    
    return {
        type: 'postgres',
        url: dbUrl,
        autoLoadEntities: true,
        synchronize: false, // Set to false in production
        ssl: {
            rejectUnauthorized: false,
        },
        // Log all queries to see what's happening
        logging: true,
    };
};