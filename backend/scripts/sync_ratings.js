const { Client } = require('pg');

async function syncRatings() {
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
        console.log('Connected to database');

        // Get all businesses that have comments
        const businessesWithComments = await client.query('SELECT DISTINCT "business_id" FROM comments');
        console.log(`Found ${businessesWithComments.rows.length} businesses with comments`);

        for (const row of businessesWithComments.rows) {
            const businessId = row.business_id;

            // Calculate avg and count for this business (only visible comments with ratings)
            const stats = await client.query(`
        SELECT 
          AVG(rating) as "averageRating",
          COUNT(*) as "totalReviews"
        FROM comments
        WHERE "business_id" = $1 
        AND status = 'visible'
        AND rating IS NOT NULL
      `, [businessId]);

            const avg = parseFloat(stats.rows[0].averageRating) || 0;
            const count = parseInt(stats.rows[0].totalReviews) || 0;
            const roundedAvg = Math.round(avg * 100) / 100;

            // Update business table
            await client.query(`
        UPDATE businesses
        SET 
          average_rating = $1,
          total_reviews = $2
        WHERE id = $3
      `, [roundedAvg, count, businessId]);

            console.log(`Updated Business ID ${businessId}: Rating=${roundedAvg}, Reviews=${count}`);
        }

        console.log('Sync completed successfully!');
    } catch (err) {
        console.error('Error during sync:', err);
    } finally {
        await client.end();
    }
}

syncRatings();
