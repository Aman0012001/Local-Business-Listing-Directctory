const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './backend/.env') });

async function updateSchema() {
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

        console.log("Adding missing columns to 'leads' table...");

        // Add vendor_reply column
        await AppDataSource.query(`
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS vendor_reply TEXT
        `);

        // Add vendor_replied_at column
        await AppDataSource.query(`
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS vendor_replied_at TIMESTAMP
        `);

        console.log("Migration successful: Added 'vendor_reply' and 'vendor_replied_at' columns to 'leads' table");

    } catch (error) {
        console.error("Error during migration:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

updateSchema();
