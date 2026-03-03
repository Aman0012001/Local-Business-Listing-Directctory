const { Client } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testLogin() {
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
        const email = 'admin@example.com';
        const rawPassword = 'Password123!';

        console.log(`Testing login for: ${email}`);
        const res = await client.query('SELECT password, is_active FROM users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log('User not found in DB!');
            return;
        }

        const user = res.rows[0];
        console.log('User found. Is Active:', user.is_active);

        const isValid = await bcrypt.compare(rawPassword, user.password);
        console.log('Password Match Result:', isValid);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

testLogin();
