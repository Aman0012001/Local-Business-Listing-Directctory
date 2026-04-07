const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST || '66.33.22.240',
    port: parseInt(process.env.DB_PORT || '45505', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: process.env.DB_DATABASE || 'railway',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    
    try {
        // 1. Get user
        const userRes = await client.query('SELECT id, role FROM "users" WHERE email = $1', ['amanjeetthakur644@gmail.com']);
        const user = userRes.rows[0];
        if (!user) {
            console.log('User not found!');
            return;
        }
        
        // 2. Get vendor
        let vendorRes = await client.query('SELECT id FROM "vendors" WHERE "userId" = $1', [user.id]).catch(e => {
            return client.query('SELECT id FROM "vendors" WHERE "user_id" = $1', [user.id]);
        });
        let vendor = vendorRes.rows ? vendorRes.rows[0] : null;
        if (!vendor) {
            console.log('Vendor not found for user. Creating one...');
            vendorRes = await client.query('INSERT INTO "vendors" ("userId", "isVerified") VALUES ($1, true) RETURNING id', [user.id])
                .catch(() => client.query('INSERT INTO "vendors" ("user_id", "is_verified") VALUES ($1, true) RETURNING id', [user.id]));
            vendor = vendorRes.rows[0];
        }
        
        // 3. Get featured/premium plan
        const planRes = await client.query('SELECT id, name FROM "subscription_plans" WHERE "isActive" = true ORDER BY price DESC LIMIT 1')
            .catch(() => client.query('SELECT id, name FROM "subscription_plans" WHERE "is_active" = true ORDER BY price DESC LIMIT 1'));
        const plan = planRes.rows[0];
        if (!plan) {
            console.log('No subscription plans found in DB!');
            return;
        }
        console.log('Assigning plan:', plan.name);
        
        // 4. Cancel existing active subs
        await client.query('UPDATE "subscriptions" SET status = $1 WHERE "vendorId" = $2 AND status = $3', ['cancelled', vendor.id, 'active'])
            .catch(() => client.query('UPDATE "subscriptions" SET status = $1 WHERE "vendor_id" = $2 AND status = $3', ['cancelled', vendor.id, 'active']));
        
        // 5. Create new subscription
        const now = new Date();
        const endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
        
        await client.query(`
            INSERT INTO "subscriptions" 
            ("vendorId", "planId", status, "startDate", "endDate", amount, "autoRenew", "createdAt", "updatedAt") 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        `, [vendor.id, plan.id, 'active', now, endDate, 0, false, now])
            .catch(() => client.query(`
                INSERT INTO "subscriptions" 
                ("vendor_id", "plan_id", status, start_date, end_date, amount, auto_renew, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
            `, [vendor.id, plan.id, 'active', now, endDate, 0, false, now]));
        
        // 6. Make business featured if it exists
        const bizRes = await client.query('UPDATE "businesses" SET "isFeatured" = true, "featuredUntil" = $1 WHERE "vendorId" = $2 RETURNING id, name', [endDate, vendor.id])
            .catch(() => client.query('UPDATE "businesses" SET is_featured = true, "featuredUntil" = $1 WHERE vendor_id = $2 RETURNING id, name', [endDate, vendor.id]))
            .catch(() => client.query('UPDATE "businesses" SET is_featured = true, "featuredUntil" = $1 WHERE "vendor_id" = $2 RETURNING id, name', [endDate, vendor.id]))
            .catch(e => {
                console.log(e.message);
                return client.query('UPDATE "businesses" SET "isFeatured" = true WHERE "vendorId" = $2 RETURNING id, name', [endDate, vendor.id]).catch(()=>({rowCount:0}));
            });
            
        console.log(`Updated ${bizRes.rowCount} businesses to be featured.`);
        
        console.log('Successfully activated featured plan for amanjeetthakur644@gmail.com!');
    } catch (e) {
        console.error('FATAL ERROR:', e.message);
    } finally {
        await client.end();
    }
}

run();
