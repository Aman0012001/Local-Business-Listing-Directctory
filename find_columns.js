const { Client } = require('pg');
require('dotenv').config();

async function findColumn() {
    const client = new Client({
        connectionString: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name, column_name
            FROM information_schema.columns 
            WHERE column_name = 'stripe_price_id'
        `);
        console.log('Tables containing stripe_price_id:');
        console.table(res.rows);
        
        const res2 = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('All tables in public schema:');
        console.table(res2.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

findColumn();
