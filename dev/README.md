# Development & VPS Setup Scripts

This folder contains scripts for initial VPS setup and manual operations.

## SSL/TLS Certificate Management

### Initial SSL Setup (One-time)

Run this when setting up SSL for the first time on your VPS:

```bash
export SSL_EMAIL=your-email@example.com
./ssl-setup.sh
```

**What it does:**
- Gets SSL certificate from Let's Encrypt for `d-t3.mooo.com`
- Combines certificates for HAProxy (`fullchain.pem` + `privkey.pem` → `combined.pem`)
- Reloads HAProxy to use new certificates

**Requirements:**
- HAProxy container must be running
- At least one client-mx container must be running (blue or green)
- Port 80 must be accessible from internet

---

### Certificate Renewal (Manual)

To manually renew certificates:

```bash
# Normal renewal (only renews if certificate expires within 30 days)
./renew-certs.sh

# Force renewal (renews immediately, useful for testing)
./renew-certs.sh --force
```

**What it does:**
- Runs certbot to check/renew certificate
- Combines certificates for HAProxy
- Gracefully reloads HAProxy (zero downtime)

---

### Automated Certificate Renewal (Cron)

Add this to your VPS crontab (`crontab -e`):

```bash
# Weekly certificate renewal check on Sundays at 3 AM
0 3 * * 0 /opt/demo-t3-deploy/current/dev/renew-certs.sh >> /var/log/cert-renewal.log 2>&1
```

**Why weekly?**
- Let's Encrypt certificates expire in 90 days
- Certbot only renews when <30 days remain
- Weekly checks ensure you won't miss the renewal window

**Alternative schedules:**
```bash
# Daily at 3 AM (recommended by Let's Encrypt, but overkill)
0 3 * * * /opt/demo-t3-deploy/current/dev/renew-certs.sh >> /var/log/cert-renewal.log 2>&1

# Twice monthly (1st and 15th at 3 AM)
0 3 1,15 * * /opt/demo-t3-deploy/current/dev/renew-certs.sh >> /var/log/cert-renewal.log 2>&1
```

---

### Check Certificate Expiration

On the VPS:

```bash
# View certificate details
openssl x509 -in /opt/demo-t3-shared/letsencrypt/live/d-t3.mooo.com/fullchain.pem -noout -dates

# Quick expiration check
openssl x509 -in /opt/demo-t3-shared/letsencrypt/live/d-t3.mooo.com/fullchain.pem -noout -enddate
```

---

### View Renewal Logs

```bash
# View recent renewal attempts
tail -f /var/log/cert-renewal.log

# View all logs
cat /var/log/cert-renewal.log
```

---

## Architecture Notes

### SSL/TLS Termination
- **HAProxy** handles all SSL/TLS termination on ports 80/443
- **NGINX** containers run HTTP-only (port 80) behind HAProxy
- HAProxy routes traffic to blue/green NGINX containers

### Certificate Files
- **Location:** `/opt/demo-t3-shared/letsencrypt/live/d-t3.mooo.com/`
- **Files:**
  - `fullchain.pem` - Certificate chain
  - `privkey.pem` - Private key
  - `combined.pem` - Combined file for HAProxy (auto-generated)

### ACME Challenge
- ACME HTTP-01 challenges are handled by NGINX containers
- HAProxy routes `/.well-known/acme-challenge/` requests to NGINX
- Certbot validates domain ownership through this path
