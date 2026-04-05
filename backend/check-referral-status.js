const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function check() {
    try {
        console.log('Connecting to database...');
        await AppDataSource.initialize();
        console.log('Connected.\n');

        const referrals = await AppDataSource.query(`
            SELECT 
                r.id as referral_id, 
                u.email, 
                v.id as vendor_id, 
                ap.id as plan_id, 
                v.is_verified
            FROM affiliate_referrals r
            JOIN users u ON r.referred_user_id = u.id
            JOIN vendors v ON u.id = v.user_id
            LEFT JOIN active_plans ap ON v.id = ap.vendor_id AND ap.status = 'active'
            WHERE r.status = 'converted'
        `);

        console.log(`--- CONVERTED Referrals Indexing (${referrals.length}) ---`);
        for (const r of referrals) {
            console.log(`- Vendor: ${r.email} (VendorID: ${r.vendor_id})`);
            console.log(`  Is Verified: ${r.is_verified}`);
            console.log(`  Plan: ${r.plan_id ? 'PREMIUM (OK)' : 'FREE/MISSING (ALERT!)'}`);
            
            const businesses = await AppDataSource.query(`SELECT id, status, is_verified, is_featured FROM businesses WHERE vendor_id = $1`, [r.vendor_id]);
            console.log(`  Businesses: ${businesses.length}`);
            businesses.forEach(b => console.log(`    - ID: ${b.id.substring(0,8)}... | Status: ${b.status} | Verified: ${b.is_verified} | Featured: ${b.is_featured}`));
            console.log('');
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

check();
