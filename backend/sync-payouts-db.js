const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: 'postgres://postgres:RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI@66.33.22.240:45505/railway',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Fix affiliates table columns
        console.log('Syncing affiliates table columns...');
        
        // Check if total_earned exists and rename to total_earnings
        const colsRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'affiliates'`);
        const cols = colsRes.rows.map(r => r.column_name);

        if (cols.includes('total_earned') && !cols.includes('total_earnings')) {
            console.log('Renaming total_earned to total_earnings...');
            await client.query(`ALTER TABLE "affiliates" RENAME COLUMN "total_earned" TO "total_earnings";`);
        } else if (!cols.includes('total_earnings')) {
            console.log('Adding total_earnings column...');
            await client.query(`ALTER TABLE "affiliates" ADD COLUMN "total_earnings" decimal(10,2) DEFAULT 0;`);
        }

        if (!cols.includes('total_withdrawals')) {
            console.log('Adding total_withdrawals column...');
            await client.query(`ALTER TABLE "affiliates" ADD COLUMN "total_withdrawals" decimal(10,2) DEFAULT 0;`);
        }

        // 2. Create payouts table
        console.log('Creating payouts table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "payouts" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "affiliate_id" uuid NOT NULL,
                "amount" decimal(10,2) NOT NULL,
                "payment_method" varchar(50) NOT NULL,
                "payment_details" text NOT NULL,
                "status" varchar DEFAULT 'pending',
                "admin_notes" text,
                "processed_at" timestamp,
                "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_affiliate FOREIGN KEY(affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE
            );
        `);
        console.log('Done.');

        // 3. Initialize default settings
        console.log('Initializing system settings...');
        const settings = [
            { key: 'affiliate_commission_rate', value: '10', description: 'Affiliate commission value for premium subscriptions', group: 'affiliate' },
            { key: 'affiliate_commission_type', value: 'percent', description: 'Commission type (percent or fixed)', group: 'affiliate' },
            { key: 'affiliate_checkin_reward', value: '5', description: 'Affiliate reward value for unique business check-ins', group: 'affiliate' },
            { key: 'affiliate_checkin_type', value: 'fixed', description: 'Check-in reward type (percent or fixed)', group: 'affiliate' },
            { key: 'affiliate_validity_months', value: '2', description: 'Number of months a referral remains eligible for rewards', group: 'affiliate' },
            { key: 'affiliate_settings_expiry', value: '', description: 'Specific expiry date for current affiliate settings (YYYY-MM-DD)', group: 'affiliate' }
        ];

        for (const setting of settings) {
            await client.query(`
                INSERT INTO "system_settings" ("key", "value", "description", "group")
                VALUES ($1, $2, $3, $4)
                ON CONFLICT ("key") DO UPDATE SET
                    "description" = EXCLUDED."description",
                    "group" = EXCLUDED."group";
            `, [setting.key, setting.value, setting.description, setting.group]);
        }
        console.log('Done.');

        console.log("Database schema updated successfully");
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
        console.log('Disconnected from database.');
    }
}
run();
