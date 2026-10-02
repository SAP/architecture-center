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

quiet=0
[[ "$1" == "--quiet" ]] && quiet=1

# Extended regex (POSIX ERE) for an internal-only host inside an http(s) URL.
# Portable across BSD grep (macOS), GNU grep (CI), and ugrep: no -P/PCRE, so
# no lookahead. The trailing character class acts as a host-label boundary so
# a decoy like "...tools.sapient.com" is NOT matched. The optional "(...\.)?"
# subdomain prefix lets a bare host such as "sap.sharepoint.com" match too.
pattern='https?://([a-zA-Z0-9.-]*\.)?(tools\.sap|int\.sap|sap\.corp|sap\.sharepoint\.com)([^a-zA-Z0-9.-]|$)'

hits=()

# One recursive grep over all markdown files:
#   -r recurse, --include filters extensions, -H filename, -n line number,
#   -o only the matching URL, -i case-insensitive, -E extended regex.
# Output lines look like "<path>:<lineno>:<url><boundary>".
scan_targets=()
for dir in "${SCAN_DIRS[@]}"; do
  [[ -d "$dir" ]] && scan_targets+=("$dir")
done

if (( ${#scan_targets} )); then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    line="${line#$REPO_ROOT/}"   # make path repo-relative
    line="${line%[^a-zA-Z0-9]}"  # drop the trailing boundary char, if any
    hits+=("$line")
  done < <(grep -rHnioE --include='*.md' --include='*.mdx' "$pattern" "${scan_targets[@]}" 2>/dev/null)
fi

if (( ${#hits} == 0 )); then
  (( quiet )) || echo "✓ No internal-only SAP links found in docs/ and news/."
  exit 0
fi

if (( ! quiet )); then
  echo "Found ${#hits} internal-only SAP link(s). These break for external visitors:"
  echo ""
  for h in "${hits[@]}"; do
    echo "  $h"
  done
  echo ""
  echo "Internal hosts: *.tools.sap, *.int.sap, *.sap.corp, sap.sharepoint.com"
fi

exit 1
