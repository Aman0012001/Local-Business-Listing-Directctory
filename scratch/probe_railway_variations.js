const variations = [
    'https://local-business-listing-directory-production.up.railway.app',
    'https://local-business-listing-directctory-production.up.railway.app',
    'https://local-business-directory-production.up.railway.app',
    'https://business-listing-directory-production.up.railway.app',
    'https://local-business-listing-production.up.railway.app'
];

async function probe() {
    for (const base of variations) {
        const url = `${base}/api/v1/health`;
        console.log(`Probing ${url}...`);
        try {
            const res = await fetch(url, { method: 'HEAD', timeout: 5000 });
            console.log(`Result for ${url}: ${res.status}`);
        } catch (e) {
            console.log(`Failed for ${url}: ${e.message}`);
        }
    }
}

probe();
