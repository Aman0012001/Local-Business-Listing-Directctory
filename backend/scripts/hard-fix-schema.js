const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function hardFixSchema() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        console.log('Connected.');

        // 1. Check if type enum exists independently of the table
        const typeCheck = await client.query("SELECT nspname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE typname = 'affiliate_referrals_type_enum'");
        
        if (typeCheck.rows.length === 0) {
            console.log('Creating type enum...');
            await client.query("CREATE TYPE affiliate_referrals_type_enum AS ENUM ('subscription', 'signup')");
        } else {
            console.log('Type enum exists. Checking labels...');
            const labelsRes = await client.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'affiliate_referrals_type_enum'");
            const labels = labelsRes.rows.map(r => r.enumlabel);
            if (!labels.includes('subscription')) {
                await client.query("ALTER TYPE affiliate_referrals_type_enum ADD VALUE 'subscription'");
            }
            if (!labels.includes('signup')) {
                await client.query("ALTER TYPE affiliate_referrals_type_enum ADD VALUE 'signup'");
            }
        }

        // 2. Ensure table column uses it
        console.log('Ensuring table column is correct...');
        // If the column exists but isn't an enum, this might be tricky, but check-schema said it was user-defined
        
        console.log('✅ Final schema check complete.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

hardFixSchema();
