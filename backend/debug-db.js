const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.join('=').trim();
            }
        });
    }
}
loadEnv();

async function checkEnums() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        console.log('--- ALL TYPES ---');
        const types = await client.query(`
            SELECT n.nspname as schema, t.typname as name
            FROM pg_type t
            LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid))
            AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
            AND n.nspname NOT IN ('pg_catalog', 'information_schema');
        `);
        console.log(JSON.stringify(types.rows, null, 2));

        console.log('--- OFFER EVENTS TABLE COLS ---');
        const cols = await client.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'offer_events';
        `);
        console.log(JSON.stringify(cols.rows, null, 2));

        console.log('--- OFFER EVENT PRICING TABLE COLS ---');
        const cols2 = await client.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'offer_event_pricing';
        `);
        console.log(JSON.stringify(cols2.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
checkEnums();
