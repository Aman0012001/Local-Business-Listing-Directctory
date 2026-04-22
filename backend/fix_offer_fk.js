const { Client } = require('pg');
const client = new Client({
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  // Add the FK to businesses table (correct table name)
  try {
    await client.query(`
      ALTER TABLE offer_events
        ADD CONSTRAINT fk_offer_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    `);
    console.log('FK offer_events -> businesses added');
  } catch(e) {
    console.log('FK skipped:', e.message);
  }

  // Also check vendor_id references vendors correctly
  const vendorCols = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'vendors' AND column_name = 'id'
  `);
  console.log('vendors.id exists:', vendorCols.rows.length > 0);

  // Verify the full query that the offers service uses on the business detail page 
  // (simulates what findPublicByBusiness does)
  const bizRow = await client.query(`SELECT id FROM businesses LIMIT 1`);
  if (bizRow.rows.length > 0) {
    const bizId = bizRow.rows[0].id;
    const test = await client.query(`
      SELECT id FROM offer_events 
      WHERE business_id = $1
        AND is_active = true 
        AND status != 'expired'
        AND (expiry_date IS NULL OR expiry_date > now())
        AND (end_date IS NULL OR end_date > now())
        AND placements @> $2::jsonb
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 20
    `, [bizId, JSON.stringify(['listing'])]);
    console.log('Full offers query OK for business', bizId, '- rows:', test.rows.length);
  }

  await client.end();
  console.log('Done!');
}).catch(e => console.error('Error:', e.message));
