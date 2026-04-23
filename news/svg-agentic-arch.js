const fs = require('fs');

// Icon paths (from @ui5/webcomponents-icons)
const icons = {
  user: "M472 511H69q-11 0-18.5-7T43 486v-58q0-32 9.5-61t27-53.5 41.5-43 52-28.5q-20-20-31.5-46T130 140q0-29 11-54.5T171 41t44.5-30T270 0t55 11 45 30 30 44.5 11 54.5q0 30-11.5 56T368 242q28 10 51.5 28.5t41 43 27 53.5 9.5 61v58q0 11-7 18t-18 7zM94 460h352v-32q0-30-11.5-57T403 324t-47-31.5-57-11.5h-57q-31 0-58 11.5T137 324t-31.5 47T94 428v32zM270 51q-37 0-63 26t-26 63q0 38 26 64t63 26q38 0 64-26t26-64q0-37-26-63t-64-26z",
  docText: "M422 0q11 0 18.5 7.5T448 26v460q0 11-7.5 18.5T422 512H90q-11 0-18.5-7.5T64 486V192q0-10 6-17L213 9q6-9 19-9h190zm-25 51H244l-20 24v66q0 21-15 36t-36 15h-50l-8 9v260h282V51zM160 282q0-11 7.5-18.5T186 256h140q11 0 18.5 7.5T352 282t-7.5 18-18.5 7H186q-11 0-18.5-7t-7.5-18zm166 70q11 0 18.5 7.5T352 378t-7.5 18-18.5 7H186q-11 0-18.5-7t-7.5-18 7.5-18.5T186 352h140z",
  ai: "M506.227 153q5 7 5.5 16t-4.5 16l-230 316q-8 11-21 11t-21-11l-230-316q-5-7-5-16t6-16l114-144q8-9 21-9h230q13 0 20 9zm-104 19q2-1 1.5-2.5t-2.5-2.5q-20-3-34-12t-22.5-20.5-13.5-24-7-22.5q-1-2-2.5-2t-1.5 2q-4 21-13 35t-20 23-23.5 13.5-22.5 6.5q-5 2 0 5 21 3 34.5 12t22.5 20.5 14 24 7 22.5q0 2 2 2t2-2q3-21 12-34.5t20.5-22.5 24-14 22.5-7z",
  fioriTools: "M50.9 157.692v2.994q0 21.957 8.484 41.918t23.454 34.932 34.932 23.454 41.918 8.484q10.979 0 21.957-2.495t20.96-6.488q19.96-9.98 33.434-24.452t24.452-34.433q7.985-20.959 7.985-40.92 0-22.955-8.983-42.916T235.54 83.337t-35.43-22.955-43.416-8.483L204.6 99.805q7.985 7.984 7.985 17.965t-7.985 17.965l-69.863 69.863q-6.987 6.987-17.965 6.987t-17.965-6.987zM256.5 287.439L418.183 450.12l30.94-30.94L287.439 256.5q-6.987 8.982-14.472 16.967t-16.468 13.973zM126.752 505.014Q117.77 512 108.788 512H20.959Q0 512 0 491.04v-87.828q0-8.982 6.986-17.964 8.983-8.983 17.965-16.967 6.987-7.985 13.973-14.472t10.979-10.48q6.986-6.986 17.964-6.986 11.977 0 18.963 6.986 7.985 7.985 7.985 17.965T86.83 379.26q-3.992 3.992-8.483 7.985t-8.483 7.984l-7.985 7.984 46.909 46.909 71.86-72.858q9.98-7.984 18.962-7.984 9.98 0 17.965 7.984 8.983 8.983 7.485 19.462t-7.485 17.466zM418.183 512q-9.98 0-17.965-7.984L208.593 312.39q-10.979 4.99-23.455 6.487t-25.45 1.497q-32.936 0-61.879-12.475t-50.9-33.934-34.433-49.903T0 164.678q0-8.982 1.497-22.456t4.99-26.448 9.482-22.456T31.938 81.84q12.974-2.994 22.955 6.987l61.879 61.879 33.934-32.936-62.878-61.88q-8.982-9.98-6.986-22.954 2.994-14.971 14.97-18.963Q124.757.998 159.689.998q32.936 0 62.378 12.476t50.9 33.933 33.935 50.901 12.475 62.378q0 26.948-6.986 48.905l191.626 191.625q6.986 7.985 6.986 17.965t-6.986 17.965l-67.868 66.87Q428.164 512 418.183 512zm84.835-421.177q7.984 7.984 7.984 17.965t-7.984 17.964l-83.837 84.835q-9.98 9.98-20.959 9.98-4.99 0-9.98-2.495t-7.985-4.491q-7.984-7.985-7.984-18.464t9.98-20.46l66.87-66.87-45.91-45.91-20.96 20.96q-9.98 9.98-20.959 9.98-7.984 0-17.965-7.985-6.986-7.984-7.485-18.963t10.48-20.959L384.25 7.984Q392.234 0 403.212 0q9.981 0 17.965 7.984z",
  browser: "M69.864 428.164q10.978 0 18.463 6.986t7.486 17.965-7.486 18.464-18.463 7.485H57.887q-23.953 0-40.92-16.967T0 421.177V57.887q0-23.953 16.967-40.92T57.887 0h363.29q23.954 0 40.92 16.967t16.967 40.92v44.912q0 10.979-7.485 18.464t-18.464 7.486-17.965-7.486-6.986-18.464V57.887q0-6.986-6.987-6.986H57.887q-6.986 0-6.986 6.986v37.926h115.773q10.979 0 18.464 7.485t7.486 18.464-7.486 17.965-18.464 6.986H50.901v274.464q0 6.987 6.986 6.987h11.977zm250.51-300.414q38.924 0 73.856 14.971t61.38 40.92 41.42 60.881T512 319.376t-14.97 74.854-41.42 60.881-61.38 40.92-73.856 14.97q-39.922 0-74.854-14.97t-60.88-40.92-40.92-60.881-14.971-74.854 14.97-74.854 40.92-60.88 60.881-40.92 74.854-14.972z",
  shield: "M430 52q18 7 18 25v179q0 41-14.5 79.5t-39 71.5-56 58.5T274 506q-8 4-11.5 5t-6.5 1q-8 0-23-8t-30.5-19-28.5-21.5-19-15.5q-45-42-68-90.5T64 256V77q0-18 18-25L248 1q3-1 8-1t8 1zm-33 44L282 60v177l115-13V96zm-282 0v128l115 13V60zm1 179q6 54 38.5 96t75.5 71V288zm166 167q43-29 75.5-71t38.5-96l-114 13v154z",
  cloud: "M379 448H113q-23 0-43.5-9t-36-24.5-24.5-36T0 335q0-21 7.5-40T28 261.5 58.5 237 96 224q0-32 12-61t33-51 49.5-35T251 64q47 0 87 27.5t57 72.5q25 4 46.5 17t37 31.5T503 255t9 50q0 35-16.5 66.5T450 423q-31 25-71 25z",
  privateCloud: "M381.255 478.066H108.788q-21.958 0-41.919-9.481t-34.931-25.95T8.483 404.71 0 358.3t8.483-46.41 22.956-37.925 33.434-26.448 40.92-9.98q3.993-29.942 17.466-56.39t33.435-45.412 45.411-29.942 53.396-10.978q42.916 0 79.844 25.95t56.889 69.863q25.95 1.996 47.407 13.972t37.926 31.439 25.45 44.413T512 334.347q0 29.941-9.98 56.39t-27.946 45.91-41.918 30.44-50.9 10.98z",
  checklist: "M186 51q-11 0-18.5-7T160 26t7.5-18.5T186 0h140q11 0 18.5 7.5T352 26t-7.5 18-18.5 7H186zm-32 64q-11 0-18.5-7T128 90t7.5-18.5T154 64h204q11 0 18.5 7.5T384 90t-7.5 18-18.5 7H154zm236 13q24 0 41 17t17 41v186q0 15-7.5 28.5T419 422l-150 87q-6 3-13 3t-13-3L93 422q-14-8-21.5-21.5T64 372V186q0-24 17-41t41-17h268z",
  connected: "M505 468q7 7 7 18t-7.5 18.5T486 512t-18-7l-82-83q-28 17-59 17-22 0-42.5-8T248 406L106 264q-33-33-33-79 0-31 17-59L8 44q-8-8-8-18Q0 15 7.5 7.5T26 0t18 7l82 83q28-17 59-17 22 0 42.5 8t37.5 25l141 141q33 35 33 80 0 31-17 59z",
  robot: "M274.5 128q-34 0-64.5 13t-53 36-35.5 53-13 65q0 34 13 64.5t35.5 53 53 35.5 64.5 13q35 0 65-13t53-35.5 36-53 13-64.5q0-35-13-65t-36-53-53-36-65-13z"
};

// Helper: renders an icon inside a box, centered horizontally, above the title
function icon(path, cx, cy, size, color) {
  const s = size / 512;
  const tx = cx - size/2;
  const ty = cy - size/2;
  return `<g transform="translate(${tx}, ${ty}) scale(${s})" opacity="0.18"><path d="${path}" fill="${color}"/></g>`;
}

const agenticArch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 700" width="960" height="700">
  <rect width="960" height="700" fill="#ffffff"/>

  <!-- Title -->
  <text x="480" y="32" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#111">Agentic Engineering for SAP Extensions</text>
  <text x="480" y="52" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#888">Coding agent equipped with domain expertise, architecture spec, and browser verification</text>

  <!-- Legend -->
  <g transform="translate(145, 78)">
    <circle cx="0" cy="0" r="5" fill="#D97757"/><text x="12" y="4" font-family="sans-serif" font-size="9" fill="#666">Coding Agent</text>
    <circle cx="110" cy="0" r="5" fill="#0faaff"/><text x="122" y="4" font-family="sans-serif" font-size="9" fill="#666">SAP Platform</text>
    <circle cx="220" cy="0" r="5" fill="#9b72cf"/><text x="232" y="4" font-family="sans-serif" font-size="9" fill="#666">Spec-Driven Development</text>
    <circle cx="400" cy="0" r="5" fill="#2a9d8f"/><text x="412" y="4" font-family="sans-serif" font-size="9" fill="#666">Verification</text>
    <circle cx="510" cy="0" r="5" fill="#555"/><text x="522" y="4" font-family="sans-serif" font-size="9" fill="#666">Developer</text>
  </g>

  <!-- Arrow markers (thin) -->
  <defs>
    <marker id="arr-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0.5 L0,5.5 L6,3 z" fill="#D97757"/></marker>
    <marker id="arr-sap" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0.5 L0,5.5 L6,3 z" fill="#0faaff"/></marker>
    <marker id="arr-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0.5 L0,5.5 L6,3 z" fill="#9b72cf"/></marker>
    <marker id="arr-teal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0.5 L0,5.5 L6,3 z" fill="#2a9d8f"/></marker>
    <marker id="arr-grey" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0.5 L0,5.5 L6,3 z" fill="#555"/></marker>
    <marker id="arr-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0.5 L0,5.5 L6,3 z" fill="#e63946"/></marker>
  </defs>

  <!-- ============================================ -->
  <!-- CODING AGENT — centre hub                   -->
  <!-- ============================================ -->
  <circle cx="480" cy="345" r="68" fill="#fff" stroke="#D97757" stroke-width="1.5"/>
  ${icon(icons.ai, 480, 318, 28, '#D97757')}
  <text x="480" y="340" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#D97757">Coding Agent</text>
  <text x="480" y="355" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#666">Claude Code</text>
  <text x="480" y="370" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">orchestrates · generates · iterates</text>

  <!-- ============================================ -->
  <!-- TOP LEFT — Developer                        -->
  <!-- ============================================ -->
  <rect x="100" y="115" width="170" height="90" rx="12" fill="#fff" stroke="#555" stroke-width="1"/>
  <rect x="143" y="105" width="84" height="14" rx="7" fill="#f5f5f5" stroke="#888" stroke-width="0.75"/>
  <text x="185" y="115" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#555">DEVELOPER</text>
  ${icon(icons.user, 185, 140, 22, '#555')}
  <text x="185" y="160" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#333">Developer</text>
  <text x="185" y="174" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">steers · reviews · commits</text>
  <text x="185" y="187" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">final approval gate</text>

  <!-- Developer → Agent -->
  <line x1="245" y1="207" x2="430" y2="295" stroke="#555" stroke-width="1" marker-end="url(#arr-grey)"/>
  <text x="315" y="242" font-family="sans-serif" font-size="7" fill="#444">prompts · reviews</text>

  <!-- ============================================ -->
  <!-- TOP RIGHT — SDD Tool + Spec                 -->
  <!-- ============================================ -->
  <rect x="615" y="115" width="200" height="90" rx="12" fill="#fff" stroke="#9b72cf" stroke-width="1"/>
  <rect x="664" y="105" width="102" height="14" rx="7" fill="#f5eefa" stroke="#9b72cf" stroke-width="0.75"/>
  <text x="715" y="115" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#9b72cf">SPEC-DRIVEN DEV</text>
  ${icon(icons.docText, 715, 140, 22, '#9b72cf')}
  <text x="715" y="159" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#9b72cf">SDD Tool</text>
  <text x="715" y="173" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#666">interviews · surfaces gaps</text>
  <line x1="633" y1="182" x2="797" y2="182" stroke="#eee" stroke-width="1"/>
  <text x="715" y="196" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#7b2d8b">Architecture Spec</text>

  <!-- Developer → SDD Tool -->
  <line x1="270" y1="155" x2="613" y2="155" stroke="#9b72cf" stroke-width="1" marker-end="url(#arr-purple)"/>
  <text x="440" y="148" font-family="sans-serif" font-size="7" fill="#444">decisions + answers</text>

  <!-- Spec → Agent -->
  <line x1="655" y1="207" x2="535" y2="295" stroke="#9b72cf" stroke-width="1" stroke-dasharray="4,3" opacity="0.5" marker-end="url(#arr-purple)"/>
  <text x="610" y="245" font-family="sans-serif" font-size="7" fill="#444">spec context</text>

  <!-- ============================================ -->
  <!-- LEFT — SAP MCP Servers group                -->
  <!-- ============================================ -->
  <rect x="30" y="265" width="220" height="220" rx="16" fill="rgba(15,170,255,0.04)" stroke="rgba(15,170,255,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <rect x="72" y="255" width="136" height="18" rx="4" fill="#e6f7ff"/>
  <text x="140" y="268" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0088cc">SAP MCP SERVERS</text>

  <!-- CAP MCP -->
  <rect x="48" y="288" width="105" height="52" rx="10" fill="#fff" stroke="#0faaff" stroke-width="1"/>
  <rect x="68" y="278" width="65" height="14" rx="7" fill="#e6f7ff" stroke="#0faaff" stroke-width="0.75"/>
  <text x="100" y="288" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">BACKEND</text>
  ${icon(icons.connected, 100, 306, 16, '#0faaff')}
  <text x="100" y="322" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0088cc">CAP MCP</text>
  <text x="100" y="334" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">CDS · services · auth</text>

  <!-- Fiori MCP -->
  <rect x="48" y="352" width="105" height="52" rx="10" fill="#fff" stroke="#0faaff" stroke-width="1"/>
  <rect x="68" y="342" width="65" height="14" rx="7" fill="#e6f7ff" stroke="#0faaff" stroke-width="0.75"/>
  <text x="100" y="352" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">FRONTEND</text>
  ${icon(icons.fioriTools, 100, 370, 16, '#0faaff')}
  <text x="100" y="386" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0088cc">Fiori MCP</text>
  <text x="100" y="398" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">annotations · UX</text>

  <!-- UI5 MCP -->
  <rect x="48" y="416" width="105" height="52" rx="10" fill="#fff" stroke="#0faaff" stroke-width="1"/>
  <rect x="68" y="406" width="65" height="14" rx="7" fill="#e6f7ff" stroke="#0faaff" stroke-width="0.75"/>
  <text x="100" y="416" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">CONTROLS</text>
  ${icon(icons.browser, 100, 434, 16, '#0faaff')}
  <text x="100" y="449" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0088cc">UI5 MCP</text>
  <text x="100" y="461" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">bindings · views</text>

  <!-- Skills -->
  <rect x="165" y="288" width="72" height="52" rx="10" fill="#fff" stroke="#0faaff" stroke-width="1"/>
  <rect x="170" y="278" width="62" height="14" rx="7" fill="#e6f7ff" stroke="#0faaff" stroke-width="0.75"/>
  <text x="201" y="288" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">ROUTING</text>
  ${icon(icons.checklist, 201, 306, 16, '#0faaff')}
  <text x="201" y="322" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0088cc">Skills</text>
  <text x="201" y="334" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">AGENTS.md</text>

  <!-- MCP → Agent -->
  <line x1="250" y1="365" x2="414" y2="350" stroke="#0faaff" stroke-width="1" marker-end="url(#arr-sap)"/>
  <text x="318" y="348" font-family="sans-serif" font-size="7" fill="#444">query · validate</text>

  <!-- ============================================ -->
  <!-- RIGHT — Verification group                  -->
  <!-- ============================================ -->
  <rect x="710" y="265" width="220" height="220" rx="16" fill="rgba(42,157,143,0.03)" stroke="rgba(42,157,143,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <rect x="775" y="255" width="90" height="18" rx="4" fill="rgba(42,157,143,0.1)"/>
  <text x="820" y="268" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#2a9d8f">VERIFICATION</text>

  <!-- Playwright MCP -->
  <rect x="730" y="290" width="180" height="58" rx="10" fill="#fff" stroke="#2a9d8f" stroke-width="1"/>
  <rect x="775" y="280" width="90" height="14" rx="7" fill="rgba(42,157,143,0.1)" stroke="#2a9d8f" stroke-width="0.75"/>
  <text x="820" y="290" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#2a9d8f">BROWSER</text>
  ${icon(icons.browser, 820, 310, 18, '#2a9d8f')}
  <text x="820" y="328" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#2a9d8f">Playwright MCP</text>
  <text x="820" y="341" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">headless browser · screenshots</text>

  <!-- Security Scan -->
  <rect x="730" y="362" width="180" height="58" rx="10" fill="#fff" stroke="#e63946" stroke-width="1"/>
  <rect x="787" y="352" width="66" height="14" rx="7" fill="rgba(230,57,70,0.08)" stroke="#e63946" stroke-width="0.75"/>
  <text x="820" y="362" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#e63946">GATE</text>
  ${icon(icons.shield, 820, 382, 18, '#e63946')}
  <text x="820" y="400" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#e63946">Security Scan</text>
  <text x="820" y="413" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">dependencies · vulnerabilities</text>

  <!-- Developer Review -->
  <rect x="730" y="434" width="180" height="40" rx="10" fill="#fff" stroke="#555" stroke-width="1"/>
  <rect x="775" y="424" width="90" height="14" rx="7" fill="#f5f5f5" stroke="#888" stroke-width="0.75"/>
  <text x="820" y="434" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#555">HUMAN</text>
  ${icon(icons.user, 820, 450, 14, '#555')}
  <text x="820" y="464" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#333">Developer Review</text>

  <!-- Agent → Verification -->
  <line x1="546" y1="345" x2="728" y2="345" stroke="#2a9d8f" stroke-width="1" marker-end="url(#arr-teal)"/>
  <text x="635" y="338" font-family="sans-serif" font-size="7" fill="#444">code + UI for verification</text>

  <!-- ============================================ -->
  <!-- BOTTOM — SAP BTP (centered)                 -->
  <!-- ============================================ -->
  <rect x="180" y="520" width="600" height="140" rx="16" fill="rgba(15,170,255,0.04)" stroke="rgba(15,170,255,0.2)" stroke-width="1" stroke-dasharray="5,3"/>
  <rect x="440" y="510" width="80" height="18" rx="4" fill="#e6f7ff"/>
  <text x="480" y="523" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0088cc">SAP BTP</text>

  <!-- Cloud watermark -->
  <g transform="translate(660, 535) scale(0.1)" opacity="0.05">
    <path d="${icons.cloud}" fill="#0faaff"/>
  </g>

  <!-- Kyma sub-group -->
  <rect x="205" y="545" width="200" height="90" rx="12" fill="rgba(50,108,229,0.03)" stroke="rgba(50,108,229,0.15)" stroke-width="1" stroke-dasharray="4,2"/>
  <rect x="265" y="536" width="80" height="14" rx="4" fill="#eef2fd"/>
  <text x="305" y="547" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#326ce5">KYMA RUNTIME</text>

  <!-- LiteLLM (inside Kyma) -->
  <rect x="230" y="562" width="150" height="55" rx="10" fill="#fff" stroke="#555" stroke-width="1"/>
  <rect x="270" y="552" width="70" height="14" rx="7" fill="#f5f5f5" stroke="#888" stroke-width="0.75"/>
  <text x="305" y="562" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#555">GATEWAY</text>
  ${icon(icons.connected, 305, 580, 16, '#555')}
  <text x="305" y="596" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#333">LiteLLM</text>
  <text x="305" y="610" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">model gateway</text>

  <!-- Gen AI Hub -->
  <rect x="470" y="550" width="180" height="65" rx="10" fill="#fff" stroke="#0faaff" stroke-width="1"/>
  <rect x="510" y="540" width="100" height="14" rx="7" fill="#e6f7ff" stroke="#0faaff" stroke-width="0.75"/>
  <text x="560" y="550" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0088cc">AI SERVICES</text>
  ${icon(icons.privateCloud, 560, 568, 18, '#0faaff')}
  <text x="560" y="586" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0088cc">SAP Gen AI Hub</text>
  <text x="560" y="601" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#666">data protection · PII masking</text>

  <!-- LiteLLM → Gen AI Hub -->
  <line x1="380" y1="588" x2="468" y2="584" stroke="#0faaff" stroke-width="1" marker-end="url(#arr-sap)"/>

  <!-- Agent → LiteLLM (inference) -->
  <line x1="445" y1="408" x2="330" y2="560" stroke="#555" stroke-width="1" stroke-dasharray="4,3" opacity="0.4" marker-end="url(#arr-grey)"/>
  <text x="365" y="480" font-family="sans-serif" font-size="7" fill="#444">inference</text>

  <!-- Agent → BTP (deploys) -->
  <line x1="515" y1="408" x2="580" y2="548" stroke="#0faaff" stroke-width="1" stroke-dasharray="4,3" opacity="0.4" marker-end="url(#arr-sap)"/>
  <text x="565" y="475" font-family="sans-serif" font-size="7" fill="#444">deploys</text>

</svg>`;

fs.writeFileSync(__dirname + '/img/2026-04-27/agentic-engineering-architecture.svg', agenticArch);
console.log('Created agentic-engineering-architecture.svg');
