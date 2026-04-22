const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env parser since we want this script to be standalone
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found in backend directory!');
        return;
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

loadEnv();

async function diagnose() {
    console.log('🔍 Diagnosing Database Connection...');
    console.log(`📍 Target: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`👤 User: ${process.env.DB_USERNAME}`);
    console.log(`📂 Database: ${process.env.DB_DATABASE}`);
    console.log(`🔒 SSL: ${process.env.DB_SSL}`);

    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000, // 5 seconds timeout
    });

    try {
        console.log('\n⏳ Attempting to connect...');
        await client.connect();
        console.log('✅ SUCCESS: Connected to the database!');
        
        const res = await client.query('SELECT current_timestamp, version();');
        console.log('📅 Server Time:', res.rows[0].current_timestamp);
        console.log('🛠️ Server Version:', res.rows[0].version);
        
    } catch (err) {
        console.error('\n❌ CONNECTION FAILED!');
        console.error('-------------------------------------------');
        console.error(`Error Code: ${err.code || 'UNKNOWN'}`);
        console.error(`Message: ${err.message}`);
        
        if (err.message.includes('ENETUNREACH')) {
            console.error('\n🚩 ANALYSIS: "Network Unreachable" usually means:');
            console.error('1. Your computer has no internet access.');
            console.error('2. A firewall/antivirus on your computer is blocking outgoing connections on port ' + process.env.DB_PORT);
            console.error('3. Your ISP (Internet Provider) is blocking this specific IP address.');
        } else if (err.message.includes('ETIMEDOUT')) {
            console.error('\n🚩 ANALYSIS: "Connection Timed Out" usually means:');
            console.error('1. The server at ' + process.env.DB_HOST + ' is offline.');
            console.error('2. The server is up, but is NOT accepting connections from your current IP (Firewall on Railway side).');
        } else if (err.message.includes('auth')) {
            console.error('\n🚩 ANALYSIS: Authentication failed. Check your DB_USERNAME and DB_PASSWORD.');
        }
        console.error('-------------------------------------------');
    } finally {
        await client.end();
        console.log('\n🏁 Diagnosis complete.');
    }
}

diagnose();
