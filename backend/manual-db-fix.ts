import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    
    console.log('Adding columns to offer_events...');
    try {
        await dataSource.query(`
            ALTER TABLE offer_events 
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
        `);
        console.log('✅ Column is_featured added or already exists.');
        
        await dataSource.query(`
            CREATE INDEX IF NOT EXISTS "IDX_offer_events_is_featured" ON offer_events(is_featured);
        `);
        console.log('✅ Index created.');
        
    } catch (err) {
        console.error('❌ Error updating database:', err.message);
    } finally {
        await app.close();
    }
}

bootstrap();
