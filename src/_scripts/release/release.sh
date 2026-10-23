#!/usr/bin/env bash
set -e

# --- Load nvm so that node/npm are available ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if ! command -v node &>/dev/null; then
  echo "Error: node is not installed or not in PATH."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Read the package.json "version" field as checked in at a given git ref
# (e.g. origin/main). Used to confirm the release phases run in the right order.
pkg_version_at() {
  git show "$1:package.json" | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).version"
}

# ----------------------------------------------------------------------------
# Release flow — two phases.
#
# The version bump lands on dev through a REVIEWED PR, never a direct push, so
# the dev branch protection (required reviews + status checks, and eventually
# "include administrators") is honoured and OpenSSF Scorecard's Branch-Protection
# and Code-Review checks are not penalised by unreviewed release commits.
#
#   ./release.sh            Phase 1 (bump): bump the version on a
#                           release/<version> branch and open a PR into dev.
#                           Get it reviewed and merged.
#
#   ./release.sh --publish  Phase 2 (publish): AFTER that PR is merged into dev,
#                           open the dev -> main release PR and create the
#                           tag/GitHub release.
# ----------------------------------------------------------------------------
MODE="${1:-bump}"

# 1. Check gh CLI is available and authenticated
if ! command -v gh &>/dev/null; then
  echo "Error: gh CLI is not installed."
  exit 1
fi
if ! gh auth status --hostname github.com &>/dev/null; then
  echo "Error: gh CLI is not authenticated. Run 'gh auth login'."
  exit 1
fi

# 2. Ensure the script is run from the project root
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
  echo "Error: Run this script from the root of the project."
  exit 1
fi

# 3. Ensure we are on the dev branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "dev" ]; then
  echo "Error: You must be on the 'dev' branch. Currently on '$current_branch'."
  exit 1
fi

# 4. Pull latest changes from remote
echo "Pulling latest changes..."
git pull

case "$MODE" in
  bump)
    # --- Phase 1: version bump on a branch + PR into dev --------------------

    # The release commit must contain only the version bump, so refuse to start
    # if these files already carry local changes — they would otherwise be swept
    # into the commit, and destroyed by the discard-on-abort path below.
    if ! git diff --quiet -- package.json package-lock.json ||
       ! git diff --cached --quiet -- package.json package-lock.json; then
      echo "Error: package.json and package-lock.json must be clean before starting a release."
      exit 1
    fi

    # Update the version in package.json via the Node script. The script also
    # syncs the version field in package-lock.json offline, so no `npm install`
    # is needed here (avoids an unpinned dependency fetch at release time).
    new_version=$(node "$SCRIPT_DIR/update-version.js")
    echo "Version updated to: $new_version"

    branch="release/$new_version"
    if git show-ref --verify --quiet "refs/heads/$branch"; then
      echo "Error: branch '$branch' already exists locally. Delete it (git branch -D $branch) or finish that release first."
      # Discard the working-tree bump so dev is left clean.
      git checkout -- package.json package-lock.json
      exit 1
    fi

    # Move the working-tree changes onto a fresh release branch so dev stays
    # untouched (git carries the uncommitted edits across the checkout).
    git checkout -b "$branch"
    git add package.json package-lock.json
    commit_msg="Release $new_version"
    git commit -m "$commit_msg"
    echo "Committed: $commit_msg"

    git push -u origin "$branch"
    echo "Pushed branch '$branch'."

    # 5. Open the version-bump PR INTO dev (reviewed + merged by a maintainer).
    echo "Creating version-bump PR into dev..."
    gh pr create \
      --repo "SAP/architecture-center" \
      --base dev \
      --head "$branch" \
      --title "$commit_msg" \
      --body "Automated version bump for \`$new_version\`. Review and merge into dev, then run \`./src/_scripts/release/release.sh --publish\` to open the dev -> main release PR and tag the release." \
      --label "new release"
    echo "PR created successfully."

    # Return to the dev branch so the working copy is back on default.
    git checkout dev

    echo ""
    echo "Next steps:"
    echo "  1. Get the '$commit_msg' PR reviewed and merged into dev."
    echo "  2. Run: ./src/_scripts/release/release.sh --publish"
    ;;

  --publish | publish)
    # --- Phase 2: dev -> main release PR + tag ------------------------------
    # Run this only after the version-bump PR has been merged into dev.

    new_version=$(node -p "require('./package.json').version")

    # Guard: refuse to publish if dev has no version bump relative to main — that
    # means the phase-1 version-bump PR has not been merged into dev yet.
    git fetch origin main
    main_version=$(pkg_version_at origin/main)
    if [ "$new_version" = "$main_version" ]; then
      echo "Error: dev ($new_version) has no version bump relative to main. Merge the version-bump PR into dev first."
      exit 1
    fi

    commit_msg="Release $new_version"
    echo "Current version on dev: $new_version"

    # 6. Create a PR from dev -> main
    echo "Creating dev -> main release PR on SAP/architecture-center..."
    gh pr create \
      --repo "SAP/architecture-center" \
      --base main \
      --head dev \
      --title "$commit_msg" \
      --body "" \
      --label "new release"
    echo "PR created successfully."

    # 7. Create GitHub release and tag
    # Prompted because the release tag must point to main, so the PR above has
    # to be merged first.
    echo ""
    read -r -p "Create GitHub release and tag $new_version now? [y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      # The tag points at the current main tip, so main must already carry this
      # version — i.e. the dev -> main PR must be merged before tagging.
      git fetch origin main
      main_version=$(pkg_version_at origin/main)
      if [ "$main_version" != "$new_version" ]; then
        echo "Error: main is still at $main_version; merge the release PR before creating $new_version."
        exit 1
      fi
      echo "Creating GitHub release $new_version..."
      gh release create "$new_version" --repo "SAP/architecture-center" --generate-notes --target main
      echo "GitHub release created successfully."
    else
      echo "Skipped. Run the following command manually once the PR is merged:"
      echo "  gh release create \"$new_version\" --repo SAP/architecture-center --generate-notes --target main"
    fi
    ;;

  *)
    echo "Usage: release.sh [--publish]"
    echo "  (no args)   Phase 1: bump the version on a release/<version> branch and open a PR into dev."
    echo "  --publish   Phase 2: open the dev -> main release PR and create the tag (after phase 1 is merged)."
    exit 1
    ;;
esac
