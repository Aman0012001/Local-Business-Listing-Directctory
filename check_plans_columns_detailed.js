const { Client } = require('pg');
require('dotenv').config();

async function checkColumns() {
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
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_plans'
            ORDER BY column_name;
        `);
        console.log('Columns in subscription_plans:');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkColumns();
