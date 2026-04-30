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

# Check Wrangler version
print_message "$BLUE" "\n→ Checking Wrangler version..."
CURRENT_VERSION=$(npx wrangler --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
LATEST_VERSION=$(npm view wrangler version 2>/dev/null)

if [ -n "$CURRENT_VERSION" ] && [ -n "$LATEST_VERSION" ]; then
    print_message "$BLUE" "  Current: $CURRENT_VERSION"
    if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
        print_message "$YELLOW" "  ⚠ New version available: $LATEST_VERSION"
        print_message "$YELLOW" "  Consider updating with: npm install -g wrangler@latest"
        print_message "$YELLOW" "  Or clear npx cache: rm -rf ~/.npm/_npx"
    else
        print_message "$GREEN" "  ✓ Using latest version"
    fi
else
    print_message "$YELLOW" "  ⚠ Could not check for updates"
fi

# Parse command line arguments
ENVIRONMENT=""
BRANCH=""
PROJECT_NAME=""

# Environment configuration
declare -A ENV_BRANCHES
ENV_BRANCHES[DEV]="dev"
ENV_BRANCHES[TEST]="test"
ENV_BRANCHES[PROD]="prod"

declare -A ENV_COLORS
ENV_COLORS[DEV]="$YELLOW"
ENV_COLORS[TEST]="$BLUE"
ENV_COLORS[PROD]="$GREEN"

print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --env, -e ENV          Environment to deploy to: DEV, TEST, or PROD (required)"
    echo "  --project, -p NAME     Specify project name (optional, uses cached value if not provided)"
    echo "  --help, -h             Show this help message"
    echo ""
    echo "Environments:"
    echo "  DEV    - Development environment (deploys to dev branch)"
    echo "  TEST   - Test/Staging environment (deploys to test branch)"
    echo "  PROD   - Production environment (deploys to main branch)"
    echo ""
    echo "Examples:"
    echo "  $0 --env DEV           # Deploy to development"
    echo "  $0 -e TEST             # Deploy to test/staging"
    echo "  $0 -e PROD             # Deploy to production"
    echo "  $0 -e DEV -p my-site   # Deploy to dev with specific project name"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="${2:u}"  # Convert to uppercase
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

# Validate environment
if [ -z "$ENVIRONMENT" ]; then
    print_message "$RED" "✗ Error: Environment is required"
    print_message "$YELLOW" "  Please specify an environment: --env DEV, --env TEST, or --env PROD"
    echo ""
    print_usage
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(DEV|TEST|PROD)$ ]]; then
    print_message "$RED" "✗ Error: Invalid environment '$ENVIRONMENT'"
    print_message "$YELLOW" "  Valid environments are: DEV, TEST, PROD"
    exit 1
fi

# Set branch based on environment
BRANCH="${ENV_BRANCHES[$ENVIRONMENT]}"
ENV_COLOR="${ENV_COLORS[$ENVIRONMENT]}"

# Check authentication
print_message "$BLUE" "\n→ Checking Cloudflare authentication..."
if npx wrangler whoami &> /dev/null; then
    print_message "$GREEN" "✓ Already authenticated with Cloudflare"
else
    print_message "$YELLOW" "⚠ Not authenticated with Cloudflare"
    print_message "$BLUE" "→ Starting authentication flow..."
    npx wrangler login
fi

# Display environment information
print_message "$ENV_COLOR" "\n╔═══════════════════════════════════════════════════════════╗"
print_message "$ENV_COLOR" "║   Deploying to: $ENVIRONMENT Environment"
print_message "$ENV_COLOR" "║   Branch: $BRANCH"
print_message "$ENV_COLOR" "╚═══════════════════════════════════════════════════════════╝"

# Build deployment command
DEPLOY_CMD="npx wrangler pages deploy \"$BUILD_DIR\""

if [ -n "$PROJECT_NAME" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --project-name=\"$PROJECT_NAME\""
fi

if [ -n "$BRANCH" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --branch=\"$BRANCH\""
fi

print_message "$BLUE" "\n→ Executing: $DEPLOY_CMD"
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
