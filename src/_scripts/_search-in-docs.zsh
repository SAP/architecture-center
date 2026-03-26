#!/bin/zsh

# Get the script directory and determine the root directory
SCRIPT_DIR=$(dirname "$0")
ROOT_DIR=$(realpath "$SCRIPT_DIR/../..")
DOCS_DIR="$ROOT_DIR/docs"

# Check if docs directory exists
if [ ! -d "$DOCS_DIR" ]; then
  echo "Error: Docs directory $DOCS_DIR does not exist."
  exit 1
fi

# Ask for the pattern to search
echo "Enter the pattern to search for:"
read -r PATTERN

if [ -z "$PATTERN" ]; then
  echo "Error: Pattern cannot be empty."
  exit 1
fi

# Initialize counters
TOTAL_MD_FILES=0
FILES_WITH_PATTERN=0

echo ""
echo "Scanning markdown files for pattern: \"$PATTERN\""
echo "============================================================================"

# Find and search all markdown files in the docs directory
find "$DOCS_DIR" -type f -name "*.md" | while read -r file; do
  TOTAL_MD_FILES=$((TOTAL_MD_FILES + 1))

  if grep -q "$PATTERN" "$file"; then
    FILES_WITH_PATTERN=$((FILES_WITH_PATTERN + 1))
    RELATIVE_PATH="${file#$DOCS_DIR/}"
    FILENAME=$(basename "$file")

    echo ""
    echo "📄 Match found:"
    echo "   Path: $RELATIVE_PATH"
    echo "   File: $FILENAME"
    echo "   Pattern: \"$PATTERN\""
  fi
done

echo ""
echo "============================================================================"
echo "Search Summary:"
echo "- Pattern searched: \"$PATTERN\""
echo "- Docs directory: $DOCS_DIR"

# Count files for summary (need to run again since while loop runs in subshell)
TOTAL=$(find "$DOCS_DIR" -type f -name "*.md" | wc -l | tr -d ' ')
MATCHES=$(grep -rl "$PATTERN" "$DOCS_DIR" --include="*.md" 2>/dev/null | wc -l | tr -d ' ')

echo "- Total markdown files scanned: $TOTAL"
echo "- Files containing pattern: $MATCHES"

if [ "$MATCHES" -eq 0 ]; then
  echo ""
  echo "❌ No matches found for \"$PATTERN\""
else
  echo ""
  echo "✅ Found $MATCHES file(s) containing \"$PATTERN\""
fi
