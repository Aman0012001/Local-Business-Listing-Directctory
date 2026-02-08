import { check, sleep } from 'k6';
import http from 'k6/http';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

export const options = {
    scenarios: {
        // 1. Browsing & Search (High Volume)
        browsing: {
            executor: 'constant-arrival-rate',
            rate: 10,
            timeUnit: '1s',
            duration: '1m',
            preAllocatedVUs: 10,
            maxVUs: 50,
        },
        // 2. Auth & Dashboard (Medium Volume)
        authenticated_ops: {
            executor: 'constant-arrival-rate',
            rate: 5,
            timeUnit: '1s',
            duration: '1m',
            preAllocatedVUs: 5,
            maxVUs: 20,
        },
        // 3. Lead Generation (Low Volume - Write Heavy)
        leads: {
            executor: 'per-vu-iterations',
            vus: 5,
            iterations: 10,
            maxDuration: '1m',
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<500'], // p95 latency must be below 500ms
        'http_req_failed': ['rate<0.01'],    // Error rate must be below 1%
    },
};

export default function () {
    // Scenario 1: Search
    const searchRes = http.get(`${BASE_URL}/businesses/search?q=aura`);
    check(searchRes, { 'search status 200': (r) => r.status === 200 });

    sleep(1);

    // Scenario 1: Business Detail
    const detailRes = http.get(`${BASE_URL}/businesses/aura-wellness`);
    check(detailRes, { 'detail status 200': (r) => r.status === 200 });

    sleep(1);

    // Scenario 3: Lead Submission
    const leadRes = http.post(`${BASE_URL}/leads`, JSON.stringify({
        businessId: 'aura-wellness',
        name: 'CI Tester',
        email: 'ci@test.com',
        type: 'inquiry'
    }), { headers: { 'Content-Type': 'application/json' } });

    check(leadRes, { 'lead created': (r) => r.status === 201 });
}

// Generate HTML Report
export function handleSummary(data) {
    return {
        'summary.html': htmlReport(data),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}
