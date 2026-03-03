const { Client } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function fix() {
    console.log('Connecting to database:', process.env.DB_HOST);
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected successfully.');

        const password = 'Password123!';
        const hash = await bcrypt.hash(password, 10);
        console.log('Generated hash for Password123!');

        const usersToFix = [
            { email: 'admin@example.com', role: 'admin' },
            { email: 'joy-cafe@example.com', role: 'vendor' },
            { email: 'customer@example.com', role: 'user' },
            { email: 'premium-vendor@example.com', role: 'vendor' }
        ];

        for (const user of usersToFix) {
            console.log(`Checking user: ${user.email}`);
            const res = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);

            if (res.rows.length > 0) {
                console.log(`Found user ${user.email}. Updating password and role...`);
                await client.query(
                    'UPDATE users SET password = $1, role = $2, is_active = true, is_email_verified = true WHERE email = $3',
                    [hash, user.role, user.email]
                );
                console.log(`Updated ${user.email}.`);
            } else {
                console.log(`User ${user.email} not found. Creating user...`);
                // Use uuid_generate_v4() which should be available as per schema.sql
                await client.query(
                    'INSERT INTO users (id, email, password, full_name, role, is_active, is_email_verified) VALUES (uuid_generate_v4(), $1, $2, $3, $4, true, true)',
                    [user.email, hash, user.email.split('@')[0], user.role]
                );
                console.log(`Created ${user.email}.`);
            }
        }

        console.log('All done!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

fix();
