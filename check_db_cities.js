const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './backend/.env') });

async function checkCities() {
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

        const cities = await AppDataSource.query("SELECT DISTINCT state FROM cities ORDER BY state");
        console.log("Found states in database:", JSON.stringify(cities.map(c => c.state)));

        const cityCount = await AppDataSource.query("SELECT COUNT(*) FROM cities");
        console.log("Total cities:", cityCount[0].count);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

checkCities();
