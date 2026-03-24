require('ts-node/register');
require('tsconfig-paths/register');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../src/app.module');
const { NotificationsService } = require('../src/modules/notifications/notifications.service');

async function test() {
    console.log('Bootstrapping NestJS app...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(NotificationsService);

    const targetUserId = process.argv[2] || 'e3ad4650-bf08-40a0-a538-f7f7efa595e2'; // Default to Salon vendor
    console.log(`Sending test notification to ${targetUserId}...`);

    try {
        await service.create({
            userId: targetUserId,
            title: '🧪 Integration Test',
            message: 'Testing push notifications for vendor role.',
            type: 'test'
        });
        console.log('✅ Test notification sent!');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await app.close();
    }
}

test();
