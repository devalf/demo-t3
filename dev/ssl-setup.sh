#!/bin/bash

# SSL setup script for demo-t3
set -e

DOMAIN="d-t3.mooo.com"
EMAIL="${SSL_EMAIL:-admin@example.com}"

# Validate email is provided
if [ "$EMAIL" = "admin@example.com" ]; then
    echo "❌ Please set your email: export SSL_EMAIL=your-email@domain.com"
    echo "   Then run the script again"
    exit 1
fi

echo "🔒 Setting up SSL for $DOMAIN"

# Create directories for SSL certificates
echo "📁 Creating SSL directories..."
sudo mkdir -p /opt/demo-t3-shared/letsencrypt
sudo mkdir -p /opt/demo-t3-shared/www-certbot

# Set permissions
sudo chown -R $USER:$USER /opt/demo-t3-shared/letsencrypt
sudo chown -R $USER:$USER /opt/demo-t3-shared/www-certbot

echo "🔎 Detecting active client-mx container..."

# Find the active client-mx container (prefer the one publishing port 80)
CLIENT_CID=$(docker ps \
  --filter "label=com.docker.compose.service=client-mx" \
  --format '{{.ID}} {{.Ports}}' | \
  grep -E '(:80->80/tcp|0.0.0.0:80->80/tcp|:::80->80/tcp)' | \
  awk '{print $1}' | head -n1 || true)

# Fallback to any running client-mx container if not found by port
if [ -z "$CLIENT_CID" ]; then
  CLIENT_CID=$(docker ps --filter "label=com.docker.compose.service=client-mx" --format '{{.ID}}' | head -n1 || true)
fi

if [ -z "$CLIENT_CID" ]; then
  echo "❌ No running client-mx container found. Make sure your stack is up (blue/green) before running this script."
  echo "   Example: run your deployment to start containers, then re-run this SSL setup."
  exit 1
fi

CLIENT_NAME=$(docker inspect -f '{{.Name}}' "$CLIENT_CID" | sed 's#^/##')
echo "✅ Using container: $CLIENT_NAME ($CLIENT_CID)"

echo "🔄 Step 1: Ensuring ACME challenge location is active..."
# ACME location is already in apps/client-mx/nginx/nginx.http.conf packaged in the image.
# Validate and reload NGINX to ensure config is active.
docker exec "$CLIENT_CID" nginx -t || true
docker exec "$CLIENT_CID" nginx -s reload || true

echo "📋 Step 2: Getting SSL certificate..."

# Get the certificate using certbot
docker run --rm \
    -v /opt/demo-t3-shared/letsencrypt:/etc/letsencrypt \
    -v /opt/demo-t3-shared/www-certbot:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

echo "🔄 Step 3: Combining certificates for HAProxy..."

# HAProxy requires fullchain.pem + privkey.pem combined
CERT_DIR="/opt/demo-t3-shared/letsencrypt/live/$DOMAIN"
COMBINED_CERT="$CERT_DIR/combined.pem"

if [[ -f "$CERT_DIR/fullchain.pem" && -f "$CERT_DIR/privkey.pem" ]]; then
  cat "$CERT_DIR/fullchain.pem" "$CERT_DIR/privkey.pem" > "$COMBINED_CERT"
  chmod 644 "$COMBINED_CERT"
  echo "✅ Combined certificate created at: $COMBINED_CERT"
else
  echo "⚠️  Could not find cert files to combine. HAProxy may not work with HTTPS."
fi

echo "♻️  Reloading HAProxy..."
HAPROXY_CONTAINER="demo-t3-haproxy"
if docker ps --format '{{.Names}}' | grep -q "^${HAPROXY_CONTAINER}$"; then
  # Graceful HAProxy reload (zero downtime)
  if docker exec "$HAPROXY_CONTAINER" sh -c 'kill -USR2 $(cat /var/run/haproxy.pid)' 2>/dev/null; then
    echo "✅ HAProxy reloaded gracefully"
  else
    docker restart "$HAPROXY_CONTAINER"
    echo "✅ HAProxy restarted"
  fi
else
  echo "⚠️  HAProxy container not running. Start it with: docker compose -f docker-compose.haproxy.yml up -d"
fi

echo "✅ SSL setup complete!"
echo "🌍 Your site should now be available at: https://$DOMAIN"
echo ""
echo "📝 To renew certificates automatically, add this to crontab (or use systemd timer):"
echo "0 12 * * * docker run --rm -v /opt/demo-t3-shared/letsencrypt:/etc/letsencrypt -v /opt/demo-t3-shared/www-certbot:/var/www/certbot certbot/certbot renew --quiet --deploy-hook 'cat /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/letsencrypt/live/$DOMAIN/privkey.pem > /etc/letsencrypt/live/$DOMAIN/combined.pem && chmod 644 /etc/letsencrypt/live/$DOMAIN/combined.pem && docker exec demo-t3-haproxy sh -c \"kill -USR2 \\\$(cat /var/run/haproxy.pid)\" 2>/dev/null || docker restart demo-t3-haproxy'"
echo ""
echo "Or use the helper script: /opt/demo-t3/.github/scripts/combine-certs.sh"