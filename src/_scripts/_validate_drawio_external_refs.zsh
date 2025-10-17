#!/bin/zsh

# Check if a folder or file parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <folder_path|file_path>"
  echo "  folder_path: Directory to scan recursively for .drawio files"
  echo "  file_path:   Single .drawio file to validate"
  exit 1
fi

# Assign the path from the parameter
INPUT_PATH="$1"

# Check if the provided path exists
if [ ! -e "$INPUT_PATH" ]; then
  echo "Error: $INPUT_PATH does not exist."
  exit 1
fi

# Initialize error flag and counters
ERROR_FOUND=0
TOTAL_DRAWIO_FILES=0
FILES_WITH_EXTERNAL_REFS=0

# Create temporary file to store files with external references
TEMP_FILE=$(mktemp)

echo "Scanning drawio files for external image references (image=http patterns)..."
echo "============================================================================"

# Function to validate a single drawio file
validate_file() {
  local file="$1"
  TOTAL_DRAWIO_FILES=$((TOTAL_DRAWIO_FILES + 1))
  echo "Checking: $file"
  
  # Search for the pattern "image=http" in the file
  if grep -q "image=http" "$file"; then
    echo "  ❌ ERROR: External image reference found!"
    
    # Show the specific lines containing the pattern for debugging
    echo "  📍 Found external references in these locations:"
    grep -n "image=http" "$file" | head -5 | while read -r line; do
      echo "    Line: $line"
    done
    
    # Add file to the list of files with external references
    echo "$file" >> "$TEMP_FILE"
    
    FILES_WITH_EXTERNAL_REFS=$((FILES_WITH_EXTERNAL_REFS + 1))
    ERROR_FOUND=1
  else
    echo "  ✅ OK: No external image references found"
  fi
  echo ""
}

# Handle both files and directories
if [ -f "$INPUT_PATH" ]; then
  # Single file mode
  if [[ "$INPUT_PATH" != *.drawio ]]; then
    echo "Error: $INPUT_PATH is not a .drawio file."
    rm -f "$TEMP_FILE"
    exit 1
  fi
  validate_file "$INPUT_PATH"
elif [ -d "$INPUT_PATH" ]; then
  # Directory mode - find and validate all drawio files in the folder and its subfolders
  find "$INPUT_PATH" -type f -name "*.drawio" | while read -r file; do
    validate_file "$file"
  done
else
  echo "Error: $INPUT_PATH is neither a file nor a directory."
  rm -f "$TEMP_FILE"
  exit 1
fi

# Read the list of files with external references
EXTERNAL_REF_FILES=$(cat "$TEMP_FILE" 2>/dev/null)

echo "============================================================================"
echo "Validation Summary:"
echo "- Total drawio files scanned: $TOTAL_DRAWIO_FILES"
echo "- Files with external references: $FILES_WITH_EXTERNAL_REFS"

if [ $ERROR_FOUND -eq 1 ]; then
  echo ""
  echo "🚨 VALIDATION FAILED: drawio files with external image references detected!"
  echo ""
  echo "Files with external references:"
  echo "==============================="
  if [ -n "$EXTERNAL_REF_FILES" ]; then
    echo "$EXTERNAL_REF_FILES" | while read -r file; do
      if [ -n "$file" ]; then
        echo "  $file"
      fi
    done
  fi
  echo ""
  echo "External image references (image=http) are not allowed as they:"
  echo "  • Create dependencies on external resources"
  echo "  • May break when external resources are unavailable"
  echo "  • Can cause security and privacy concerns"
  echo "  • May slow down diagram loading"
  echo ""
  echo "Please replace external image references with local images or"
  echo "embedded data URIs to ensure diagrams are self-contained."
  
  # Clean up temporary file
  rm -f "$TEMP_FILE"
  exit 1
else
  echo ""
  echo "✅ VALIDATION PASSED: No external image references found!"
  # Clean up temporary file
  rm -f "$TEMP_FILE"
fi
