import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function delete2000() {
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
        console.log('🚀 Connected to database for PKR 2000 cleanup...');

        // 1. Delete transactions first (due to foreign key constraints)
        const txDelRes = await client.query('DELETE FROM transactions WHERE amount = 2000');
        console.log(`✅ Deleted ${txDelRes.rowCount} transactions with amount 2000.`);

        // 2. Delete subscriptions with amount 2000
        const subDelRes = await client.query('DELETE FROM subscriptions WHERE amount = 2000');
        console.log(`✅ Deleted ${subDelRes.rowCount} subscriptions with amount 2000.`);

        console.log('🎉 PKR 2000 record cleanup completed successfully!');

    } catch (err: any) {
        console.error('❌ Error during 2000 cleanup:', err.message || err);
    } finally {
        await client.end();
    }
}

delete2000();
