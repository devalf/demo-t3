#!/bin/bash
set -e

# Docker Cleanup Script for limited VPS
# Usage: ./docker-cleanup.sh [--aggressive=true|false]

# Parse arguments
AGGRESSIVE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --aggressive=*)
      AGGRESSIVE="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

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

log "Starting Docker cleanup (aggressive=${AGGRESSIVE})..."

# Check available space before cleanup
SPACE_BEFORE=$(df / | tail -1 | awk '{print $4}')
log "Available space before: ${SPACE_BEFORE}KB"

# Stop and remove exited containers
log "Removing stopped containers..."
docker container prune -f || warn "Failed to remove some containers"

# Remove unused networks
log "Removing unused networks..."
docker network prune -f || warn "Failed to remove some networks"

# Remove unused volumes (careful with postgres_data)
if [[ "$AGGRESSIVE" == "true" ]]; then
  log "Removing unused volumes (preserving postgres_data)..."
  # Get list of volumes to remove (exclude postgres_data)
  VOLUMES_TO_REMOVE=$(docker volume ls -q | grep -v postgres_data | grep -v "^$" || true)
  if [[ -n "$VOLUMES_TO_REMOVE" ]]; then
    echo "$VOLUMES_TO_REMOVE" | xargs docker volume rm || warn "Failed to remove some volumes"
  else
    log "No volumes to remove"
  fi
fi

# Clean build cache
log "Removing Docker build cache..."
docker builder prune -a -f || warn "Failed to clean build cache"

# Image cleanup strategy
if [[ "$AGGRESSIVE" == "true" ]]; then
  log "AGGRESSIVE: Removing ALL unused images..."

  # Keep only currently running images
  RUNNING_IMAGES=$(docker ps --format "table {{.Image}}" | tail -n +2 | sort -u)
  log "Currently running images:"
  echo "$RUNNING_IMAGES"

  # Remove all unused images (safer than hardcoded version list)
  log "Removing all unused images..."
  docker image prune -a -f || warn "Failed to remove unused images"

else
  log "STANDARD: Removing dangling images only..."
  docker image prune -f || warn "Failed to remove dangling images"
fi

# Remove any remaining <none> tagged images
log "Removing untagged images..."
NONE_IMAGES=$(docker images | grep "<none>" | awk '{print $3}' || true)
if [[ -n "$NONE_IMAGES" ]]; then
  echo "$NONE_IMAGES" | xargs docker rmi -f || warn "Failed to remove some untagged images"
fi

# System-wide cleanup
log "Running system-wide Docker cleanup..."
docker system prune -a -f || warn "System prune failed"

# Final space check
SPACE_AFTER=$(df / | tail -1 | awk '{print $4}')
SPACE_FREED=$((SPACE_AFTER - SPACE_BEFORE))

log "Cleanup completed!"
log "Available space after: ${SPACE_AFTER}KB"
if [[ $SPACE_FREED -gt 0 ]]; then
  success "Space freed: ${SPACE_FREED}KB ($(($SPACE_FREED / 1024))MB)"
else
  warn "Space freed: ${SPACE_FREED}KB"
fi

# Display current Docker usage
log "Current Docker disk usage:"
docker system df

# Warn if still low on space
if [[ $SPACE_AFTER -lt 5242880 ]]; then  # 5GB in KB
  error "CRITICAL: Less than 5GB free space remaining!"
  exit 1
elif [[ $SPACE_AFTER -lt 10485760 ]]; then  # 10GB in KB
  warn "WARNING: Less than 10GB free space remaining!"
fi

success "Docker cleanup completed successfully"
