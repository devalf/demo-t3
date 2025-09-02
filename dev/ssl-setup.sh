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

echo "🔄 Step 3: Switching container to packaged HTTPS config..."

# Validate packaged HTTPS config inside the container
if ! docker exec "$CLIENT_CID" nginx -t -c /etc/nginx/nginx.https.conf; then
  echo "❌ Packaged nginx.https.conf failed validation inside container. Aborting switch."
  exit 1
fi

# Activate HTTPS config
docker exec "$CLIENT_CID" sh -c 'cp /etc/nginx/nginx.https.conf /etc/nginx/nginx.conf && nginx -t'

echo "♻️  Reloading NGINX with HTTPS..."
docker exec "$CLIENT_CID" nginx -s reload

echo "✅ SSL setup complete!"
echo "🌍 Your site should now be available at: https://$DOMAIN"
echo ""
echo "📝 To renew certificates automatically, add this to crontab:"
echo "0 12 * * * docker run --rm -v /opt/demo-t3-shared/letsencrypt:/etc/letsencrypt -v /opt/demo-t3-shared/www-certbot:/var/www/certbot certbot/certbot renew --quiet && CID=\$(docker ps --filter label=com.docker.compose.service=client-mx -q | head -n1); [ -n \"$CID\" ] && docker exec \"$CID\" nginx -s reload || true"