const fetch = require('node-fetch');

async function test() {
    const baseUrl = '`${process.env.NEXT_PUBLIC_API_URL}`';

    // 1. Try to login (using superadmin credentials if known, or vendor)
    // Based on logs, a common user is vendore@gmail.com
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'user1@gmail.com',
            password: 'password'
        })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const { token } = await loginRes.json();
    console.log('Login successful. Token acquired.');

    // 2. Test notifications endpoint
    const notifyRes = await fetch(`${baseUrl}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Notifications status:', notifyRes.status);
    console.log('Notifications response:', await notifyRes.text());
}

test();
