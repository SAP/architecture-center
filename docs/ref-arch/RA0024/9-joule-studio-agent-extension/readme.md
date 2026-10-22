---
id: 67ghj3
slug: /ref-arch/67ghj3
sidebar_position: 10
title: Joule Studio Agent Extension
description: An overview of extending Joule Studio with custom agents, covering architecture, extension patterns, and guidance for adoption.
sidebar_label: Joule Studio Agent Extension
keywords:
  - sap
  - joule studio
  - agent extension
  - ai agents
  - sap btp
image: img/ac-soc-med.png
tags:
  - genai
  - agents
  - build
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - yannick-besnehard
last_update:
  author: yannick-besnehard
  date: 2026-09-17
---


SAP delivers a growing catalog of standard AI agents across its Autonomous Suite — Finance, HCM, SCM, Spend, CX, and more. These agents are powerful out of the box, but every enterprise runs its processes a little differently. An **Agent Extension** lets you tailor an already-deployed SAP standard agent to your business context **without rebuilding it and without touching its source code**.

Instead of forking an agent, you author an extension as a separate solution asset in [Joule Studio](/docs/ref-arch/ff07b1) that augments a base agent at runtime. The base agent stays unmodified and continues to receive SAP updates; your customizations are layered on top and resolved by the platform on every invocation.

An extension can add three kinds of capabilities, and the agent developer controls which of them are open for extension:

- **Instructions** — additional context injected into the agent's system prompt to steer its behavior toward your policies, tone, or domain knowledge.
- **Tools** — new capabilities surfaced through Model Context Protocol (MCP) servers, giving the agent access to data and actions beyond its built-in toolset.
- **Execution hooks** — n8n workflows that run *before* (pre-hook) or *after* (post-hook) the agent processes a request, for validation, enrichment, notifications, or downstream automation.

## Architecture

The architecture diagram shows how Agent Extensions fit into the SAP Business AI Platform and the Joule experience.

![drawio](drawio/agent-extension.drawio)

## Flow

An Agent Extension moves through three stages — from authoring, to deployment, to runtime consumption:

1. **Extend** — In Joule Studio, a builder chooses an extensible SAP standard agent and declares what the extension adds: instructions, MCP tools, and/or pre/post hooks. The agent's own definition governs which of these surfaces are available.

2. **Deploy** — The extension is packaged and deployed independently from the base agent. Its dependencies (MCP servers, n8n workflows) are resolved during deployment, and the extension's implementation metadata is published so the platform can find it at runtime.

3. **Consume** — When a user's request reaches the base agent through Joule, the Agent Gateway resolves the active extensions and merges them into that invocation. Instructions are added to the prompt, extension tools become available alongside the agent's own, and hooks run before and after execution. The base agent remains stateless with respect to extensions — the extension layer is re-resolved on every call.

## Characteristics

- **Extend without forking**: Add capabilities to SAP standard agents without modifying or rebuilding them. The base agent keeps receiving SAP updates while your customizations remain cleanly separated.

- **Capability-driven surface**: What can be extended is declared by the agent developer, so extensions stay within the boundaries the base agent supports — instructions, tools, and hooks are only available where the agent opts in.

- **Composable capabilities**: Combine additional instructions, MCP-based tools, and pre/post execution hooks to tailor an agent to a specific business process.

- **Independent lifecycle**: Extensions are deployed and versioned separately from the base agent, enabling safe iteration without touching the underlying agent.

- **Runtime-resolved and governed**: The Agent Gateway merges extensions into each invocation within the managed runtime, so logging, audit logging, and enterprise identity controls apply consistently to extended behavior.

## Examples in an SAP context

- **AP Invoice Agent Extension**: Adds a post-processing hook that triggers an n8n workflow when invoice matching fails, routing the exception to the right approver.

- **Policy-aware instructions**: Injects company-specific spend or travel policy as additional instructions so a standard agent's responses respect internal rules without changing the agent itself.

- **Custom tool augmentation**: Surfaces an MCP server tool that exposes a proprietary or third-party data source, letting a standard agent answer questions it could not before.

## References

- [Joule Studio — SAP Product Page](https://www.sap.com/germany/products/artificial-intelligence/joule-studio.html)
- [Solution Types — SAP Help Portal](https://help.sap.com/docs/joule-studio/joule-studio/solution-types?version=CLOUD&ai=true)
