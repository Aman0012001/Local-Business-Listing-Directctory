# AWS Infrastructure Deployment Guide (Terraform)

This guide provides steps to provision and manage your AWS infrastructure using Terraform.

## 1. Prerequisites
- [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) installed.
- [AWS CLI](https://aws.amazon.com/cli/) configured with proper credentials.
- An existing SSH Key Pair in AWS (named in `ssh_key_name`).

## 2. Deployment Steps

### Step 1: Initialize
Navigate to the environment directory (e.g., `production`):
```bash
cd terraform/environments/production
terraform init
```

### Step 2: Configure
Create your `terraform.tfvars` from the example:
```bash
cp terraform.tfvars.example terraform.tfvars
# Update values in terraform.tfvars (AMI, SSH Key, Allowed IPs)
```

### Step 3: Plan & Apply
```bash
terraform plan
terraform apply
```
*Review the changes and type `yes` when prompted.*

### Step 4: Destroy (Cleanup)
```bash
terraform destroy
```

---

## 3. Cost Estimation (Monthly AWS Spend)

Based on a standard `t3.medium` setup in `us-east-1` (Prices are estimates):

| Service | Component | Estimated Monthly Cost |
|---------|-----------|------------------------|
| **EC2** | `t3.medium` instance (2 vCPU, 4GB RAM) | ~$30.00 |
| **EBS** | 20GB gp3 SSD Storage | ~$1.60 |
| **Networking** | Elastic IP & Data Transfer (100GB) | ~$10.00 |
| **Route 53** | Hosted Zone & Queries | ~$0.60 |
| **TOTAL** | | **~$42.20 / Month** |

*Note: You may qualify for the AWS Free Tier for some components during the first 12 months.*

---

## 4. Final Go-Live Checklist

- [ ] **DNS Record**: Point your domain (e.g., `aura.com`) and API subdomain (`api.aura.com`) to the **Elastic IP** output by Terraform.
- [ ] **Stripe Live Verification**:
    - Update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Live values.
    - Verify that the Webhook URL in Stripe Dashboard uses `https://`.
- [ ] **SSL Certificates**:
    - SSH into the server.
    - Use Certbot to generate certificates: `sudo certbot certonly --standalone -d aura.com -d api.aura.com`.
    - Place the resulting `fullchain.pem` and `privkey.pem` into `/opt/aura-platform/nginx/ssl/`.
- [ ] **Firewall Verification**:
    - Test that ports 80 and 443 are open.
    - Test that port 22 is **only** accessible from your allowed IPs.
- [ ] **Database Persistence**:
    - Verify that the Docker volume `postgres_data` is being saved correctly on the EBS volume.
- [ ] **Environment Seeding**: 
    - Ensure `SEED_DATABASE=true` is set for the first container start to populate professional plans.
