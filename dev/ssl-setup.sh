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

echo "🔄 Step 1: Adding temporary nginx config for challenge..."

# Create temporary nginx config that handles ACME challenge
cat > /tmp/nginx-temp-ssl.conf << 'EOF'
user root;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

include /usr/share/nginx/modules/*.conf;

events {
  worker_connections 1024;
}

http {
  log_format  main    '$remote_addr - $remote_user [$time_local] "$request" '
  '$status $body_bytes_sent "$http_referer" '
  '"$http_user_agent" "$http_x_forwarded_for"';

  access_log  /var/log/nginx/access.log  main;
  sendfile            on;
  tcp_nopush          on;
  tcp_nodelay         on;
  keepalive_timeout   65;
  types_hash_max_size 2048;
  include             /etc/nginx/mime.types;
  default_type        application/octet-stream;

  server {
    listen      80      default_server;
    gzip on;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";
    gzip_proxied any;
    gzip_buffers 16 8k;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
    gzip_min_length 1024;
    access_log /var/log/nginx/app.access.log;
    error_log /var/log/nginx/app.error.log;
    root /usr/share/nginx/html;

    # Let's Encrypt challenge - ADDED
    location /.well-known/acme-challenge/ {
      root /var/www/certbot;
    }

    # Proxy API to internal Nest server
    location /api/ {
      proxy_pass http://server-nest:8083;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header Connection "";

      # Security headers at edge
      add_header X-Frame-Options DENY;
      add_header X-Content-Type-Options nosniff;
      add_header X-XSS-Protection "1; mode=block";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
  }
}
EOF

# Backup current config and apply temp config
docker exec "$CLIENT_CID" cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.original
docker cp /tmp/nginx-temp-ssl.conf "$CLIENT_CID":/etc/nginx/nginx.conf
docker exec "$CLIENT_CID" nginx -s reload

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

echo "🔄 Step 3: Creating and applying HTTPS config..."

# Create HTTPS config on VPS (not in repo)
cat > /opt/demo-t3-shared/nginx-https.conf << 'EOF'
user root;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

include /usr/share/nginx/modules/*.conf;

events {
  worker_connections 1024;
}

http {
  log_format  main    '$remote_addr - $remote_user [$time_local] "$request" '
  '$status $body_bytes_sent "$http_referer" '
  '"$http_user_agent" "$http_x_forwarded_for"';

  access_log  /var/log/nginx/access.log  main;
  sendfile            on;
  tcp_nopush          on;
  tcp_nodelay         on;
  keepalive_timeout   65;
  types_hash_max_size 2048;
  include             /etc/nginx/mime.types;
  default_type        application/octet-stream;

  # HTTP server - redirect to HTTPS
  server {
    listen 80;
    server_name d-t3.mooo.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
      root /var/www/certbot;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
      return 301 https://$server_name$request_uri;
    }
  }

  # HTTPS server
  server {
    listen 443 ssl http2;
    server_name d-t3.mooo.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/d-t3.mooo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/d-t3.mooo.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    gzip on;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";
    gzip_proxied any;
    gzip_buffers 16 8k;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
    gzip_min_length 1024;
    
    access_log /var/log/nginx/app.access.log;
    error_log /var/log/nginx/app.error.log;
    root /usr/share/nginx/html;

    # Proxy API to internal Nest server
    location /api/ {
      proxy_pass http://server-nest:8083;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header Connection "";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
  }
}
EOF

# Apply the HTTPS config from VPS filesystem
docker cp /opt/demo-t3-shared/nginx-https.conf "$CLIENT_CID":/etc/nginx/nginx.conf

echo "♻️  Step 4: Reloading NGINX with HTTPS..."
docker exec "$CLIENT_CID" nginx -s reload

echo "✅ SSL setup complete!"
echo "🌍 Your site should now be available at: https://$DOMAIN"
echo ""
echo "📝 To renew certificates automatically, add this to crontab:"
echo "0 12 * * * docker run --rm -v /opt/demo-t3-shared/letsencrypt:/etc/letsencrypt -v /opt/demo-t3-shared/www-certbot:/var/www/certbot certbot/certbot renew --quiet && CID=\$(docker ps --filter label=com.docker.compose.service=client-mx -q | head -n1); [ -n \"$CID\" ] && docker exec \"$CID\" nginx -s reload || true"

# Cleanup
rm /tmp/nginx-temp-ssl.conf