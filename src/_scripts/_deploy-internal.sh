#!/usr/bin/env bash
# Builds the site and pushes the output to the gh-pages branch.
#
# Usage: bash src/_scripts/_deploy-internal.sh

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
REMOTE="origin"

cd "$REPO_DIR"

# --- 1. Build ---
echo "Clearing cache..."
npm run clear

echo "Exporting drawios..."
CACHE_ENABLED=1 node src/_scripts/_export-drawios/_export.js

echo "Building..."
npm run build

# --- 2. Push build output to gh-pages on the internal remote ---
echo "Deploying to $REMOTE/gh-pages..."

WORKTREE_DIR="$REPO_DIR/../gh-pages-deploy"

# Clean up any leftover worktree from a previous failed run
git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
git worktree prune 2>/dev/null || true

git worktree add "$WORKTREE_DIR" gh-pages --quiet

cleanup_worktree() {
  git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
}
trap cleanup_worktree EXIT

rsync -a --delete --exclude='.git' "$REPO_DIR/build/" "$WORKTREE_DIR/"

git -C "$WORKTREE_DIR" add -A
git -C "$WORKTREE_DIR" commit --quiet -m "Deploy $(date -u '+%Y-%m-%d %H:%M') UTC"
git -C "$WORKTREE_DIR" push "$REMOTE" gh-pages

echo ""
echo "Done. Site available at: https://pages.github.tools.sap/OCTO/architecture-center/"
