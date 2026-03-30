---
title: Your Coding Agent Writes Code Fast. SAP Tooling Makes It Right.
description: Agentic engineering with Claude Code and SAP MCP servers bridges the gap between fast code generation and production-quality SAP development. Learn how to equip your coding agent with the right tooling.
authors: [guilherme-segantini]
keywords: ["SAP Architecture Center", "Claude Code", "Agentic Engineering", "MCP Servers", "SAP BTP", "CAP", "Fiori", "LiteLLM", "Gen AI Hub"]
hide_table_of_contents: true
date: 2026-03-30
draft: true
---

## Your Coding Agent Writes Code Fast. SAP Tooling Makes It Right.

Coding agents like Claude Code can generate code very quickly — including a full SAP intelligent application built on SAP CAP. Ask it for a Fiori Elements list report, and you'll get something that compiles, runs, and looks convincing. But look closer. The service uses synchronous loading. The controller leans on deprecated `jQuery.sap.*` calls. The labels are hardcoded in English instead of using i18n resource bundles — making the app impossible to localize without rewriting code. The entity definitions ignore CDS best practices that any seasoned SAP developer would catch in a code review.

The code arrives fast. It also arrives broken — and debugging after the fact is the most expensive way to use AI. Every round-trip back to the agent to fix what it should have gotten right the first time erodes the speed advantage you signed up for.

This is the tension at the heart of using coding agents for SAP development — not whether the agent can write code, but whether it can write *correct* code at speed. The answer isn't better prompting. It's better equipping.

<!-- truncate -->

## Vibe Coding Had Its Moment

In early 2025, Andrej Karpathy popularized "vibe coding" — the freewheeling, accept-everything approach where you paste errors back into the chat and hope for the best. For quick prototypes and solo experiments, it still has a place. But the industry has moved on. The next step is **agentic engineering** — grounded on reliable enterprise best practices and authoritative sources of truth.

Simon Willison defines it clearly: building software using coding agents that can both generate and execute code — allowing them to test, iterate, and debug independently of turn-by-turn human guidance. The human acts as architect, orchestrator, and reviewer. The agent does the heavy lifting. You set the direction, define the constraints, and make the judgment calls. The agent writes, tests, refactors, and iterates — with real autonomy, not autocomplete.

This distinction matters because code generation is now trivially cheap. The bottleneck has moved. Quality, maintainability, correctness within SAP conventions, security, and team collaboration between humans and agents — these are what separate a demo from a production application. Agentic engineering turns AI from a novelty into a genuine force multiplier, but only when you apply engineering rigor to the process.

## The Problem With Unequipped Agents

Here is what happens when you point a general-purpose coding agent at an SAP extension project without domain-specific tooling:

- It generates UI5 modules using global variables instead of `sap.ui.define`
- It loads dependencies synchronously, violating async-first conventions
- It hardcodes user-facing strings instead of using i18n resource bundles
- It reaches for deprecated APIs because its training data includes years of legacy patterns
- It confidently uses API signatures that changed two releases ago — and the developer discovers the mismatch only at runtime, because the agent's training data has a cutoff and no way to check what is current
- It generates a Fiori Elements page that compiles, passes linting, and looks correct on paper — but renders as a blank page in the browser because the bootstrap wiring is subtly wrong. Without browser access, the agent cannot catch this class of bug
- It structures CDS entities in ways that technically work but ignore CAP conventions

The output looks professional. It runs. And it creates technical debt from the first commit.

This is not a limitation of the model's intelligence. It is a limitation of context. Without access to SAP's current best practices at development time, the agent has no way to distinguish a correct pattern from a plausible one.

## The On-Premise AI Gap Is a Business Problem

And for one group of customers, the stakes could not be higher.

If you run S/4HANA on-premise, you have watched Joule, intelligent scenarios, and embedded AI capabilities land in Rise and public cloud editions — and you have watched them land somewhere else. Your competitors on BTP are automating approval workflows, generating purchase order summaries, and building intelligent extensions while your teams are still writing the same boilerplate they wrote three years ago. The gap is not technical curiosity. It is time to value — and it is widening every quarter.

Migration to Rise is not happening tomorrow. For many organizations, it is not happening next year either. But the business cases that demand intelligent applications do not wait for infrastructure decisions to resolve. A warehouse manager needs predictive restocking recommendations now. A procurement team needs automated supplier risk scoring now. Every month those capabilities sit in a backlog because "we are still on-premise" is a month of competitive advantage left on the table.

This is exactly the problem agentic engineering solves. Your core S/4 system does not need to change. Your ERP stays where it is. The extension application runs on BTP, connected through Destination service and SAP's standard connectivity framework. A coding agent equipped with SAP-specific tooling writes production-quality CAP services and Fiori interfaces against your existing data — and what used to take a development team weeks of requirements gathering, prototyping, and iteration compresses into days. Same access to frontier models. Same quality standards. Built side-by-side with your existing landscape, not instead of it.

The question is not whether on-premise customers can build intelligent applications. It is whether their coding agents are equipped to build them *correctly*.

## The SAP Tooling Advantage

This is where **Model Context Protocol (MCP) servers** change the equation. MCP gives your coding agent structured, real-time access to domain expertise — not as static documentation, but as callable tools the agent consults while it works. MCP servers provide *capability*: they connect the agent to external systems and domain knowledge. For *procedural knowledge* — your team's deploy process, review checklist, CDS modeling conventions — you write skills. The two work together: a skill can tell the agent which MCP tools to call and in what order.

Three MCP servers form the core of the SAP developer toolkit:

- **CAP MCP Server** — guides CDS entity modeling, service definitions, and backend patterns according to current CAP conventions
- **Fiori MCP Server** — ensures Fiori Elements applications follow SAP UX guidelines, annotation patterns, and page configurations
- **UI5 MCP Server** — provides UI5 Web Components guidance, control usage, and binding patterns

When Claude Code is equipped with these servers, it does not guess at SAP conventions. It checks. The result is code that a senior SAP developer would recognize as correct — not code that needs three rounds of review to get there. The agent queries the CAP MCP server before defining an entity. It consults the Fiori MCP server before configuring a list report page. It validates control usage against the UI5 MCP server before writing a view. Each decision is grounded in current SAP guidance, not in whatever pattern happened to appear most frequently in the training data.

**Context7** closes a separate gap. LLMs rely on outdated or generic information about the libraries you use — producing code based on year-old training data, hallucinating APIs that do not exist, and giving generic answers for old package versions. Context7 feeds the agent up-to-date, version-specific library documentation at development time, so every API call reflects what the framework actually supports *today*. SAP MCP servers guide *how* to build. Context7 ensures the agent builds against *what actually exists right now*.

## Verifying What the Agent Built

Code that compiles is not code that works. Fiori Elements apps have complex runtime wiring — ushell containers, annotation bindings, OData initialization — and a page that passes linting can still render as a blank screen. Without browser access, the agent cannot catch this class of bug. A developer opens the app, sees the blank page, pastes the error back into the chat — and you are back to vibe coding with extra steps.

**Playwright MCP** gives the agent eyes on the running application. After generating a Fiori Elements page, the agent launches a headless browser, takes screenshots, and verifies the page actually renders. If something is broken, it iterates — without waiting for a human to open a browser and report what went wrong. This is the concrete mechanism behind the definition of agentic engineering: agents that create code, test, iterate, and debug *independently*.

Equipping the agent looks like this in practice:

```json
// .claude/settings.json — MCP server configuration
{
  "mcpServers": {
    "cap": { "command": "npx", "args": ["@cap-js/mcp-server"] },
    "fiori": { "command": "npx", "args": ["@sap-ux/fiori-mcp-server"] },
    "ui5": { "command": "npx", "args": ["@ui5/mcp-server"] },
    "context7": { "command": "npx", "args": ["-y", "@upstash/context7-mcp"] },
    "playwright": { "command": "npx", "args": ["@anthropic-ai/playwright-mcp", "--headless"] }
  }
}
```

```markdown
# CLAUDE.md — SAP project rules
- Use `sap.ui.define` for all modules — no globals
- Async loading only (`data-sap-ui-async="true"`)
- i18n for all user-facing text — no hardcoded strings
- XML views only — no JavaScript views
```

Keep your CLAUDE.md short — under 200 lines — and specific. "Run `npm test` before committing" is enforceable; "make sure tests pass" is not. Reference supporting documents by description rather than importing them: writing "see docs/architecture.md for service boundaries" loads the file only when the task needs it, keeping your context window lean for the work that matters.

A few lines of configuration, and the agent shifts from generating plausible code to engineering correct code.

## Correct Code Is Not Enough. Enterprise Agents Need Governed Infrastructure.

The tooling gets the code right. The next question is infrastructure — and the first concern is data protection. When your coding agent sends code, business logic, and enterprise context to frontier models, you need a contractual guarantee that your data will be safe and not used for training or improving those models. Going direct to provider APIs does not give you that through a single, SAP-governed agreement. Running through SAP's Gen AI Hub does — SAP's agreements with model providers ensure your data stays yours.

With that foundation in place, the practical advantages follow. Your coding agent benefits from access to multiple frontier models — model strengths vary by use case, and being able to switch models or get a second opinion from a different model is a genuine advantage in agentic workflows. But without a proxy layer, that means each project negotiating its own API keys, spinning up its own guardrails, and building its own content filtering for every provider.

**LiteLLM** solves this as a gateway into SAP Gen AI Hub. One integration point. One SAP API key. Every frontier model available to your agent immediately — and because SAP negotiates volume pricing with hyperscalers, the economics work at scale without a separate procurement exercise per project.

Behind that gateway, **Gen AI Hub** in AI Core handles what you would otherwise build yourself: multi-model proxy routing across SAP and non-SAP models, content filters and PII masking on every request, guardrails that apply before any response reaches your application. These are not optional extras for enterprise development — they are table stakes. Gen AI Hub ships them as infrastructure so your team builds on top of them instead of rebuilding them. Layer your security from the client side too — Claude Code restricts writes to the launch directory by default, and per-tool allow and deny lists in settings.json provide enforcement that does not depend on the model's judgment.

The full-stack picture: **Fiori** on the frontend, **CAP** on the backend, **Gen AI Hub** for intelligent services, **BTP** for runtime — Cloud Foundry or Kyma — and backing services like Destination and HANA Cloud for connectivity and persistence. The agent works across this entire stack, guided at every layer by SAP-specific tooling. Your extension application connects to SAP's data through the same integration patterns your team already uses.

## Agents Don't Define the Work. Humans Do.

Agentic Engineering is not fully autonomous — and that is the point. Agentic engineering is a partnership. The human brings judgment, works with AI to define clear product guardrails, and sets the project context where humans still remain accountable for the overall agentic engineering process. The agent brings speed, consistency, and tireless execution.

In practice, this means humans set up the agent with the right tools for the project — the appropriate MCP servers, skills tailored to your team's patterns, and CLI integrations for your development workflow. For project-local integrations where you do not need structured schemas or OAuth, a CLI wrapper is often the simplest option — no server to run, version-controlled alongside your code. Humans and AI co-create the product specification, requirements, and acceptance criteria using spec-driven development tools like **OpenSpec** or **GSD**. These tools add a lightweight specification layer so you agree on what to build before any code is written — eliminating the drift that happens when requirements live only in chat history. The agent writes the code. SAP tooling ensures it is written correctly. Subagents handle parallel, isolated work — code review, research, exploration — each running in its own context window and returning only a concise summary, keeping your primary context focused on what matters. The human reviews, decides, and ships.

Session after session, the agent accumulates your team's institutional memory — conventions, corrections, architectural decisions — making it more effective every time it runs. When you find yourself giving the same correction three times, that is a skill candidate. Write it once, and the agent never makes that mistake again. For organizations scaling this across multiple teams, a governed and centralized MCP server registry becomes essential: curated, approved tooling that any developer in your organization can safely adopt.

And as agentic workflows mature, the next frontier is agent-to-agent interoperability. **A2A (Agent-to-Agent protocol)** handles coordination between agents — letting a planning agent delegate to a coding agent, or a testing agent report results back to an orchestrator. MCP equips individual agents with tools; A2A lets those agents work together. The two protocols are complementary, not competing.

Start with one extension application. Equip Claude Code with SAP's MCP servers, Context7, and Playwright. And see the difference between generating code and engineering it.

## References

**SAP MCP Servers**
- [CAP MCP Server](https://www.npmjs.com/package/@cap-js/mcp-server) — MCP server for SAP Cloud Application Programming Model (CAP) development
- [Fiori MCP Server](https://www.npmjs.com/package/@sap-ux/fiori-mcp-server) — Helps AI models create and modify SAP Fiori applications
- [UI5 MCP Server](https://github.com/niclas-nickel/ui5-mcp-server) — UI5 Web Components development assistance

**Agentic Engineering & Spec-Driven Development**
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) — Spec-driven development tool that adds a lightweight specification layer before code is written
- [GSD (Get Shit Done)](https://github.com/gsd-build/get-shit-done) — Meta-prompting, context engineering, and spec-driven development system for coding agents

**Developer Tooling MCP Servers**
- [GitHub MCP Server](https://github.com/github/github-mcp-server) — Manage issues, PRs, and workflows through natural language
- [Context7](https://github.com/upstash/context7) — Up-to-date code documentation for any prompt
- [Playwright MCP](https://github.com/anthropics/anthropic-quickstarts/tree/main/playwright-mcp) — Headless browser automation for coding agents — navigate, screenshot, and verify UI

**SAP Platform**
- [LiteLLM SAP Provider](https://docs.litellm.ai/docs/providers/sap) — Gateway to SAP AI Foundation via Gen AI Hub
- [Claude Code Documentation](https://code.claude.com/docs) — Official Claude Code docs, skills, MCP, and quickstart guides
- [Anthropic Skills Repository](https://github.com/anthropics/skills) — Reference patterns for Claude Code skills
