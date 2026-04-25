import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchLog, City } from '../entities';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const searchLogRepo = app.get(getRepositoryToken(SearchLog));
    const cityRepo = app.get(getRepositoryToken(City));

    console.log('🔍 Logging dummy searches...');
    
    const targetCities = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi'];
    const keywords = ['Restaurant', 'Hotel', 'Hospital', 'School', 'Mall'];

    for (const cityName of targetCities) {
        const city = await cityRepo.findOne({ where: { name: cityName } });
        if (city && city.latitude && city.longitude) {
            for (let i = 0; i < 3; i++) {
                const keyword = keywords[Math.floor(Math.random() * keywords.length)];
                const log = searchLogRepo.create({
                    keyword,
                    city: cityName,
                    latitude: city.latitude,
                    longitude: city.longitude,
                    searchedAt: new Date(),
                    normalizedKeyword: keyword.toLowerCase()
                });
                await searchLogRepo.save(log);
                console.log(`✅ Logged ${keyword} in ${cityName}`);
            }
        } else {
            console.warn(`⚠️ City ${cityName} not found or missing coords`);
        }
    }

    console.log('🚀 Seeding completed!');
    await app.close();
}

bootstrap().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
