const fs = require('fs');

const timeBreakdown = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#0f1117"/>
  <text x="400" y="35" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ffffff">Where Does the Time Actually Go?</text>
  <text x="400" y="55" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#666">Debugging the same bug — human vs AI-assisted investigation</text>
  <text x="175" y="90" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e63946">HUMAN INVESTIGATION</text>
  <text x="175" y="108" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#555">~15 hours across 3 days</text>
  <g transform="translate(175, 220)">
    <path d="M0,0 L0,-80 A80,80 0 0,1 66.7,41 Z" fill="#e63946" opacity="0.9"/>
    <path d="M0,0 L66.7,41 A80,80 0 0,1 -29,75.3 Z" fill="#9b72cf" opacity="0.85"/>
    <path d="M0,0 L-29,75.3 A80,80 0 0,1 -80,0 Z" fill="#e9c46a" opacity="0.85"/>
    <path d="M0,0 L-80,0 A80,80 0 0,1 0,-80 Z" fill="#2a9d8f" opacity="0.9"/>
    <circle r="44" fill="#0f1117"/>
    <text y="-8" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="800" fill="#e63946">10%</text>
    <text y="12" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#666">ACTUAL FIX</text>
  </g>
  <g transform="translate(60, 330)">
    <rect x="0" y="0" width="12" height="12" rx="2" fill="#e63946"/>
    <text x="18" y="10" font-family="sans-serif" font-size="10" fill="#bbb">Chasing wrong hypotheses</text>
    <text x="210" y="10" font-family="sans-serif" font-size="10" font-weight="bold" fill="#e63946">35%</text>
    <rect x="0" y="22" width="12" height="12" rx="2" fill="#9b72cf"/>
    <text x="18" y="32" font-family="sans-serif" font-size="10" fill="#bbb">Rebuilding context</text>
    <text x="210" y="32" font-family="sans-serif" font-size="10" font-weight="bold" fill="#9b72cf">30%</text>
    <rect x="0" y="44" width="12" height="12" rx="2" fill="#e9c46a"/>
    <text x="18" y="54" font-family="sans-serif" font-size="10" fill="#bbb">Waiting for redeployments</text>
    <text x="210" y="54" font-family="sans-serif" font-size="10" font-weight="bold" fill="#e9c46a">25%</text>
    <rect x="0" y="66" width="12" height="12" rx="2" fill="#2a9d8f"/>
    <text x="18" y="76" font-family="sans-serif" font-size="10" fill="#bbb">Actual fix work</text>
    <text x="210" y="76" font-family="sans-serif" font-size="10" font-weight="bold" fill="#2a9d8f">10%</text>
  </g>
  <line x1="400" y1="75" x2="400" y2="420" stroke="#222" stroke-width="1"/>
  <text x="625" y="90" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2a9d8f">CLAUDE CODE</text>
  <text x="625" y="108" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#555">60 minutes</text>
  <g transform="translate(625, 220)">
    <path d="M0,0 L0,-80 A80,80 0 0,1 76,-24.7 Z" fill="#457b9d" opacity="0.9"/>
    <path d="M0,0 L76,-24.7 A80,80 1,1,1 -47,-64.8 Z" fill="#2a9d8f" opacity="0.9"/>
    <path d="M0,0 L-47,-64.8 A80,80 0 0,1 0,-80 Z" fill="#e9c46a" opacity="0.85"/>
    <circle r="44" fill="#0f1117"/>
    <text y="-8" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="800" fill="#2a9d8f">65%</text>
    <text y="12" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#666">ACTUAL FIX</text>
  </g>
  <g transform="translate(510, 330)">
    <rect x="0" y="0" width="12" height="12" rx="2" fill="#2a9d8f"/>
    <text x="18" y="10" font-family="sans-serif" font-size="10" fill="#bbb">Actual fix + regression tests</text>
    <text x="210" y="10" font-family="sans-serif" font-size="10" font-weight="bold" fill="#2a9d8f">65%</text>
    <rect x="0" y="22" width="12" height="12" rx="2" fill="#457b9d"/>
    <text x="18" y="32" font-family="sans-serif" font-size="10" fill="#bbb">Hypothesis elimination</text>
    <text x="210" y="32" font-family="sans-serif" font-size="10" font-weight="bold" fill="#457b9d">20%</text>
    <rect x="0" y="44" width="12" height="12" rx="2" fill="#e9c46a"/>
    <text x="18" y="54" font-family="sans-serif" font-size="10" fill="#bbb">Planning + self-challenge</text>
    <text x="210" y="54" font-family="sans-serif" font-size="10" font-weight="bold" fill="#e9c46a">15%</text>
    <rect x="0" y="66" width="12" height="12" rx="2" fill="#333" opacity="0.3"/>
    <text x="18" y="76" font-family="sans-serif" font-size="10" fill="#444">Dead ends</text>
    <text x="210" y="76" font-family="sans-serif" font-size="10" fill="#444">0%</text>
  </g>
  <g transform="translate(135, 455)">
    <rect x="0" y="0" width="100" height="40" rx="8" fill="#1a1d27" stroke="#2a2d3a"/>
    <text x="50" y="18" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="800" fill="#e63946">90%</text>
    <text x="50" y="32" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">HUMAN: NOT FIXING</text>
  </g>
  <g transform="translate(350, 455)">
    <rect x="0" y="0" width="100" height="40" rx="8" fill="#1a1d27" stroke="#2a2d3a"/>
    <text x="50" y="18" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="800" fill="#2a9d8f">15x</text>
    <text x="50" y="32" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">FASTER RESOLUTION</text>
  </g>
  <g transform="translate(565, 455)">
    <rect x="0" y="0" width="100" height="40" rx="8" fill="#1a1d27" stroke="#2a2d3a"/>
    <text x="50" y="18" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="800" fill="#2a9d8f">+55%</text>
    <text x="50" y="32" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">MORE FIX TIME</text>
  </g>
</svg>`;

fs.writeFileSync(__dirname + '/time-breakdown.svg', timeBreakdown);
console.log('Created time-breakdown.svg');

// Setup Diagram - Claude Code's system setup with grouped icons
const setupDiagram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 950 850" width="950" height="850">
  <rect width="950" height="850" fill="#ffffff"/>
  <text x="475" y="35" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="#111">Claude Code — Full System Setup</text>
  <text x="475" y="55" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#888">Everything Claude Code could read, trace, and act on — and the governance layer that made it safe</text>

  <!-- Legend -->
  <g transform="translate(170, 75)">
    <circle cx="0" cy="0" r="5" fill="#181717"/><text x="12" y="4" font-family="sans-serif" font-size="10" fill="#666">Code &amp; Docs</text>
    <circle cx="120" cy="0" r="5" fill="#326ce5"/><text x="132" y="4" font-family="sans-serif" font-size="10" fill="#666">Kubernetes &amp; Gardener</text>
    <circle cx="290" cy="0" r="5" fill="#0faaff"/><text x="302" y="4" font-family="sans-serif" font-size="10" fill="#666">SAP BTP / AI Core</text>
    <circle cx="430" cy="0" r="5" fill="#c0392b"/><text x="442" y="4" font-family="sans-serif" font-size="10" fill="#666">Voice &amp; WebRTC</text>
    <circle cx="560" cy="0" r="5" fill="#7b2d8b"/><text x="572" y="4" font-family="sans-serif" font-size="10" fill="#666">Governance &amp; Safety</text>
  </g>

  <!-- GROUP CONTAINERS -->
  <!-- Governance Group (Top) -->
  <rect x="200" y="100" width="550" height="170" rx="16" fill="rgba(123,45,139,0.04)" stroke="rgba(123,45,139,0.25)" stroke-width="1.5" stroke-dasharray="5,3"/>
  <rect x="216" y="90" width="160" height="18" rx="4" fill="#f5eefa"/>
  <text x="226" y="103" font-family="sans-serif" font-size="9" font-weight="bold" fill="#7b2d8b">GOVERNANCE &amp; SAFETY LAYER</text>

  <!-- Code Group (Left) -->
  <rect x="10" y="290" width="150" height="130" rx="16" fill="rgba(24,23,23,0.03)" stroke="rgba(24,23,23,0.2)" stroke-width="1.5" stroke-dasharray="5,3"/>
  <rect x="26" y="280" width="75" height="18" rx="4" fill="#f5f5f5"/>
  <text x="36" y="293" font-family="sans-serif" font-size="9" font-weight="bold" fill="#181717">CODE &amp; DOCS</text>

  <!-- SAP Group (Left-Bottom) -->
  <rect x="10" y="440" width="150" height="130" rx="16" fill="rgba(15,170,255,0.04)" stroke="rgba(15,170,255,0.25)" stroke-width="1.5" stroke-dasharray="5,3"/>
  <rect x="26" y="430" width="80" height="18" rx="4" fill="#e6f7ff"/>
  <text x="36" y="443" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0088cc">SAP PLATFORM</text>

  <!-- Infrastructure Group (Right) -->
  <rect x="790" y="290" width="150" height="130" rx="16" fill="rgba(50,108,229,0.04)" stroke="rgba(50,108,229,0.25)" stroke-width="1.5" stroke-dasharray="5,3"/>
  <rect x="806" y="280" width="85" height="18" rx="4" fill="#eef2fd"/>
  <text x="816" y="293" font-family="sans-serif" font-size="9" font-weight="bold" fill="#326ce5">INFRASTRUCTURE</text>

  <!-- Voice Group (Bottom) -->
  <rect x="200" y="590" width="550" height="150" rx="16" fill="rgba(192,57,43,0.04)" stroke="rgba(192,57,43,0.25)" stroke-width="1.5" stroke-dasharray="5,3"/>
  <rect x="216" y="580" width="130" height="18" rx="4" fill="#fdecea"/>
  <text x="226" y="593" font-family="sans-serif" font-size="9" font-weight="bold" fill="#c0392b">VOICE &amp; WEBRTC STACK</text>

  <!-- CONNECTOR LINES -->
  <line x1="150" y1="370" x2="408" y2="420" stroke="#181717" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.4"/>
  <line x1="800" y1="370" x2="542" y2="420" stroke="#326ce5" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="150" y1="510" x2="408" y2="460" stroke="#0faaff" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="300" y1="660" x2="440" y2="505" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="475" y1="660" x2="475" y2="511" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="650" y1="660" x2="510" y2="505" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="300" y1="235" x2="440" y2="385" stroke="#7b2d8b" stroke-width="2" opacity="0.6"/>
  <line x1="475" y1="235" x2="475" y2="379" stroke="#555" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>
  <line x1="650" y1="235" x2="510" y2="385" stroke="#7b2d8b" stroke-width="2" opacity="0.6"/>

  <!-- CENTRE NODE - Claude Code -->
  <circle cx="475" cy="445" r="65" fill="#fff" stroke="#D97757" stroke-width="2.5"/>
  <text x="475" y="440" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#D97757">Claude Code</text>
  <text x="475" y="458" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#666">claude-sonnet-4.5</text>

  <!-- GOVERNANCE GROUP NODES -->
  <!-- LLM Gateway -->
  <rect x="240" y="145" width="120" height="80" rx="12" fill="#fff" stroke="#7b2d8b" stroke-width="1.5"/>
  <rect x="265" y="135" width="70" height="14" rx="7" fill="#f5eefa" stroke="#7b2d8b" stroke-width="1"/>
  <text x="300" y="145" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#7b2d8b">GOVERNANCE</text>
  <text x="300" y="180" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7b2d8b">Internal LLM Gateway</text>
  <text x="300" y="195" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">every token logged</text>
  <text x="300" y="208" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">attributed · auditable</text>

  <!-- Session Memory -->
  <rect x="415" y="145" width="120" height="80" rx="12" fill="#fff" stroke="#444" stroke-width="1.5"/>
  <rect x="448" y="135" width="54" height="14" rx="7" fill="#f5f5f5" stroke="#aaa" stroke-width="1"/>
  <text x="475" y="145" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#444">PERSISTS</text>
  <text x="475" y="180" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#333">Session Memory</text>
  <text x="475" y="195" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">.claude/ in repo</text>
  <text x="475" y="208" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">cross-session context</text>

  <!-- Approval Gates -->
  <rect x="590" y="145" width="120" height="80" rx="12" fill="#fff" stroke="#7b2d8b" stroke-width="1.5"/>
  <rect x="615" y="135" width="70" height="14" rx="7" fill="#f5eefa" stroke="#7b2d8b" stroke-width="1"/>
  <text x="650" y="145" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#7b2d8b">GOVERNANCE</text>
  <text x="650" y="180" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7b2d8b">Approval Gates</text>
  <text x="650" y="195" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">human reviews</text>
  <text x="650" y="208" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">every write op</text>

  <!-- CODE GROUP NODE - GitHub -->
  <rect x="25" y="320" width="120" height="80" rx="12" fill="#fff" stroke="#181717" stroke-width="1.5"/>
  <rect x="50" y="310" width="70" height="14" rx="7" fill="#f0f8ff" stroke="#0faaff" stroke-width="1"/>
  <text x="85" y="320" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">READ-ONLY</text>
  <text x="85" y="355" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#181717">GitHub MCP</text>
  <text x="85" y="370" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">code + docs access</text>
  <text x="85" y="383" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">trace any file</text>

  <!-- SAP GROUP NODE -->
  <rect x="18" y="470" width="134" height="80" rx="12" fill="#fff" stroke="#0faaff" stroke-width="1.5"/>
  <rect x="55" y="460" width="40" height="14" rx="7" fill="#f0f8ff" stroke="#0faaff" stroke-width="1"/>
  <text x="75" y="470" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">READ</text>
  <text x="85" y="505" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0088cc">SAP BTP / AI Core</text>
  <text x="85" y="520" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">staging + prod</text>
  <text x="85" y="533" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">GenAI Hub</text>

  <!-- INFRASTRUCTURE GROUP NODE - K8s + Gardener -->
  <rect x="797" y="320" width="136" height="80" rx="12" fill="#fff" stroke="#326ce5" stroke-width="1.5"/>
  <rect x="827" y="310" width="76" height="14" rx="7" fill="#eef2fd" stroke="#326ce5" stroke-width="1"/>
  <text x="865" y="320" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#326ce5">SSO TOKEN</text>
  <text x="865" y="355" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#326ce5">Kubernetes + Gardener</text>
  <text x="865" y="370" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">kubectl · shoot cluster</text>
  <text x="865" y="383" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">short-lived SSO</text>

  <!-- VOICE GROUP NODES -->
  <!-- Voice Agent -->
  <rect x="240" y="625" width="120" height="80" rx="12" fill="#fff" stroke="#c0392b" stroke-width="1.5"/>
  <rect x="257" y="615" width="66" height="14" rx="7" fill="#eef2fd" stroke="#326ce5" stroke-width="1"/>
  <text x="290" y="625" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#326ce5">READ + EXEC</text>
  <text x="300" y="660" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#c0392b">Voice Agent</text>
  <text x="300" y="675" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">Python / LiveKit</text>
  <text x="300" y="688" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">logs · code · config</text>

  <!-- WebRTC -->
  <rect x="415" y="625" width="120" height="80" rx="12" fill="#fff" stroke="#c0392b" stroke-width="1.5"/>
  <rect x="450" y="615" width="50" height="14" rx="7" fill="#f0f8ff" stroke="#0faaff" stroke-width="1"/>
  <text x="475" y="625" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">READ</text>
  <text x="475" y="660" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#c0392b">WebRTC</text>
  <text x="475" y="675" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">room · ICE · TURN</text>
  <text x="475" y="688" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">agent signalling</text>

  <!-- Voice Client -->
  <rect x="590" y="625" width="120" height="80" rx="12" fill="#fff" stroke="#c0392b" stroke-width="1.5"/>
  <rect x="625" y="615" width="50" height="14" rx="7" fill="#f0f8ff" stroke="#0faaff" stroke-width="1"/>
  <text x="650" y="625" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">READ</text>
  <text x="650" y="660" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#c0392b">Voice Client</text>
  <text x="650" y="675" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">browser / mobile</text>
  <text x="650" y="688" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">WebRTC peer</text>

  <!-- BOTTOM SECTION - Categories -->
  <g transform="translate(100, 765)">
    <line x1="0" y1="20" x2="180" y2="20" stroke="#7b2d8b" stroke-width="2"/>
    <text x="0" y="14" font-family="sans-serif" font-size="9" font-weight="bold" fill="#7b2d8b">🔒 GOVERNANCE</text>
    <text x="0" y="38" font-family="sans-serif" font-size="10" fill="#555">• Read-only MCP — observe everything</text>
    <text x="0" y="54" font-family="sans-serif" font-size="10" fill="#555">• Every token logged — auditable</text>
  </g>

  <g transform="translate(370, 765)">
    <line x1="0" y1="20" x2="200" y2="20" stroke="#326ce5" stroke-width="2"/>
    <text x="0" y="14" font-family="sans-serif" font-size="9" font-weight="bold" fill="#326ce5">🏗️ INFRASTRUCTURE</text>
    <text x="0" y="38" font-family="sans-serif" font-size="10" fill="#555">• Short-lived SSO — rotated per session</text>
    <text x="0" y="54" font-family="sans-serif" font-size="10" fill="#555">• Gardener docs — non-vanilla context</text>
  </g>

  <g transform="translate(660, 765)">
    <line x1="0" y1="20" x2="150" y2="20" stroke="#444" stroke-width="2"/>
    <text x="0" y="14" font-family="sans-serif" font-size="9" font-weight="bold" fill="#444">💾 MEMORY</text>
    <text x="0" y="38" font-family="sans-serif" font-size="10" fill="#555">• Cross-session — no re-reading files</text>
  </g>
</svg>`;

fs.writeFileSync(__dirname + '/setup-diagram.svg', setupDiagram);
console.log('Created setup-diagram.svg');

// Voice Agent Data Flow Diagram (simplified)
const voiceAgentDfd = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">
  <rect width="900" height="600" fill="#ffffff"/>
  <text x="450" y="28" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#111">Voice Agent — Data Flow Diagram</text>
  <text x="450" y="48" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#888">WebRTC Client → Voice Framework → Voice Agent → Realtime LLM + Enterprise Agent → Speaker</text>
  
  <!-- Legend -->
  <g transform="translate(150, 70)">
    <rect x="0" y="-4" width="28" height="4" rx="2" fill="#326ce5"/>
    <text x="35" y="0" font-family="sans-serif" font-size="8" fill="#555">Audio / RTC</text>
    <rect x="100" y="-4" width="28" height="4" rx="2" fill="#D97757"/>
    <text x="135" y="0" font-family="sans-serif" font-size="8" fill="#555">Agent control</text>
    <rect x="210" y="-4" width="28" height="4" rx="2" fill="#0faaff"/>
    <text x="245" y="0" font-family="sans-serif" font-size="8" fill="#555">Enterprise agent</text>
    <rect x="330" y="-4" width="28" height="4" rx="2" fill="#7b2d8b"/>
    <text x="365" y="0" font-family="sans-serif" font-size="8" fill="#555">LLM inference</text>
    <rect x="440" y="-4" width="28" height="4" rx="2" fill="#009F76"/>
    <text x="475" y="0" font-family="sans-serif" font-size="8" fill="#555">TTS audio</text>
  </g>

  <!-- Phase bands -->
  <rect x="20" y="90" width="100" height="450" rx="6" fill="#eef2fd" stroke="#326ce5" stroke-width="1" stroke-dasharray="4,2" opacity="0.5"/>
  <text x="70" y="105" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#326ce5">Client</text>
  
  <rect x="130" y="90" width="120" height="450" rx="6" fill="#eef2fd" stroke="#326ce5" stroke-width="1" stroke-dasharray="4,2" opacity="0.5"/>
  <text x="190" y="105" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#326ce5">Voice Framework</text>
  
  <rect x="260" y="90" width="280" height="450" rx="6" fill="#fff9f7" stroke="#D97757" stroke-width="1" stroke-dasharray="4,2" opacity="0.5"/>
  <text x="400" y="105" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#D97757">Voice Agent (Python)</text>
  
  <rect x="550" y="90" width="330" height="450" rx="6" fill="#f0f9ff" stroke="#0faaff" stroke-width="1" stroke-dasharray="4,2" opacity="0.5"/>
  <text x="715" y="105" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#0088cc">AI Platform + Enterprise Agent</text>

  <!-- Voice Client (mic) -->
  <rect x="30" y="140" width="80" height="50" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
  <text x="70" y="162" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#111">Voice Client</text>
  <text x="70" y="175" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">mic input</text>

  <!-- Voice Client (speaker) -->
  <rect x="30" y="440" width="80" height="50" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
  <text x="70" y="462" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#111">Voice Client</text>
  <text x="70" y="475" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">speaker</text>

  <!-- Voice Framework (inbound) -->
  <circle cx="190" cy="165" r="40" fill="#fff" stroke="#326ce5" stroke-width="2"/>
  <text x="190" y="160" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#326ce5">WebRTC</text>
  <text x="190" y="172" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#666">Voice Framework</text>

  <!-- Voice Framework (outbound) -->
  <circle cx="190" cy="465" r="40" fill="#fff" stroke="#326ce5" stroke-width="2"/>
  <text x="190" y="460" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#326ce5">WebRTC</text>
  <text x="190" y="472" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#666">audio out</text>

  <!-- Voice Agent core -->
  <circle cx="400" cy="200" r="55" fill="#fff" stroke="#D97757" stroke-width="2"/>
  <text x="400" y="195" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#D97757">Voice Agent</text>
  <text x="400" y="210" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">orchestrator</text>

  <!-- Enterprise query tool -->
  <circle cx="400" cy="360" r="45" fill="#fff" stroke="#0faaff" stroke-width="2"/>
  <text x="400" y="355" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#0088cc">Query</text>
  <text x="400" y="368" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">Enterprise Agent</text>

  <!-- TTS -->
  <circle cx="400" cy="490" r="35" fill="#fff" stroke="#009F76" stroke-width="2"/>
  <text x="400" y="488" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#007a5a">TTS</text>
  <text x="400" y="500" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#666">speech synthesis</text>

  <!-- Realtime LLM -->
  <circle cx="715" cy="200" r="50" fill="#fff" stroke="#7b2d8b" stroke-width="2"/>
  <text x="715" y="195" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#7b2d8b">Realtime LLM</text>
  <text x="715" y="210" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">multimodal audio</text>

  <!-- Auth endpoint -->
  <rect x="640" y="290" width="100" height="40" rx="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
  <text x="690" y="308" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#111">Auth Endpoint</text>
  <text x="690" y="320" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#666">OAuth 2.0</text>

  <!-- Enterprise Agent API -->
  <rect x="640" y="360" width="100" height="40" rx="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
  <text x="690" y="378" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#111">Enterprise API</text>
  <text x="690" y="390" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#666">REST + WebSocket</text>

  <!-- Token cache -->
  <rect x="330" y="270" width="140" height="30" fill="#fff" stroke="#555" stroke-width="1"/>
  <line x1="330" y1="270" x2="330" y2="300" stroke="#555" stroke-width="1"/>
  <line x1="470" y1="270" x2="470" y2="300" stroke="#555" stroke-width="1"/>
  <text x="400" y="290" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#333">Auth Token Cache</text>

  <!-- Flow arrows -->
  <line x1="110" y1="165" x2="150" y2="165" stroke="#326ce5" stroke-width="2" marker-end="url(#arrow-blue)"/>
  <line x1="230" y1="165" x2="345" y2="185" stroke="#326ce5" stroke-width="2" marker-end="url(#arrow-blue)"/>
  <line x1="455" y1="185" x2="665" y2="185" stroke="#7b2d8b" stroke-width="2" marker-end="url(#arrow-purple)"/>
  <line x1="665" y1="215" x2="455" y2="215" stroke="#7b2d8b" stroke-width="2" marker-end="url(#arrow-purple-rev)"/>
  <line x1="445" y1="360" x2="640" y2="380" stroke="#0faaff" stroke-width="2" marker-end="url(#arrow-sap)"/>
  <line x1="640" y1="385" x2="445" y2="365" stroke="#0faaff" stroke-width="2" marker-end="url(#arrow-sap-rev)"/>
  <line x1="400" y1="415" x2="400" y2="455" stroke="#009F76" stroke-width="2" marker-end="url(#arrow-green)"/>
  <line x1="345" y1="485" x2="230" y2="470" stroke="#326ce5" stroke-width="2" marker-end="url(#arrow-blue-rev)"/>
  <line x1="150" y1="465" x2="110" y2="465" stroke="#326ce5" stroke-width="2" marker-end="url(#arrow-blue-rev)"/>
  
  <!-- Arrow markers -->
  <defs>
    <marker id="arrow-blue" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#326ce5"/></marker>
    <marker id="arrow-blue-rev" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto"><path d="M7,0 L7,6 L0,3 z" fill="#326ce5"/></marker>
    <marker id="arrow-purple" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#7b2d8b"/></marker>
    <marker id="arrow-purple-rev" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto"><path d="M7,0 L7,6 L0,3 z" fill="#7b2d8b"/></marker>
    <marker id="arrow-sap" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#0faaff"/></marker>
    <marker id="arrow-sap-rev" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto"><path d="M7,0 L7,6 L0,3 z" fill="#0faaff"/></marker>
    <marker id="arrow-green" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#009F76"/></marker>
  </defs>

  <!-- Flow labels -->
  <text x="130" y="155" font-family="sans-serif" font-size="6" fill="#444">mic audio</text>
  <text x="280" y="160" font-family="sans-serif" font-size="6" fill="#444">audio + VAD</text>
  <text x="530" y="175" font-family="sans-serif" font-size="6" fill="#444">audio + instructions</text>
  <text x="530" y="228" font-family="sans-serif" font-size="6" fill="#444">audio tokens + text</text>
  <text x="500" y="355" font-family="sans-serif" font-size="6" fill="#444">query</text>
  <text x="500" y="400" font-family="sans-serif" font-size="6" fill="#444">streamed response</text>
  <text x="408" y="440" font-family="sans-serif" font-size="6" fill="#444">text → speech</text>
  <text x="280" y="495" font-family="sans-serif" font-size="6" fill="#444">audio out</text>
  <text x="130" y="455" font-family="sans-serif" font-size="6" fill="#444">speaker</text>
</svg>`;

fs.writeFileSync(__dirname + '/voice-agent-dfd.svg', voiceAgentDfd);
console.log('Created voice-agent-dfd.svg');
