import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepo = app.get(getRepositoryToken(User));

    console.log('👥 Listing Admin users...');
    const admins = await userRepo.find({
        where: [
            { role: UserRole.ADMIN },
            { role: UserRole.SUPERADMIN }
        ]
    });

    if (admins.length === 0) {
        console.log('No admins found. Creating one...');
        const admin = userRepo.create({
            email: 'admin@example.com',
            fullName: 'System Admin',
            password: 'admin_password', // In real app use hash
            role: UserRole.SUPERADMIN
        });
        await userRepo.save(admin);
        console.log('✅ Created admin@example.com');
    } else {
        admins.forEach(a => console.log(`- ${a.email} [${a.role}]`));
    }

    await app.close();
}

bootstrap().catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
});
