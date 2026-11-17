#!/bin/zsh

# Flags links to SAP-internal-only hosts in public content (docs/, news/).
# These links require the SAP network or SSO, so they break for external
# visitors to the public Architecture Center site.
#
# Internal-only host patterns matched (case-insensitive):
#   *.tools.sap            internal tooling (github.tools.sap, pages.github.tools.sap,
#                          *.hyperspace.tools.sap, jira.tools.sap, ...)
#   *.int.sap              internal services (wiki.one.int.sap, ...)
#   *.sap.corp             legacy corporate network (*.wdf.sap.corp, *.mo.sap.corp,
#                          go.sap.corp, ...)
#   sap.sharepoint.com     internal SharePoint
#
# Note: *.cloud.sap, *.hana.ondemand.com, docs.sap, help.sap.com, me.sap.com and
# community.sap.com are customer-facing and are intentionally NOT flagged.
#
# Usage:
#   src/_scripts/_check-internal-links.zsh            # scan and report
#   src/_scripts/_check-internal-links.zsh --quiet    # exit code only, no listing
#
# Exit codes: 0 = none found, 1 = internal links found.

REPO_ROOT="${0:A:h}/../.."
SCAN_DIRS=("$REPO_ROOT/docs" "$REPO_ROOT/news")

# Args: optional --quiet, plus optional repo-relative file paths. When file paths
# are given (CI changed-files mode) only those are scanned; with none (local runs)
# the whole docs/ + news/ corpus is scanned.
quiet=0
files=()
for arg in "$@"; do
  case "$arg" in
    --quiet) quiet=1 ;;
    *) files+=("$arg") ;;
  esac
done

# Extended regex (POSIX ERE) for an internal-only host inside a URL.
# Portable across BSD grep (macOS), GNU grep (CI), and ugrep: no -P/PCRE, so
# no lookahead. The scheme is optional ("(https?:)?//") so protocol-relative
# links such as "//github.tools.sap/path" are caught too. The trailing
# character class acts as a host-label boundary so a decoy like
# "...tools.sapient.com" is NOT matched. The optional "(...\.)?" subdomain
# prefix lets a bare host such as "sap.sharepoint.com" match too.
pattern='(https?:)?//([a-zA-Z0-9.-]*\.)?(tools\.sap|int\.sap|sap\.corp|sap\.sharepoint\.com)([^a-zA-Z0-9.-]|$)'

hits=()

# Grep for internal-only hosts. Output lines look like "<path>:<lineno>:<url><boundary>".
#   -H filename, -n line number, -o only the matching URL, -i case-insensitive, -E ERE.
scan_targets=()
if (( ${#files} )); then
  # Changed-files mode: scan only the given md/mdx files that still exist.
  for f in "${files[@]}"; do
    [[ "$f" == *.md || "$f" == *.mdx ]] && [[ -f "$f" ]] && scan_targets+=("$f")
  done
  grep_cmd=(grep -HnioE "$pattern")
else
  # Whole-corpus mode (local default): recurse docs/ and news/.
  for dir in "${SCAN_DIRS[@]}"; do
    [[ -d "$dir" ]] && scan_targets+=("$dir")
  done
  grep_cmd=(grep -rHnioE --include='*.md' --include='*.mdx' "$pattern")
fi

if (( ${#scan_targets} )); then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    line="${line#$REPO_ROOT/}"   # make path repo-relative
    line="${line%[^a-zA-Z0-9]}"  # drop the trailing boundary char, if any
    hits+=("$line")
  done < <("${grep_cmd[@]}" "${scan_targets[@]}" 2>/dev/null)
fi

if (( ${#hits} == 0 )); then
  (( quiet )) || echo "✅ No internal-only SAP links found in docs/ and news/."
  if [[ -n "$GITHUB_STEP_SUMMARY" ]]; then
    {
      echo "### Internal link check"
      echo ""
      echo "✅ No internal-only SAP links found."
    } >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 0
fi

# In CI, surface each hit as an inline PR annotation (Files tab) plus a job summary.
# Hits are "path:lineno:url"; split on the first two colons (the URL keeps its own).
if [[ -n "$GITHUB_ACTIONS" ]]; then
  # Escape untrusted text for the GitHub Actions command channel so a crafted
  # filename or URL can't forge/corrupt annotations (data vs. property escaping).
  esc_data() { local s=$1; s=${s//'%'/%25}; s=${s//$'\r'/%0D}; s=${s//$'\n'/%0A}; print -rn -- "$s"; }
  esc_prop() { local s; s=$(esc_data "$1"); s=${s//,/%2C}; s=${s//:/%3A}; print -rn -- "$s"; }
  # Neutralise backticks/newlines in a PR-controlled path before it goes into a
  # Markdown inline-code span in the job summary, so it cannot break out of it.
  esc_sum() { printf '%s' "$1" | tr '`\n\r' '   '; }
  for h in "${hits[@]}"; do
    rel="${h%%:*}"; rest="${h#*:}"; lineno="${rest%%:*}"; url="${rest#*:}"
    echo "::error file=$(esc_prop "${rel}"),line=${lineno},title=Internal link::$(esc_data "Internal-only SAP link (breaks for external visitors): ${url}")"
  done
  if [[ -n "$GITHUB_STEP_SUMMARY" ]]; then
    {
      echo "### Internal link check"
      echo ""
      echo "❌ Found ${#hits} internal-only SAP link(s) that break for external visitors:"
      echo ""
      for h in "${hits[@]}"; do echo "- \`$(esc_sum "$h")\`"; done
      echo ""
      echo "📖 How to fix (replace the internal-only link with a public one): https://architecture.learning.sap.com/docs/community/automated-checks/document-body/internal-links"
    } >> "$GITHUB_STEP_SUMMARY"
  fi
fi

if (( ! quiet )); then
  echo "❌ Found ${#hits} internal-only SAP link(s). These break for external visitors:"
  echo ""
  for h in "${hits[@]}"; do
    echo "  $h"
  done
  echo ""
  echo "Internal hosts: *.tools.sap, *.int.sap, *.sap.corp, sap.sharepoint.com"
fi

exit 1
