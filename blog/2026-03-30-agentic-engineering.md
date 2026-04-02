---
title: Your Coding Agent Writes Code Fast. SAP Tooling Makes It Right.
description: Agentic engineering with Claude Code and SAP MCP servers bridges the gap between fast code generation and production-quality SAP development. Learn how to equip your coding agent with the right tooling.
authors: [guilherme-segantini]
keywords: ["SAP Architecture Center", "Claude Code", "Agentic Engineering", "MCP Servers", "SAP BTP", "CAP", "Fiori", "LiteLLM", "Gen AI Hub"]
hide_table_of_contents: true
date: 2026-03-30
draft: false
---

Less than thirty minutes. That is how long it took Claude Code and Opus 4.6 to build a full SAP extension app from scratch. After grounding Claude on my use cases and technical requirements, utilizing a spec-driven tool, I was trully impressed how quickly Claude built my Financial Risk Analyzer, utilizing CAP as the backend, Fiori Elements list report, OData endpoints to display financial risk classifications powered by AI Core. I said, that's it, not longer spending a lot time to build extension apps! Happy, oh yes, but that excitement unfortunetely didn't last too long.

The Fiori Elements frontend would not render at all! After several iterations of debugging with the coding agent, I got the page to display finally, but then columns that should have shown data from the CAP backend came up empty. More back-and-forth. Then I discovered the "Analyze Risks" button did nothing when clicked. The root cause was not a single bug but several issues caused by deprecated patterns, annotations that were never wired up, and naming mismatches between the controller and what Fiori Elements actually looks for. 

Yes! Coding agents like Claude write code fast, no question, but debugging after the fact turned out to be the most expensive way to use AI. That initial rush of excitement faded fast. Each fix cycle, wait for a new attempt, test again was slowly turning my enthusiasm into frustration. The real question then is not about writing code fast, but writing *correct* code. And the answer to that is not just a contextual gap. It is better equipping the agent. 


## The Problem With Unequipped Agents

We all understand code generation is cheap. The challenge is to build applications that trully work. The bottleneck has moved to many other areas, including but not limited to quality, security, maintainability, etc. Besides, an application that works, doesn't qualify it as an Enterprise solution. As an architect, we should ensure that the most solid architectural principles are applied too, including performance effiency, reliability, scalability, security. That's what differents an Enterprise Solution from a PoC.

Worse, fixes do not always stick. After I corrected my Analyze Risks button, the agent later reintroduced that problem because it had forgotten and applied the same old deprecated patterns in a later session. Without persistent memory of the correct approach, every session is a fresh opportunity to make the same mistakes.

Frontier models are not lacking intelligence at all. That's not my point. Tools and Frameworks evolve very rapidly. New versions are released constantly but these models suffer from old technical specifications used while they were trained. They can't be trained at the speed that tools and frameworks evolve! That's why the challenge here is ingesting the right context to them, Lessons learned on my side, without access to SAP's current best practices at development time, the agent has no way to distinguish a correct pattern from a plausible one.

My Point is: any general-purpose coding agent without domain-specific knowledge will lead you to similar problems.

## The On-Premise AI Gap Is a Business Problem

And for one group of customers, the stakes could not be higher.

If you run S/4HANA on-premise, you have watched Joule, intelligent scenarios, and embedded AI capabilities land via RISE and public or private cloud editions — somewhere else. The gap is not technical curiosity. It is time to value, and it widens every quarter. Migration to Cloud is not happening tomorrow. But the business cases that demand intelligent applications should not wait for infrastructure decisions. A warehouse manager needs predictive restocking now. A procurement team needs automated supplier risk scoring now. Unlocking AI value in this scenario is a challenge - unless you use agentic engineering the right way.

Your core S/4 system does not need to change. Your ERP stays where it is. The extension application gets created quickly by a coding agent (e.g. Claude Code) and can be deployed on BTP, connected through Destination service and SAP's standard connectivity framework. Equipping your coding agent with SAP-specific tooling writes production-quality CAP services and Fiori interfaces against your existing data — and what used to take a development team weeks of requirements gathering, prototyping, and iteration compresses into days. Same access to frontier models. Same quality standards. Built side-by-side with your existing landscape, not instead of it.

On-premise customers can absolutely build intelligent applications. The question is whether their coding agents are equipped to build them *correctly*.

## The SAP Tooling Advantage

**Model Context Protocol (MCP) servers** change the equation. While your coding agent builds code fast, MCP gives your agent structured, real-time access to domain expertise. Not static documentation, but callable tools the coding agent consults while it works. MCP servers provide *capability*: they connect the coding agent to external systems and domain knowledge. For *procedural knowledge* (your team's deploy process, review checklist, CDS modeling conventions) you write skills. The two work together: a skill can tell the coding agent which MCP tools to call and in what order.

Three MCP servers form the core of the SAP developer toolkit:

- **CAP MCP Server** — guides CDS entity modeling, service definitions, and backend patterns according to current CAP conventions
- **Fiori MCP Server** — ensures Fiori Elements applications follow SAP UX guidelines, annotation patterns, and page configurations
- **UI5 MCP Server** — provides UI5 Web Components guidance, control usage, and binding patterns

When Claude Code is equipped with these servers, it does not guess at SAP conventions. It checks. The coding agent queries the CAP MCP server before defining an entity, consults the Fiori MCP server before configuring a list report page, and validates control usage against the UI5 MCP server before writing a view. Each decision is grounded in current SAP guidance, not in whatever pattern happened to appear most frequently in the training data.

When I ran the same Financial Risk Analyzer project with the CAP MCP server equipped, it got the `UI.DataFieldForAction` annotation right on the first pass. That single change saved me the hours I had spent debugging the button.

**Context7** closes a separate gap. LLMs rely on outdated or generic information about the libraries you use — producing code based on year-old training data, hallucinating APIs that do not exist, and giving generic answers for old package versions. Context7 feeds the coding agent up-to-date, version-specific library documentation at development time, so every API call reflects what the framework actually supports *today*. SAP MCP servers guide *how* to build. Context7 ensures the coding agent builds against *what actually exists right now*.

## Verifying What the Coding Agent Built

Code that compiles is not code that works. Fiori Elements apps have complex runtime wiring (ushell containers, annotation bindings, OData initialization) and a page that passes linting can still render as a blank screen. Without browser access, the coding agent cannot catch this class of bug. A developer opens the app, sees the blank page, pastes the error back into the chat, and you are back to vibe coding with extra steps.

**Playwright MCP** gives the coding agent eyes on the running application. After generating a Fiori Elements page, the coding agent launches a headless browser, takes screenshots, and verifies the page actually renders. If something is broken, it iterates without waiting for a human to open a browser and report what went wrong. That is the concrete mechanism behind agentic engineering: coding agents that create code, test, iterate, and debug *independently*.

Equipping the coding agent looks like this in practice:

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

**A note on trust:** MCP servers execute with your local privileges: filesystem access, shell commands, network calls. A compromised or malicious server can exfiltrate code, inject backdoors, or leak credentials silently. Only adopt MCP servers validated by your organization.

Keep your CLAUDE.md short (under 200 lines) and specific. "Run `npm test` before committing" is enforceable; "make sure tests pass" is not. Reference supporting documents by description rather than importing them: writing "see docs/architecture.md for service boundaries" loads the file only when the task needs it, keeping your context window lean for the work that matters.

A few lines of configuration, and the same coding agent that generated plausible code now engineers correct code. The speed was always there. The tooling adds the judgment.

## Secure the Code Your Agent Writes. It Won't Do It for You.

The tooling gets the code right. But correct is not the same as secure. MCP servers teach convention, not security. A CAP service with correct CDS modeling can still expose an unprotected OData endpoint. **Treat all AI-generated code as untrusted.** Apply secure coding review (input validation, authorization checks, secrets management, OWASP top-10) the same way you would for human-written code. Security hardening like CORS, CSP headers, and OData authorization scoping remains your responsibility.

Protect your sessions too. Never enter personal data or customer data into coding agent prompts. Use synthetic data. Never open files containing credentials or service keys while the agent is active, because anything it reads becomes model context. Use `.claudeignore` to exclude `.env`, `default-env.json`, and service keys.

## Enterprise Agents Need Governed Infrastructure.

With the code secured, the next concern is your data. When your coding agent sends code, business logic, and enterprise context to frontier models, you need a contractual guarantee that your data will not be used for training or improving those models. Going direct to provider APIs does not give you that through a single, SAP-governed agreement. Running through SAP's Gen AI Hub does. SAP's agreements with model providers ensure your data stays yours, and that guarantee is the foundation everything else builds on.

With that foundation in place, the practical advantages follow. Your coding agent benefits from access to multiple frontier models — model strengths vary by use case, and being able to switch models or get a second opinion from a different model is a genuine advantage in agentic workflows. But without a proxy layer, that means each project negotiating its own API keys, spinning up its own guardrails, and building its own content filtering for every provider.

**LiteLLM** solves this as a gateway into SAP Gen AI Hub. One integration point. One SAP API key. Every frontier model available to your coding agent immediately. Because SAP negotiates volume pricing with hyperscalers, the economics work at scale without a separate procurement exercise per project. In practice, this means frontier model access at a fraction of the direct-to-provider cost.

Behind that gateway, **Gen AI Hub** in AI Core handles what you would otherwise build yourself: multi-model proxy routing across SAP and non-SAP models, content filters and PII masking on every request, guardrails that apply before any response reaches your application. These are table stakes for enterprise development, not optional extras. Gen AI Hub ships them as infrastructure so your team builds on top of them instead of rebuilding them. Layer your security from the client side too: Claude Code restricts writes to the launch directory by default, and per-tool allow and deny lists in settings.json provide enforcement that does not depend on the model's judgment.

The full-stack picture: **Fiori** on the frontend, **CAP** on the backend, **Gen AI Hub** for intelligent services, **BTP** for runtime (Cloud Foundry or Kyma) and backing services like Destination and HANA Cloud for connectivity and persistence. The coding agent works across this entire stack, guided at every layer by SAP-specific tooling.

## You're Still the Architect. Agents Are the Builders.

I still review every entity definition and annotation the agent writes. That has not changed. What changed is what I find during those reviews: refinements, not fundamental mistakes. Agentic engineering is a partnership, not autopilot. You bring the judgment, set the guardrails, and own the project context. The agent brings speed, consistency, and the patience to execute the same patterns correctly at 2 AM.

That partnership breaks down the moment requirements live only in chat history. Without a persistent spec, the agent fills gaps with assumptions, each new session starts from scratch, and the further you get the harder it is to course-correct. **Spec-driven development (SDD)** solves this. Tools like **OpenSpec** and **GSD** add a lightweight specification layer (markdown files organized by capability) where you and the coding agent co-create requirements and acceptance criteria *before* any code is written. The spec becomes the contract. Every session inherits the same requirements. The agent builds to spec, not to vibes.

In practice, you set up the coding agent with MCP servers for domain knowledge, skills for repeatable workflows, and SDD tools for requirements clarity. The coding agent writes the code. SAP tooling ensures it is written correctly. Subagents handle parallel, isolated work (code review, research, exploration), each running in its own context window and returning only a concise summary, keeping your primary context focused on what matters.

The human reviews, decides, and ships.

Session after session, the coding agent accumulates your team's institutional memory — conventions, corrections, architectural decisions — making it more effective every time it runs. When you find yourself giving the same correction three times, that is a skill candidate. Write it once, and the coding agent never makes that mistake again.

For organizations scaling this across multiple teams, a **governed and centralized MCP server registry** is a security requirement, not a nice-to-have. MCP servers execute with developer privileges. An unvetted server is an unvetted dependency with shell access. Curate an approved catalog of MCP servers and skills so that any developer in your organization adopts only tooling that has been reviewed for security, data handling, and access scope.

As agentic workflows mature, **A2A (Agent-to-Agent protocol)** opens the next frontier, letting a planning agent delegate to a coding agent, or a testing agent report results back to an orchestrator. MCP equips individual agents with tools; A2A lets those agents work together. Whether that scales to a team of twenty agents working in parallel is still an open question, but one extension app is enough to prove the tooling model works.

What I took away from this experiment is simple: the coding agent was never the bottleneck. My mistake was letting it work without the right context. Once I equipped it with SAP's MCP servers, Context7, and Playwright, the same agent that had cost me hours of debugging started producing code I could actually ship.

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
