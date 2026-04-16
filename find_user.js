const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './backend/.env') });

async function findUser() {
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
        const res = await client.query("SELECT id, email, is_active, delete_at FROM users WHERE id = '832842d8-6ffb-4251-a662-6c66ff5ed496'");
        console.log("✅ User found:", res.rows[0]);
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await client.end();
    }
}

findUser();
