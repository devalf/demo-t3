#!/bin/bash
set -e

# Detect affected projects for NX monorepo deployment
# Usage: ./detect-affected.sh [force_deploy] [base_ref]

FORCE_DEPLOY=${1:-false}
BASE_REF=${2:-HEAD~1}

# Force deploy if requested or if this is the first deployment
if [[ "$FORCE_DEPLOY" == "true" ]]; then
  echo "apps=client-mx,server-nest,auth-service" >> $GITHUB_OUTPUT
  echo "libs=$(yarn --silent nx show projects --type=lib --json | jq -r '. | map(select(. | test("-e2e$") | not)) | join(",")')" >> $GITHUB_OUTPUT
  echo "has-affected=true" >> $GITHUB_OUTPUT
  echo "should-deploy=true" >> $GITHUB_OUTPUT
  echo "🚀 Force deploy requested - deploying all apps"
else
  # Get affected apps and libs (excluding e2e projects)
  AFFECTED_APPS=$(yarn --silent nx show projects --affected --type=app --base=$BASE_REF --json | jq -r '. | map(select(. | test("-e2e$") | not)) | join(",")')
  AFFECTED_LIBS=$(yarn --silent nx show projects --affected --type=lib --base=$BASE_REF --json | jq -r '. | map(select(. | test("-e2e$") | not)) | join(",")')
  
  echo "apps=$AFFECTED_APPS" >> $GITHUB_OUTPUT
  echo "libs=$AFFECTED_LIBS" >> $GITHUB_OUTPUT
  
  # Check if we have any affected projects
  if [[ -n "$AFFECTED_APPS" || -n "$AFFECTED_LIBS" ]]; then
    echo "has-affected=true" >> $GITHUB_OUTPUT
    # Deploy if any app is affected or if shared libs are affected
    if [[ -n "$AFFECTED_APPS" ]] || echo "$AFFECTED_LIBS" | grep -E "(models|utils|utils-ui)" > /dev/null; then
      echo "should-deploy=true" >> $GITHUB_OUTPUT
      echo "📦 Affected projects detected - deployment needed"
    else
      echo "should-deploy=false" >> $GITHUB_OUTPUT
      echo "📚 Only non-critical libs affected - skipping deployment"
    fi
  else
    echo "has-affected=false" >> $GITHUB_OUTPUT
    echo "should-deploy=false" >> $GITHUB_OUTPUT
    echo "✅ No affected projects - skipping deployment"
  fi
fi

echo "Affected apps: $AFFECTED_APPS"
echo "Affected libs: $AFFECTED_LIBS"
