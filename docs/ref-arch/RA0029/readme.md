---
id: 98efa0
slug: /ref-arch/98efa0
sidebar_position: 300
title: Agentic AI & AI Agents
description: >-
  Build, integrate and orchestrate AI agents on the SAP Business AI Platform.
  This reference architecture covers the full spectrum — from Joule Work and
  Joule Assistants to Joule Studio, pro-code agents with SAP Cloud SDK for AI,
  A2A and MCP interoperability and integration with the SAP Autonomous Suite.
keywords:
  - sap
  - ai agents
  - joule
  - joule work
  - joule studio
  - joule assistants
  - autonomous enterprise
  - autonomous suite
  - business ai platform
  - a2a
  - agent2agent
  - mcp
  - pro-code
  - ibd
  - intent-based-development
  - low-code
  - btp
  - generative ai hub
  - sap cloud sdk for ai
  - ai agent hub
  - leanix
sidebar_label: Agentic AI & AI Agents
image: img/ac-soc-med.png
tags:
  - genai
  - agents
  - appdev
  - aws
  - gcp
  - azure
  - ibm
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - kay-schmitteckert
  - micinit
  - mar-hol
discussion: 
last_update:
  author: kay-schmitteckert
  date: 2026-08-27
---

:::info Disclaimer
Some components and capabilities of this reference architecture are not yet generally available (GA) — the current architecture reflects a transitional state highlighting the relevant building blocks for an agentic architecture based on SAP Business AI Platform. In particular the bidirectional communication with 3rd-party and self-hosted agents through Agent Gateway is not yet supported. Full bidirectional capabilities are expected to be released soon and will evolve the architecture accordingly.
:::

AI agents represent a new paradigm in enterprise software — combining large language models with tools, memory and reasoning to autonomously execute complex, multi-step business tasks. In the SAP ecosystem, agents bridge intelligent automation and core business processes, enabling systems to dynamically adapt, reason and act in real time.

SAP's approach centers on **Joule** as the unified AI engagement layer: **Joule Work** is where users express intent and AI orchestrates outcomes across systems; **Joule Assistants** coordinate agents across business functions; and **Joule Agents** handle the specific, multi-step tasks that drive real process automation. Custom agents built by customers, partners or SAP line-of-business teams connect to this ecosystem via open standards — A2A for agent-to-agent collaboration and MCP for tool connectivity — enabling a composable, interoperable agent landscape that extends into any third-party AI platform.

This reference architecture is a comprehensive guide to developing, deploying and managing AI agents in the SAP ecosystem, powered by the [SAP Business AI Platform](https://www.sap.com/products/artificial-intelligence/ai-platform.html). It covers architectural patterns, components and best practices for building agents — from building agents in Joule Studio on a managed runtime to bringing your own agent built with SAP Cloud SDK for AI — and for integrating them with Joule and the broader enterprise landscape.

## Architecture

The core architecture for AI agents at SAP is built on the [SAP Business AI Platform](https://www.sap.com/products/artificial-intelligence/ai-platform.html) — an enterprise AI foundation combining deep process context, trusted data and enterprise-grade governance.

![drawio](./drawio/architecture.drawio)

The architecture centers on the **SAP Business AI Platform** — SAP-managed, encompassing Joule Work and its agent runtime — and the **SAP Autonomous Suite**, where agents execute across all lines of business. Custom agents can be built in Joule Studio and deployed to the SAP-managed runtime or developed and deployed to a customer-managed BTP subaccount. 3rd-party AI systems connect via open standards (A2A, MCP). Cross-cutting concerns such as trust, authentication and agent governance are handled by **SAP Cloud Identity Services** and **SAP LeanIX AI Agent Hub**.

### SAP Business AI Platform

The SAP Business AI Platform is SAP's enterprise AI foundation combining deep process context, trusted data, and enterprise-grade governance. SAP Business Technology Platform capabilities are a core part of SAP Business AI Platform, enabling organizations to build, integrate, manage, and run enterprise AI agents, apps, and workflows. The platform is organized around three pillars: **Build** — tools to develop and deploy agents, apps, and workflows; **Contextualize and Reason** — harmonized business data, semantics, and domain knowledge that ground every agent in real business processes; and **Govern** — lifecycle management, observability, and compliance across the full agent landscape.

#### Joule Work

[**Joule Work**](https://www.sap.com/products/artificial-intelligence/joule-work.html) is SAP's central workspace where AI agents handle routine work so people can focus on driving outcomes. Users express a goal and Joule orchestrates actions across SAP and non-SAP systems to get it done. The experience is available across web, desktop and mobile and surfaces through three interfaces: **Conversations** for dialogue-driven intent and task execution, **Spaces** for goal-oriented, persistent workstreams with full context and the **Develop** interface for building and managing agents and automations via Joule Studio. Joule Work coordinates work through **Joule Assistants** — role- and process-aware AI from the SAP Autonomous Suite — and **Joule Agents**, which handle the specific multi-step tasks across business functions. All of this is powered by the **Joule Orchestrator (Agent Harness)**: a multi-step reasoning and orchestration engine that routes requests to agents and loads the tools and skills needed to execute them, including built-in capabilities for grounding and data access across SAP's application landscape.

**Joule Studio** is SAP's AI-native development environment for building custom agents, apps, and workflows — grounded in SAP business context and deployed to the SAP-managed runtime. The underlying methodology is **Intent-Based Development (IBD)**: a structured, AI-driven workflow from intent to deployed solution, powered by SAP Knowledge Graph, SAP LeanIX enterprise landscape data, and SAP Domain Models. Two flows are available: a **Low-Code Flow** using the visual, browser-based builder (no local setup required), and a **Pro-Code Flow** using your own IDE with the Joule Studio CLI and a coding agent connected via MCP. Both follow the same six phases — intent, requirements, specification, code generation, testing, deployment — and produce the same deployable artifact, automatically registered with Joule.

#### Agent Gateway

The central integration layer of the SAP Business AI Platform — responsible for discovery and execution of agentic resources. Both Joule and agents connect to tools and business capabilities through the Agent Gateway, which centrally handles authentication, principal propagation, policy enforcement and tenancy. Read more about [A2A and MCP for Interoperability](./1-a2a-and-mcp/readme.md), [Integrating AI Agents with Joule](./4-integrate-ai-agents-with-joule/readme.md) and [Integrating Joule Agents into Your Ecosystem](./5-integrate-joule-agents-and-tools-into-your-ecosystem/readme.md).

#### SAP Signavio — Agent Mining

Observability and continuous improvement of AI agents — providing behavioral tracing, process conformance analysis, performance benchmarking and business impact measurement across the agent landscape. Read more about [Agent Behavior Mining](./9-agent-behavior-mining/readme.md).

#### SAP LeanIX — AI Agent Hub

[**SAP AI Agent Hub**](https://www.sap.com/products/artificial-intelligence/ai-agent-hub.html) is a vendor-agnostic command center for the discovery and governance of AI agents, LLMs and MCP servers across the enterprise. It maintains a structured registry of all AI assets — regardless of origin — grounded in their architecture and business context. Key capabilities include evaluation and verification workflows (only verified MCP servers can be called in production), identity and access control for agents and MCP servers, and AI observability with session health and tool call tracing.

### SAP Business Technology Platform (BTP)

The customer's own BTP subaccount hosts self-managed agents and integrations — connected to the SAP Business AI Platform via A2A and MCP.

-   **Custom Agents — Bring Your Own Agent:** Pro-code AI agents built with SAP Cloud SDK for AI (Python or TypeScript), deployed in the customer's BTP subaccount and connected to Joule via the A2A protocol. Supports frameworks including LangGraph, AG2, CrewAI, Smolagents, Google ADK and Pydantic AI. Read more about [Bring Your Own Agent](./3-bring-your-own-agent/readme.md).

-   **MCP Gateway in SAP Integration Suite:** Customer-managed, governed MCP exposure for SAP and non-SAP APIs. Provides enterprise-grade tool access with security, rate limiting, observability and lifecycle management built in — without requiring custom MCP server development. API usage is subject to the [SAP API Policy](https://help.sap.com/doc/sap-api-policy/latest/en-US/API_Policy_latest.pdf). Read more about [Third-Party MCP Access to SAP Solutions](./10-third-party-mcp-access/readme.md).

### SAP Autonomous Suite

The [**SAP Autonomous Suite**](https://www.sap.com/products/business-applications.html) is SAP's integrated suite of applications where agents and workflows run continuously across every part of the business — five domains operating as one. People set direction and AI executes, with human-AI collaboration built in at every step: supervision, approvals and clear accountability. Grounded in decades of SAP process and industry expertise, the suite spans: **Autonomous Finance, Autonomous Spend, Autonomous SCM, Autonomous HCM, Autonomous CX** and **Industry AI**.

### 3rd Party Integration

External AI platforms, clients and tools connect to the SAP agent ecosystem via open standards — either consuming Joule Agents or providing additional capabilities to agents.

-   **Tools:** External MCP Servers and APIs that extend agent capabilities and provide additional data sources and actions.

-   **AI Agents & Clients:** Google Cloud, Microsoft Azure, AWS, IBM Cloud and other AI platforms and clients — either consuming Joule Agents via the Agent Gateway (A2A) or being orchestrated by Joule for SAP-specific tasks. Read more about [Integrating Joule Agents into Your Ecosystem](./5-integrate-joule-agents-and-tools-into-your-ecosystem/readme.md) and [Integrating AI Agents with Joule](./4-integrate-ai-agents-with-joule/readme.md).

### Security & Agent Identity

**SAP Cloud Identity Services** is the identity hub — managing authentication, authorization and identity federation across all connections. It acts as identity provider, proxy or broker and federates with third-party identity providers and identity management systems to establish trust across the full enterprise landscape.

In an agentic architecture, agents act on behalf of users and systems, which means identity must extend beyond humans. SAP Cloud Identity Services supports two agent operation models: agents acting within a user's context (with agent-specific permission constraints) and autonomous agents operating independently with their own dedicated technical identity, tokens and audit trail. The effective permission at runtime is the intersection of user permissions and agent permissions — enforced by the Agent Gateway at every communication hop. Read more about [Agent Identity](./8-ai-agent-identity/readme.md).

## Building and Connecting Agents

SAP supports two paths for building agents and multiple patterns for connecting them into the broader enterprise landscape — all based on open standards.

**Joule Studio:** Build agents, workflows, and applications grounded in SAP business context, deployed to the SAP-managed runtime. Powered by Intent-Based Development (IBD) — a structured AI-driven workflow from intent to deployment. Two flows are available: a **Low-Code Flow** using the visual browser-based builder, and a **Pro-Code Flow** using your own IDE with the Joule Studio CLI and a coding agent via MCP. Both produce the same artifact, automatically registered with Joule. Read more about [Building AI Agents with Joule Studio](./2-building-ai-agents-with-joule-studio/readme.md).

**Bring Your Own Agent:** Develop agents with full programmatic control using SAP Cloud SDK for AI (Python or TypeScript) and integrate popular frameworks (LangGraph, AG2, CrewAI, Smolagents). Deploy to the customer's BTP subaccount as a self-managed runtime and connect to Joule via the A2A protocol. Read more about [Bring Your Own Agent](./3-bring-your-own-agent/readme.md), [AI Agents for Structured Data](./6-ai-agents-for-structured-data/readme.md) and [Agentic Engineering for SAP Extensions](./7-agentic-engineering-for-sap-extensions/readme.md).

**Inbound (Agent Gateway — A2A):** Third-party AI platforms and clients consume Joule Agents through the Agent Gateway via A2A. Google Vertex AI, Microsoft Copilot Studio, AWS Bedrock and others can delegate SAP-specific tasks to Joule Agents, with trust established via SAP Cloud Identity Services. Read more about [Integrating Joule Agents into Your Ecosystem](./5-integrate-joule-agents-and-tools-into-your-ecosystem/readme.md).

**Outbound (Bring Your Own Agent — A2A):** Joule orchestrates external agents built with any A2A-compliant framework. Supports synchronous communication, asynchronous callbacks for long-running tasks and multi-turn conversations with context handling. Read more about [Integrating AI Agents with Joule](./4-integrate-ai-agents-with-joule/readme.md).

**Third-Party MCP Access:** External MCP clients — such as Microsoft Copilot Studio — can connect to SAP business capabilities via the MCP Gateway in SAP Integration Suite, providing governed, enterprise-grade tool access without custom MCP server development. Read more about [Third-Party MCP Access to SAP Solutions](./10-third-party-mcp-access/readme.md).

**Open Standards:** SAP uses A2A as the preferred standard for multi-agent collaboration and MCP for semantic tool connectivity — ensuring the platform is open to any A2A- or MCP-compliant agent or tool, regardless of vendor or framework. Read more about [Agent & Tool Interoperability](./1-a2a-and-mcp/readme.md).

## Services and Components

-   [SAP Business AI Platform](https://www.sap.com/products/artificial-intelligence/ai-platform.html)
-   [Joule Work](https://www.sap.com/products/artificial-intelligence/joule-work.html)
-   [Joule Studio](https://www.sap.com/products/artificial-intelligence/joule-studio.html)
- [SAP Autonomous Suite](https://www.sap.com/products/business-applications.html)
-   [SAP Cloud SDK for AI](https://help.sap.com/docs/sap-cloud-sdk)
-   [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)
-   [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/cloud-identity-services?region=all)
-   [SAP Business Technology Platform](https://www.sap.com/products/technology-platform.html)

## Examples

Take a look at the following examples that build upon or implement elements of this Reference Architecture:
- [Reference Implementation for A2A-Compliant Pro-Code Agents on SAP BTP with Joule Integration](https://github.com/SAP-samples/btp-joule-a2a-pro-code-agent): Modular reference implementation covering a full-fledged agentic scenario end to end including Joule Integration via the A2A Protocol.
- [SAP A2A Agent Toolkit Plugin](https://github.com/SAP-samples/joule-a2a-agent-toolkit/): Build, deploy and connect AI agents to SAP Joule via the A2A (Agent-to-Agent) protocol on BTP Cloud Foundry — all from Claude Code.
