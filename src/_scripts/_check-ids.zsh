#!/bin/zsh

# Validates `id` and `slug` frontmatter fields across all docs/ref-arch readme.md files.
# - `id` format must be exactly 6 characters: [a-z0-9]
# - `id` values must be unique across all files
# - `slug` must match the id, i.e. be exactly "/ref-arch/<id>"

REPO_ROOT="${0:A:h}/../.."
REF_ARCH_DIR="$REPO_ROOT/docs/ref-arch"

typeset -A seen   # id -> first file path (relative)
errors=()
error_files=()    # parallel to errors: the repo-relative file each error belongs to
count=0

# Record an error message together with the file it applies to, so CI can emit a
# correctly-located ::error annotation (there is no line number; file-level is enough).
add_error() { errors+=("$1"); error_files+=("$2"); }

for file in "$REF_ARCH_DIR"/**/readme.md(.N); do
  rel="${file#$REPO_ROOT/}"

  # Skip the conceptual landing page (slug "/ref-arch") and the RA0000 demo,
  # neither of which follows the "/ref-arch/<id>" convention.
  if [[ "$rel" == "docs/ref-arch/readme.md" || "$rel" == docs/ref-arch/RA0000/* ]]; then
    continue
  fi

  (( count++ ))

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

  # Extract the `slug:` value the same way.
  slug=$(awk '
    /^---[[:space:]]*$/ { if (++fence == 2) exit; next }
    fence == 1 && /^slug:[[:space:]]*/ {
      sub(/^slug:[[:space:]]*/, "")
      gsub(/^["'\'']|["'\'']$/, "")
      print
      exit
    }
  ' "$file")

  if [[ -z "$id" ]]; then
    add_error "MISSING id     $rel" "$rel"
    continue
  fi

  if [[ ! "$id" =~ '^[a-z0-9]{6}$' ]]; then
    add_error "INVALID id \"$id\"  ->  $rel" "$rel"
  fi

  if [[ "$slug" != "/ref-arch/$id" ]]; then
    add_error "SLUG MISMATCH  slug \"$slug\" != \"/ref-arch/$id\"  ->  $rel" "$rel"
  fi

  if [[ -n "${seen[$id]}" ]]; then
    add_error "DUPLICATE id \"$id\"  ->  $rel  (first seen in ${seen[$id]})" "$rel"
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

  # In CI, surface each error as an inline PR annotation and a job summary.
  if [[ -n "$GITHUB_ACTIONS" ]]; then
    for ((i = 1; i <= ${#errors}; i++)); do
      echo "::error file=${error_files[$i]}::${errors[$i]}"
    done
    if [[ -n "$GITHUB_STEP_SUMMARY" ]]; then
      {
        echo "### Reference Architecture ID check"
        echo ""
        echo "Found ${#errors} error(s) across $count files:"
        echo ""
        for err in "${errors[@]}"; do echo "- ${err}"; done
      } >> "$GITHUB_STEP_SUMMARY"
    fi
  fi

  exit 1
fi
