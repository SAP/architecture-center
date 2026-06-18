#!/bin/bash
# Security check for package.json npm scripts
# Run this before committing changes to package.json
# Usage: ./scripts/check-npm-scripts.sh

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Checking package.json for suspicious npm scripts..."

PACKAGE_JSON="package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
    echo -e "${RED}Error: package.json not found${NC}"
    exit 1
fi

# Dangerous lifecycle hooks that execute automatically
DANGEROUS_HOOKS=(
    "preinstall"
    "postinstall"
    "preuninstall"
    "postuninstall"
    "prepublish"
    "preprepare"
    "prepare"
    "postprepare"
)

# Suspicious patterns that indicate potential attacks
SUSPICIOUS_PATTERNS=(
    "curl.*|.*sh"
    "wget.*|.*bash"
    "base64.*-d"
    "/dev/tcp"
    "nc -e"
    "nc -c"
    "eval("
    '$(curl'
    '$(wget'
    "railway.app"
    "ngrok.io"
    "pipedream"
    "requestbin"
    "webhook.site"
    "burpcollaborator"
    "oastify.com"
    "interact.sh"
)

FOUND_ISSUES=0
FOUND_WARNINGS=0

# Check for dangerous lifecycle hooks
echo ""
echo "Checking for dangerous lifecycle hooks..."
for hook in "${DANGEROUS_HOOKS[@]}"; do
    if grep -q "\"$hook\":" "$PACKAGE_JSON"; then
        SCRIPT_VALUE=$(grep -o "\"$hook\":[^,}]*" "$PACKAGE_JSON" | head -1)
        echo -e "${YELLOW}⚠️  WARNING: Found lifecycle hook '$hook': $SCRIPT_VALUE${NC}"
        FOUND_WARNINGS=1

        # Check if it contains dangerous patterns
        for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
            if echo "$SCRIPT_VALUE" | grep -qiE "$pattern"; then
                echo -e "${RED}🚨 CRITICAL: Hook '$hook' contains suspicious pattern: $pattern${NC}"
                FOUND_ISSUES=1
            fi
        done
    fi
done

# Check all scripts for suspicious patterns
echo ""
echo "Checking all scripts for suspicious patterns..."
SCRIPTS=$(grep -o '"[^"]*":[[:space:]]*"[^"]*"' "$PACKAGE_JSON" 2>/dev/null || true)

for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    if echo "$SCRIPTS" | grep -qiE "$pattern"; then
        echo -e "${RED}🚨 CRITICAL: Found suspicious pattern '$pattern' in scripts${NC}"
        FOUND_ISSUES=1
    fi
done

# Check for shell script references
echo ""
echo "Checking for external shell script references..."
if grep -qE '\.sh["\s]' "$PACKAGE_JSON"; then
    echo -e "${YELLOW}⚠️  WARNING: package.json references .sh shell scripts${NC}"
    echo "    Please review these scripts manually for security issues."
    FOUND_WARNINGS=1
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FOUND_ISSUES -eq 1 ]; then
    echo -e "${RED}❌ SECURITY CHECK FAILED${NC}"
    echo "Critical security issues found. Please review and fix before committing."
    exit 1
elif [ $FOUND_WARNINGS -eq 1 ]; then
    echo -e "${YELLOW}⚠️  SECURITY CHECK PASSED WITH WARNINGS${NC}"
    echo "Please review the warnings above before committing."
    exit 0
else
    echo -e "${GREEN}✅ SECURITY CHECK PASSED${NC}"
    echo "No suspicious patterns found in package.json scripts."
    exit 0
fi
