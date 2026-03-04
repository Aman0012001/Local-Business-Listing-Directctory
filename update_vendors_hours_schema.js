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

        // Add business_hours column to vendors table if it doesn't exist
        await AppDataSource.query(`
            ALTER TABLE vendors 
            ADD COLUMN IF NOT EXISTS business_hours JSONB
        `);
        console.log("Migration successful: Added 'business_hours' column to 'vendors' table");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

updateSchema();
