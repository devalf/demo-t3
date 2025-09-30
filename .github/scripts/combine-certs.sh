#!/bin/bash
# Certificate Combining Script for HAProxy
# HAProxy requires fullchain.pem + privkey.pem combined into single file
# Usage: ./combine-certs.sh

set -e

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

DOMAIN="d-t3.mooo.com"
CERT_DIR="/opt/demo-t3-shared/letsencrypt/live/${DOMAIN}"
FULLCHAIN="${CERT_DIR}/fullchain.pem"
PRIVKEY="${CERT_DIR}/privkey.pem"
COMBINED="${CERT_DIR}/combined.pem"

log "Combining certificates for HAProxy..."

# Check if cert files exist
if [[ ! -f "$FULLCHAIN" ]]; then
  error "Certificate not found: $FULLCHAIN"
  exit 1
fi

if [[ ! -f "$PRIVKEY" ]]; then
  error "Private key not found: $PRIVKEY"
  exit 1
fi

# Combine certificates
log "Creating combined certificate at: $COMBINED"
cat "$FULLCHAIN" "$PRIVKEY" > "$COMBINED"

# Set proper permissions (readable by HAProxy)
chmod 644 "$COMBINED"

success "Certificate combined successfully!"
log "HAProxy will use: $COMBINED"

# Reload HAProxy if running
HAPROXY_CONTAINER="demo-t3-haproxy"
if is_container_running "$HAPROXY_CONTAINER"; then
  log "Reloading HAProxy to pick up new certificate..."

  # HAProxy graceful reload (zero downtime)
  if docker exec "$HAPROXY_CONTAINER" sh -c 'kill -USR2 $(cat /var/run/haproxy.pid)' 2>/dev/null; then
    success "HAProxy reloaded successfully!"
  else
    # Fallback: restart container (brief downtime)
    log "Graceful reload failed, restarting container..."
    docker restart "$HAPROXY_CONTAINER"
    success "HAProxy restarted!"
  fi
else
  log "HAProxy container not running, skipping reload"
fi