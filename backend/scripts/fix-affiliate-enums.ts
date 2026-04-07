import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the root of backend
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixEnums() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false },
    });

    try {
        console.log(`Connecting to ${process.env.DB_HOST}...`);
        await client.connect();
        
        // 1. Fix Status Enum
        const statusRes = await client.query(`
            SELECT enumlabel FROM pg_enum 
            JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
            WHERE typname = 'affiliate_referrals_status_enum';
        `);
        const statusLabels = statusRes.rows.map(r => r.enumlabel);
        console.log('Current Status Enum:', statusLabels);

        const requiredStatus = ['pending', 'converted', 'expired'];
        for (const status of requiredStatus) {
            if (!statusLabels.includes(status)) {
                console.log(`Adding "${status}" to affiliate_referrals_status_enum...`);
                await client.query(`ALTER TYPE affiliate_referrals_status_enum ADD VALUE '${status}'`);
            }
        }

        // 2. Fix Type Enum
        const typeRes = await client.query(`
            SELECT enumlabel FROM pg_enum 
            JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
            WHERE typname = 'affiliate_referrals_type_enum';
        `);
        const typeLabels = typeRes.rows.map(r => r.enumlabel);
        console.log('Current Type Enum:', typeLabels);

        const requiredTypes = ['subscription', 'signup'];
        for (const type of requiredTypes) {
            if (!typeLabels.includes(type)) {
                console.log(`Adding "${type}" to affiliate_referrals_type_enum...`);
                await client.query(`ALTER TYPE affiliate_referrals_type_enum ADD VALUE '${type}'`);
            }
        }

        console.log('✅ Enums updated successfully!');
    } catch (err) {
        console.error('❌ Error updating enums:', err.message);
    } finally {
        await client.end();
    }
}

fixEnums();
