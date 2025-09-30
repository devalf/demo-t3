#!/bin/bash
# Certificate Renewal Script for Let's Encrypt
# Usage: ./renew-certs.sh [--force]

set -e

# Source common utilities from .github/scripts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../.github/scripts/common.sh"

FORCE_RENEWAL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE_RENEWAL=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      echo "Usage: $0 [--force]"
      exit 1
      ;;
  esac
done

log "Starting certificate renewal..."

# Build certbot command
CERTBOT_CMD="docker run --rm \
  -v /opt/demo-t3-shared/letsencrypt:/etc/letsencrypt \
  -v /opt/demo-t3-shared/www-certbot:/var/www/certbot \
  certbot/certbot renew --quiet"

if [[ "$FORCE_RENEWAL" == "true" ]]; then
  log "Force renewal enabled"
  CERTBOT_CMD="$CERTBOT_CMD --force-renewal"
fi

# Run certbot renewal
log "Running certbot..."
eval "$CERTBOT_CMD"

# Combine certificates for HAProxy and reload
log "Combining certificates and reloading HAProxy..."
"${SCRIPT_DIR}/../.github/scripts/combine-certs.sh"

success "Certificate renewal completed successfully!"