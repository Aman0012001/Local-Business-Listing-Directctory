const { Client } = require('pg');

const client = new Client({
    host: "66.33.22.240",
    port: 45505,
    user: "postgres",
    password: "RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI",
    database: "railway",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to DB");

        // List all tables
        const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables:", tablesRes.rows.map(r => r.table_name).join(', '));

        // Fix nulls in affiliates if it exists
        if (tablesRes.rows.some(r => r.table_name === 'affiliates')) {
            await client.query("UPDATE affiliates SET referral_code = 'REF-' || id WHERE referral_code IS NULL");
            console.log("Fixed affiliates");
        }

        // Fix nulls in affiliate_referrals if it exists (though I dropped it)
        if (tablesRes.rows.some(r => r.table_name === 'affiliate_referrals')) {
            await client.query("UPDATE affiliate_referrals SET type = 'default' WHERE type IS NULL");
            console.log("Fixed affiliate_referrals");
        }

        await client.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
