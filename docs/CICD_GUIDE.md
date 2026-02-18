# CI/CD & Production Deployment Guide

This guide explains how to configure GitHub Actions for automated deployments and how to maintain the production environment.

## 1. GitHub Secrets Configuration

You must add the following secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):

### Infrastructure Secrets
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `PROD_HOST` | Production server IP/Domain | `1.2.3.4` |
| `STAGING_HOST` | Staging server IP/Domain | `staging.aura.com` |
| `SERVER_USER` | SSH username | `deploy` |
| `SSH_PRIVATE_KEY` | Private SSH key to access servers | `-----BEGIN RSA PRIVATE KEY-----...` |
| `DOCKERHUB_USERNAME`| Docker Hub username | `auraplatform` |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token | `dckr_pat_...` |

### Application Secrets (Frontend & Backend)
| Secret Name | Description |
|-------------|-------------|
| `PROD_API_URL` | Live API Endpoint (Frontend build) |
| `STAGING_API_URL` | Staging API Endpoint (Frontend build) |
| `STRIPE_PUBLIC_KEY`| Stripe Test/Live Public Key |
| `STRIPE_SECRET_KEY`| Stripe Test/Live Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook signing secret |
| `DB_PASSWORD` | Production PostgreSQL password |
| `JWT_SECRET` | Secret for signing auth tokens |

---

## 2. Server-Side Setup Instructions

On your production/staging server, follow these steps to prepare the environment:

1. **Install Docker & Docker Compose**:
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io docker-compose -y
   sudo usermod -aG docker $USER
   ```

2. **Directory Structure**:
   ```bash
   sudo mkdir -p /opt/aura-platform
   sudo chown -R $USER:$USER /opt/aura-platform
   cd /opt/aura-platform
   ```

3. **Environment Files**:
   Create a `.env` file in `/opt/aura-platform/` with all necessary production variables.

4. **Copy Docker Compose**:
   Ensure the `docker-compose.yml` from the repository is present in `/opt/aura-platform/`.

---

## 3. Zero-Downtime Deployment & Rollback

### Zero-Downtime Strategy
The current configuration uses `docker-compose up -d`, which restarts containers. To achieve true zero-downtime:
1. **Blue-Green Deployment**: Spin up a new set of containers on a different port, wait for health checks, and swap Nginx upstream.
2. **Rolling Update**: If using Docker Swarm or Kubernetes, use `update-config` to rotate containers one by one.

### Quick Rollback Strategy
If a deployment fails or introduces a critical bug:
1. **Manual Rollback**:
   Update the image tag in `docker-compose.yml` to the previous stable version (e.g., `aura-api:main-old-hash`) and run:
   ```bash
   docker-compose up -d api
   ```
2. **Revert Commit**:
   Revert the faulty commit on the `main` branch and push. GitHub Actions will automatically redeploy the previous known-good state.

---

## 4. Final Production Launch Checklist

Before flipping the switch:
- [ ] **Database Backups**: Ensure automated daily backups are configured for PostgreSQL.
- [ ] **Health Checks**: Verify `docker-compose ps` shows all services as `healthy`.
- [ ] **SSL Certification**: Ensure Let's Encrypt certificates are active and auto-renewing.
- [ ] **Log Rotation**: Configure Docker log rotation to prevent disk overflow.
- [ ] **Error Tracking**: Integrate Sentry or similar for real-time error monitoring.
- [ ] **Firewall**: Ensure only ports 80, 443, and 22 (SSH) are open to the public.

---

## 5. Monitoring & Alerting Recommendations

1. **Uptime Monitoring**: Use **UptimeRobot** or **Better Stack** to ping your frontend and API every 60 seconds.
2. **Resource Monitoring**: Use **Netdata** or **Prometheus/Grafana** to monitor CPU/RAM/Disk usage on the server.
3. **Log Aggregation**: Use **Loki** or **ELK Stack** (already partially in your `docker-compose`) to search and visualize application logs.
4. **Discord/Slack Alerts**: Configure GitHub Actions to send a message to a channel whenever a build or deployment fails.
