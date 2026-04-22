const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function syncAffiliateTables() {
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
        console.log('Connected to database. Starting synchronization...');

        // 1. Create Affiliates Table
        console.log('Creating "affiliates" table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "affiliates" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" uuid UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                "referral_code" varchar UNIQUE NOT NULL,
                "total_earnings" decimal(10,2) DEFAULT 0,
                "total_withdrawals" decimal(10,2) DEFAULT 0,
                "balance" decimal(10,2) DEFAULT 0,
                "status" varchar DEFAULT 'active',
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `);
        console.log('✅ "affiliates" table ready.');

        // 2. Create Enums and Affiliate Referrals Table
        console.log('Creating enums and "affiliate_referrals" table...');
        
        try {
            await client.query("CREATE TYPE affiliate_referrals_type_enum AS ENUM ('subscription', 'signup')");
        } catch (e) {
            console.log('Type "affiliate_referrals_type_enum" already exists.');
        }

        try {
            await client.query("CREATE TYPE affiliate_referrals_status_enum AS ENUM ('pending', 'converted', 'expired')");
        } catch (e) {
            console.log('Type "affiliate_referrals_status_enum" already exists.');
        }

        await client.query(`
            CREATE TABLE IF NOT EXISTS "affiliate_referrals" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "affiliate_id" uuid NOT NULL REFERENCES "affiliates"("id") ON DELETE CASCADE,
                "referred_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                "type" affiliate_referrals_type_enum NOT NULL,
                "status" affiliate_referrals_status_enum DEFAULT 'pending',
                "commission_amount" decimal(10,2) DEFAULT 0,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log('✅ "affiliate_referrals" table ready.');

        // 3. Fix Payouts Table
        console.log('Updating "payouts" table constraints...');
        
        // Add foreign key if missing
        try {
            await client.query(`
                ALTER TABLE "payouts" 
                ADD CONSTRAINT "fk_payouts_affiliate" 
                FOREIGN KEY ("affiliate_id") 
                REFERENCES "affiliates"("id") 
                ON DELETE CASCADE;
            `);
            console.log('✅ Foreign key added to "payouts".');
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log('Constraint already exists in "payouts".');
            } else {
                console.warn('⚠️ Could not add constraint to "payouts" (it might already exist or column is missing):', e.message);
            }
        }

        console.log('\n🚀 Synchronization complete!');

    } catch (err) {
        console.error('❌ Error during synchronization:', err);
    } finally {
        await client.end();
    }
}

syncAffiliateTables();
