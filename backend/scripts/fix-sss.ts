
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixUserSSS() {
    try {
        const connection = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            ssl: { rejectUnauthorized: false },
            entities: [path.join(__dirname, '../src/entities/*.entity.ts')],
        });

        // 1. Find user sss
        const userRes = await connection.query("SELECT id FROM users WHERE email='sss@gmail.com'");
        const uid = userRes[0]?.id;
        const vendRes = await connection.query("SELECT id FROM vendors WHERE user_id=$1", [uid]);
        const vid = vendRes[0]?.id;

        // 2. Find Basic plan ID
        const basicPlan = await connection.query("SELECT id FROM pricing_plans WHERE name ILIKE '%basic%' LIMIT 1");
        const bid = basicPlan[0]?.id;
        
        console.log(`User ID: ${uid}, Vendor ID: ${vid}, Basic Plan ID: ${bid}`);

        if (vid && bid) {
            // Check current active plan for this vendor
            const currentPlan = await connection.query(`
                SELECT ap.id, p.name 
                FROM active_plans ap 
                JOIN pricing_plans p ON ap.plan_id = p.id 
                WHERE ap.vendor_id = $1 AND ap.status = 'active'
            `, [vid]);
            
            console.log('Current Active Plans:', currentPlan);

            if (currentPlan.length > 0) {
                const planRecordId = currentPlan[0].id;
                console.log(`Setting plan for active_plans record ${planRecordId} to ${bid}`);
                const upd = await connection.query(`
                    UPDATE active_plans 
                    SET plan_id = $1 
                    WHERE id = $2
                `, [bid, planRecordId]);
                console.log('Update result:', upd);
            }
        } else {
            console.log('Could not find vendor or basic plan');
        }

        await connection.close();
    } catch (err) {
        console.error('ERROR in fix script:', err);
    }
}

fixUserSSS();
