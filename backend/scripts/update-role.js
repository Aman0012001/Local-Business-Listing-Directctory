const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function updateRole() {
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

        const email = 'amansalon@gmail.com';
        const res = await client.query('UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role', ['vendor', email]);

        if (res.rows.length > 0) {
            console.log('User role updated successfully:', JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log('User not found:', email);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

updateRole();
