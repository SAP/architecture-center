#!/usr/bin/env zsh
#
# delete-workflow-runs.sh — delete ALL GitHub Actions workflow runs for a repo.
#
# Deletion is irreversible: it removes run history (logs, artifacts metadata),
# NOT the workflow files themselves. New runs are created again on the next
# push / PR / schedule.
#
# Requires: gh (GitHub CLI), authenticated for the target host (`gh auth status`).
#
# Usage:
#   .github/scripts/delete-workflow-runs.sh [-r owner/repo] [-H host] [-p N] [-y] [-n]
#
#   -r owner/repo   Target repo. Default: the current git remote's repo.
#   -H host         GitHub host. Default: derived from the remote, else github.com.
#   -p N            Parallel deletes. Default: 10.
#   -y              Skip the confirmation prompt.
#   -n              Dry run — list what would be deleted, delete nothing.
#   -h              Show this help.
#
# Examples:
#   # Preview only — list the runs that would be deleted, delete nothing:
#   .github/scripts/delete-workflow-runs.sh -n
#
#   # Preview for the shared internal repo:
#   .github/scripts/delete-workflow-runs.sh -r OCTO/architecture-center -H github.tools.sap -n
#
#   # Delete every run on the shared internal repo (asks for confirmation):
#   .github/scripts/delete-workflow-runs.sh -r OCTO/architecture-center -H github.tools.sap
#
#   # Non-interactive — skip the confirmation prompt (host derived from the remote):
#   .github/scripts/delete-workflow-runs.sh -r OCTO/architecture-center -y
#
#   # Faster on large repos — raise parallelism to 20:
#   .github/scripts/delete-workflow-runs.sh -r OCTO/architecture-center -y -p 20

set -euo pipefail

# Capture the script path at top level: inside a zsh function $0 is the
# function name, not the script, so grab it here for usage() to read.
SELF="$0"

PARALLEL=10
ASSUME_YES=0
DRY_RUN=0
REPO=""
HOST=""

usage() { sed -n '2,35p' "$SELF"; exit "${1:-0}"; }

while getopts ":r:H:p:ynh" opt; do
  case "$opt" in
    r) REPO="$OPTARG" ;;
    H) HOST="$OPTARG" ;;
    p) PARALLEL="$OPTARG" ;;
    y) ASSUME_YES=1 ;;
    n) DRY_RUN=1 ;;
    h) usage 0 ;;
    :) echo "Error: -$OPTARG requires a value." >&2; usage 1 ;;
    \?) echo "Error: unknown option -$OPTARG." >&2; usage 1 ;;
  esac
done

command -v gh >/dev/null 2>&1 || { echo "Error: gh (GitHub CLI) is not installed." >&2; exit 1; }

# Derive host and repo from the current git remote when not given.
if [[ -z "$HOST" || -z "$REPO" ]]; then
  remote_url="$(git remote get-url origin 2>/dev/null || true)"
  if [[ -n "$remote_url" ]]; then
    # Strip scheme + optional user@, then split host / owner / repo.
    stripped="${remote_url#*://}"
    stripped="${stripped#*@}"
    stripped="${stripped%.git}"
    derived_host="${stripped%%/*}"
    derived_repo="${stripped#*/}"
    [[ -z "$HOST" ]] && HOST="$derived_host"
    [[ -z "$REPO" ]] && REPO="$derived_repo"
  fi
fi

[[ -z "$HOST" ]] && HOST="github.com"
if [[ -z "$REPO" ]]; then
  echo "Error: could not determine target repo. Pass -r owner/repo." >&2
  exit 1
fi

export GH_HOST="$HOST"

echo "Host:     $HOST"
echo "Repo:     $REPO"
echo "Parallel: $PARALLEL"
[[ "$DRY_RUN" -eq 1 ]] && echo "Mode:     DRY RUN (no deletions)"

# Confirm auth against the target host.
gh auth status --hostname "$HOST" >/dev/null 2>&1 || {
  echo "Error: not authenticated to $HOST. Run: gh auth login --hostname $HOST" >&2
  exit 1
}

fetch_ids() {
  gh run list --repo "$HOST/$REPO" --limit 500 --json databaseId --jq '.[].databaseId' </dev/null
}

ids="$(fetch_ids)"
count="$(print -r -- "$ids" | grep -c . || true)"

if [[ "$count" -eq 0 ]]; then
  echo "No workflow runs found. Nothing to delete."
  exit 0
fi

echo "Found $count workflow run(s)."

if [[ "$DRY_RUN" -eq 1 ]]; then
  print -r -- "$ids"
  echo "Dry run: would delete $count run(s)."
  exit 0
fi

if [[ "$ASSUME_YES" -ne 1 ]]; then
  printf "Delete ALL %d runs on %s/%s? This cannot be undone. [y/N] " "$count" "$HOST" "$REPO"
  read -r reply
  [[ "$reply" == [yY] || "$reply" == [yY][eE][sS] ]] || { echo "Aborted."; exit 1; }
fi

# GitHub caps run listing at ~1000 (500/page here); loop until the repo is empty
# so counts above one page are fully cleared. Deletes run in parallel via the API,
# which is markedly faster than `gh run delete` per run.
total_ok=0
while [[ -n "$ids" ]]; do
  ok="$(
    print -r -- "$ids" | xargs -P "$PARALLEL" -I {} sh -c \
      'gh api --method DELETE "repos/'"$REPO"'/actions/runs/{}" </dev/null >/dev/null 2>&1 && echo ok' \
      | grep -c ok || true
  )"
  total_ok=$(( total_ok + ok ))
  ids="$(fetch_ids)"
done

remaining="$(gh run list --repo "$HOST/$REPO" --limit 500 --json databaseId --jq 'length' </dev/null)"
echo "Deleted: $total_ok"
echo "Remaining: $remaining"
[[ "$remaining" -eq 0 ]] || { echo "Warning: $remaining run(s) could not be deleted." >&2; exit 1; }
