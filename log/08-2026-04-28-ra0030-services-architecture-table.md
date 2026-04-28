# 2026-04-28 — RA0030 Services and Architecture Table Expansion

**Scope**: `docs/ref-arch/RA0030/readme-v4.md` — Architecture table and Services and Components section

## What was done

- Researched SAP BTP extension recommendations via subagent to identify canonical services and patterns
- Audited Services and Components section against body text: removed SAP Joule, SAP Business Data Cloud and SAP Cloud SDK for AI (not mentioned in body); added SAP Cloud Application Programming Model (named throughout body but only in Resources)
- Rebuilt Architecture table from 6 abstract rows to 5 top-level components with named sub-components
- Replaced "Context Engineering" + "Coding Agent" rows with "Agent Harness" — grounding via specs, skills and MCP servers is part of the harness description, not a separate abstract component
- Broke out three SAP MCP servers as named sub-rows under Agent Harness: SAP Build MCP Servers, Fiori MCP Server, UI5 Web Components MCP Server
- Renamed "Foundation Model Access" to "Foundation Model Proxy" — described as LiteLLM hosted on BTP routing through SAP AI Core and SAP Generative AI Hub
- Added SAP AI Core by name to Foundation Model Proxy row (was previously unnamed)
- Expanded SAP BTP Runtime with three named sub-rows: SAP HANA Cloud, SAP Integration Suite, SAP BTP Audit Log Service
- Briefly added CI/CD sub-components (SAP CI/CD, Cloud Transport Management, Cloud ALM) then removed — decided this RA covers agentic engineering, not DevOps; RA0023 owns that concern
- Removed all HTML indentation entities (&nbsp;, &emsp;) from table — sub-components sit flush with parent rows
- Updated Services and Components to match final table: 10 entries covering AI, CAP, data, integration and MCP servers

## Decisions made

- Sub-components in the Architecture table carry no indentation markup — the grouping is conveyed by descriptions alone
- CI/CD services excluded entirely; quality pipeline stays as a single abstract row without named SAP services
- "Foundation Model Proxy" preferred over "LLM Proxy" or "AI Gateway" to align with SAP's own foundation model vocabulary
- Services and Components lists only services named in the document body — no aspirational entries

## Open items

- Architecture diagram does not yet exist; table now defines the components the diagram must show
- "Related Missions" section is still empty — needs links to RA0001, RA0007, RA0023
- Opening paragraphs still do not anchor in BTP extensions / clean core before introducing agentic engineering
