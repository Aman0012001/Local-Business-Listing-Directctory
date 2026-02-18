import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

export const options = {
    scenarios: {
        checkout_pressure: {
            executor: 'constant-arrival-rate',
            rate: 1, // 1 checkout per second (low volume but sustained)
            timeUnit: '1s',
            duration: '2m',
            preAllocatedVUs: 5,
            maxVUs: 10,
        },
    },
};

export default function () {
    const planId = '00000000-0000-0000-0000-000000000002'; // Professional Plan

    const payload = JSON.stringify({
        planId: planId,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${__ENV.TEST_AUTH_TOKEN}`, // Required for checkout
        },
    };

    const res = http.post(`${BASE_URL}/subscriptions/checkout`, payload, params);

    check(res, {
        'checkout session created': (r) => r.status === 201,
        'has stripe url': (r) => r.json().checkoutUrl !== undefined,
    });

    sleep(10);
}
