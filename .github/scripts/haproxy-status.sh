#!/bin/bash
# HAProxy Status and Health Check Script
# Shows current backend status, traffic distribution, and health

set -e

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

HAPROXY_CONTAINER="demo-t3-haproxy"

echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       HAProxy Status Dashboard             ║${NC}"
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo ""

# Check if HAProxy is running
if ! is_container_running "$HAPROXY_CONTAINER"; then
  echo -e "${RED}❌ HAProxy container is NOT running${NC}"
  echo ""
  echo "Start it with:"
  echo "  docker compose -f docker-compose.haproxy.yml up -d"
  exit 1
fi

echo -e "${GREEN}✅ HAProxy is running${NC}"
echo ""

# Get container info
HAPROXY_ID=$(docker ps --filter "name=${HAPROXY_CONTAINER}" --format '{{.ID}}')
HAPROXY_STATUS=$(docker inspect -f '{{.State.Status}}' "$HAPROXY_ID")
HAPROXY_UPTIME=$(docker inspect -f '{{.State.StartedAt}}' "$HAPROXY_ID" | xargs -I {} date -d {} +"%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "N/A")

echo -e "${BLUE}Container Info:${NC}"
echo "  ID: $HAPROXY_ID"
echo "  Status: $HAPROXY_STATUS"
echo "  Started: $HAPROXY_UPTIME"
echo ""

# Get backend stats
echo -e "${BLUE}Backend Status:${NC}"
echo ""

STATS=$(haproxy_cmd "show stat" 2>/dev/null || echo "")

if [[ -z "$STATS" ]]; then
  echo -e "${RED}❌ Could not retrieve stats from HAProxy${NC}"
  exit 1
fi

# Parse blue/green backend status
BLUE_LINE=$(echo "$STATS" | grep "be_client_mx,blue," || true)
GREEN_LINE=$(echo "$STATS" | grep "be_client_mx,green," || true)

print_backend_status() {
  local color=$1
  local line=$2

  if [[ -z "$line" ]]; then
    echo -e "  ${color^^}: ${RED}NOT CONFIGURED${NC}"
    return
  fi

  # Extract fields (CSV format)
  local status=$(echo "$line" | cut -d',' -f18)
  local weight=$(echo "$line" | cut -d',' -f19)
  local check_status=$(echo "$line" | cut -d',' -f20)
  local last_chg=$(echo "$line" | cut -d',' -f25)
  local down_time=$(echo "$line" | cut -d',' -f26)

  # Color based on status
  local status_color="${RED}"
  if [[ "$status" == "UP" ]]; then
    status_color="${GREEN}"
  elif [[ "$status" == "DOWN" ]]; then
    status_color="${RED}"
  else
    status_color="${YELLOW}"
  fi

  # Weight indicator (traffic percentage)
  local traffic_pct="0%"
  if [[ "$weight" =~ ^[0-9]+$ ]]; then
    traffic_pct="${weight}%"
  fi

  echo -e "  ${CYAN}${color^^}:${NC}"
  echo -e "    Status:      ${status_color}${status}${NC}"
  echo -e "    Weight:      ${traffic_pct} (traffic distribution)"
  echo -e "    Check:       ${check_status}"

  if [[ "$status" == "DOWN" && -n "$down_time" && "$down_time" != "0" ]]; then
    echo -e "    Downtime:    ${down_time}s"
  fi

  if [[ -n "$last_chg" && "$last_chg" != "0" ]]; then
    echo -e "    Last Change: ${last_chg}s ago"
  fi
  echo ""
}

print_backend_status "blue" "$BLUE_LINE"
print_backend_status "green" "$GREEN_LINE"

# Show traffic distribution summary
echo -e "${BLUE}Traffic Distribution:${NC}"

BLUE_WEIGHT=$(echo "$BLUE_LINE" | cut -d',' -f19 2>/dev/null || echo "0")
GREEN_WEIGHT=$(echo "$GREEN_LINE" | cut -d',' -f19 2>/dev/null || echo "0")

BLUE_WEIGHT=${BLUE_WEIGHT:-0}
GREEN_WEIGHT=${GREEN_WEIGHT:-0}

TOTAL=$((BLUE_WEIGHT + GREEN_WEIGHT))

if [[ $TOTAL -eq 0 ]]; then
  echo "  No traffic routing configured"
else
  BLUE_PCT=$((BLUE_WEIGHT * 100 / TOTAL))
  GREEN_PCT=$((GREEN_WEIGHT * 100 / TOTAL))

  # Visual bar
  BLUE_BARS=$((BLUE_PCT / 5))
  GREEN_BARS=$((GREEN_PCT / 5))

  echo -n "  Blue:  "
  for ((i=0; i<BLUE_BARS; i++)); do echo -n "█"; done
  echo -e " ${BLUE_PCT}%"

  echo -n "  Green: "
  for ((i=0; i<GREEN_BARS; i++)); do echo -n "█"; done
  echo -e " ${GREEN_PCT}%"
fi

echo ""

# Show running containers
echo -e "${BLUE}Application Containers:${NC}"
BLUE_CONTAINERS=$(docker ps --filter "name=blue-" --format "table {{.Names}}\t{{.Status}}" | tail -n +2 || echo "")
GREEN_CONTAINERS=$(docker ps --filter "name=green-" --format "table {{.Names}}\t{{.Status}}" | tail -n +2 || echo "")

if [[ -n "$BLUE_CONTAINERS" ]]; then
  echo -e "${CYAN}  Blue Environment:${NC}"
  echo "$BLUE_CONTAINERS" | sed 's/^/    /'
  echo ""
fi

if [[ -n "$GREEN_CONTAINERS" ]]; then
  echo -e "${CYAN}  Green Environment:${NC}"
  echo "$GREEN_CONTAINERS" | sed 's/^/    /'
  echo ""
fi

if [[ -z "$BLUE_CONTAINERS" && -z "$GREEN_CONTAINERS" ]]; then
  echo "  ${YELLOW}No blue/green containers running${NC}"
  echo ""
fi

# Quick health check
echo -e "${BLUE}Quick Health Check:${NC}"

# Test HTTP
if curl -sf http://localhost/ >/dev/null 2>&1; then
  echo -e "  HTTP (80):   ${GREEN}✓ Responding${NC}"
else
  echo -e "  HTTP (80):   ${RED}✗ Not responding${NC}"
fi

# Test HTTPS
if curl -sfk https://localhost/ >/dev/null 2>&1; then
  echo -e "  HTTPS (443): ${GREEN}✓ Responding${NC}"
else
  echo -e "  HTTPS (443): ${YELLOW}⚠ Not responding (cert issue?)${NC}"
fi

# Test stats page
if curl -sf http://localhost:8404/ >/dev/null 2>&1; then
  echo -e "  Stats (8404): ${GREEN}✓ Available at http://localhost:8404${NC}"
else
  echo -e "  Stats (8404): ${RED}✗ Not available${NC}"
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo ""
echo "💡 Tips:"
echo "  • Shift traffic: .github/scripts/haproxy-shift-traffic.sh <blue|green>"
echo "  • View full stats: curl http://localhost:8404"
echo "  • HAProxy logs: docker logs demo-t3-haproxy"
echo ""