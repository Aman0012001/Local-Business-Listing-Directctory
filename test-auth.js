const { Client } = require('pg');

async function testPasswords() {
    const passwords = ['postgres', '5432', 'admin', 'root', 'password', '123456', 'Password123!', ''];
    const users = ['postgres', 'admin'];
    const databases = ['webapp', 'business_saas_db', 'postgres', 'local_business_platform'];

    console.log('--- Starting DB Password Brute-force ---');

    for (const user of users) {
        for (const pwd of passwords) {
            for (const db of databases) {
                const client = new Client({
                    user: user,
                    password: pwd,
                    host: 'localhost',
                    port: 5432,
                    database: db
                });

                try {
                    await client.connect();
                    console.log(`\n✅ SUCCESS!`);
                    console.log(`User: ${user}`);
                    console.log(`Password: ${pwd || '(empty)'}`);
                    console.log(`Database: ${db}`);
                    await client.end();
                    process.exit(0);
                } catch (err) {
                    process.stdout.write('.');
                    if (err.message.includes('password authentication failed')) {
                        // Expected
                    } else if (err.message.includes('database')) {
                        // Database might not exist, but password might be right?
                        // Actually auth happens first usually.
                    }
                }
            }
        }
    }

    console.log('\n❌ No passwords worked.');
}

testPasswords();
