#!/usr/bin/env bash
# Builds the site for the internal GitHub Pages deployment and force-pushes
# the output to the gh-pages branch of the `internal` git remote.
#
# Usage: bash src/_scripts/_deploy-internal.sh

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CONFIG="$REPO_DIR/docusaurus.config.ts"
INTERNAL_URL="https://pages.github.tools.sap"
INTERNAL_BASE="/OCTO/architecture-center"
REMOTE="origin"

cd "$REPO_DIR"

# --- 1. Patch docusaurus.config.ts ---
echo "Patching docusaurus.config.ts..."
sed -i '' "s|url: '.*'|url: '$INTERNAL_URL'|" "$CONFIG"
sed -i '' "s|const baseUrl = '.*';|const baseUrl = '$INTERNAL_BASE';|" "$CONFIG"

restore_config() {
  echo "Restoring docusaurus.config.ts..."
  git checkout -- "$CONFIG"
}
trap restore_config EXIT

# --- 2. Build ---
echo "Building..."
npm run build

# --- 3. Restore config (trap handles it, but be explicit) ---
restore_config
trap - EXIT

# --- 4. Push build output to gh-pages on the internal remote ---
echo "Deploying to $REMOTE/gh-pages..."

REMOTE_URL=$(git remote get-url "$REMOTE")
TEMP_DIR=$(mktemp -d)

git -C "$TEMP_DIR" init --quiet
git -C "$TEMP_DIR" remote add origin "$REMOTE_URL"
cp -r "$REPO_DIR/build/." "$TEMP_DIR/"
touch "$TEMP_DIR/.nojekyll"
git -C "$TEMP_DIR" add .
git -C "$TEMP_DIR" commit --quiet -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git -C "$TEMP_DIR" push origin HEAD:gh-pages --force --quiet

rm -rf "$TEMP_DIR"

echo ""
echo "Done. Site available at: $INTERNAL_URL$INTERNAL_BASE/"
