const { Client } = require('pg');

async function seed() {
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
        
        const plans = [
            { name: 'Silver Plan', type: 'silver', price: 500, duration: 7, unit: 'days' },
            { name: 'Gold Plan', type: 'gold', price: 1500, duration: 15, unit: 'days' },
            { name: 'Platinum Plan', type: 'platinum', price: 4000, duration: 30, unit: 'days' }
        ];

        for (const plan of plans) {
            const sql = `
                INSERT INTO offer_event_pricing (name, type, price, duration, unit, is_active)
                VALUES ($1, $2, $3, $4, $5, true)
                ON CONFLICT DO NOTHING;
            `;
            await client.query(sql, [plan.name, plan.type, plan.price, plan.duration, plan.unit]);
            console.log(`Seeded plan: ${plan.name}`);
        }

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.end();
    }
}

seed();
