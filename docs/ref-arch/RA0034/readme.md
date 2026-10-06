---
id: jkg4j2
slug: /ref-arch/jkg4j2
sidebar_position: 1
title: SAP AI Agent Hub
description: >-
  Govern and manage AI agents throughout their lifecycle with SAP AI Agent Hub — the enterprise command center for AI governance that brings architecture intelligence, multi-cloud discovery, observability, and compliance to your growing agent estate.
keywords:
  - sap
  - sap leanix
  - sap ai agent hub
  - agent governance
  - agent registry
  - agent lifecycle
  - agent observability
  - mcp registry
  - ai governance
  - eu ai act compliance
  - agent mining
  - business ai platform
sidebar_label: SAP AI Agent Hub
image: img/ac-soc-med.png
tags:
  - agents
  - genai
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - perbernhardt
  - fabianleh
discussion:
last_update:
  author: perbernhardt
  date: 2026-10-01
---

As AI agents proliferate across enterprise systems — spanning SAP, third-party cloud platforms, and custom deployments — organizations need a systematic way to discover, verify, observe, and govern their entire agent estate. **SAP AI Agent Hub** is the enterprise command center for AI governance: a single platform that brings enterprise architecture discipline to AI agent management, built on SAP LeanIX.

The hub addresses a fundamental challenge: while building and deploying individual agents is increasingly straightforward, governing the resulting landscape at scale is not. SAP AI Agent Hub makes the agent estate visible, manageable, and compliant — from the initial planning of a new agent through to its eventual decommissioning.

## Architecture

![drawio](drawio/ai-agent-hub.drawio)

## Flow

1. **SAP AI Agent Hub** is the central governance platform for AI agents in the enterprise. Agent metadata from every source — SAP agents, custom agents, and third-party agents — flows into the hub's registry, which maintains a unified inventory across the entire agent estate. It also offers a MCP Server to surface architectural context from the hub into development environments, ensuring builders work with the right business and technical context from day one.

2. An **Agent Manager** — typically an enterprise architect or IT governance lead — uses the hub to discover agents, map them to enterprise architecture, verify and activate them, monitor usage and resource access, adjust permissions, and decommission agents at end of life.

3. Agent telemetry from supported SAP-managed agent runtimes flows into **SAP Signavio** for behavioral process analysis and into SAP Cloud ALM for operational monitoring.
4. **SAP SuccessFactors** provides the organizational dimension, mapping agents to business units and roles.

4. **SAP Cloud Identity Services** manages agent identities and acts as the authority for access control. Registering an agent in the hub triggers provisioning flows that create the corresponding agent identity record and align it with enterprise access policies. See [Agent Identity](../RA0029/8-ai-agent-identity/readme.md) for the detailed identity architecture.

5. The **SAP Agent Gateway** forms the runtime enforcement point: SAP and third-party agents route their requests through it, and the gateway applies the access control policies defined in the hub. The gateway connects agents to MCP servers, SAP applications, Integration Suite adapters, and external systems.

## Agent Lifecycle

SAP AI Agent Hub manages AI agents across five interconnected lifecycle phases.

### Plan & Build

Create agents with the right architecture context from day one. Enterprise architects use the hub to plan new agent initiatives, evaluate fit against the existing technology landscape, and ensure new agents align with organizational strategy. SAP LeanIX provides the architecture inventory — existing applications, business capabilities, IT components, data objects, and processes — as the context layer for agent design and governance.

Joule Studio integrates with the hub via the LeanIX MCP server, surfacing architectural context during agent creation so developers work with the right building blocks and business alignment from the start. Architecture decisions made in the hub inform and constrain what agents are built, on which technology, and for which purpose.

### Discover & Provision

Build a rich, up-to-date inventory of all agents operating in the landscape. SAP AI Agent Hub automatically discovers agents across SAP and non-SAP environments through managed integrations:

- **SAP agents**: Standard agents delivered by SAP, custom agents built on Joule Studio, and extended partner-built agents
- **Third-party agents**: Agents deployed on Microsoft Azure, Google Cloud, AWS, ServiceNow, and Databricks
- **Local agents**: Agents running in developer environments, including Claude Code (in preview)
- **MCP servers**: Discovered via Integration Suite connectors and MCP Builder
- **LLMs**: Discovered via SAP AI Core

Discovered agents populate the agent registry with standardized fact sheets capturing identity, ownership, capabilities, technology stack, and governance status. The hub surfaces contextually relevant agent suggestions based on the customer's specific architecture landscape, helping teams identify the right agent for any task — or whether a new one needs to be built at all.

Provisioning aligns agent access and permissions with enterprise standards through SAP Cloud Identity Services integration. Verification checkpoints guide agent rollout — agents that have not passed the required governance checks remain in a pending state until cleared.

### Observe & Analyze

Turn observable agent telemetry into actionable intelligence. SAP Cloud ALM receives session telemetry from SAP-managed agents and delivers dedicated agent dashboards with evaluation rates, error root causes, session volumes, and performance trends over time. Architects and operations teams can monitor real-time agent performance against defined KPIs, detect anomalies before they impact business operations, and generate insights that inform agent strategy and investment decisions.

### Secure & Govern

Ensure agents act within organizational guardrails, policies, and processes:

- **Ownership and accountability**: Every registered agent has a clear owner and responsible party
- **Architecture review**: Continuous verification that agents conform to enterprise architecture standards and alignment with business capabilities and processes
- **Verification records**: Structured compliance records for each agent and MCP server, capturing assessment results and architecture review outcomes
- **EU AI Act compliance**: Risk assessment meta model extensions and a purpose-built survey capability enable organizations to classify agents by risk category, complete required documentation, and manage ongoing compliance obligations
- **Runtime enforcement**: The SAP Agent Gateway applies access control policies at runtime, ensuring agents only invoke permitted tools, APIs, and data sources

### Optimize & Decommission

Maximize the impact of the agent estate while managing its complexity. Agent behavior mining through SAP Signavio Process Intelligence reveals how agents actually behave in production: how they navigate process steps, where they deviate, and what they cost to run. These insights surface optimization opportunities, identify redundant or underperforming agents, and provide the data-driven foundation for decommissioning decisions with minimal disruption.

SuccessFactors integration adds the organizational perspective: as agents take on tasks previously performed by people, the skills mapping capability helps organizations understand how roles and required competencies are shifting, and plan accordingly.

## Core Capabilities

### Agent & MCP Registry

The central catalog of all AI artifacts in the enterprise landscape — agents, MCP servers, and LLMs. Each entry is a fact sheet capturing standardized attributes: identity, ownership, technology stack, business capabilities served, and governance status. The registry connects to the broader LeanIX architecture inventory, enabling architects to understand how agents relate to applications, processes, data objects, and IT components across the landscape.

The registry covers three categories of SAP-originated agents:

- **Standard agents**: Pre-built agents delivered by SAP
- **Custom agents**: Agents built on Joule Studio by customers
- **Extended agents**: Partner-built agents available through the SAP ecosystem

The hub maintains a reference catalog with SAP-curated suggestions — recommending agents relevant to the customer's specific architecture landscape based on their existing context and the inventory of available agents.

### Agent Evals & Assessment

Structured assessment and verification for agents and MCP servers. Verification records capture evaluation outcomes, compliance checks, and architecture review results. The EU AI Act risk assessment extension enables organizations to classify agents by risk category and manage ongoing compliance obligations. An AI governance assistant (in preview) helps teams navigate assessment processes and interpret governance requirements.

### Identity & Access Control

SAP Cloud Identity Services manages agent identities alongside human identities. The hub drives the full agent identity lifecycle: registering a new agent creates the corresponding identity record in SAP Cloud Identity Services, provisioning flows align role and permission assignments, and ongoing governance ensures agent access remains appropriate as capabilities and organizational requirements evolve. See [Agent Identity](../RA0029/8-ai-agent-identity/readme.md) for the detailed identity architecture.

### Agent Observability

Session telemetry from SAP-managed agents flows into SAP Cloud ALM, where dedicated agent dashboards surface evaluation rates, error patterns, session volumes, and performance trends over time. This observability layer enables proactive detection of anomalies and provides the operational data needed for continuous improvement.

### Agent Mining

Signavio Process Intelligence ingests agent execution traces via a dedicated AI Agent Mining connector. Once mining is enabled for an agent type in the hub, telemetry is routed to the connector, which normalizes it into an event log structure for behavioral analysis. Signavio surfaces process conformance issues, cost drivers, and performance benchmarks. See [Agent Behavior Mining](../RA0029/9-agent-behavior-mining/readme.md) for the detailed mining architecture.

### Agent Org & Skills Mapping

Integration with SAP SuccessFactors maps the agent estate to the organizational structure, revealing which teams, business units, and roles interact with which agents. This organizational dimension supports impact analysis, change management, and the emerging discipline of workforce planning as agents reshape job functions and required competencies across the enterprise.

## SAP Integrations

| Integration | Role |
|---|---|
| **SAP LeanIX** | Foundation platform; architecture inventory, fact sheets, architecture decisions, EA context |
| **SAP Cloud ALM** | Agent observability; session telemetry, performance dashboards, lifecycle management |
| **SAP Signavio Process Intelligence** | Agent mining; behavioral analysis, conformance checking, impact measurement |
| **SAP SuccessFactors** | Org chart integration; agent-to-workforce mapping and skills planning |
| **SAP Cloud Identity Services** | Agent identity store; authentication, authorization, and identity lifecycle management |
| **SAP Integration Suite** | MCP server management; MCP Builder for publishing and governing MCP servers |
| **Joule Studio** | Agent development; LeanIX MCP server surfaces architecture context during agent creation |

## Services and Components

- [SAP AI Agent Hub](https://help.sap.com/docs/leanix/ea/ai-agent-hub?locale=en-US)
- [SAP LeanIX](https://www.sap.com/products/erp/enterprise-architecture-tool.html)
- [SAP Cloud ALM](https://discovery-center.cloud.sap/serviceCatalog/sap-cloud-alm)
- [SAP Signavio Process Intelligence](https://help.sap.com/docs/signavio-process-intelligence?locale=en-US)
- [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/cloud-identity-services?region=all)
- [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)
- [Joule Studio](https://www.sap.com/products/artificial-intelligence/joule-studio.html)
- [SAP SuccessFactors](https://www.sap.com/products/hcm.html)
