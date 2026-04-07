const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function checkTable() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT to_regclass('public.notifications') as table_exists;");
        console.log('Table check result:', res.rows[0]);

        if (res.rows[0].table_exists) {
            const columns = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications';");
            console.log('Columns:', columns.rows.map(r => r.column_name));
        }
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await client.end();
    }
}

checkTable();
