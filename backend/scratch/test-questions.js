const http = require('http');

async function testEndpoint() {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/business-setup/questions',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        let data = '';
        res.on('data', (d) => {
            data += d;
        });
        res.on('end', () => {
            console.log('Body:', data);
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.end();
}

testEndpoint();
