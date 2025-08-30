#!/bin/bash
set -e

# Detect affected projects for NX monorepo deployment
# Usage: ./detect-affected.sh [force_deploy] [base_ref]

FORCE_DEPLOY=${1:-false}
BASE_REF=${2:-HEAD~1}

# Ensure BASE_REF exists (handles force-push scenarios where before SHA is gone)
if ! git cat-file -e "${BASE_REF}^{commit}" 2>/dev/null; then
  echo "⚠️ Base ref ${BASE_REF} not found. Attempting fallbacks..."
  if git rev-parse --verify --quiet origin/master >/dev/null; then
    BASE_REF=origin/master
    echo "↩️ Falling back to ${BASE_REF}"
  elif git rev-parse --verify --quiet origin/main >/dev/null; then
    BASE_REF=origin/main
    echo "↩️ Falling back to ${BASE_REF}"
  else
    BASE_REF=HEAD~1
    echo "↩️ Falling back to ${BASE_REF}"
  fi
fi

# Force deploy if requested or if this is the first deployment
if [[ "$FORCE_DEPLOY" == "true" ]]; then
  echo "apps=client-mx,server-nest,auth-service" >> $GITHUB_OUTPUT
  echo "libs=$(yarn --silent nx show projects --type=lib --json | jq -r '. | map(select(. | test("-e2e$") | not)) | join(",")')" >> $GITHUB_OUTPUT
  echo "has_affected=true" >> $GITHUB_OUTPUT
  echo "should_deploy=true" >> $GITHUB_OUTPUT
  echo "🚀 Force deploy requested - deploying all apps"
else
  # Get affected apps and libs (excluding e2e projects)
  AFFECTED_APPS=$(yarn --silent nx show projects --affected --type=app --base=$BASE_REF --json | jq -r '. | map(select(. | test("-e2e$") | not)) | join(",")')
  AFFECTED_LIBS=$(yarn --silent nx show projects --affected --type=lib --base=$BASE_REF --json | jq -r '. | map(select(. | test("-e2e$") | not)) | join(",")')
  
  echo "apps=$AFFECTED_APPS" >> $GITHUB_OUTPUT
  echo "libs=$AFFECTED_LIBS" >> $GITHUB_OUTPUT
  
  # Check if we have any affected projects
  if [[ -n "$AFFECTED_APPS" || -n "$AFFECTED_LIBS" ]]; then
    echo "has_affected=true" >> $GITHUB_OUTPUT
    # Deploy if any app is affected or if shared libs are affected
    if [[ -n "$AFFECTED_APPS" ]] || echo "$AFFECTED_LIBS" | grep -E "(models|utils|utils-ui)" > /dev/null; then
      echo "should_deploy=true" >> $GITHUB_OUTPUT
      echo "📦 Affected projects detected - deployment needed"
    else
      echo "should_deploy=false" >> $GITHUB_OUTPUT
      echo "📚 Only non-critical libs affected - skipping deployment"
    fi
  else
    echo "has_affected=false" >> $GITHUB_OUTPUT
    echo "should_deploy=false" >> $GITHUB_OUTPUT
    echo "✅ No affected projects - skipping deployment"
  fi
fi

echo "Affected apps: $AFFECTED_APPS"
echo "Affected libs: $AFFECTED_LIBS"
