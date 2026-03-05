const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, './backend/.env') });

async function queryUsers() {
    console.log('Connecting to:', process.env.DB_HOST);

    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();
        console.log('Connected to database successfully.');

        // Query based on available columns in User entity
        // We use full_name/fullName and email
        const res = await client.query('SELECT id, email, full_name, role FROM users LIMIT 10');

        console.log('Query results:');
        console.table(res.rows);

    } catch (err) {
        console.error('Database Error:', err.message);
    } finally {
        await client.end();
    }
}

queryUsers();
