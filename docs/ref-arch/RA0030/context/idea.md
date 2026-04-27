# Knowledge source

## Purpose

Create a new reference architecture in agentic engineering

> Coding agents grounded in SAP domain expertise — via MCP servers, architecture specs, and curated skills — produce enterprise-quality results that ungrounded agents cannot. This is agentic engineering applied to the SAP ecosystem.

**The SAP advantage.** Claude Code equipped with SAP MCP servers (CAP, Fiori, UI5) produces better code than Claude Code alone. The agent writes the code; SAP provides the best practices.

**Human-AI collaboration.** Humans set up the agent for the project — the right skills, CLIs, and MCP servers, not a universal giant list. Then humans and AI co-create the product spec, requirements, plan, and acceptance criteria using spec-driven development tools (OpenSpec, GSD, superpowers).

**Enterprise governance.** Organizations need a governed, centralized registry for MCP servers and an AI Skills catalog. Coding agents maintain generic skill registries, but institutions must curate and approve what developers can safely use.

**Institutional memory.** Skills, project instructions, and CLAUDE.md patterns make the agent smarter session after session — building reusable knowledge rather than starting from zero.

**Protocols.** MCP as tools to equip your agents. A2A for agent-to-agent interoperability.

**Accessibility.** Customers can build AI-powered applications affordably and quickly, side-by-side with existing S4 work — including on-premise customers who don't get embedded AI today.

## What NOT to Say

- Do NOT position it as "use Claude Code to pull SAP data and build your own tools"
- Do NOT suggest vibe-coding a naive replacement for the entire SAP stack

## Target Audience

- SAP customers building extension applications (hundreds to thousands)
- Especially: S4HANA on-premise customers who don't get Joule/embedded AI (reserved for Rise/public cloud) but still want AI-powered processes
- Architects evaluating agentic engineering approaches

## Tone & Style

- **Be human** -- show emotion, make opinions
- **Be bold and contentious** -- take a couple of strong points to engage readers
- More opinionated than a reference architecture; this is thought leadership
- Acceptable to create a **fictional storyline** (e.g., Guillermo as a product manager building a Fiori app)

## Key Points to Cover

### 1. Why Agentic Engineering Matters for SAP
- Vibe coding has a "big brother" now: agentic engineering
- Customers need extension apps; this approach gets them to production faster
- Biggest SAP customer pain point: **time to value**

### 2. The SAP Tooling Advantage
- Claude Code + SAP's opinionated tech (CAP, MCP servers) = better, faster, safer code quality outcome.
- Not just any code generation -- but guided by SAP best practices
- Full-stack paradigm: Fiori frontend, CAP backend, Gen AI Hub, BTP runtime (Cloud Foundry or Kyma), backing services (Destination, HANA Cloud)
- SAP Extended app connected to connected to SAP's data.
- **LLMs Significantly cheaper** than direct providers (SAP passes on hyperscaler discounts)

### 3. Enabling Claude Code for SAP extension apps. (LiteLLM & Gen AI Hub Value Prop)
- **LiteLLM** = position it as a gateway to SAP's AI Foundation
- **Gen AI Hub** = position it as the AI foundation (features include: multi-LLM SAP and Non-SAP proxy support, content filters, PII masking, RAG/document grounding, guardrails,  tool calling, streaming, image input, data masking -- ~20 features)
- Single SAP API key to access all frontier models

### 4. The Opportunity for On-Premise Customers
- S4HANA on-premise customers are frustrated about missing embedded AI
- This approach lets them build AI-powered apps **without** migrating to Rise/public cloud
- Affordable, fast, side-by-side with existing S4 work

### MCP Servers for agentic engineering
- Context7: Up-to-date code docs for any prompt. 
- get-shit-done: A light-weight and powerful meta-prompting, context engineering and spec-driven development system for Claude Code, OpenCode, Gemini CLI, Codex, Copilot, Cursor, Windsurf, and Antigravity. https://github.com/gsd-build/get-shit-done 
- OpenSpec: Spec-Driven Development tool that let's your AI coding assistants become powerful. Without an SDD, they are unpredictable when requirements live only in chat history. OpenSpec adds a lightweight spec layer so you agree on what to build before any code is written. https://github.com/Fission-AI/OpenSpec
- IU5 MCP Server: The UI5 Model Context Protocol server offers tools to improve the developer experience when working with agentic AI tools. https://github.com/UI5/webcomponents-mcp-server
- CAP MCP Server: MCP Server for coding agent development of SAP Cloud Application Programming Model (CAP) applications 
- Fiori MCP Server: A Model Context Protocol server that helps AI models create or modify SAP Fiori applications. https://www.npmjs.com/package/@sap-ux/fiori-mcp-server. For the best experience we recommend using this server alongside @cap-js/mcp-server and @ui5/mcp-server.
- UI5 Web Components MCP Server: MCP server for UI5 Web Components development assistance. https://github.com/UI5/webcomponents-mcp-server
