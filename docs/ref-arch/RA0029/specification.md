# RA0029 Overview Update — Specification

> Working document. Delete before merging.

## Goal

Update the root-level overview of RA0029 (Agentic AI & AI Agents) to reflect the current platform picture:
- Introduce **SAP Business AI Platform** as the top-level framing
- Surface **SAP Signavio** (Agent Mining) and **SAP LeanIX** (AI Agent Hub) as platform-level components
- Clarify the **Joule Studio** internals (intent-based development, MCP Builder)
- Restructure the **SAP BTP Subaccount** view (Custom Agents + MCP Gateway)
- Add the **Autonomous Suite** as a bottom tier
- Sharpen the **3rd-party** topology (Tools vs. AI Agents & Clients)
- Add explicit edge labels (A2A, MCP, TRUST, Authenticate)
- Rewrite the text to match the updated diagram and framing

Sub-pages (1–10) are not in scope for this update.

---

## Files to Change

| File | Change |
|---|---|
| `drawio/architecture.drawio` | Restructure diagram to match WIP (see below) |
| `readme.md` | Rewrite text to align with new diagram and Business AI Platform framing |

---

## Diagram Changes

### Add / restructure

- **SAP Business AI Platform** — outer container wrapping all SAP-managed components
- **SAP Signavio (Agent Mining)** — top-left inside platform; arrow to Joule
- **SAP LeanIX (AI Agent Hub)** — top-right inside platform; arrow to Joule
- **Joule Work** — explicit entry point inside Joule (receives user requests)
- **Joule Studio** — update sub-label to "Custom Agents / Intent based Development"; add **MCP Builder** as child item
- **SAP BTP Subaccount** — restructure to show: Custom Agents box containing "Bring Your Own Agent (SAP Cloud SDK for AI)" + **MCP Gateway in SAP Integration Suite**
- **3rd Party panel** — split into two sections: **Tools** (MCP Server, API) and **AI Agents & Clients** (Google Cloud, Microsoft Azure, AWS, IBM Cloud, others)
- **Autonomous Suite** — new bottom tier with: Autonomous Finance, Autonomous Spend, Autonomous SCM, Autonomous HCM, Autonomous CX, Industry AI
- **SAP Cloud Identity Services** — keep; add **3rd party identity provider / identity management** beside it with TRUST arrow
- **Network divider** — vertical separator between SAP-managed and 3rd-party zones, labeled "Network"
- **Edge labels** — add explicit labels: A2A (magenta), MCP (teal), TRUST (green), Authenticate (green)

### Remove
- WIP banner (top-right corner)

---

## Text Changes (readme.md)

### Frontmatter
- `last_update.date`: `2026-07-21`

### Disclaimer
Keep the Agent Gateway "not yet GA / unidirectional only" disclaimer. May tighten wording slightly.

### Intro
Rewrite to introduce SAP Business AI Platform as the overarching concept. Emphasize:
- The platform spans from intent-based (Joule Studio) to pro-code (SAP Cloud SDK for AI) agent development
- Joule is the central engagement layer unifying all AI experiences
- Agent Gateway is the central hub governing all agent communication
- The platform is open to 3rd-party AI agents and clients via open standards (A2A, MCP)

### Architecture section
Update component descriptions:
- **SAP Business AI Platform** — new top-level entry
- **SAP Signavio / SAP LeanIX** — add as platform-level components (Agent Mining, AI Agent Hub)
- **Joule** — update to "SAP-managed"; clarify Joule Work as user entry point; Joule Orchestrator as Agent Harness
- **Joule Studio** — update to mention intent-based development + MCP Builder
- **Custom Agents on SAP BTP** — update to reflect Bring Your Own Agent + MCP Gateway in SAP Integration Suite
- **3rd Party** — split into Tools and AI Agents & Clients
- **Autonomous Suite** — add as integration target
- **Security** — add 3rd-party identity federation

### Development Approaches
Minor update: reference intent-based development (Joule Studio) and pro-code (SAP Cloud SDK for AI) as converging on the same runtime.

### Integration Patterns
Minor update: align with explicit A2A/MCP/TRUST edge labels shown in diagram.

### Services and Components
Add:
- SAP LeanIX
- SAP Signavio
- MCP Gateway in SAP Integration Suite (if not already listed)

---

## Open Items

- [ ] Confirm MCP Builder name and whether it is GA (needed for text)
- [ ] Confirm Autonomous Suite list is complete / correctly named
- [ ] Provide additional context for text rewrite once diagram is finalized
