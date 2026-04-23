
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load backend env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function syncPlacements() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Reset all placements to [] to start fresh
    await client.query("UPDATE offer_events SET placements = '[]'::jsonb;");
    console.log('Reset all offer placements to [].');

    // 2. Fetch all active promotions
    const now = new Date();
    const activePromotionsRes = await client.query(`
      SELECT offer_event_id, placements 
      FROM promotion_bookings 
      WHERE status = 'active' 
      AND start_time <= $1 
      AND end_time > $1
    `, [now]);

    const activePromotions = activePromotionsRes.rows;
    console.log(`Found ${activePromotions.length} active promotions.`);

    // 3. Update offers one by one
    // (Map to aggregate placements for each offer)
    const offerPlacementsMap = new Map();
    activePromotions.forEach(promo => {
        const current = offerPlacementsMap.get(promo.offer_event_id) || [];
        const combined = [...new Set([...current, ...promo.placements])];
        offerPlacementsMap.set(promo.offer_event_id, combined);
    });

    for (const [offerId, placements] of offerPlacementsMap.entries()) {
        await client.query(
            "UPDATE offer_events SET placements = $1::jsonb WHERE id = $2",
            [JSON.stringify(placements), offerId]
        );
        console.log(`Synced placements ${JSON.stringify(placements)} for offer ${offerId}`);
    }

    console.log('Sync complete!');

  } catch (err) {
    console.error('Error during sync:', err);
  } finally {
    await client.end();
  }
}

syncPlacements();
