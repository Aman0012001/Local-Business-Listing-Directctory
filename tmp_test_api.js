async function test() {
    try {
        const res = await fetch('http://localhost:3002/api/v1/cities/admin');
        console.log('Status:', res.status);
        console.log('Status Text:', res.statusText);
        const text = await res.text();
        console.log('Response:', text.substring(0, 200));
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}
test();
