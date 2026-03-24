import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NotificationsService } from '../src/modules/notifications/notifications.service';
import { User } from '../src/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const notificationsService = app.get(NotificationsService);
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

    const userId = process.argv[2];
    const title = process.argv[3] || '🧪 CLI Test Push';
    const message = process.argv[4] || 'This is a test notification sent via the CLI script.';

    if (!userId) {
        console.log('Usage: npx ts-node -r tsconfig-paths/register scripts/test-push.ts <USER_ID> ["TITLE"] ["MESSAGE"]');
        
        // Find a sample user for convenience
        const sampleUser = await userRepo.findOne({ where: {} });
        if (sampleUser) {
            console.log(`\nSample User ID: ${sampleUser.id} (${sampleUser.fullName || sampleUser.email})`);
        }
        
        await app.close();
        return;
    }

    try {
        console.log(`Sending test notification to user ${userId}...`);
        const notification = await notificationsService.create({
            userId,
            title,
            message,
            type: 'test_cli'
        });
        console.log('✅ Notification created and dispatched successfully!');
        console.log('Notification ID:', notification.id);
    } catch (err) {
        console.error('❌ Failed to send notification:', err.message);
    } finally {
        await app.close();
    }
}

bootstrap();
