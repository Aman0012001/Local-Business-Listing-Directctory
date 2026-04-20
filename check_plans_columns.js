const { Client } = require('pg');
require('dotenv').config();

async function checkColumns() {
    const client = new Client({
        connectionString: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_plans'
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
