const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function checkUser() {
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

        const res = await client.query('SELECT id, email, role, is_active FROM users WHERE email = $1', ['amansalon@gmail.com']);
        console.log('User:', JSON.stringify(res.rows, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

checkUser();
