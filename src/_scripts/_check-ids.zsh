#!/bin/zsh

# Validates `id` and `slug` frontmatter fields across all docs/ref-arch readme.md files.
# - `id` format must be exactly 6 characters: [a-z0-9]
# - `id` values must be unique across all files
# - `slug` must match the id, i.e. be exactly "/ref-arch/<id>"

REPO_ROOT="${0:A:h}/../.."
REF_ARCH_DIR="$REPO_ROOT/docs/ref-arch"

# Escape untrusted text for the GitHub Actions command channel so a crafted
# filename or message can't forge/corrupt annotations (data vs. property escaping).
esc_data() { local s=$1; s=${s//'%'/%25}; s=${s//$'\r'/%0D}; s=${s//$'\n'/%0A}; print -rn -- "$s"; }
esc_prop() { local s; s=$(esc_data "$1"); s=${s//,/%2C}; s=${s//:/%3A}; print -rn -- "$s"; }

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
error_lines=()    # parallel to errors: frontmatter line of each error ("" when none)
typeset -A seen_idline  # id -> line of its id: field in the first-seen file
count=0

# Record an error with its file and (optional) frontmatter line so CI can emit a
# located ::error annotation that pins inline on the PR diff.
add_error() { errors+=("$1"); error_files+=("$2"); error_lines+=("$3"); }
# True when the given file should fail the check (local mode always reports).
should_report() { (( report_all )) || [[ -n "${changed[$1]}" ]]; }
# 1-based line of a frontmatter field inside the first --- ... --- block ("" if absent).
field_line() {
  awk -v field="$2" '
    /^---[[:space:]]*$/ { if (++fence == 2) exit; next }
    fence == 1 && $0 ~ "^" field ":[[:space:]]*" { print NR; exit }
  ' "$1"
}

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
    should_report "$rel" && add_error "MISSING id     $rel" "$rel" ""
    continue
  fi

  id_line=$(field_line "$file" id)
  slug_line=$(field_line "$file" slug)

  if [[ ! "$id" =~ '^[a-z0-9]{6}$' ]]; then
    should_report "$rel" && add_error "INVALID id \"$id\"  ->  $rel" "$rel" "$id_line"
  fi

  if [[ "$slug" != "/ref-arch/$id" ]]; then
    should_report "$rel" && add_error "SLUG MISMATCH  slug \"$slug\" != \"/ref-arch/$id\"  ->  $rel" "$rel" "$slug_line"
  fi

  if [[ -n "${seen[$id]}" ]]; then
    # Duplicate id. Report when EITHER colliding file was changed; attribute the
    # annotation to the changed file so it surfaces on the PR that introduced it.
    if should_report "$rel" || should_report "${seen[$id]}"; then
      if should_report "$rel"; then culprit="$rel"; culprit_line="$id_line"; else culprit="${seen[$id]}"; culprit_line="${seen_idline[$id]}"; fi
      add_error "DUPLICATE id \"$id\"  ->  $rel  (first seen in ${seen[$id]})" "$culprit" "$culprit_line"
    fi
  else
    seen[$id]="$rel"
    seen_idline[$id]="$id_line"
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

  # In CI, surface each error as an inline PR annotation (pinned to the offending
  # frontmatter line when known; file-level for MISSING id) plus a job summary.
  if [[ -n "$GITHUB_ACTIONS" ]]; then
    for (( i = 1; i <= ${#errors}; i++ )); do
      lineattr=""
      [[ -n "${error_lines[$i]}" ]] && lineattr=",line=${error_lines[$i]}"
      echo "::error file=$(esc_prop "${error_files[$i]}")${lineattr},title=Reference architecture IDs::$(esc_data "${errors[$i]}")"
    done
    if [[ -n "$GITHUB_STEP_SUMMARY" ]]; then
      {
        echo "### Reference architecture ID check"
        echo ""
        echo "❌ Found ${#errors} error(s) across $count files:"
        echo ""
        for err in "${errors[@]}"; do echo "- ${err}"; done
        echo ""
        echo "📖 How to fix (fix the id or slug, or let Quick Start generate them): https://architecture.learning.sap.com/docs/community/automated-checks/front-matter/reference-architecture-ids"
      } >> "$GITHUB_STEP_SUMMARY"
    fi
  fi

  exit 1
fi
