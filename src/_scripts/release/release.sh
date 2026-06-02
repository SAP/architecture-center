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

# 2. Pull latest changes from remote
echo "Pulling latest changes..."
git pull

# 3. Update the version in package.json via the Node script
new_version=$(node "$SCRIPT_DIR/update-version.js")
echo "Version updated to: $new_version"

# 4. Run npm install (to update package-lock.json)
echo "Running npm install..."
npm install

# 5. Stage the relevant files
git add package.json package-lock.json

# 6. Commit
commit_msg="Release $new_version"
git commit -m "$commit_msg"
echo "Committed: $commit_msg"

# 7. Push to remote/dev
git push
echo "Pushed successfully."

# 8. Create a PR from dev -> main
echo "Creating PR on SAP/architecture-center..."
gh pr create \
  --repo "SAP/architecture-center" \
  --base main \
  --head dev \
  --title "$commit_msg" \
  --body "" \
  --label "new release"
echo "PR created successfully."

# 9. Create GitHub release and tag
echo "Creating GitHub release $new_version..."
gh release create "$new_version" --repo "SAP/architecture-center" --generate-notes --target main
echo "GitHub release created successfully."
