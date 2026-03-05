const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './backend/.env') });

async function createTables() {
    const AppDataSource = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        logging: false,
    });

    try {
        await AppDataSource.initialize();
        console.log("Connected to database");

        console.log("Creating 'comments' table...");

        // Create enum type if it doesn't exist
        try {
            await AppDataSource.query(`
                DO $$ BEGIN
                    CREATE TYPE comments_status_enum AS ENUM ('visible', 'hidden', 'flagged');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);
        } catch (e) {
            console.log("Enum type might already exist or failed to create (could be permissions)");
        }

        await AppDataSource.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                business_id UUID NOT NULL,
                content TEXT NOT NULL,
                rating INTEGER,
                status comments_status_enum DEFAULT 'visible',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
            )
        `);

        console.log("Creating 'comment_replies' table...");
        await AppDataSource.query(`
            CREATE TABLE IF NOT EXISTS comment_replies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                comment_id UUID NOT NULL,
                vendor_id UUID NOT NULL,
                reply_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
                CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
                CONSTRAINT uq_comment UNIQUE (comment_id)
            )
        `);

        // Add indexes
        console.log("Creating indexes...");
        await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)`);
        await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_comments_business_id ON comments(business_id)`);
        await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at)`);

        console.log("Migration successful: Created 'comments' and 'comment_replies' tables.");

    } catch (error) {
        console.error("Error during migration:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

createTables();
