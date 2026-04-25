
const urls = [
    'https://local-business-listing-directory-production.railway.app/api/v1/health',
    'https://local-business-listing-directory-production.railway.app/api/health',
    'https://local-business-listing-directory-production.railway.app/v1/health',
    'https://local-business-listing-directory-production.railway.app/health',
    'https://local-business-listing-directory-production.railway.app/api/docs',
];

async function check() {
    for (const url of urls) {
        try {
            const res = await fetch(url);
            console.log(`URL: ${url} | Status: ${res.status} | Content-Type: ${res.headers.get('content-type')}`);
            if (res.ok) {
                const text = await res.text();
                console.log(`Response snippet: ${text.substring(0, 100)}`);
            }
        } catch (e) {
            console.log(`URL: ${url} | Failed: ${e.message}`);
        }
    }
}

check();
