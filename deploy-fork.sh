#!/usr/bin/env bash
#
# deploy-fork.sh — Build the site locally and publish it straight to the
# gh-pages branch of your fork, WITHOUT committing or pushing any source change.
#
# It temporarily patches docusaurus.config.ts for fork hosting, runs the
# Docusaurus deploy (which force-pushes the built site to gh-pages), then
# restores the config so your working tree is left untouched.
#
# Prereqs (one-time):
#   - On your fork: Settings -> Pages -> Source = "Deploy from a branch",
#     Branch = "gh-pages" / "(root)". (Docusaurus creates gh-pages on first run.)
#   - Git push access to your fork over HTTPS or SSH.
#
# Usage:
#   ./deploy-fork.sh
#
set -euo pipefail

# ---- Fork settings -----------------------------------------------------------
GH_USER="navyakhurana"
REPO="architecture-center"
DEPLOY_BRANCH="gh-pages"
FORK_URL="https://${GH_USER}.github.io"
FORK_BASEURL="/${REPO}/"
# -----------------------------------------------------------------------------

CONFIG="docusaurus.config.ts"
BACKUP="${CONFIG}.deploybak"

cleanup() {
    if [[ -f "$BACKUP" ]]; then
        mv "$BACKUP" "$CONFIG"
        echo "✓ Restored original $CONFIG"
    fi
}
trap cleanup EXIT

echo "→ Backing up and patching $CONFIG for fork hosting…"
cp "$CONFIG" "$BACKUP"

# Point url / baseUrl / org at the fork. These sed patterns match the exact
# lines in the committed config (see lines 9, 17, 21).
sed -E -i '' "s|^const baseUrl = '.*';|const baseUrl = '${FORK_BASEURL}';|" "$CONFIG"
sed -E -i '' "s|^    url: '.*',|    url: '${FORK_URL}',|" "$CONFIG"
sed -E -i '' "s|^    organizationName: '.*', //GitHub org|    organizationName: '${GH_USER}', //GitHub org|" "$CONFIG"
sed -E -i '' "s|^    deploymentBranch: '.*',|    deploymentBranch: '${DEPLOY_BRANCH}',|" "$CONFIG"

echo "→ Generating required data files…"
npm run generate-news
npm run generate-ref-arch-updates

echo "→ Deploying to ${GH_USER}/${REPO} (branch: ${DEPLOY_BRANCH})…"
# Push over HTTPS (no SSH key configured). Docusaurus builds the GIT_USER into
# the HTTPS remote; the osxkeychain/gh credential helper supplies the token.
GIT_USER="${GH_USER}" \
USE_SSH=false \
DEPLOYMENT_BRANCH="${DEPLOY_BRANCH}" \
CURRENT_BRANCH=main \
npm run deploy

echo ""
echo "✓ Deployed. Your preview will be live shortly at:"
echo "    ${FORK_URL}${FORK_BASEURL}"
