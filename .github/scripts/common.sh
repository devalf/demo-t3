#!/bin/bash
# Common utilities for deployment scripts
# Source this file in other scripts: source "$(dirname "$0")/common.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
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

info() {
  echo -e "${CYAN}[INFO]${NC} $1"
}

# Check if a Docker container is running
is_container_running() {
  local container_name=$1
  docker ps --format '{{.Names}}' | grep -q "^${container_name}$"
}

# Execute command in HAProxy container
haproxy_cmd() {
  local cmd=$1
  docker exec demo-t3-haproxy sh -c "echo '$cmd' | socat stdio /var/run/haproxy/admin.sock"
}

# Get HAProxy server weight
get_haproxy_weight() {
  local server=$1
  haproxy_cmd "show stat" | grep "be_client_mx,$server" | cut -d',' -f19
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "This script should be sourced, not executed directly."
  echo "Usage: source $(basename "$0")"
  exit 1
fi