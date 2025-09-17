#!/bin/bash
set -e

# Blue-Green Deployment Script for VPS
# Usage: ./blue-green-deploy.sh [--apps="app1,app2"] [--force-all]

# Parse command line arguments
AFFECTED_APPS=""
FORCE_ALL=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --apps=*)
      AFFECTED_APPS="${1#*=}"
      shift
      ;;
    --force-all)
      FORCE_ALL=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Configuration
SOURCE_DIR="/opt/demo-t3"
DEPLOY_DIR="/opt/demo-t3-deploy"
BACKUP_DIR="/opt/demo-t3-backup"
CURRENT_LINK="${DEPLOY_DIR}/current"

# Space management for limited VPS
MIN_FREE_SPACE_GB=15  # Minimum 15GB free space required
MAX_BACKUPS=2         # Keep only 2 backups (instead of 3) to save space

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Apply HTTPS nginx.conf from repository to the active client-mx container (non-fatal)
apply_https_config() {
  # Only apply HTTPS if certs are present (first-time SSL setup may not be done yet)
  local CERT_DIR_HOST="/opt/demo-t3-shared/letsencrypt/live/d-t3.mooo.com"
  if [[ ! -d "$CERT_DIR_HOST" ]]; then
    warn "TLS certificates not found at $CERT_DIR_HOST. Skipping HTTPS config apply."
    return 0
  fi

  # Use the current deployment's compose context to find the client-mx container
  local CID
  CID=$(docker compose --env-file "$ENV_FILE_PATH" -f "$COMPOSE_FILE_PATH" ps -q client-mx 2>/dev/null || true)

  if [[ -z "$CID" ]]; then
    warn "Could not find running client-mx container in current deployment context. Skipping HTTPS apply."
    return 0
  fi

  # The HTTPS config is packaged with the image at /etc/nginx/nginx.https.conf
  log "Switching client-mx container ($CID) to packaged HTTPS config..."

  # Validate packaged HTTPS config
  if ! docker exec "$CID" nginx -t -c /etc/nginx/nginx.https.conf; then
    warn "Packaged nginx.https.conf failed validation. Skipping HTTPS switch."
    return 0
  fi

  # Replace active config with HTTPS config
  if docker exec "$CID" sh -c 'cp /etc/nginx/nginx.https.conf /etc/nginx/nginx.conf && nginx -t'; then
    if docker exec "$CID" nginx -s reload; then
      success "HTTPS config applied and NGINX reloaded for client-mx."
    else
      warn "Failed to reload NGINX after applying HTTPS config."
    fi
  else
    warn "Failed to activate HTTPS config inside container."
  fi
}

# Determine current and target environments
if [[ -L "$CURRENT_LINK" ]]; then
  CURRENT_ENV=$(basename "$(readlink "$CURRENT_LINK")")
  if [[ "$CURRENT_ENV" == "blue" ]]; then
    TARGET_ENV="green"
  else
    TARGET_ENV="blue"
  fi
else
  TARGET_ENV="blue"
  CURRENT_ENV=""
fi

TARGET_DIR="${DEPLOY_DIR}/${TARGET_ENV}"

log "Starting blue-green deployment..."
log "Current environment: ${CURRENT_ENV:-none}"
log "Target environment: $TARGET_ENV"

# Check available disk space before starting
AVAILABLE_KB=$(df / | tail -1 | awk '{print $4}')
AVAILABLE_GB=$((AVAILABLE_KB / 1024 / 1024))
log "Available disk space: ${AVAILABLE_GB}GB"

if [[ $AVAILABLE_GB -lt $MIN_FREE_SPACE_GB ]]; then
  error "Insufficient disk space! Available: ${AVAILABLE_GB}GB, Required: ${MIN_FREE_SPACE_GB}GB"
  error "Please run cleanup: .github/scripts/docker-cleanup.sh --aggressive=true"
  exit 1
fi

# Create directories
sudo mkdir -p "$DEPLOY_DIR" "$BACKUP_DIR" \
  "/opt/demo-t3-shared/postgres-data" \
  "/opt/demo-t3-shared/prometheus-data" \
  "/opt/demo-t3-shared/grafana-data" \
  "/opt/demo-t3-shared/loki-data" \
  "/opt/demo-t3-shared/promtail-data" \
  "/opt/demo-t3-shared/redis-data"

# Ensure base shared dir owned by deploy user so we can manage subdirs
sudo chown -R $USER:$USER "$DEPLOY_DIR" "$BACKUP_DIR" "/opt/demo-t3-shared"

# Fix permissions for monitoring volumes to match container users
# Postgres (alpine image runs as uid 70)
sudo chown -R 70:70 /opt/demo-t3-shared/postgres-data || true
sudo chmod -R 700 /opt/demo-t3-shared/postgres-data || true

# Prometheus (official image runs as uid 65534:nogroup)
sudo chown -R 65534:65534 /opt/demo-t3-shared/prometheus-data || true
sudo chmod -R 755 /opt/demo-t3-shared/prometheus-data || true

# Grafana (official image runs as uid 472)
sudo chown -R 472:472 /opt/demo-t3-shared/grafana-data || true
sudo chmod -R 755 /opt/demo-t3-shared/grafana-data || true

# Loki (official image runs as uid 10001)
sudo chown -R 10001:10001 /opt/demo-t3-shared/loki-data || true
sudo chmod -R 755 /opt/demo-t3-shared/loki-data || true

# Promtail (runs as root in official image). Keep readable/writable by root
sudo chown -R 0:0 /opt/demo-t3-shared/promtail-data || true
sudo chmod -R 755 /opt/demo-t3-shared/promtail-data || true

# Redis (official image typically runs as uid 999). Ensure directory is writable.
sudo chown -R 999:999 /opt/demo-t3-shared/redis-data || true
sudo chmod -R 755 /opt/demo-t3-shared/redis-data || true

# Ensure shared external Docker network exists for cross-stack communication
MONITORING_NETWORK_NAME="demo-t3-network"
if ! docker network inspect "$MONITORING_NETWORK_NAME" >/dev/null 2>&1; then
  log "Creating external Docker network: $MONITORING_NETWORK_NAME"
  docker network create "$MONITORING_NETWORK_NAME"
else
  log "External network $MONITORING_NETWORK_NAME already exists"
fi

# Bring up monitoring stack if it's not already running (do not restart each deploy)
MONITORING_COMPOSE_FILE="$SOURCE_DIR/docker-compose.monitoring.yml"
if [[ -f "$MONITORING_COMPOSE_FILE" ]]; then
  # Check if any Prometheus container is running on this host (compose names are project-prefixed)
  if ! docker ps --format '{{.Image}} {{.Names}}' | grep -q 'prom/prometheus'; then
    log "Starting monitoring stack (prometheus, grafana, loki, promtail) once..."
    docker compose --env-file "$SOURCE_DIR/.env.production" -f "$MONITORING_COMPOSE_FILE" up -d
  else
    log "Monitoring stack already running; skipping restart"
  fi
else
  warn "Monitoring compose file not found at $MONITORING_COMPOSE_FILE. Skipping monitoring startup."
fi

# Bring up data stack (postgres, redis) if it's not already running (do not restart each deploy)
DATA_COMPOSE_FILE="$SOURCE_DIR/docker-compose.data.production.yml"
if [[ -f "$DATA_COMPOSE_FILE" ]]; then
  # Using stable container names defined in docker-compose.data.production.yml
  POSTGRES_RUNNING=$(docker ps --format '{{.Names}}' | grep -w '^postgres$' || true)
  REDIS_RUNNING=$(docker ps --format '{{.Names}}' | grep -w '^redis$' || true)
  if [[ -z "$POSTGRES_RUNNING" || -z "$REDIS_RUNNING" ]]; then
    log "Starting data stack (postgres, redis) once..."
    docker compose --env-file "$SOURCE_DIR/.env.production" -f "$DATA_COMPOSE_FILE" up -d
  else
    log "Data stack already running; skipping restart"
  fi
else
  warn "Data compose file not found at $DATA_COMPOSE_FILE. Skipping data stack startup."
fi

# Ensure source directory has latest code (pulled by GitHub Actions)
log "Verifying source code in $SOURCE_DIR..."
cd "$SOURCE_DIR"
git status --porcelain || warn "Git status check failed"

# Ensure .env.production exists in source
if [[ ! -f "$SOURCE_DIR/.env.production" ]]; then
  error ".env.production not found in $SOURCE_DIR. Deployment cannot continue."
  exit 1
fi

# Copy complete source code to target environment
log "Copying source code from $SOURCE_DIR to $TARGET_DIR..."
rm -rf "$TARGET_DIR"
cp -r "$SOURCE_DIR" "$TARGET_DIR"

# Remove .git directory from deployment (optional, saves space)
rm -rf "$TARGET_DIR/.git"

# Change to target directory
cd "$TARGET_DIR"

# Absolute paths to avoid cwd issues
COMPOSE_FILE_PATH="$TARGET_DIR/docker-compose.production.yml"
ENV_FILE_PATH="$TARGET_DIR/.env.production"

# Stop current services if they exist
if [[ -n "$CURRENT_ENV" ]]; then
  CURRENT_DIR="${DEPLOY_DIR}/${CURRENT_ENV}"
  if [[ -d "$CURRENT_DIR" ]]; then
    log "Stopping current services in $CURRENT_ENV..."
    cd "$CURRENT_DIR"
    docker compose --env-file .env.production -f docker-compose.production.yml down --remove-orphans || warn "Failed to stop some services"
  fi
fi

cd "$TARGET_DIR"

# Build base image required by app Dockerfiles
log "Building base image demo-base:latest from Dockerfile.base..."
docker build -t demo-base:latest -f Dockerfile.base .

# Build Docker images (Docker handles all dependencies, builds, and Prisma generation)
if [[ "$FORCE_ALL" == "true" ]]; then
  log "Building all Docker images..."
  docker compose --env-file "$ENV_FILE_PATH" -f "$COMPOSE_FILE_PATH" build --no-cache
elif [[ -n "$AFFECTED_APPS" ]]; then
  log "Building affected services: $AFFECTED_APPS"
  # Convert comma-separated apps to space-separated for docker-compose
  SERVICES=$(echo "$AFFECTED_APPS" | tr ',' ' ')
  docker compose --env-file "$ENV_FILE_PATH" -f "$COMPOSE_FILE_PATH" build --no-cache "$SERVICES"
else
  log "No affected apps specified, building all services for safety..."
  docker compose --env-file "$ENV_FILE_PATH" -f "$COMPOSE_FILE_PATH" build --no-cache
fi

log "Starting services in $TARGET_ENV environment..."
docker compose --env-file "$ENV_FILE_PATH" -f "$COMPOSE_FILE_PATH" up -d

# Wait for services to be healthy
log "Waiting for services to become healthy..."
TIMEOUT=300  # 5 minutes
ELAPSED=0
INTERVAL=10

while [[ $ELAPSED -lt $TIMEOUT ]]; do
  ALL_HEALTHY=true
  for SVC in client-mx server-nest auth-service; do
    CID=$(docker compose --env-file "$ENV_FILE_PATH" -f "$COMPOSE_FILE_PATH" ps -q "$SVC" || true)
    if [[ -z "$CID" ]]; then
      ALL_HEALTHY=false
      break
    fi
    STATUS=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}healthy{{end}}' "$CID" 2>/dev/null || echo starting)
    if [[ "$STATUS" != "healthy" ]]; then
      ALL_HEALTHY=false
      break
    fi
  done

  if [[ "$ALL_HEALTHY" == "true" ]]; then
    success "All services are healthy!"
    break
  else
    warn "Services not healthy yet, waiting..."
  fi

  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
  log "Health check progress: ${ELAPSED}s/${TIMEOUT}s"
done

if [[ $ELAPSED -ge $TIMEOUT ]]; then
  error "Health check timeout! Rolling back..."

  # Stop failed deployment
  docker compose --env-file "$ENV_FILE_PATH" -f "$COMPOSE_FILE_PATH" down --remove-orphans

  # Restore previous deployment if it exists
  if [[ -n "$CURRENT_ENV" ]]; then
    log "Restoring previous deployment..."
    cd "${DEPLOY_DIR}/${CURRENT_ENV}"
    docker compose --env-file .env.production -f docker-compose.production.yml up -d
    success "Rollback completed"
  fi

  exit 1
fi

# Final health check
log "Performing final health check..."
sleep 30

# Check if main application is responding
if curl -f -s http://localhost/ > /dev/null; then
  success "Application is responding correctly!"
else
  error "Application health check failed! Rolling back..."
  docker compose --env-file .env.production -f docker-compose.production.yml down --remove-orphans
  if [[ -n "$CURRENT_ENV" ]]; then
    cd "${DEPLOY_DIR}/${CURRENT_ENV}"
    docker compose --env-file .env.production -f docker-compose.production.yml up -d
  fi
  exit 1
fi

# Update symlink to point to new environment
log "Switching traffic to new environment..."
sudo rm -f "$CURRENT_LINK"
sudo ln -sf "$TARGET_DIR" "$CURRENT_LINK"

# Backup old environment
if [[ -n "$CURRENT_ENV" ]]; then
  log "Backing up previous environment..."
  BACKUP_NAME="backup-${CURRENT_ENV}-$(date +%Y%m%d-%H%M%S)"
  cp -r "${DEPLOY_DIR}/${CURRENT_ENV}" "${BACKUP_DIR}/${BACKUP_NAME}"

  # Keep only last 2 backups to save space on 80GB VPS
  cd "$BACKUP_DIR"
  ls -t | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -rf
fi

# Basic Docker cleanup (aggressive cleanup runs via separate workflow)
log "Running basic Docker cleanup..."
docker container prune -f || warn "Failed to remove stopped containers"
docker image prune -f || warn "Failed to remove dangling images"

# Note: Aggressive cleanup runs automatically via GitHub Actions cleanup workflow

# Apply HTTPS config to active client-mx container (if config exists)
log "Ensuring HTTPS config is applied to the active client container..."
apply_https_config

success "Deployment completed successfully!"
success "New environment: $TARGET_ENV"
success "Application is available at: http://$(hostname -I | awk '{print $1}')"

# Display service status
log "Service status:"
cd "$TARGET_DIR"
docker compose --env-file "$ENV_FILE_PATH" -f "$COMPOSE_FILE_PATH" ps

# VPS verification commands (for manual debugging):
# ls -l /opt/demo-t3/current                                    # Check current symlink
# ls -l /opt/demo-t3/.env.production                           # Check env file
# docker compose --env-file .env.production -f docker-compose.production.yml ps --format json | jq  # Health status
# curl -sf http://localhost/                                   # Frontend check
# docker logs client-mx --tail=50                             # Frontend logs
# docker logs server-nest --tail=50                           # API logs
# docker logs auth-service --tail=50                          # Auth logs
# docker logs postgres --tail=50                              # DB logs
# docker logs redis --tail=50                                 # Cache logs
