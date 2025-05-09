#!/bin/zsh

# Check if a folder parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <folder_path>"
  exit 1
fi

# Assign the folder path from the parameter
FOLDER_PATH="$1"

# Check if the provided path is a valid directory
if [ ! -d "$FOLDER_PATH" ]; then
  echo "Error: $FOLDER_PATH is not a valid directory."
  exit 1
fi

# Find and optimize all SVG files in the folder and its subfolders
find "$FOLDER_PATH" -type f -name "*.svg" | while read -r file; do
  echo "Optimizing: $file"
  svgo "$file" -o "$file"
done

echo "SVG optimization completed."