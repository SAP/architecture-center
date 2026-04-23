# 2026-04-23 — Agentic Engineering Architecture Diagram

## Scope
Blog post `news/2026-04-27-agentic-engineering.md` — created a big-picture architecture SVG diagram and improved the `blog-svg-diagrams` skill.

## What was done
- Discussed architecture with senior architect lens — iterated from methodology to component architecture
- Created `agentic-engineering-architecture.svg` as a light-theme hub-and-spoke system diagram
- Central hub: Coding Agent (Claude Code), surrounded by Developer, SDD Tool, SAP MCP Servers, Verification group, SAP BTP platform
- Iterated through 5 revisions: aligned top row, removed app box, single arrows, thin borders, icons inside nodes, BTP centered, Kyma nested inside BTP
- Created `svg-agentic-arch.js` Node.js script to generate the SVG
- Updated `blog-svg-diagrams` skill with 8 improvements learned during iteration

## Decisions made
- Higher abstraction for SAP platform: BTP as container, not individual services (XSUAA, HANA, Destination)
- LiteLLM and Gen AI Hub run inside BTP, not alongside it; LiteLLM specifically in Kyma Runtime
- Verification shown as distributed feedback arrows, not a single box — Playwright, security scan, and developer review all grouped
- Removed CAP+Fiori App output box — diagram focuses on the system, not the artifact
- Thin borders (`stroke-width: 1`) over heavy ones — lets content breathe

## Open items
- Blog post `spotlight_image` frontmatter still points to `img/2026-05-27/new-diagram-pending.webp` — needs updating to reference the new SVG
- SVG may need further visual refinement after seeing it in the blog's actual layout
- `svg-creator.js` (from previous session) is untracked — decide whether to keep or remove
