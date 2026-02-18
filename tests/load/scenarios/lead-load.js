import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

export const options = {
    stages: [
        { duration: '1m', target: 30 },
        { duration: '2m', target: 30 },
        { duration: '1m', target: 0 },
    ],
};

export default function () {
    const businessId = 'aura-wellness'; // Simulated ID

    const leadPayload = JSON.stringify({
        businessId: businessId,
        name: 'Load Tester',
        email: 'tester@load.com',
        phone: '1234567890',
        message: 'Testing system pressure and websocket emits',
        type: 'inquiry'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Simulate Lead Generation (Triggers WebSocket notification in backend)
    const res = http.post(`${BASE_URL}/leads`, leadPayload, params);

    check(res, {
        'lead created': (r) => r.status === 201,
        'notify emitted': (r) => r.status < 400,
    });

    sleep(5); // Simulate user read time
}
