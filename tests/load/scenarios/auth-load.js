import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';
const TEST_EMAIL = __ENV.TEST_USER_EMAIL || 'vendor@example.com';
const TEST_PASSWORD = __ENV.TEST_USER_PASSWORD || 'Password123!';

export const options = {
    stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'],
    },
};

export default function () {
    // 1. Login
    const loginPayload = JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);

    const isOk = check(loginRes, {
        'login success': (r) => r.status === 200 || r.status === 201,
        'has token': (r) => r.json().accessToken !== undefined,
    });

    if (!isOk) return;

    const authToken = loginRes.json().accessToken;
    const authParams = {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    };

    sleep(1);

    // 2. Profile Access
    const profileRes = http.get(`${BASE_URL}/users/profile`, authParams);
    check(profileRes, {
        'profile status is 200': (r) => r.status === 200,
    });

    sleep(2);

    // 3. Refresh Token (assuming endpoint exists)
    // const refreshRes = http.post(`${BASE_URL}/auth/refresh`, {}, authParams);
    // check(refreshRes, { 'refresh status is 200': (r) => r.status === 200 });
}
