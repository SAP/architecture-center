# Blog Post Brief details

## Purpose

First blog post to use the Architecture Center blog for **thought leadership** (not just reference architecture announcements). Sets the tone for the "AI-native North Star" content direction.

## Core Message

> **SAP MCP developer tooling + Claude Code = faster, safer, more efficient outcome** for building SAP extension applications.

- Agentic engineering **combined with SAP** is the strategy
- Claude Code equipped with **CAP and MCP tools** produces better results than Claude Code alone (Including SAP CAP MCP Server; FIORI MCP Server; UI5 MCP Server)
- Customers can build AI-powered applications **affordably and quickly**, side-by-side with existing S4 work
- Claude code writes the code, SAP provides the best practices
- Build institutional memory that makes the agent smarter session after session. 
- Consider a governed and centralized registry strategy for MCP servers for developers at your organization, including AI Skills catalog. Claude Code maintain a registry of generic skills but institutions have to curate, approve them you can safely use.
- Humans and AI need to work together. Humans setup Claude based on project needs, including the right skills (not univeral giant list), CLIs, MCPs for development); Humans and AI work together to create the product spec, requirements, plan, acceptance criteria with a great help of AI by using SDD tools, like OpenSpec or GSD.
- A2A and MCP: Use A2A for agent interoperability and MCP as tools to equip your agents.

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
- Github MCP Server: Connect AI assistants to GitHub.com – manage issues, PRs, and workflows through natural language. https://github.com/github/github-mcp-server
- Context7: Up-to-date code docs for any prompt. 
- get-shit-done: A light-weight and powerful meta-prompting, context engineering and spec-driven development system for Claude Code, OpenCode, Gemini CLI, Codex, Copilot, Cursor, Windsurf, and Antigravity. https://github.com/gsd-build/get-shit-done 
- OpenSpec: Spec-Driven Development tool that let's your AI coding assistants become powerful. Without an SDD, they are unpredictable when requirements live only in chat history. OpenSpec adds a lightweight spec layer so you agree on what to build before any code is written. https://github.com/Fission-AI/OpenSpec
- Chrome DevTools MCP: Lets your coding agent control and inspect a live Chrome browser. https://github.com/ChromeDevTools/chrome-devtools-mcp  
- Angular CLI MCP Server: The Angular CLI MCP Server provides AI-assisted tools for Angular development, enabling AI models to access Angular documentation, find code examples, and apply best practices. https://github.com/angular/angular-cli
- IU5 MCP Server: The UI5 Model Context Protocol server offers tools to improve the developer experience when working with agentic AI tools. https://github.com/UI5/webcomponents-mcp-server
- CAP MCP Server: MCP Server for coding agent development of SAP Cloud Application Programming Model (CAP) applications 
- Fiori MCP Server: A Model Context Protocol server that helps AI models create or modify SAP Fiori applications. https://www.npmjs.com/package/@sap-ux/fiori-mcp-server. For the best experience we recommend using this server alongside @cap-js/mcp-server and @ui5/mcp-server.
- UI5 Web Components MCP Server: MCP server for UI5 Web Components development assistance. https://github.com/UI5/webcomponents-mcp-server
