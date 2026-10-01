#!/bin/zsh

# Validates `id` frontmatter fields across all docs/ref-arch readme.md files.
# - Format must be exactly 6 characters: [a-z0-9]
# - Values must be unique across all files

REPO_ROOT="${0:A:h}/../.."
REF_ARCH_DIR="$REPO_ROOT/docs/ref-arch"

typeset -A seen   # id -> first file path (relative)
errors=()
count=0

for file in "$REF_ARCH_DIR"/**/*.md(.N); do
  (( count++ ))
  rel="${file#$REPO_ROOT/}"

  # Extract the `id:` value from inside the first --- ... --- frontmatter block,
  # then strip surrounding quotes and whitespace.
  id=$(awk '
    /^---[[:space:]]*$/ { if (++fence == 2) exit; next }
    fence == 1 && /^id:[[:space:]]*/ {
      sub(/^id:[[:space:]]*/, "")
      gsub(/^["'\'']|["'\'']$/, "")
      print
      exit
    }
  ' "$file")

  if [[ -z "$id" ]]; then
    errors+=("MISSING id     $rel")
    continue
  fi

  if [[ ! "$id" =~ '^[a-z0-9]{6}$' ]]; then
    errors+=("INVALID id \"$id\"  ->  $rel")
  fi

  if [[ -n "${seen[$id]}" ]]; then
    errors+=("DUPLICATE id \"$id\"  ->  $rel  (first seen in ${seen[$id]})")
  else
    seen[$id]="$rel"
  fi
done

if (( ${#errors} == 0 )); then
  echo "✓ All $count files have valid, unique ids."
  exit 0
else
  echo "Found ${#errors} error(s) across $count files:"
  echo ""
  for err in "${errors[@]}"; do
    echo "  $err"
  done
  exit 1
fi
