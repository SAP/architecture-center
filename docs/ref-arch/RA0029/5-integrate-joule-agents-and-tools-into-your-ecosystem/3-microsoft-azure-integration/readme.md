---
id: a2c0f1
slug: /ref-arch/a2c0f1
sidebar_position: 3
title: Microsoft Copilot Integration with Joule Agents
description: >-
  Integrate Microsoft Copilot with Joule Agents through the SAP Agent Gateway, using Copilot Studio as the orchestration layer with Microsoft Entra ID and SAP Cloud Identity Services federation.
keywords:
  - sap
  - joule agents
  - agent gateway
  - a2a
  - microsoft copilot
  - microsoft copilot studio
  - microsoft entra id
  - sap cloud identity services
  - identity propagation
  - principal propagation
  - business ai platform
sidebar_label: Microsoft Copilot
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - azure
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - kay-schmitteckert
  - niklas-dziwisch
  - hobru
  - mar-hol
discussion: 
last_update:
  author: kay-schmitteckert
  date: 2026-10-23
---

:::info Disclaimer
Some components and capabilities of this reference architecture are not yet generally available (GA) - the current architecture reflects a transitional state that highlights the relevant building blocks for an agentic architecture based on SAP Business AI Platform. In particular, the [Agent Gateway](../../1-a2a-and-mcp/readme.md#architecture) is not yet GA. The patterns outlined here show how the integration between Microsoft Copilot Studio and SAP can be done today and will evolve as those capabilities are released.
:::

**[Microsoft Copilot](https://www.microsoft.com/copilot)** is Microsoft's AI assistant embedded across Microsoft 365, Teams, and other Microsoft surfaces. [Microsoft Copilot Studio](https://www.microsoft.com/copilot/products/copilot-studio) is the low-code platform used to extend and customize Copilot with additional agents and actions. If you are new to it, start with the [Microsoft Copilot Studio documentation](https://learn.microsoft.com/microsoft-copilot-studio/).

This page describes the **inbound** direction - **Microsoft Copilot**, extended via **Copilot Studio**, **consuming** agents running on SAP Business AI Platform. Copilot Studio acts as the orchestration layer that wires SAP capabilities into the Copilot experience; the SAP side exposes Joule Agents, Assistants, and Custom Agents (built with Joule Studio) through the **Agent Gateway**. Identity flows end-to-end through a trust relationship between **Microsoft Entra ID** and **SAP Cloud Identity Services**, so every delegated task runs in the context of the signed-in business user and respects existing SAP authorizations on the downstream systems.

Microsoft Copilot in Teams or Microsoft 365 can hand an SAP-specific task - a finance, procurement, or HR request, for example - to a Joule Agent, Assistant, or Custom Agent and return the answer in the flow of work, or orchestrate a process that spans Microsoft and SAP Business AI Platform. Because every delegation runs under the signed-in user's identity, the SAP authorizations already in place continue to govern what the agent can do, with full end-to-end traceability and no parallel permission model to maintain.

## Architecture

![drawio](./drawio/architecture.drawio)

## Core Components

- **Microsoft Copilot (via Copilot Studio)**: The end-user AI assistant on the Microsoft side. Copilot Studio is used to extend it with custom agents and actions; the resulting agent orchestrates tasks and sends them to the Agent Gateway.
- **Power Platform custom connector**: The bridge between Copilot Studio and the Agent Gateway. Performs the token exchange against SAP Cloud Identity Services and forwards the call. A custom connector is used - rather than Copilot Studio's native agent-to-agent "add agent" path - because the Agent Gateway only accepts a token minted for its own resource, and obtaining that token requires an exchange step the native path cannot perform.
- **Microsoft Entra ID ↔ SAP Cloud Identity Services**: OIDC federation. Entra ID authenticates the user and acts as the corporate identity provider; SAP Cloud Identity Services trusts that identity and brokers it into SAP so it propagates to the target agent.
- **Agent Gateway**: The single inbound/outbound hub for agent traffic. Routes to the SAP-managed runtimes where the Joule Agents, Assistants, and Custom Agents are deployed.

## Identity and principal propagation

Secure, user-context-aware access is the centerpiece of this architecture - the goal is **no shared user credentials and no over-privileged service accounts**, so each invocation of an agent running on SAP Business AI Platform executes with the permissions of the individual signed-in user.

- **SAP Cloud Identity Services (Identity Authentication, IAS)** is federated with **Microsoft Entra ID** over OIDC. Entra ID authenticates the end user and acts as the corporate identity provider; IAS trusts that identity and brokers it into the SAP landscape.
- The Agent Gateway only accepts a token minted specifically for the **agent-gateway resource** - a plain OAuth bearer token does not carry the audience the gateway requires. Obtaining that token is what the integration approach below sets up.
- Because the user's identity (`sub`) is preserved through to the SAP side, the target agent's **role-based access control (RBAC)** is enforced **per real user**, and actions are attributable to a named user for audit and compliance.

## Integration approach

A **Power Platform custom connector** serves as the bridge: it performs the token exchange against **SAP Cloud Identity Services** and forwards the call to the Agent Gateway. The result is real **principal propagation** - the gateway token carries the actual signed-in user, so the target agent's RBAC is enforced per user.

:::tip Agent Interoperability Cookbook for Microsoft Copilot
Step-by-step setup - custom connector, token exchange, SAP Cloud Identity Services configuration, and Copilot Studio wiring - lives in the cookbook: **Microsoft Agent Interoperability Recipe** in the `SAP-samples/agent-interoperability`](https://github.com/SAP-samples/agent-interoperability/tree/main/microsoft-azure-integration)). _SAP-internal._
:::

## Related Resources

- [Integrating Joule Agents into Your Ecosystem](../readme.md) - the parent reference architecture for external consumption of SAP agents
- [Microsoft Copilot Studio and the MCP Gateway in SAP Integration Suite](../../10-third-party-mcp-access/1-copilot-studio-with-mcp/readme.md) - the MCP / tool-consumption counterpart
- [A2A and MCP for Interoperability](../../1-a2a-and-mcp/readme.md) - Agent Gateway, authentication, and A2A protocol details
- [Microsoft Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Microsoft Copilot Studio - Connect an agent to another agent (A2A)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-agent-to-agent)
- [SAP Help - Invoking an SAP Agent Through IDP Trust and JWKS-Based Integration](https://help.sap.com/docs/CROSS_DOMAIN_AGENTS/85abb1b3c5734138826f02d079b04975/e9da5158a18649168e040495b26c43bc.html)
- [Identity and Access Management with Microsoft Entra and SAP BTP - SAP Community](https://community.sap.com/t5/technology-blog-posts-by-members/identity-and-access-management-with-microsoft-entra-part-i-managing-access/ba-p/13873276)
