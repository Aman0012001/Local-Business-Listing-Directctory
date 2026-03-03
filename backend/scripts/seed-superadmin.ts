
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { UserRole } from '../src/entities/user.entity';
import { AuthService } from '../src/modules/auth/auth.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    const email = 'superadmin@example.com';
    const password = 'SuperAdmin123!';

    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
        console.log('Superadmin already exists. Updating role to superadmin...');
        existingUser.role = UserRole.SUPERADMIN;
        await userRepository.save(existingUser);
        console.log('Superadmin updated successfully.');
    } else {
        console.log('Creating new superadmin...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({
            email,
            password: hashedPassword,
            fullName: 'Super Administrator',
            role: UserRole.SUPERADMIN,
            isEmailVerified: true,
            isActive: true
        });
        await userRepository.save(user);
        console.log('Superadmin created successfully.');
    }

    console.log('Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    await app.close();
}

bootstrap();
