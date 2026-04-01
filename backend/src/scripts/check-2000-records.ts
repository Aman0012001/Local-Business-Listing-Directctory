import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function check() {
    const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SSL } = process.env;
    const client = new Client({
        host: DB_HOST,
        port: parseInt(DB_PORT || '5432'),
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        const subCount = await client.query('SELECT count(*) FROM subscriptions WHERE amount = 2000');
        const txCount = await client.query('SELECT count(*) FROM transactions WHERE amount = 2000');
        console.log('Subscriptions with 2000:', subCount.rows[0].count);
        console.log('Transactions with 2000:', txCount.rows[0].count);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
