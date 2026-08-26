#!/usr/bin/env bash
# Manual local deployment script for SAP Architecture Center
# Replicates the deploy-manual.yml workflow without GitHub Actions runners.
# Usage: ./deploy-local.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
WORKTREE_PATH="$REPO_ROOT/../gh-pages-deploy"

cd "$REPO_ROOT"

echo "==> Installing dependencies"
npm ci

echo "==> Fetching contributors details"
GITHUB_TOKEN=$(gh auth token --hostname github.tools.sap) \
  node src/_scripts/_fetch-contributors-details.js

echo "==> Exporting drawios to SVGs (using local draw.io app, cache enabled)"
CACHE_ENABLED=1 node src/_scripts/_export-drawios/_export.js

# Requires VALIDATOR_RULES_API_URL secret — skip if not set
if [[ -n "${VALIDATOR_RULES_API_URL:-}" ]]; then
  echo "==> Generating validation rules"
  node src/_scripts/_generate-validator-rules.js
else
  echo "==> Skipping validation rules (VALIDATOR_RULES_API_URL not set)"
fi

echo "==> Building site"
npm run build

echo "==> Updating drawio links with hashed URLs"
node src/_scripts/_update-drawio-links.js

echo "==> Checking out gh-pages branch into worktree"
git worktree add "$WORKTREE_PATH" gh-pages

echo "==> Syncing build output to worktree"
rsync -a --delete --exclude='.git' "$REPO_ROOT/build/" "$WORKTREE_PATH/"

# Restore the .git file that rsync would have deleted
echo "gitdir: $REPO_ROOT/.git/worktrees/gh-pages-deploy" > "$WORKTREE_PATH/.git"

echo "==> Committing"
git -C "$WORKTREE_PATH" add -A
git -C "$WORKTREE_PATH" commit -m "Deploy $(date -u '+%Y-%m-%d %H:%M') UTC"

echo "==> Pushing to origin/gh-pages"
git -C "$WORKTREE_PATH" push origin gh-pages

echo "==> Cleaning up worktree"
git worktree remove "$WORKTREE_PATH"

echo ""
echo "Deployment complete: https://pages.github.tools.sap/OCTO/architecture-center/"
