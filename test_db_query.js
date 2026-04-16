const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './backend/.env') });

async function testQuery() {
    console.log("CONFIG:", {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        ssl: process.env.DB_SSL
    });

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
        console.log("✅ Connected successfully");
        const res = await client.query('SELECT current_user, now(), count(*) from users');
        console.log("✅ Query result:", res.rows[0]);
    } catch (error) {
        console.error("❌ DB Test Error:", error.message);
        console.error("Error Code:", error.code);
    } finally {
        await client.end();
    }
}

testQuery();
