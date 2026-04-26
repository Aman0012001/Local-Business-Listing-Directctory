async function test() {
    const baseUrl = '`${process.env.NEXT_PUBLIC_API_URL}`';

    const searches = [
        { query: 'pizza', city: 'Lahore', latitude: 31.5204, longitude: 74.3587 },
        { query: 'tech', city: 'Karachi', latitude: 24.8607, longitude: 67.0011 },
        { query: 'clothing', city: 'Islamabad', latitude: 33.6844, longitude: 73.0479 },
        { query: 'cafe', city: 'Lahore', latitude: 31.5580, longitude: 74.3507 },
        { query: 'tech', city: 'Karachi', latitude: 24.8807, longitude: 67.0211 },
    ];

    for (const s of searches) {
        try {
            console.log(`Logging search for ${s.query} in ${s.city}...`);
            const params = new URLSearchParams({
                query: s.query,
                city: s.city,
                latitude: s.latitude.toString(),
                longitude: s.longitude.toString()
            }).toString();

            const response = await fetch(`${baseUrl}/businesses/search?${params}`);
            if (!response.ok) {
                console.error(`Error logging search: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            console.error('Error logging search:', err.message);
        }
    }
    console.log('Test completed.');
}

test();
