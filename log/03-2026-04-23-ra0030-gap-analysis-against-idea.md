# 2026-04-23 — RA0030 Gap Analysis Against Idea Document

## Scope

RA0030 (Agentic Engineering for SAP) readme.md, compared against `docs/ref-arch/RA0030/context/idea.md`.

## What was done

- Compared idea.md (knowledge source / brief) against the published readme to identify 9 content gaps
- Applied ref-arch-structure and ref-arch-voice skills to determine which gaps fit the main page vs. future sub-pages
- Addressed all gaps at headline level on the main page without exceeding density benchmarks:
  - Added time-to-value framing to the opening paragraph
  - Added human-AI collaboration (structured specifications co-created by humans and agents) to opening, Grounding Layer and Flow step 1
  - Added new Governance Layer describing centralized MCP server and skills registry
  - Added A2A protocol mention to Orchestration Layer
  - Expanded Model Access Layer with Gen AI Hub capabilities (content filtering, PII masking, guardrails, data grounding, audit logging) and hyperscaler pricing advantage
  - Expanded Grounding Layer with institutional memory (persistent instructions, knowledge accumulation across sessions)
  - Expanded Compounding Knowledge characteristic to name the mechanism (project instructions, persistent memory)
  - Replaced Tooling Agnosticism characteristic with Governed Toolchain (tooling-agnostic framing already in opening)
  - Added On-Premise Extension with Cloud AI example for S/4HANA on-premise customers
  - Added Fiori MCP Server and UI5 Web Components MCP Server to Services and Resources
  - Added OpenSpec to Resources
- Architecture moved from 5 layers to 6 layers
- All structural benchmarks remain within range (6 characteristics, 5 flow steps, 5 examples, 11 services, 15 resources)

## Decisions made

- Governance is a standalone layer rather than folded into Grounding — it controls what tools are available, which is distinct from what knowledge they provide
- Tooling Agnosticism removed as a characteristic since it was already stated in the opening; freed the slot for Governed Toolchain
- On-prem story framed architecturally (model access layer connects on-prem extensions to cloud AI) rather than as a deployment guide
- Sub-pages deferred — all gaps addressed at high level on main page with room to expand later

## Open items

- Diagram (drawio) does not yet reflect the new Governance Layer — needs visual update
- Tone remains standard RA voice; idea.md requested bolder, more opinionated thought leadership style
- Context7 not added to Services/Resources — needs verified URL
- Sub-pages for deeper treatment: specification layer, institutional memory, deployment variants
