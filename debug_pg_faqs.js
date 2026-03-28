const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    const client = new Client({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const res = await client.query(`SELECT faqs FROM businesses WHERE slug = 'bright-future-academy-mn8n7y7p'`);
    console.log('--- TYPE ---');
    console.log(typeof res.rows[0].faqs);
    console.log('--- CONTENT ---');
    console.dir(res.rows[0].faqs, { depth: null });
    await client.end();
}
check();
