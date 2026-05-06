# RA0030 - Agentic Engineering Reference Architecture

## Context

We are building a new reference architecture on agentic engineering at [docs/ref-arch/RA0030/readme.md](docs/ref-arch/RA0030/readme.md).

## Purpose

This reference architecture shows the synergy between coding agents (Claude Code, Codex, etc.) in the context of building rapid intelligent apps that are then deployed in BTP and utilizing other combined SAP solutions. Example: a BTP extension to S4/HANA using CAP/Fiori.

> Coding agents grounded in SAP domain expertise — via MCP servers, architecture specs, and curated skills — produce enterprise-quality results that ungrounded agents cannot. This is agentic engineering applied to the SAP ecosystem.

**Human-AI collaboration.** Humans set up the agent for the project — the right skills, CLIs, and MCP servers, not a universal giant list. Then humans and AI co-create the product spec, requirements, plan, and acceptance criteria using spec-driven development tools (OpenSpec, GSD, superpowers).

**Enterprise governance.** Organizations need a governed, centralized registry for MCP servers and an AI Skills catalog. Coding agents maintain generic skill registries, but institutions must curate and approve what developers can safely use.

**Institutional memory.** Skills, project instructions, and CLAUDE.md patterns make the agent smarter session after session — building reusable knowledge rather than starting from zero.

**Protocols.** MCP as tools to equip your agents. A2A for agent-to-agent interoperability.

**Accessibility.** Customers can build AI-powered applications affordably and quickly, side-by-side with existing S4 work — including on-premise customers who don't get embedded AI today.

- Claude Code + SAP's opinionated tech (CAP, MCP servers) = better, faster, safer code quality outcome guided by SAP best practices

## Key Constraints

- **Audience**: S4HANA on-premise customers who don't get Joule/embedded AI (reserved for Rise/public cloud) but still want AI-powered processes
- **Depth**: Architecture patterns & decision frameworks (not implementation guides)
- **Coding agent is central.** In this context, a coding agent is a complete agent harness like Claude Code. It builds intelligent apps based on curated and approved specs, grounded on SAP-trusted and current knowledge (by querying SAP MCP servers).
- **No guidance on building AI agents.** This RA must not give guidance on how to build AI agents.
- **BTP as deployment target.** SAP Business Technology Platform is the strategic business platform to host apps produced by the agent.
- Do NOT position it as "use Claude Code to pull SAP data and build your own tools"
- Do NOT suggest vibe-coding a naive replacement for the entire SAP stack
- **LiteLLM** = position it as a gateway to SAP's AI Foundation
- **Gen AI Hub** = position it as the AI foundation (features include: multi-LLM SAP and Non-SAP proxy support, content filters, PII masking, RAG/document grounding, guardrails,  tool calling, streaming, image input, data masking -- ~20 features)

## The SAP opportunity for On-Premise Customers

Advantages include but not limited to: 
- S4HANA on-premise customers are frustrated about missing embedded AI
- This approach lets them build AI-powered apps **without** migrating to Rise/public cloud
- The holy grail for clients is accelerating extensions on BTP to keep the core clean. 
- Affordable, fast, side-by-side with existing S4 work
- Full-stack paradigm: Fiori frontend, CAP backend, Gen AI Hub, BTP runtime (Cloud Foundry or Kyma), backing services (Destination, HANA Cloud)
- SAP Extended app working syde-by-syde with S4/Hana.

## SAP Tooling Advantage include but not limited

- Claude Code equipped with SAP MCP servers (CAP, Fiori, UI5) produces better code than Claude Code alone. The agent writes the code; SAP provides the best practices.
- BTP 
- Connectivity with S4/HANA

## Some strategic SAP tools include

- Joule
- AI Core
- SAP Business Data Cloud
- SAP HANA Cloud 
- SAP Knowledge Graph
- SAP Databricks

## Related Content

- Blog on Coding Agents for BTP Extensions, CAP/Fiori: [The Agentic Code Quality Funnel](/news/2026/04/27/agentic-engineering)
  
- `docs/ref-arch/RA0029/readme.md` provides a comprehensive guide to developing, deploying and managing AI agents in your SAP ecosystem powered by SAP Business Technology Platform (BTP). It details the architectural patterns, components and best practices for building both low-code and pro-code agents, integrating them with Joule through bidirectional A2A communication and ensuring seamless interoperability across the enterprise landscape. 


## Issues

- Define goal for the RA. (This is done)
- Ellaborate RA draft. (This is done)
- Ellaborate the Flow that describes the happy path of agentic engineering for BTP extensions. (Issue description: blog documents the flow and methodology: `news/2026-04-27-agentic-engineering.md`)
- Cover governance and security.
- What SAP tooling and Non-SAP tooling can be applied to this architecture to support the flow (ie: Coding Agent (ie: claude code), Litellm w/ Gen AI Hub, BTP, SAP MCP servers, SAP Build (CAP, Fiori))? Any others SAP Tooling?
- What are the opportunities to document regarding the SAP strategic tooling?
- What are the integrations with the SAP Tooling and the coding agent or produced app.
- What components are key to this architecture (coding agents, SAP tooling, Non-SAP tooling if applicable). Are we making it clear the architectural and business value of each architectural component? 
- How do the architectural components interact with each other? How's the architecture diagram look like?
- Can multiple architecture patterns be identified from this reference architecture?
- Include a business problem section that this architecture solves based on blog `news/2026-04-27-agentic-engineering.md`?