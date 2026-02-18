import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

export const options = {
    scenarios: {
        public_traffic: {
            executor: 'ramping-arrival-rate',
            startRate: 1,
            timeUnit: '1s',
            preAllocatedVUs: 10,
            maxVUs: 100,
            stages: [
                { duration: '1m', target: 50 }, // Ramp-up
                { duration: '3m', target: 50 }, // Sustained
                { duration: '1m', target: 100 }, // Spike
                { duration: '1m', target: 0 },  // Cool down
            ],
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
        http_req_failed: ['rate<0.01'],    // Less than 1% errors
    },
};

export default function () {
    // 1. Search Businesses
    const searchRes = http.get(`${BASE_URL}/businesses/search?q=aura&limit=10`);
    check(searchRes, {
        'search status is 200': (r) => r.status === 200,
        'search is fast': (r) => r.timings.duration < 500,
    });

    sleep(1);

    // 2. Load Business Detail (assuming a known ID or randomly pick if possible)
    // In a real test, we'd use a data file with IDs
    const detailRes = http.get(`${BASE_URL}/businesses/aura-wellness`);
    check(detailRes, {
        'detail status is 200': (r) => r.status === 200,
    });

    sleep(2);
}
