/**
 * Fix: Re-approve all reviews that were incorrectly set to isApproved=false
 * by the suspicion detection auto-rejection logic.
 * 
 * Run: node fix-unapproved-reviews.js
 */
const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false },
});

async function fixReviews() {
    await client.connect();
    console.log('Connected to database');

    // First, see how many are unapproved
    const countResult = await client.query(
        `SELECT COUNT(*) FROM reviews WHERE "isApproved" = false`
    );
    console.log(`Found ${countResult.rows[0].count} unapproved reviews`);

    // Re-approve all of them
    const updateResult = await client.query(
        `UPDATE reviews SET "isApproved" = true WHERE "isApproved" = false`
    );
    console.log(`Re-approved ${updateResult.rowCount} reviews`);

    // Show current state
    const afterResult = await client.query(
        `SELECT COUNT(*) as total, 
                SUM(CASE WHEN "isApproved" = true THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN "isApproved" = false THEN 1 ELSE 0 END) as unapproved
         FROM reviews`
    );
    console.log('Reviews state after fix:', afterResult.rows[0]);

    await client.end();
    console.log('Done!');
}

fixReviews().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
