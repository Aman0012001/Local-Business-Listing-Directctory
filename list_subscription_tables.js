const { Client } = require('pg');
require('dotenv').config();

async function listTables() {
    const dbUrl = process.env.DATABASE_URL;
    const config = dbUrl ? { connectionString: dbUrl } : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    };

    const client = new Client({
        ...config,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE '%subscription%'
        `);
        console.log('Tables matching "subscription":');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

listTables();
