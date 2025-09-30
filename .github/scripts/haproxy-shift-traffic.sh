#!/bin/bash
# HAProxy Traffic Shifting Script
# Gradually shifts traffic between blue and green environments
# Usage: ./haproxy-shift-traffic.sh <blue|green>

set -e

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

TARGET_COLOR="${1:-}"
HAPROXY_CONTAINER="demo-t3-haproxy"

if [[ "$TARGET_COLOR" != "blue" && "$TARGET_COLOR" != "green" ]]; then
  error "Usage: $0 <blue|green>"
  error "Specify which color should receive traffic"
  exit 1
fi

# Determine source and target
if [[ "$TARGET_COLOR" == "blue" ]]; then
  TARGET_SERVER="blue"
  SOURCE_SERVER="green"
else
  TARGET_SERVER="green"
  SOURCE_SERVER="blue"
fi

log "Shifting traffic to: $TARGET_COLOR"
log "Current traffic source: $SOURCE_SERVER"

# Check if HAProxy container is running
if ! is_container_running "$HAPROXY_CONTAINER"; then
  error "HAProxy container '$HAPROXY_CONTAINER' is not running"
  exit 1
fi

# Gradual traffic shift: 0% -> 25% -> 50% -> 75% -> 100%
SHIFT_STEPS=(
  "0:100"    # 0% target, 100% source
  "25:75"    # 25% target, 75% source
  "50:50"    # 50% target, 50% source
  "75:25"    # 75% target, 25% source
  "100:0"    # 100% target, 0% source
)

STEP_DELAY=10  # seconds between shifts

for step in "${SHIFT_STEPS[@]}"; do
  TARGET_WEIGHT="${step%:*}"
  SOURCE_WEIGHT="${step#*:}"

  log "Shifting: $TARGET_COLOR=${TARGET_WEIGHT}% / $SOURCE_SERVER=${SOURCE_WEIGHT}%"

  # Set weights
  haproxy_cmd "set server be_client_mx/$TARGET_SERVER weight $TARGET_WEIGHT" >/dev/null
  haproxy_cmd "set server be_client_mx/$SOURCE_SERVER weight $SOURCE_WEIGHT" >/dev/null

  # Verify
  ACTUAL_TARGET=$(get_haproxy_weight "$TARGET_SERVER")
  ACTUAL_SOURCE=$(get_haproxy_weight "$SOURCE_SERVER")

  if [[ "$ACTUAL_TARGET" == "$TARGET_WEIGHT" && "$ACTUAL_SOURCE" == "$SOURCE_WEIGHT" ]]; then
    success "  ✓ Weights applied: $TARGET_COLOR=$ACTUAL_TARGET, $SOURCE_SERVER=$ACTUAL_SOURCE"
  else
    warn "  ⚠ Weight mismatch. Expected: $TARGET_WEIGHT/$SOURCE_WEIGHT, Got: $ACTUAL_TARGET/$ACTUAL_SOURCE"
  fi

  # Wait before next shift (except on last step)
  if [[ "$TARGET_WEIGHT" != "100" ]]; then
    log "  Waiting ${STEP_DELAY}s before next shift..."
    sleep "$STEP_DELAY"
  fi
done

success "Traffic shift complete! All traffic now on: $TARGET_COLOR"

# Show final status
log "Current backend status:"
haproxy_cmd "show stat" | grep "be_client_mx," | grep -E "(blue|green)" | awk -F',' '{printf "  %s: weight=%s status=%s\n", $2, $19, $18}'