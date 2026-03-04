"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const user_entity_1 = require("../src/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_2 = require("../src/entities/user.entity");
const bcrypt = require("bcrypt");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userRepository = app.get((0, typeorm_1.getRepositoryToken)(user_entity_2.User));
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin123!';
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        console.log('Superadmin already exists. Updating role to superadmin...');
        existingUser.role = user_entity_1.UserRole.SUPERADMIN;
        await userRepository.save(existingUser);
        console.log('Superadmin updated successfully.');
    }
    else {
        console.log('Creating new superadmin...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({
            email,
            password: hashedPassword,
            fullName: 'Super Administrator',
            role: user_entity_1.UserRole.SUPERADMIN,
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
//# sourceMappingURL=seed-superadmin.js.map