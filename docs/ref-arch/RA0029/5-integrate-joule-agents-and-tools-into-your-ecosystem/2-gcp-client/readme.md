---
id: c9a3f8
slug: /ref-arch/c9a3f8
sidebar_position: 2
title: Gemini Enterprise with SAP Agent Gateway (A2A)
description: >-
  Connect a Google Gemini Enterprise or GCP Agent Platform agent to SAP Joule
  Agents, Assistants, and Custom Agents through the Agent Gateway over the A2A
  protocol, using a proxy agent on Google Agent Runtime and three-legged OAuth
  with SAP Cloud Identity Services.
keywords:
  - sap
  - joule agents
  - agent gateway
  - a2a
  - google gemini enterprise
  - gcp agent platform
  - google agent runtime
  - vertex ai agent engine
  - three-legged oauth
  - sap cloud identity services
  - identity propagation
  - business ai platform
sidebar_label: Google Gemini Enterprise (A2A)
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - gcp
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
Some components and capabilities of this reference architecture are not yet generally available (GA) — the current architecture reflects a transitional state that highlights the relevant building blocks for an agentic architecture based on SAP Business AI Platform. In particular, the [Agent Gateway](../../1-a2a-and-mcp/readme.md#architecture) is not yet GA. The pattern outlined here shows how the integration between Google Gemini Enterprise and SAP can be done today and will evolve as those capabilities are released.
:::

[Google Gemini Enterprise](https://cloud.google.com/gemini/docs) and the **GCP Agent Platform** let organizations build and orchestrate AI agents across Google Cloud and the Google Workspace surface. This page describes the **inbound** direction — a Gemini Enterprise agent **consuming** SAP agents — using the **Agent2Agent (A2A) protocol**.

The SAP side, running on the SAP-managed **Business AI Platform (BAIP)**, exposes Joule Agents, Assistants, and Custom Agents (built with Joule Studio) through the **Agent Gateway**. Identity flows end-to-end through **SAP Cloud Identity Services**, so every delegated task runs in the context of the signed-in business user and respects existing SAP authorizations.

A2A and MCP are complementary: use **A2A** (this page) when a Gemini Enterprise agent needs to *delegate a task to a specialized SAP agent*, and **MCP** when it needs to *consume SAP capabilities as tools* — see [Third-Party MCP Access](../../10-third-party-mcp-access/readme.md). In practice, a user working in Gemini Enterprise can hand an SAP-specific task to a Joule Agent, Assistant, or Custom Agent and receive the answer in the flow of work. Because every delegation runs under the signed-in user's identity, the SAP authorizations already in place continue to govern what the agent can do, with full end-to-end traceability.

## Architecture

Gemini Enterprise cannot connect **directly** to an SAP agent through the Agent Gateway: it does not support cross-provider A2A authentication with an in-product sign-in prompt. The integration therefore introduces one additional component on the Google side — a **proxy agent** running on **Google Agent Runtime (Vertex AI Agent Engine)**.

The proxy agent is a transparent intermediary that sits between Gemini Enterprise and the downstream SAP agent. It has a single job: take the end-user token that Gemini Enterprise forwards, exchange it at **SAP Cloud Identity Services (IAS)** for a token scoped to the Agent Gateway, and relay the call to the SAP agent over A2A. Because the proxy is itself a Gemini Enterprise agent, it can surface the SAP sign-in prompt in the Gemini Enterprise chat UI, which is what makes the **three-legged OAuth** flow possible.

| Layer | Component | Role |
| --- | --- | --- |
| Front end (Google Cloud) | **Gemini Enterprise / GCP Agent Platform agent** | The orchestrator the user interacts with; forwards the end-user token and renders the SAP sign-in prompt |
| Bridge (Google Agent Runtime) | **Proxy agent** (Vertex AI Agent Engine) | Transparent A2A proxy; exchanges the user token at SAP IAS for an Agent-Gateway-scoped token and relays the call downstream |
| Identity | **SAP Cloud Identity Services (IAS)** | Authenticates the user (three-legged OAuth) and mints the downstream-scoped token; brokers the identity into SAP |
| Entry point | **SAP Agent Gateway** | The single inbound hub for agent traffic; speaks **A2A** and routes to the SAP-managed runtimes |
| Target | **SAP Joule Agents, Assistants, and Custom Agents (Joule Studio)** | The SAP agents the delegated task runs against, deployed in the SAP-managed runtimes |

![drawio](./drawio/architecture.drawio)

:::note
The diagram above currently shows the generic external-consumption architecture for this section. A dedicated GCP (Gemini Enterprise ↔ SAP, three-legged OAuth) diagram will replace it.
:::

## Identity and principal propagation

Secure, user-context-aware access is the centerpiece of this architecture — the goal is **no shared secrets and no over-privileged service accounts**, so each SAP agent invocation executes with the permissions of the individual signed-in user.

- The flow is **three-legged OAuth**: Gemini Enterprise authenticates the end user against **SAP Cloud Identity Services** over the **front channel** (a browser redirect / in-product sign-in prompt, rendered through the proxy agent), and forwards the resulting user token.
- The Agent Gateway only accepts a token minted specifically for the **agent-gateway resource** (`urn:sap:identity:application:provider:name:agent-gateway`) — a plain OAuth bearer token does not carry the audience the gateway requires. The proxy agent performs this **token exchange** at SAP IAS.
- To authenticate the exchange, the proxy signs a **client assertion** using a dedicated **Google Cloud service account** whose public keys SAP IAS trusts (configured as a trusted JWT issuer). No long-lived client secret is stored in the runtime.
- Because the user's identity is preserved through to the SAP side, the target agent's **role-based access control (RBAC)** is enforced **per real user**, and actions are attributable to a named user for audit and compliance.

## Integration approach

Reaching an SAP agent behind the Agent Gateway from Gemini Enterprise comes down to three pieces of setup:

1. **A Google Cloud service account** that signs the SAP IAS client assertion — SAP IAS is configured to trust this service account as a JWT issuer, so no client secret has to live in the Google runtime.
2. **An SAP IAS application** configured with the Gemini Enterprise redirect URIs and a trust relationship to the Google service account, so it can run the three-legged OAuth flow and mint the Agent-Gateway-scoped token.
3. **The proxy agent on Google Agent Runtime**, pointed at the downstream Agent Gateway A2A endpoint, that performs the token exchange and relays the call. It is then registered in Gemini Enterprise so users can delegate to it.

:::tip Hands-on deep dive
Step-by-step setup — service-account signer, SAP IAS trust and redirect configuration, proxy-agent deployment, and Gemini Enterprise registration — lives in the external cookbook: **Authenticate inbound connections from GCP Agents using 3-legged OAuth** in the SAP-internal `OCTO/aioli` repository. _SAP-internal; currently a draft, pending merge._
:::

## Related Resources

- [Integrating Joule Agents into Your Ecosystem](../readme.md) — the parent reference architecture for external consumption of SAP agents
- [Microsoft Copilot Studio with SAP Agent Gateway (A2A)](../3-microsoft-azure-client/readme.md) — the equivalent pattern for Microsoft Copilot Studio
- [A2A and MCP for Interoperability](../../1-a2a-and-mcp/readme.md) — Agent Gateway, authentication, and A2A protocol details
- [Third-Party MCP Access](../../10-third-party-mcp-access/readme.md) — the complementary MCP / tool-consumption path for third-party agents
- [SAP Help — Assigning the Agent Gateway Consumer System to Formations](https://help.sap.com/docs/CROSS_DOMAIN_AGENTS/85abb1b3c5734138826f02d079b04975/a0465991ba964736a781c275ddd852db.html)
- [SAP Help — Invoking an SAP Agent Through IDP Trust and JWKS-Based Integration](https://help.sap.com/docs/CROSS_DOMAIN_AGENTS/85abb1b3c5734138826f02d079b04975/e9da5158a18649168e040495b26c43bc.html)
- [Google Gemini for Google Cloud documentation](https://cloud.google.com/gemini/docs)
- [Vertex AI Agent Engine documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview)
