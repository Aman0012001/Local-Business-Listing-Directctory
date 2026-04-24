import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '45505'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: true,
    entities: [join(process.cwd(), 'src', 'entities', '**', '*.entity.{ts,js}')],
    migrations: [join(process.cwd(), 'src', 'migrations', '**', '*.ts')],
    subscribers: [],
});
