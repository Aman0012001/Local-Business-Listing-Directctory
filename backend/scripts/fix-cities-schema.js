"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '../.env') });
async function run() {
    const client = new pg_1.Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    try {
        await client.connect();
        console.log('Connected to database');
        await client.query(`
            ALTER TABLE cities 
            ADD COLUMN IF NOT EXISTS "country" CHARACTER VARYING(100) DEFAULT 'Pakistan'
        `);
        console.log('Added country column successfully');
        await client.query(`
            CREATE INDEX IF NOT EXISTS "IDX_cities_country" ON "cities" ("country")
        `);
        console.log('Added index successfully');
    }
    catch (err) {
        console.error('Error during schema update:', err);
    }
    finally {
        await client.end();
    }
}
run();
//# sourceMappingURL=fix-cities-schema.js.map