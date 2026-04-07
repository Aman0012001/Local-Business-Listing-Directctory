import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

const dbConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || '66.33.22.240',
    port: parseInt(process.env.DB_PORT || '45505', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: process.env.DB_DATABASE || 'railway',
    entities: [path.join(__dirname, 'src/entities/**/*.entity{.ts,.js}')],
    ssl: { rejectUnauthorized: false },
};

async function checkUsers() {
    const dataSource = new DataSource(dbConfig as any);
    await dataSource.initialize();
    console.log('DB Connected!');
    const users = await dataSource.getRepository(User).find({ select: ['id', 'email', 'password', 'role'] });
    console.log('Found users:', users.map(u => ({ id: u.id, email: u.email, role: u.role, hasPassword: !!u.password })));
    
    // Check if any standard password like 'Admin@123' works for them
    for (const u of users) {
        if (u.password) {
            const isMatch = await bcrypt.compare('Admin@123', u.password);
            console.log(`Email ${u.email} -> password is 'Admin@123'? ${isMatch}`);

            const isMatch2 = await bcrypt.compare('password', u.password);
            console.log(`Email ${u.email} -> password is 'password'? ${isMatch2}`);
        }
    }

    await dataSource.destroy();
}

checkUsers().catch(console.error);
