
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./backend/dist/app.module');
const { CitiesService } = require('./backend/dist/modules/cities/cities.service');

async function testService() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const citiesService = app.get(CitiesService);
  
  try {
    console.log('Testing findPopular()...');
    const result = await citiesService.findPopular();
    console.log('Result count:', result.length);
    console.log('First city:', JSON.stringify(result[0], null, 2));
    process.exit(0);
  } catch (err) {
    console.error('SERVICE ERROR:', err);
    process.exit(1);
  }
}

testService();
