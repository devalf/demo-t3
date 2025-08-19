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
DEPLOY_DIR="/opt/demo-t3"
BACKUP_DIR="/opt/demo-t3-backup"
BLUE_DIR="${DEPLOY_DIR}/blue"
GREEN_DIR="${DEPLOY_DIR}/green"
CURRENT_LINK="${DEPLOY_DIR}/current"

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

# Determine current and target environments
if [[ -L "$CURRENT_LINK" ]]; then
  CURRENT_ENV=$(basename $(readlink "$CURRENT_LINK"))
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

# Create directories
sudo mkdir -p "$BLUE_DIR" "$GREEN_DIR" "$BACKUP_DIR"
sudo chown -R $USER:$USER "$DEPLOY_DIR" "$BACKUP_DIR"

# Copy source code to target environment (git-based deployment)
log "Preparing source code in $TARGET_DIR..."
rm -rf "$TARGET_DIR"
cp -r "$DEPLOY_DIR" "$TARGET_DIR"

# Ensure we have the latest code (should already be pulled by GitHub Actions)
cd "$TARGET_DIR"
log "Verifying latest code is present..."
git status --porcelain || warn "Git status check failed"

# Copy environment file from secrets
if [[ -f "/tmp/.env.production" ]]; then
  cp /tmp/.env.production "$TARGET_DIR/"
else
  log "Using existing .env.production file"
fi

# Change to target directory
cd "$TARGET_DIR"

# Stop current services if they exist
if [[ -n "$CURRENT_ENV" ]]; then
  log "Stopping current services..."
  cd "${DEPLOY_DIR}/${CURRENT_ENV}"
  docker-compose -f docker-compose.production.yml down --remove-orphans || warn "Failed to stop some services"
  cd "$TARGET_DIR"
fi

# Build Docker images (Docker handles all dependencies, builds, and Prisma generation)
if [[ "$FORCE_ALL" == "true" ]]; then
  log "Building all Docker images..."
  docker-compose -f docker-compose.production.yml build --no-cache
elif [[ -n "$AFFECTED_APPS" ]]; then
  log "Building affected services: $AFFECTED_APPS"
  # Convert comma-separated apps to space-separated for docker-compose
  SERVICES=$(echo "$AFFECTED_APPS" | tr ',' ' ')
  docker-compose -f docker-compose.production.yml build --no-cache $SERVICES
else
  log "No affected apps specified, building all services for safety..."
  docker-compose -f docker-compose.production.yml build --no-cache
fi

log "Starting services in $TARGET_ENV environment..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
log "Waiting for services to become healthy..."
TIMEOUT=300  # 5 minutes
ELAPSED=0
INTERVAL=10

while [[ $ELAPSED -lt $TIMEOUT ]]; do
  if docker-compose -f docker-compose.production.yml ps --format json | jq -r '.[].Health' | grep -q "unhealthy"; then
    warn "Some services are unhealthy, waiting..."
  elif docker-compose -f docker-compose.production.yml ps --format json | jq -r '.[].Health' | grep -qv "healthy\|starting"; then
    warn "Services still starting, waiting..."
  else
    success "All services are healthy!"
    break
  fi
  
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
  log "Health check progress: ${ELAPSED}s/${TIMEOUT}s"
done

if [[ $ELAPSED -ge $TIMEOUT ]]; then
  error "Health check timeout! Rolling back..."
  
  # Stop failed deployment
  docker-compose -f docker-compose.production.yml down --remove-orphans
  
  # Restore previous deployment if it exists
  if [[ -n "$CURRENT_ENV" ]]; then
    log "Restoring previous deployment..."
    cd "${DEPLOY_DIR}/${CURRENT_ENV}"
    docker-compose -f docker-compose.production.yml up -d
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
  docker-compose -f docker-compose.production.yml down --remove-orphans
  if [[ -n "$CURRENT_ENV" ]]; then
    cd "${DEPLOY_DIR}/${CURRENT_ENV}"
    docker-compose -f docker-compose.production.yml up -d
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
  
  # Keep only last 3 backups
  cd "$BACKUP_DIR"
  ls -t | tail -n +4 | xargs -r rm -rf
fi

# Clean up old Docker images
log "Cleaning up old Docker images..."
docker image prune -f || warn "Failed to clean up some Docker images"

success "Deployment completed successfully!"
success "New environment: $TARGET_ENV"
success "Application is available at: http://$(hostname -I | awk '{print $1}')"

# Display service status
log "Service status:"
docker-compose -f docker-compose.production.yml ps
