---
title: Your Coding Agent Writes Code Fast. SAP Tooling Makes It Right.
description: Agentic engineering with Claude Code and SAP MCP servers bridges the gap between fast code generation and production-quality SAP development. Learn how to equip your coding agent with the right tooling.
authors: [guilherme-segantini]
keywords: ["SAP Architecture Center", "Claude Code", "Agentic Engineering", "MCP Servers", "SAP BTP", "CAP", "Fiori", "LiteLLM", "Gen AI Hub"]
hide_table_of_contents: true
date: 2026-03-30
draft: false
---

Less than thirty minutes. That is how long it took Claude Code and Opus 4.6 to build a full SAP extension app from scratch. After grounding Claude on my use cases and technical requirements, utilizing a spec-driven tool, I was trully impressed how quickly Claude built my Financial Risk Analyzer, utilizing CAP as the backend, Fiori Elements list report, OData endpoints to display financial risk classifications. I was trully happy, but that excitement unfortunetely didn't last too long.

The frontend would not render at all! I got a blank page and after several iterations of debugging with the coding agent, I got the page to display finally, but then columns that should have shown data from the CAP backend came up empty. More back-and-forth. Then I discovered the "Analyze Risks" button did nothing when clicked. The root cause was not a single bug but several issues caused by deprecated patterns, annotations that were never wired up, and naming mismatches between the controller and what Fiori Elements actually looks for. 

Yes! Coding agents like Claude write code fast, no question, but debugging after the fact turned out to be the most expensive way to use AI. That initial rush of excitement faded fast. Each fix cycle, wait for a new attempt, test again was slowly turning my enthusiasm into frustration. The real question then is not about writing code fast, but writing *correct* code. And the answer to that is not just a contextual gap. It is better equipping the agent. 


## The Problem With Unequipped Agents

Even after I fixed every bug in the Financial Risk Analyzer, I knew the app was not enterprise-ready. It worked, but it was not built on top of solid architectural principles — performance efficiency, reliability, scalability, security. That is what separates a working prototype from something you can actually ship.

And the fixes did not always stick. After I corrected my Analyze Risks button, the agent later reintroduced that very same problem because it had forgotten and applied the same old deprecated patterns in a later session. Without persistent memory of the correct approach, every session was a fresh opportunity to make the same mistakes — despite using a top-of-the-line frontier model, Opus 4.6 from Anthropic.

Here is what I came to understand. Frontier models are not lacking intelligence at all. They are really good. But the SDKs, APIs, tools, and frameworks evolve rapidly. New versions of libraries are released constantly, yet these models are trained on technical specifications that become obsolete by the time they ship. They simply cannot be trained at the speed that tools and frameworks evolve. The challenge, then, is to feed the model the right context — grounded in best practices, tooling, and sources of truth for specifications that are up to date.

Any general-purpose coding agent without domain-specific knowledge will lead you to the same problems I hit.

## The SAP Tooling Advantage

That realization led me to **Model Context Protocol (MCP) servers**, and they changed the equation entirely. While the coding agent builds code fast, MCP gives it structured, real-time access to domain expertise — not static documentation, but callable tools the agent consults while it works. MCP servers provide *capability*: they connect the coding agent to external systems and domain knowledge. For *procedural knowledge* (your team's deploy process, review checklist, CDS modeling conventions) you write skills. The two work together: a skill can tell the coding agent which MCP tools to call and in what order.

For my SAP projects, three MCP servers made the biggest difference:

- **CAP MCP Server** — guides CDS entity modeling, service definitions, and backend patterns according to current CAP conventions
- **Fiori MCP Server** — ensures Fiori Elements applications follow SAP UX guidelines, annotation patterns, and page configurations
- **UI5 MCP Server** — provides UI5 Web Components guidance, control usage, and binding patterns

Once I equipped Claude Code with these servers, it stopped guessing at SAP conventions. It checked. The coding agent queried the CAP MCP server before defining an entity, consulted the Fiori MCP server before configuring a list report page, and validated control usage against the UI5 MCP server before writing a view. Each decision was grounded in current SAP guidance, not in whatever pattern happened to appear most frequently in the training data.

When I ran the same Financial Risk Analyzer project with the CAP MCP server equipped, it got the `UI.DataFieldForAction` annotation right on the first pass. That single change saved me the hours I had spent debugging the button.

**Context7** closed a separate gap I kept running into. The model would rely on outdated or generic information about the libraries I was using — producing code based on year-old training data, hallucinating APIs that do not exist, and giving generic answers for old package versions. Context7 feeds the coding agent up-to-date, version-specific library documentation at development time, so every API call reflects what the framework actually supports *today*. SAP MCP servers guided *how* to build. Context7 ensured my agent built against *what actually exists right now*.

## Verifying What the Coding Agent Built

As we know,code that compiles is not code that works. My Fiori Elements app had complex runtime wiring — ushell containers, annotation bindings, OData initialization — and a page that passed linting still rendered as a blank screen. Without browser access, the coding agent could not catch this class of bug. I would open the app, see the blank page, paste the error back into the chat, and repeat. 

**Playwright MCP** gave my coding agent eyes on the running application. After generating a Fiori Elements page, the agent launched a headless browser, took screenshots, and verified the page actually rendered. When something was broken, it iterated without waiting for me to open a browser and report what went wrong. That is the concrete mechanism behind agentic engineering: coding agents that create code, test, iterate, and debug *independently*.

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

**A note on trust:** MCP servers execute with your local privileges: filesystem access, shell commands, network calls. A compromised or malicious server can exfiltrate code, inject backdoors, or leak credentials silently. My recommendation to you: only adopt MCP servers that have been verified from the security standpoint entirely.

Also, as you know, you don't want to dump a lof of instructions to Claude due to Context Rot concerns, instead, keep your CLAUDE.md short (under 200 lines) and be very specific. It's okay to reference other md files there. Claude won't need them all, but keep them as reference when needed. 

Do you think that's all? No, because code that runs is not code ready for the enterprise. The agent was capable of writing valid SAP code but it wasn't yet grounded with technical specifications based on the enterprise  architecture principles.

## Beyond Correctness: Architecture Principles

When I reviewed my working Financial Risk Analyzer — the one MCP had gotten right on the first pass — I found an unscoped OData endpoint and no input validation. The SAP patterns were correct but security was missing. And security was just the first gap. Performance efficiency, reliability, scalability — the principles you apply before you design any enterprise solution, were not considered entirely for the generated code.

A system design methodology was needed. Tradicionally, by experience, I'd write the technical specification with certain level of information. Even documentation the most important parts would take me some time. You might have heard about spec-driven development, where AI helps you documenting the project scope and ellaborate the necessary documentation needed. That lead me to **GSD (Get Shit Done)**, a spec-driven development framework for Claude Code. That was a life changing moment for me. Even before I let my agent procude the code, GSD interviewed me about each architecture principle — security posture, performance budgets, reliability expectations, scalability constraints. But only after I grounded it on my architectural principles from the SAP Architecture Center. Those were the questions I would ask as an architect before designing any solution, but now the agent was asking them. My answers became a technical specification grounded in the same enterprise principles that the [SAP Architecture Center](https://architecture.sap.com) codifies as reference architectures.

The difference was immediate. That was the right moment I really started realizing the time savings benefits.  With a spec shaped by architecture principles, the agent did not just write correct SAP code — it wrote code that reflected the non-functional requirements an enterprise application actually needs. Every session inherited that spec. No context rot. No re-explaining the same constraints. 

## Secure the Code Your Agent Writes. It Won't Do It for You.

Here's a piece of advice. Even after equipping your agent, **always assume code is untrusted**. MCP servers teach convention. GSD captures technical spec. But neither can guarantee the generated code is hardened. That's why my recommendation to you is simple. Continue applying the same rigor to to safeguard your clients. The same secure coding review I would apply to human-written code — input validation, authorization checks, secrets management, OWASP top-10, etc. Security hardening like CORS, CSP headers, and OData authorization scoping remains your responsibility, not to your agent. In a case of a data breach, I'm sure they aren't going to escalate it to your agent, but you. 

I also learned to protect my sessions. This principle is easy and simple to understand. You should only expose data it needs. And never enter any personal data or customer data into coding agent prompts. I never open files containing credentials or service keys while the agent is active, because anything it reads becomes model context. Ensure to tell Claude which files it should absolutely not read. List them in the `.claudeignore` to exclude the `.env`, `default-env.json`, and service keys in general from the agent's view. Although contracts guarantee data protection by model providers, a data breach problem tomorrow on their side may compromise your company.

I'm sorry to share the bad news, but there's more you should know. And this one is not dimished in value just because shows up here after all you've read so far.

## Enterprise Agents Need Governed Infrastructure.

When my coding agent sends code to a model, it carries business logic and intellectual property. I need a contractual guarantee that none of it gets used for training or sold to a third party. Going direct to model providers does not give me that through a single agreement. Running through SAP's **Gen AI Hub** does — SAP's agreements with providers ensure your data stays yours.

That same infrastructure solves a second problem. Agentic workflows benefit from multiple frontier models — strengths vary by task, and a second opinion from a different model is a real advantage. **LiteLLM** gives me a single gateway into Gen AI Hub: one integration point, one SAP API key, every frontier model available immediately, at volume pricing SAP negotiates with hyperscalers. Behind that gateway, Gen AI Hub handles content filters and PII masking on every request — guardrails I would otherwise have built myself.

The full-stack picture: **Fiori** on the frontend, **CAP** on the backend, **Gen AI Hub** for intelligent services, **BTP** for runtime and backing services like Destination and HANA Cloud. The coding agent works across this entire stack, guided at every layer by SAP-specific tooling.

## You Are the Architect of Your Agents

Here is how I work now. I write the spec before I write any code — architecture principles, security posture, non-functional requirements, all captured upfront. I equip my coding agent with SAP MCP servers so it checks conventions instead of guessing. I give it Playwright so it verifies its own work in the browser. I run every request through governed infrastructure so my company's IP stays protected. And I review every entity definition, every annotation, every endpoint — not because the agent cannot be trusted, but because I am the one who ships it.

That is the AI way of building software. Not faster typing — better engineering.

What I took away from building the Financial Risk Analyzer is simple: the coding agent was never the bottleneck. I was — when I let it work without the right context. MCP servers, architecture principles, and a spec-driven workflow turned the same model that cost me hours of debugging into one that produced enterprise-grade code I could actually ship. And this applies beyond cloud-native apps — the same workflow extends to S/4HANA on-premise scenarios, BTP extensions, anywhere SAP customers need to move faster without touching the core.

**Start with equipping your coding agent with the [CAP](https://www.npmjs.com/package/@cap-js/mcp-server), [Fiori](https://www.npmjs.com/package/@sap-ux/fiori-mcp-server), and [UI5](https://github.com/niclas-nickel/ui5-mcp-server) MCP servers. Write the spec before any code. Review everything. Ship with confidence.** The tooling exists. The architecture principles are documented. And the competitive advantage? It is not the agent itself. It's about combining it to build intelligent apps to work on top top of your master data, and business processes that your SAP systems already hold. Equipped agents turn that data into applications in hours instead of months. The companies that ground their agents in the right tooling and build on the data they already own will not just move faster — they will set the pace. Are you ready to apply these best practices to accelerate transformations?

## References

**SAP MCP Servers**
- [CAP MCP Server](https://community.sap.com/t5/technology-blog-posts-by-sap/boost-your-cap-development-with-ai-introducing-the-mcp-server-for-cap/ba-p/14202849) — MCP server for SAP Cloud Application Programming Model (CAP) development
- [Fiori MCP Server](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-fiori-tools-update-first-release-of-the-sap-fiori-mcp-server-for/ba-p/14204694) — Helps AI models create and modify SAP Fiori applications
- [UI5 MCP Server](https://community.sap.com/t5/technology-blog-posts-by-sap/give-your-ai-agent-some-tools-introducing-the-ui5-mcp-server/ba-p/14200825) — UI5 Web Components development assistance

**Agentic Engineering & Spec-Driven Development**
- [GSD (Get Shit Done)](https://github.com/gsd-build/get-shit-done) — Meta-prompting, context engineering, and spec-driven development system for coding agents
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) — Spec-driven development tool that adds a lightweight specification layer before code is written

**Developer Tooling MCP Servers**
- [Context7](https://github.com/upstash/context7) — Up-to-date code documentation for any prompt
- [Playwright MCP](https://github.com/anthropics/anthropic-quickstarts/tree/main/playwright-mcp) — Headless browser automation for coding agents — navigate, screenshot, and verify UI

**SAP Platform**
- [LiteLLM SAP Provider](https://docs.litellm.ai/docs/providers/sap) — Gateway to SAP AI Foundation via Gen AI Hub
- [Claude Code Documentation](https://code.claude.com/docs) — Official Claude Code docs, skills, MCP, and quickstart guides