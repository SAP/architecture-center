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

// Setup Diagram - Claude Code's system setup
const setupDiagram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 550" width="900" height="550">
  <rect width="900" height="550" fill="#ffffff"/>
  <text x="450" y="28" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#111">Claude Code — Full System Setup</text>
  <text x="450" y="48" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#666">Everything Claude Code could read, trace, and act on — and the governance layer that made it safe</text>
  
  <!-- Legend -->
  <g transform="translate(180, 70)">
    <circle cx="0" cy="0" r="4" fill="#181717"/><text x="10" y="4" font-family="sans-serif" font-size="9" fill="#666">Code</text>
    <circle cx="60" cy="0" r="4" fill="#326ce5"/><text x="70" y="4" font-family="sans-serif" font-size="9" fill="#666">Kubernetes</text>
    <circle cx="150" cy="0" r="4" fill="#0faaff"/><text x="160" y="4" font-family="sans-serif" font-size="9" fill="#666">SAP BTP</text>
    <circle cx="230" cy="0" r="4" fill="#c0392b"/><text x="240" y="4" font-family="sans-serif" font-size="9" fill="#666">Voice</text>
    <circle cx="290" cy="0" r="4" fill="#7b2d8b"/><text x="300" y="4" font-family="sans-serif" font-size="9" fill="#666">Governance</text>
  </g>

  <!-- Connector lines -->
  <line x1="140" y1="130" x2="390" y2="260" stroke="#181717" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.4"/>
  <line x1="760" y1="130" x2="510" y2="260" stroke="#326ce5" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="100" y1="300" x2="375" y2="300" stroke="#0faaff" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="140" y1="460" x2="390" y2="340" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="760" y1="460" x2="510" y2="340" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>
  <line x1="330" y1="170" x2="410" y2="248" stroke="#7b2d8b" stroke-width="2" opacity="0.6"/>
  <line x1="570" y1="170" x2="490" y2="248" stroke="#7b2d8b" stroke-width="2" opacity="0.6"/>
  <line x1="450" y1="100" x2="450" y2="248" stroke="#555" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4"/>

  <!-- CENTER: Claude Code -->
  <circle cx="450" cy="300" r="55" fill="#fff" stroke="#D97757" stroke-width="2.5"/>
  <text x="450" y="295" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#D97757">Claude Code</text>
  <text x="450" y="310" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">claude-sonnet-4.5</text>

  <!-- TOP: Memory -->
  <rect x="390" y="90" width="120" height="45" rx="8" fill="#fff" stroke="#444" stroke-width="1.5"/>
  <text x="450" y="110" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#333">Session Memory</text>
  <text x="450" y="122" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">.claude/ in repo</text>

  <!-- TOP-LEFT: LLM Gateway -->
  <rect x="243" y="140" width="120" height="50" rx="8" fill="#fff" stroke="#7b2d8b" stroke-width="1.5"/>
  <text x="303" y="160" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#7b2d8b">LLM Gateway</text>
  <text x="303" y="172" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">every token logged</text>

  <!-- TOP-RIGHT: Approval Gate -->
  <rect x="537" y="140" width="120" height="50" rx="8" fill="#fff" stroke="#7b2d8b" stroke-width="1.5"/>
  <text x="597" y="160" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#7b2d8b">Approval Gates</text>
  <text x="597" y="172" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">human reviews writes</text>

  <!-- LEFT: GitHub -->
  <rect x="72" y="100" width="120" height="55" rx="8" fill="#fff" stroke="#181717" stroke-width="1.5"/>
  <text x="132" y="122" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#181717">GitHub MCP</text>
  <text x="132" y="137" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">full repo access</text>

  <!-- LEFT: SAP BTP -->
  <rect x="15" y="275" width="130" height="50" rx="8" fill="#fff" stroke="#0faaff" stroke-width="1.5"/>
  <text x="80" y="295" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0088cc">SAP BTP / AI Core</text>
  <text x="80" y="310" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">staging + prod</text>

  <!-- LEFT: Voice Agent -->
  <rect x="72" y="435" width="120" height="50" rx="8" fill="#fff" stroke="#c0392b" stroke-width="1.5"/>
  <text x="132" y="455" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#c0392b">Voice Agent</text>
  <text x="132" y="470" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">Python / LiveKit</text>

  <!-- RIGHT: Kubernetes -->
  <rect x="700" y="100" width="136" height="55" rx="8" fill="#fff" stroke="#326ce5" stroke-width="1.5"/>
  <text x="768" y="122" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#326ce5">Kubernetes + Gardener</text>
  <text x="768" y="137" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">kubectl · SSO token</text>

  <!-- RIGHT: Voice Client -->
  <rect x="700" y="435" width="120" height="50" rx="8" fill="#fff" stroke="#c0392b" stroke-width="1.5"/>
  <text x="760" y="455" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#c0392b">Voice Client</text>
  <text x="760" y="470" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">browser / mobile</text>

  <!-- Bottom pills -->
  <g transform="translate(100, 520)">
    <rect x="0" y="0" width="160" height="22" rx="11" fill="#f7f8fc" stroke="#dde1ee"/>
    <text x="80" y="14" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#555">Read-only MCP access</text>
  </g>
  <g transform="translate(280, 520)">
    <rect x="0" y="0" width="160" height="22" rx="11" fill="#f7f8fc" stroke="#dde1ee"/>
    <text x="80" y="14" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#555">Short-lived SSO tokens</text>
  </g>
  <g transform="translate(460, 520)">
    <rect x="0" y="0" width="160" height="22" rx="11" fill="#f7f8fc" stroke="#dde1ee"/>
    <text x="80" y="14" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#555">Every token logged</text>
  </g>
  <g transform="translate(640, 520)">
    <rect x="0" y="0" width="160" height="22" rx="11" fill="#f7f8fc" stroke="#dde1ee"/>
    <text x="80" y="14" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#555">Memory across sessions</text>
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
