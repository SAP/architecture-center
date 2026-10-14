---
id: a2c0f1
slug: /ref-arch/a2c0f1
sidebar_position: 3
title: Microsoft Copilot Studio with SAP Agent Gateway (A2A)
description: >-
  Connect a Microsoft Copilot Studio agent to SAP Joule Agents, Assistants, and
  Custom Agents through the Agent Gateway over the A2A protocol, with Microsoft
  Entra ID ↔ SAP Cloud Identity Services federation and per-user identity
  propagation.
keywords:
  - sap
  - joule agents
  - agent gateway
  - a2a
  - microsoft copilot studio
  - microsoft entra id
  - sap cloud identity services
  - identity propagation
  - principal propagation
  - business ai platform
sidebar_label: Microsoft Copilot Studio (A2A)
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
discussion: 
last_update:
  author: kay-schmitteckert
  date: 2026-10-13
---

:::info Disclaimer
Some components and capabilities of this reference architecture are not yet generally available (GA) — the current architecture reflects a transitional state that highlights the relevant building blocks for an agentic architecture based on SAP Business AI Platform. In particular, the [Agent Gateway](../../1-a2a-and-mcp/readme.md#architecture) is not yet GA. The patterns outlined here show how the integration between Microsoft Copilot Studio and SAP can be done today and will evolve as those capabilities are released.
:::

[Microsoft Copilot Studio](https://www.microsoft.com/en-us/microsoft-365-copilot/microsoft-copilot-studio) is Microsoft's low-code platform for building and orchestrating AI agents across Microsoft 365, Teams, and custom channels. If you are new to it, start with the [Microsoft Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/).

This page describes the **inbound** direction — a Copilot Studio agent **consuming** SAP agents — using the **Agent2Agent (A2A) protocol**. Copilot Studio acts as the **A2A client**; the SAP side, running on the SAP-managed **Business AI Platform (BAIP)**, exposes Joule Agents, Assistants, and Custom Agents (built with Joule Studio) through the **Agent Gateway**. Identity flows end-to-end through a trust relationship between **Microsoft Entra ID** and **SAP Cloud Identity Services**, so every delegated task runs in the context of the signed-in business user and respects existing SAP authorizations.

It is the **A2A counterpart** to the tool-consumption pattern in [Microsoft Copilot Studio and the MCP Gateway](../../10-third-party-mcp-access/1-copilot-studio-with-mcp/readme.md): use **MCP** when Copilot Studio needs to *call SAP capabilities as tools*, and **A2A** when it needs to *delegate a task to a specialized SAP agent*. In practice, a Copilot Studio agent in Teams or Microsoft 365 can hand an SAP-specific task — a finance, procurement, or HR request, for example — to a Joule Agent, Assistant, or Custom Agent and return the answer in the flow of work, or orchestrate a process that spans Microsoft and SAP agents. Because every delegation runs under the signed-in user's identity, the SAP authorizations already in place continue to govern what the agent can do, with full end-to-end traceability and no parallel permission model to maintain.

## Architecture

![drawio](./drawio/architecture.drawio)

:::note
The diagram above currently shows the generic external-consumption architecture for this section. A dedicated Copilot Studio ↔ SAP (A2A) diagram will replace it.
:::

### Architecture at a Glance

| Layer | Component | Role |
| --- | --- | --- |
| Front end (Microsoft Azure) | **Microsoft Copilot Studio agent** | The orchestrator / reasoner. Acts as an **A2A client** that sends tasks across the network boundary to the SAP Agent Gateway |
| Identity | **Microsoft Entra ID &rlarr;&rarr; SAP Cloud Identity Services** | Bidirectional OIDC federation; authenticates the user and brokers the identity into SAP so it propagates to the target agent |
| Entry point | **SAP Agent Gateway** | The single inbound/outbound hub for agent traffic crossing the network boundary; speaks **A2A** externally and routes to the managed runtimes internally |
| Target | **SAP Joule Agents, Assistants, and Custom Agents (Joule Studio)** | The SAP agents the delegated task runs against, deployed in the SAP-managed runtimes |

The two environments are separated by a **network boundary**. The Agent Gateway is the only path across it: externally it speaks A2A with Copilot Studio; internally it connects to the SAP-managed runtimes where the Joule Agents, Assistants, and Custom Agents are deployed.

## Identity and principal propagation

Secure, user-context-aware access is the centerpiece of this architecture — the goal is **no shared secrets and no over-privileged service accounts**, so each SAP agent invocation executes with the permissions of the individual signed-in user.

- **SAP Cloud Identity Services (Identity Authentication, IAS)** is federated with **Microsoft Entra ID** over OIDC. Entra ID authenticates the end user and acts as the corporate identity provider; IAS brokers that identity into the SAP landscape.
- The Agent Gateway only accepts a token minted specifically for the **agent-gateway resource** — a plain OAuth bearer token does not carry the audience the gateway requires. Obtaining that token is what the integration approach below sets up.
- Because the user's identity (`sub`) is preserved through to the SAP side, the target agent's **role-based access control (RBAC)** is enforced **per real user**, and actions are attributable to a named user for audit and compliance.

## Integration approach

To reach an SAP agent that sits **behind the SAP Agent Gateway**, Copilot Studio's native *Connect Agent2Agent* is not sufficient on its own: it cannot mint the gateway-scoped token the gateway requires. Instead, a **Power Platform custom connector** performs the required token exchange against SAP Cloud Identity Services before forwarding the A2A call. The result is real **principal propagation** — the gateway token carries the actual signed-in user, so the target agent's RBAC is enforced per user.

:::tip Hands-on deep dive
Step-by-step setup — custom connector, token exchange, SAP Cloud Identity Services configuration, and Copilot Studio wiring — lives in the external cookbook: **Microsoft Agent Interoperability Recipe** in the SAP-internal `OCTO/aioli` repository ([`agent-interoperability-cookbook/microsoft-agent-interoperability-recipe.md`](https://github.tools.sap/OCTO/aioli/blob/microsoft-cookbook-niklas/agent-interoperability-cookbook/microsoft-agent-interoperability-recipe.md)). _SAP-internal; currently a draft on a feature branch, pending merge._
:::

## Related Resources

- [Integrating Joule Agents into Your Ecosystem](../readme.md) — the parent reference architecture for external consumption of SAP agents
- [Microsoft Copilot Studio and the MCP Gateway in SAP Integration Suite](../../10-third-party-mcp-access/1-copilot-studio-with-mcp/readme.md) — the MCP / tool-consumption counterpart
- [A2A and MCP for Interoperability](../../1-a2a-and-mcp/readme.md) — Agent Gateway, authentication, and A2A protocol details
- [Microsoft Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Microsoft Copilot Studio — Connect an agent to another agent (A2A)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-agent-to-agent)
- [SAP Help — Invoking an SAP Agent Through IDP Trust and JWKS-Based Integration](https://help.sap.com/docs/CROSS_DOMAIN_AGENTS/85abb1b3c5734138826f02d079b04975/e9da5158a18649168e040495b26c43bc.html)
- [Identity and Access Management with Microsoft Entra and SAP BTP — SAP Community](https://community.sap.com/t5/technology-blog-posts-by-members/identity-and-access-management-with-microsoft-entra-part-i-managing-access/ba-p/13873276)
