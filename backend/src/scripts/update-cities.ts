import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CitiesService } from '../modules/cities/cities.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const citiesService = app.get(CitiesService);

    console.log('🏙️ Updating Pakistani cities with coordinates...');
    const result = await citiesService.bulkImportByCountry('Pakistan');
    console.log('✅ Pakistani cities updated:', result);

    await app.close();
}

bootstrap().catch(err => {
    console.error('❌ Update failed:', err);
    process.exit(1);
});
