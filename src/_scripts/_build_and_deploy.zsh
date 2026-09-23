#!/usr/bin/env zsh

# Build and Deploy Script
# This script builds the project and optionally exports drawio files and deploys to Cloudflare

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

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo "${color}${message}${NC}"
}

print_message "$BLUE" "╔═══════════════════════════════════════════════════════════╗"
print_message "$BLUE" "║   Build and Deploy Script                                 ║"
print_message "$BLUE" "╚═══════════════════════════════════════════════════════════╝"

# Parse command line arguments
DRAWIO_EXPORT=false
PROD_DEPLOY=false

print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -drawio:true    Export drawio files before build and deploy to TEST"
    echo "  -prod:true      Deploy to PROD (skips drawio export)"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "Important:"
    echo "  - drawio:true and prod:true cannot be used together"
    echo "  - prod:true always skips drawio export"
    echo ""
    echo "Examples:"
    echo "  $0                    # Clear cache, build (no deployment)"
    echo "  $0 -drawio:true       # Clear, export drawios, build, deploy to TEST"
    echo "  $0 -prod:true         # Clear, build, deploy to PROD (no drawio export)"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -drawio:true)
            DRAWIO_EXPORT=true
            shift
            ;;
        -prod:true)
            PROD_DEPLOY=true
            shift
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

# Validate that drawio and prod are not used together
if [ "$DRAWIO_EXPORT" = true ] && [ "$PROD_DEPLOY" = true ]; then
    print_message "$RED" "✗ Error: -drawio:true and -prod:true cannot be used together"
    print_message "$YELLOW" "  These options are mutually exclusive"
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"

# Step 1: Clear cache
print_message "$BLUE" "\n→ Step 1: Clearing Docusaurus cache..."
npm run clear

if [ $? -eq 0 ]; then
    print_message "$GREEN" "✓ Cache cleared successfully"
else
    print_message "$RED" "✗ Failed to clear cache"
    exit 1
fi

# Step 2: Export drawios (only if drawio:true and NOT prod:true)
if [ "$DRAWIO_EXPORT" = true ]; then
    print_message "$BLUE" "\n→ Step 2: Exporting drawio files..."
    node "$SCRIPT_DIR/_export-drawios.js"

    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✓ Drawio files exported successfully"
    else
        print_message "$RED" "✗ Failed to export drawio files"
        exit 1
    fi
else
    print_message "$YELLOW" "\n→ Step 2: Skipping drawio export"
fi

# Step 3: Build
print_message "$BLUE" "\n→ Step 3: Building project..."
npm run build

if [ $? -eq 0 ]; then
    print_message "$GREEN" "✓ Build completed successfully"
else
    print_message "$RED" "✗ Build failed"
    exit 1
fi

# Step 4: Deploy
if [ "$DRAWIO_EXPORT" = true ]; then
    print_message "$BLUE" "\n→ Step 4: Deploying to TEST environment..."
    npm run deploy:cloudflare:test

    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✓ Deployed to TEST successfully"
    else
        print_message "$RED" "✗ Deployment to TEST failed"
        exit 1
    fi
elif [ "$PROD_DEPLOY" = true ]; then
    print_message "$BLUE" "\n→ Step 4: Deploying to PROD environment..."
    npm run deploy:cloudflare:prod

    if [ $? -eq 0 ]; then
        print_message "$GREEN" "✓ Deployed to PROD successfully"
    else
        print_message "$RED" "✗ Deployment to PROD failed"
        exit 1
    fi
else
    print_message "$YELLOW" "\n→ Step 4: No deployment requested"
fi

# Final success message
print_message "$GREEN" "\n════════════════════════════════════════════════════════════"
print_message "$GREEN" "✓ All tasks completed successfully!"
print_message "$GREEN" "════════════════════════════════════════════════════════════"
