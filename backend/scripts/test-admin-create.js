const fetch = require('node-fetch');

async function testAdminCreate() {
    const API_URL = '`${process.env.NEXT_PUBLIC_API_URL}`';

    // 1. Login as Super Admin
    console.log('Logging in as Super Admin...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@example.com',
            password: 'Password123!'
        })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.error('Login failed:', loginData);
        return;
    }

    const token = loginData.tokens.accessToken;
    console.log('Login successful. Token acquired.');

    // 2. Get Categories to find a valid UUID
    console.log('Fetching categories...');
    const catRes = await fetch(`${API_URL}/categories`);
    const categories = await catRes.json();
    if (!catRes.ok || categories.length === 0) {
        console.error('Failed to fetch categories');
        return;
    }
    const categoryId = categories[0].id;
    console.log(`Using Category ID: ${categoryId}`);

    // 3. Attempt to create a business
    console.log('Attempting to create a business as Super Admin...');
    const createRes = await fetch(`${API_URL}/businesses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Super Admin Business Test ' + Date.now(),
            categoryId: categoryId,
            description: 'This is a test business created by Super Admin to verify RBAC changes.',
            phone: '+1234567890',
            address: '123 Admin Lane',
            city: 'Admin City',
            state: 'Admin State',
            pincode: '12345',
            latitude: 40.7128,
            longitude: -74.0060
        })
    });

    const createData = await createRes.json();
    if (createRes.ok) {
        console.log('SUCCESS: Business created successfully by Super Admin!');
        console.log('Business ID:', createData.id);
    } else {
        console.error('FAILURE: Failed to create business:', createData);
    }
}

testAdminCreate();
