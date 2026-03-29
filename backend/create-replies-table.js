const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const createTableSql = `
            CREATE TABLE IF NOT EXISTS review_replies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                review_id UUID NOT NULL,
                user_id UUID NOT NULL,
                content TEXT NOT NULL,
                is_approved BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now(),
                FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `;

        await client.query(createTableSql);
        console.log('review_replies table created successfully.');

        // Let's also create the indices that TypeORM would have created
        await client.query(`CREATE INDEX IF NOT EXISTS "IDX_review_replies_review_id" ON review_replies (review_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS "IDX_review_replies_user_id" ON review_replies (user_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS "IDX_review_replies_is_approved" ON review_replies (is_approved);`);
        await client.query(`CREATE INDEX IF NOT EXISTS "IDX_review_replies_created_at" ON review_replies (created_at);`);
        
        console.log('Indices created successfully.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
        console.log('Disconnected');
    }
}

main();
