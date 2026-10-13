#!/bin/zsh

# Validates `id` and `slug` frontmatter fields across all docs/ref-arch readme.md files.
# - `id` format must be exactly 6 characters: [a-z0-9]
# - `id` values must be unique across all files
# - `slug` must match the id, i.e. be exactly "/ref-arch/<id>"

REPO_ROOT="${0:A:h}/../.."
REF_ARCH_DIR="$REPO_ROOT/docs/ref-arch"

# Args: optional repo-relative readme paths the PR changed. When given (CI changed-
# files mode) only errors on those files fail the check — but EVERY readme is still
# read so id/slug uniqueness (a global invariant) is validated against the whole set.
# With no args (local runs) all files are reported.
typeset -A seen      # id -> first file path (relative), built from ALL readmes
typeset -A changed   # repo-relative paths the PR touched
report_all=1
for arg in "$@"; do changed[$arg]=1; report_all=0; done

errors=()
error_files=()    # parallel to errors: the repo-relative file each error belongs to
count=0

# Record an error together with its file so CI can emit a located ::error annotation.
add_error() { errors+=("$1"); error_files+=("$2"); }
# True when the given file should fail the check (local mode always reports).
should_report() { (( report_all )) || [[ -n "${changed[$1]}" ]]; }

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
    should_report "$rel" && add_error "MISSING id     $rel" "$rel"
    continue
  fi

  if [[ ! "$id" =~ '^[a-z0-9]{6}$' ]]; then
    should_report "$rel" && add_error "INVALID id \"$id\"  ->  $rel" "$rel"
  fi

  if [[ "$slug" != "/ref-arch/$id" ]]; then
    should_report "$rel" && add_error "SLUG MISMATCH  slug \"$slug\" != \"/ref-arch/$id\"  ->  $rel" "$rel"
  fi

  if [[ -n "${seen[$id]}" ]]; then
    # Duplicate id. Report when EITHER colliding file was changed; attribute the
    # annotation to the changed file so it surfaces on the PR that introduced it.
    if should_report "$rel" || should_report "${seen[$id]}"; then
      if should_report "$rel"; then culprit="$rel"; else culprit="${seen[$id]}"; fi
      add_error "DUPLICATE id \"$id\"  ->  $rel  (first seen in ${seen[$id]})" "$culprit"
    fi
  else
    seen[$id]="$rel"
  fi
done

if (( ${#errors} == 0 )); then
  echo "✅ All $count files have valid, unique ids."
  if [[ -n "$GITHUB_STEP_SUMMARY" ]]; then
    {
      echo "### Reference architecture ID check"
      echo ""
      echo "✅ All $count files have valid, unique ids."
    } >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 0
else
  echo "❌ Found ${#errors} error(s) across $count files:"
  echo ""
  for err in "${errors[@]}"; do
    echo "  $err"
  done

  # In CI, surface each error as an inline PR annotation (file-level; the script
  # tracks no line number) plus a job summary.
  if [[ -n "$GITHUB_ACTIONS" ]]; then
    for (( i = 1; i <= ${#errors}; i++ )); do
      echo "::error file=${error_files[$i]},title=Reference architecture IDs::${errors[$i]}"
    done
    if [[ -n "$GITHUB_STEP_SUMMARY" ]]; then
      {
        echo "### Reference architecture ID check"
        echo ""
        echo "❌ Found ${#errors} error(s) across $count files:"
        echo ""
        for err in "${errors[@]}"; do echo "- ${err}"; done
      } >> "$GITHUB_STEP_SUMMARY"
    fi
  fi

  exit 1
fi
