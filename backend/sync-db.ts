import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
    process.env.DB_SYNCHRONIZE = 'true';
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    await dataSource.synchronize();
    console.log('Database synchronized successfully!');
    await app.close();
}
bootstrap();
