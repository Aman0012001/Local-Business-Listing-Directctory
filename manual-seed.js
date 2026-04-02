const { Client } = require('pg');

async function seedRules() {
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
        console.log('Connected to database for manual seeding...');

        const defaults = [
            { placement: 'homepage', pricePerHour: 100, pricePerDay: 2400 },
            { placement: 'category', pricePerHour: 70, pricePerDay: 1680 },
            { placement: 'listing', pricePerHour: 50, pricePerDay: 1200 },
            { placement: 'offer', pricePerHour: 40, pricePerDay: 960 },
            { placement: 'event', pricePerHour: 60, pricePerDay: 1440 },
            { placement: 'page', pricePerHour: 80, pricePerDay: 1920 },
        ];

        for (const rule of defaults) {
            const res = await client.query('SELECT id FROM promotion_pricing_rules WHERE placement = $1', [rule.placement]);
            if (res.rows.length === 0) {
                console.log(`Seeding missing rule: ${rule.placement}`);
                await client.query(
                    'INSERT INTO promotion_pricing_rules (placement, "pricePerHour", "pricePerDay", is_active) VALUES ($1, $2, $3, $4)',
                    [rule.placement, rule.pricePerHour, rule.pricePerDay, true]
                );
            } else {
                console.log(`Rule exists: ${rule.placement}`);
            }
        }

        console.log('Manual seeding complete.');
    } catch (err) {
        console.error('Error during manual seeding:', err);
    } finally {
        await client.end();
    }
}

seedRules();
