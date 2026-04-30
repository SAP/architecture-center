#!/usr/bin/env zsh

# Cloudflare Pages Deployment Script
# This script deploys the build folder to Cloudflare Pages using Wrangler CLI

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="${0:a:h}"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo "${color}${message}${NC}"
}

print_message "$BLUE" "╔═══════════════════════════════════════════════════════════╗"
print_message "$BLUE" "║   Cloudflare Pages Deployment Script                      ║"
print_message "$BLUE" "╚═══════════════════════════════════════════════════════════╝"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    print_message "$RED" "✗ Error: Build directory not found at $BUILD_DIR"
    print_message "$YELLOW" "  Please run 'npm run build' first to create the build directory."
    exit 1
fi

print_message "$GREEN" "✓ Build directory found: $BUILD_DIR"

# Check if wrangler is available (via npx)
print_message "$BLUE" "\n→ Checking Wrangler availability..."
if ! command -v npx &> /dev/null; then
    print_message "$RED" "✗ Error: npx not found. Please install Node.js and npm."
    exit 1
fi

print_message "$GREEN" "✓ npx is available"

# Parse command line arguments
BRANCH=""
PROJECT_NAME=""

print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --branch, -b BRANCH    Deploy to a preview branch (e.g., dev, staging)"
    echo "  --project, -p NAME     Specify project name (optional, uses cached value if not provided)"
    echo "  --help, -h             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Deploy to production"
    echo "  $0 --branch dev        # Deploy to dev preview branch"
    echo "  $0 -p my-site -b dev   # Deploy to dev branch of my-site project"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -p|--project)
            PROJECT_NAME="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            print_message "$RED" "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Check authentication
print_message "$BLUE" "\n→ Checking Cloudflare authentication..."
if npx wrangler whoami &> /dev/null; then
    print_message "$GREEN" "✓ Already authenticated with Cloudflare"
else
    print_message "$YELLOW" "⚠ Not authenticated with Cloudflare"
    print_message "$BLUE" "→ Starting authentication flow..."
    npx wrangler login
fi

# Build deployment command
DEPLOY_CMD="npx wrangler pages deploy \"$BUILD_DIR\""

if [ -n "$PROJECT_NAME" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --project-name=\"$PROJECT_NAME\""
fi

if [ -n "$BRANCH" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --branch=\"$BRANCH\""
    print_message "$BLUE" "\n→ Deploying to preview branch: $BRANCH"
else
    print_message "$BLUE" "\n→ Deploying to production"
fi

print_message "$BLUE" "→ Executing: $DEPLOY_CMD"
print_message "$BLUE" "════════════════════════════════════════════════════════════\n"

# Execute deployment
eval $DEPLOY_CMD

# Check if deployment was successful
if [ $? -eq 0 ]; then
    print_message "$GREEN" "\n════════════════════════════════════════════════════════════"
    print_message "$GREEN" "✓ Deployment completed successfully!"
    print_message "$GREEN" "════════════════════════════════════════════════════════════"
else
    print_message "$RED" "\n════════════════════════════════════════════════════════════"
    print_message "$RED" "✗ Deployment failed!"
    print_message "$RED" "════════════════════════════════════════════════════════════"
    exit 1
fi
