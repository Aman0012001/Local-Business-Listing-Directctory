const fetch = require('node-fetch');

async function testSearch() {
    const url = 'http://localhost:3002/api/v1/offers/public/search?isFeatured=true&limit=4';
    console.log(`Testing ${url}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            const data = await res.json();
            console.log('Success! Data count:', data.data.length);
        } else {
            const text = await res.text();
            console.error('Error body:', text);
        }
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

testSearch();
