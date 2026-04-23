#!/bin/zsh

# Deploy script for cernus76's GitHub Pages
# Site: https://cernus76.github.io/architecture-center/

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build-cernus76"
CONFIG_FILE="$PROJECT_ROOT/docusaurus.config.ts"

echo "🚀 Starting deployment to cernus76.github.io/architecture-center/"
echo "=================================================="

cd "$PROJECT_ROOT"

# Step 1: Clear Docusaurus cache
echo "\n📦 Step 1: Clearing Docusaurus cache..."
npm run clear

# Step 2: Export drawio files
echo "\n🎨 Step 2: Exporting drawio files..."
cd "$SCRIPT_DIR"
node _export-drawios.js
cd "$PROJECT_ROOT"

# Step 3: Update baseUrl and build
echo "\n🔧 Step 3: Building with baseUrl=/architecture-center/..."

# Backup original baseUrl and set to /architecture-center/
sed -i '' "s|const baseUrl = '/';|const baseUrl = '/architecture-center/';|" "$CONFIG_FILE"

# Clean previous build
rm -rf "$BUILD_DIR"

# Build
npm run build -- --out-dir build-cernus76

# Restore original baseUrl
sed -i '' "s|const baseUrl = '/architecture-center/';|const baseUrl = '/';|" "$CONFIG_FILE"

# Step 4: Deploy to GitHub Pages
echo "\n🚀 Step 4: Deploying to GitHub Pages..."
cd "$BUILD_DIR"
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy to cernus76.github.io/architecture-center/ - $(date '+%Y-%m-%d %H:%M:%S')"
git remote add origin https://github.com/cernus76/architecture-center.git
git push -f origin gh-pages

echo "\n✅ Deployment complete!"
echo "🌐 Live at: https://cernus76.github.io/architecture-center/"
