const { Client } = require('pg');

async function run() {
    const client = new Client({
        host: '66.33.22.240',
        port: 45505,
        user: 'postgres',
        password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
        database: 'railway',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const email = 'amanjeetthakur644@gmail.com';

        // 1. Find User
        const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rowCount === 0) {
            console.error('User not found');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log(`Found User ID: ${userId}`);

        // 2. Find Vendor
        const vendorRes = await client.query('SELECT id FROM vendors WHERE "user_id" = $1', [userId]);
        if (vendorRes.rowCount === 0) {
            console.error('Vendor record not found for this user');
            return;
        }
        const vendorId = vendorRes.rows[0].id;
        console.log(`Found Vendor ID: ${vendorId}`);

        // 3. Find Business (Listing)
        const businessRes = await client.query('SELECT id, name as title FROM businesses WHERE "vendor_id" = $1 LIMIT 1', [vendorId]);
        if (businessRes.rowCount === 0) {
            console.error('No business (listing) found for this vendor. Please create a business first.');
            return;
        }
        const businessId = businessRes.rows[0].id;
        console.log(`Found Business ID: ${businessId} (${businessRes.rows[0].title})`);

        // 4. Find Booster Plan (Pricing)
        const planRes = await client.query('SELECT id, name, duration FROM offer_event_pricing WHERE "is_active" = true LIMIT 1');
        if (planRes.rowCount === 0) {
            console.error('No active pricing plans found.');
            return;
        }
        const pricingId = planRes.rows[0].id;
        console.log(`Found Pricing ID: ${pricingId} (${planRes.rows[0].name})`);

        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // 5. Create Test Offer
        const offerSql = `
            INSERT INTO offer_events 
            (title, description, type, status, is_active, start_date, end_date, expiry_date, vendor_id, business_id, pricing_id, highlights, terms)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id;
        `;
        const offerValues = [
            '🔥 Summer Mega Sale',
            'Get 40% OFF on all premium services this summer!',
            'offer',
            'active',
            true,
            now,
            weekLater,
            weekLater,
            vendorId,
            businessId,
            pricingId,
            JSON.stringify(['40% Discount', 'All Categories', 'Limited Time']),
            JSON.stringify(['Valid once per user', 'Cannot combine with other offers'])
        ];
        const offerInsert = await client.query(offerSql, offerValues);
        console.log(`✅ Created Offer ID: ${offerInsert.rows[0].id}`);

        // 6. Create Test Event
        const eventValues = [
            '✨ Exclusive Vendor Networking',
            'Join the elite vendors for an evening of networking and growth.',
            'event',
            'active',
            true,
            now,
            weekLater,
            weekLater,
            vendorId,
            businessId,
            pricingId,
            JSON.stringify(['Networking', 'Dinner Included', 'Guest Speakers']),
            JSON.stringify(['ID Required', 'Prior registration required'])
        ];
        const eventInsert = await client.query(offerSql, eventValues);
        console.log(`✅ Created Event ID: ${eventInsert.rows[0].id}`);

    } catch (err) {
        console.error('Operation failed:', err);
    } finally {
        await client.end();
    }
}

run();
