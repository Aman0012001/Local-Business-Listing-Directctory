async function testReviews() {
    const baseUrl = '`${process.env.NEXT_PUBLIC_API_URL}`';
    const token = 'YOUR_TOKEN_HERE'; // I'll need a token or use a public businessId

    // First, let's find a businessId
    const businessesRes = await fetch(`${baseUrl}/businesses/search?limit=1`);
    const businesses = await businessesRes.json();
    if (!businesses.data || businesses.data.length === 0) {
        console.error('No businesses found to review.');
        return;
    }
    const businessId = businesses.data[0].id;
    console.log(`Testing with Business ID: ${businessId}`);

    // I'll skip the token part for now and just check if the IP is being captured in the creation logic
    // Actually, I can't post without a token. 
    // I'll check the existing reviews in the admin endpoint instead.
}

testReviews();
