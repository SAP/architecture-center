---
id: 219c07
slug: /ref-arch/219c07
sidebar_position: 2
title: Building AI Agents with Joule Studio
description: >-
  Build, deploy and connect AI agents using Joule Studio — SAP's AI-native
  development environment. Covers both the browser-based Low-Code Flow and the
  CLI-driven Pro-Code Flow, both powered by Intent-Based Development (IBD).
keywords:
  - sap
  - ai agents
  - joule studio
  - intent-based development
  - ibd
  - low-code
  - pro-code
  - managed runtime
  - joule work
sidebar_label: Building AI Agents with Joule Studio
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - kay-schmitteckert
discussion: 
last_update:
  author: kay-schmitteckert
  date: 2026-08-25
---

**Joule Studio** is SAP's AI-native development environment for building custom agents, apps, and workflows — grounded in SAP business context and deployed to the SAP-managed runtime as part of the SAP Business AI Platform.

The underlying methodology is **Intent-Based Development (IBD)**: a structured, AI-driven workflow that takes you from a business intent all the way to a deployed, production-ready solution. IBD works by combining SAP-specific knowledge (SAP Knowledge Graph, SAP LeanIX enterprise landscape, SAP Domain Models) with a coding agent or a visual browser-based builder — depending on the flow you choose.

Both flows follow the same six phases and produce the same deployable artifact, automatically registered with Joule:

| Phase | Description |
|---|---|
| **01 Intent** | Define what you want to build |
| **02 Requirements** | Generate a Product Requirements Document (PRD) |
| **03 Specification** | Translate requirements into a technical blueprint |
| **04 Solution** | AI-driven code generation |
| **05 Testing** | Auto-generated unit tests and AI evals |
| **06 Deployment** | Deploy to SAP-managed runtime |

## Low-Code Flow

The **Low-Code Flow** uses the visual, browser-based Joule Studio builder — no local setup or coding agent required. You describe your intent in the Joule chat, and IBD guides the solution through requirements, specification, code generation, testing, and deployment, all within the browser.

This flow is ideal for business analysts, citizen developers, and professional developers who want to build quickly without managing local tooling or infrastructure.

**What you can build:**

-   **Agents** — custom AI agents tailored to your SAP landscape
-   **Agent Extensions** — custom skills, instructions, or data fields added to existing SAP agents
-   **n8n Workflows** — multi-step AI automations connecting SAP and other systems
-   **Applications** — full-stack apps (CAP backend + React frontend) for viewing and managing data

### Key Components

-   **Joule Studio (browser-based):** Visual development environment for defining agent instructions, configuring tools, orchestrating workflows, and specifying human-in-the-loop interactions.
-   **SAP Knowledge Graph:** API discovery, fit-gap analysis, and Reference Business Architecture mapping — used during intent refinement to identify relevant SAP capabilities and APIs.
-   **SAP LeanIX:** Provides your enterprise landscape context — applications, business capabilities, and organization structure — so IBD can ground the solution in your specific environment.
-   **Generative AI Hub:** Foundation models, document grounding (RAG), prompt optimization, and orchestration capabilities including data masking, I/O filtering, and translation.
-   **Managed Runtime:** Agents deploy to the SAP-managed runtime — SAP handles scaling, monitoring, and operations. Solutions are accessible immediately after deployment.

## Pro-Code Flow

The **Pro-Code Flow** uses the Joule Studio CLI (`jl`) with a coding agent (Claude Code or OpenCode) connected via MCP. IBD skills are loaded into the coding agent's context, providing SAP-specific knowledge and structured workflow guidance. You work locally in your own IDE — the same IBD phases apply, but the coding agent drives implementation.

This flow gives professional developers full programmatic control while staying grounded in SAP's APIs, processes, and best practices.

### Key Components

-   **Joule Studio CLI (`jl`):** Command-line interface for initializing projects, managing deployments, and connecting to Joule Studio landscapes.
-   **IBD Skills:** Reusable instruction sets (distributed as an NPM package) loaded into the coding agent via MCP — providing SAP-specific workflows, API access, and deployment guidance.
-   **SAP Knowledge Graph + SAP LeanIX + SAP Domain Models:** Same data sources as the Low-Code Flow — accessible via a remote MCP server connected to the coding agent.
-   **Managed Runtime:** Same deployment target as the Low-Code Flow — solutions deploy via `jl solution deploy` and register automatically with Joule.

## When to Use Joule Studio

Use Joule Studio (either flow) when:

-   Building agents, workflows, or apps that should run on SAP's managed runtime and integrate natively with Joule
-   You want SAP business context, API discovery, and best practices built into the development process
-   Speed of delivery and alignment with SAP's standard tooling are priorities

For agents that require full programmatic control outside of Joule Studio — deployed to your own BTP subaccount and connected to Joule via A2A — see [Bring Your Own Agent](../3-bring-your-own-agent/readme.md).
