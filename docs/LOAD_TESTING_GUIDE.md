# Load & Stress Testing Guide (k6)

This document provides instructions for stress-testing the Aura platform production and staging environments using **k6**.

## 1. Prerequisites
- [k6 installed](https://k6.io/docs/getting-started/installation/) on your local machine or a separate test runner server.
- Valid test credentials in the targeted environment.

---

## 2. Test Scenarios

| File | Scenario | Load Type |
|------|----------|-----------|
| `public-load.js` | Business search & details | Ramping Arrival Rate (Traffic spikes) |
| `auth-load.js` | Login & Profile access | Sustained (User sessions) |
| `lead-load.js` | Lead generation | Constant Pressure (Write performance) |
| `stripe-load.js` | Stripe checkout creation | Low-Volume (Integration health) |

---

## 3. Execution Commands

### Staging Baseline (Safe start)
```bash
k6 run -e API_URL=https://staging.aura.com/api/v1 -e TEST_USER_EMAIL=staging@aura.com tests/load/scenarios/public-load.js
```

### Production Spike Test (Controlled)
```bash
k6 run --vus 50 --duration 5m -e API_URL=https://api.aura.com/api/v1 tests/load/scenarios/public-load.js
```

### Full System Stress (Sequential)
```bash
./tests/load/run-all-tests.sh
```

---

## 4. Metrics & Thresholds

| Metric | Target (SLA) | Critical (Threshold) |
|--------|--------------|----------------------|
| **Response Time (p95)** | < 300ms | > 1000ms |
| **Error Rate** | < 0.1% | > 1.0% |
| **Max Throughput** | 100+ RPS | Failure to scale |

---

## 5. Result Interpretation & Tuning

### Symptom: High `http_req_duration` (Latency)
- **Check DB**: Are indexes missing on `businesses` or `leads`?
- **Check Redis**: Is the search query cache hit rate low?
- **Check Nginx**: Are worker connections too low?

### Symptom: 504 Gateway Timeout
- **Cause**: Backend service (NestJS) is stuck or processing long-running tasks.
- **Fix**: Upgrade EC2 instance (t3.medium -> t3.large) or increase `MAX_CONNECTIONS` in Postgres.

### Symptom: 429 Too Many Requests
- **Cause**: Rate limiting (`ThrottlerModule`) is kicking in.
- **Fix**: Adjust `THROTTLE_LIMIT` in `.env` if legitimate traffic is being blocked.

---

## 6. Scaling Recommendations

| Current Load (RPS) | Metric Threshold | Recommended Action |
|--------------------|------------------|-------------------|
| 0 - 50 | Low Pressure | Maintain `t3.medium` |
| 50 - 150 | CPU > 70% | Move to `t3.large` or Cluster mode (PM2) |
| 150 - 500+ | Memory Pressure | Move to **AWS ECS/EKS** with Auto-Scaling |
| High Read/Write | Latency > 500ms | Split DB (Read Replicas) |

---

## 7. Final Production Launch Approval

- [ ] **Load Test Passed**: p95 < 500ms at 100 concurrent users.
- [ ] **Error Rate**: 0% during sustained load.
- [ ] **Data Integrity**: Verify no duplicate subscriptions or broken leads after stress.
- [ ] **Resource Peak**: Memory usage stayed below 80% during the crash test.
---

## 8. Automated CI/CD Nightly Tests

The system is configured to run automated load tests every night at **02:00 UTC** via GitHub Actions (`.github/workflows/load-tests.yml`).

### CI Behavior:
- **Environment**: Defaults to `staging`.
- **Thresholds**: Strict `p95 < 500ms` and `error < 1%`.
- **Pipeline Failure**: If thresholds are breached, the workflow fails, preventing unmonitored performance regressions.
- **Reporting**: An interactive `summary.html` is generated and uploaded as a GitHub Artifact for every run.

### Setup Checklist for CI:
1. **GitHub Secrets**: Ensure `STAGING_API_URL` and `PROD_API_URL` are set.
2. **Slack Alerts**: Add `SLACK_WEBHOOK` to secrets to receive instant failure notifications.

### Tuning Thresholds:
You can adjust the strictness of the tests directly in `tests/load/ci-suite.js`:

```javascript
export const options = {
  thresholds: {
    'http_req_duration': ['p(95)<500'], // Decrease for tighter performance budgets
    'http_req_failed': ['rate<0.01'],    // Increase if external service instability is expected
  },
};
```
