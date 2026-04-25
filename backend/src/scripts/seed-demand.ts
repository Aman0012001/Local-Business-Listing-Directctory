import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CitiesService } from '../modules/cities/cities.service';
import { DemandService } from '../modules/demand/demand.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const citiesService = app.get(CitiesService);
    const demandService = app.get(DemandService);

    console.log('🚀 Starting Demand Data Seeding...');

    // 1. Bulk Import Pakistan Cities (Updates coordinates)
    console.log('🏙️ Updating Pakistani cities with coordinates...');
    await citiesService.bulkImportByCountry('Pakistan');
    console.log('✅ Pakistani cities updated.');

    // 2. Generate Dummy Search Logs
    const cities = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan'];
    const keywords = ['Restaurant', 'Plumber', 'Electrician', 'Doctor', 'Gym', 'Car Repair', 'Laundry', 'Bakery'];

    console.log('🔍 Logging dummy searches...');
    for (const city of cities) {
        for (let i = 0; i < 5; i++) {
            const keyword = keywords[Math.floor(Math.random() * keywords.length)];
            await demandService.logSearch({
                keyword,
                city,
                categorySlug: keyword.toLowerCase().replace(' ', '-'),
            });
        }
    }

    console.log('✅ Dummy searches logged.');
    console.log('🚀 Seeding completed successfully!');
    await app.close();
}

bootstrap().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
