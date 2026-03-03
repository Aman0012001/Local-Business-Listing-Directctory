const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function fixPassword() {
    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 10);

    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();
        console.log('Database connected');

        const res = await client.query(
            'UPDATE users SET password = $1, is_active = true WHERE email = $2',
            [hash, 'partner1@hyperlocal.com']
        );
        console.log('Update result:', res.rowCount, 'row(s) updated');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

fixPassword();
