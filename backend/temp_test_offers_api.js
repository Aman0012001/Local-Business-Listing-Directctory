const axios = require('axios');

async function testOffersApi() {
    const baseUrl = 'http://localhost:3001/api/v1';
    
    console.log('Testing Public Offers Search API...');
    
    try {
        // Test basic search
        console.log('\n1. Testing basic search (no filters)...');
        const res1 = await axios.get(`${baseUrl}/offers/public/search`);
        console.log(`Success! Found ${res1.data.data.length} offers. Total: ${res1.data.meta.total}`);
        
        // Test city filter
        if (res1.data.data.length > 0) {
            const city = res1.data.data[0].business.city;
            console.log(`\n2. Testing city filter (City: ${city})...`);
            const res2 = await axios.get(`${baseUrl}/offers/public/search`, { params: { city } });
            console.log(`Success! Found ${res2.data.data.length} offers in ${city}.`);
        }
        
        // Test keyword filter
        console.log('\n3. Testing keyword filter (Query: "sale")...');
        const res3 = await axios.get(`${baseUrl}/offers/public/search`, { params: { query: 'sale' } });
        console.log(`Success! Found ${res3.data.data.length} offers matching "sale".`);

        // Test type filter
        console.log('\n4. Testing type filter (Type: "event")...');
        const res4 = await axios.get(`${baseUrl}/offers/public/search`, { params: { type: 'event' } });
        console.log(`Success! Found ${res4.data.data.length} events.`);

    } catch (error) {
        console.error('API Test Failed:', error.response ? error.response.data : error.message);
    }
}

testOffersApi();
