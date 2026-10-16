---
id: b4d7e2
slug: /ref-arch/b4d7e2
sidebar_position: 1
title: Amazon Quick with Agent Gateway
description: >-
  Connect Amazon Quick to Joule Agents, Assistants, and Custom Agents running on SAP Business AI Platform through AWS AgentCore and the Agent Gateway, with end-to-end user identity propagation across Cognito, AgentCore Identity, and SAP Cloud Identity Services.
keywords:
  - sap
  - joule agents
  - agent gateway
  - a2a
  - amazon quick
  - aws agentcore
  - aws agentcore identity
  - amazon cognito
  - identity propagation
  - principal propagation
  - on-behalf-of token exchange
  - business ai platform
sidebar_label: Amazon Quick / AWS AgentCore
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - aws
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
  date: 2026-10-14
---

:::info Disclaimer
Some components and capabilities of this reference architecture are not yet generally available (GA) — the current architecture reflects a transitional state that highlights the relevant building blocks for an agentic architecture based on SAP Business AI Platform. In particular, the [Agent Gateway](../../1-a2a-and-mcp/readme.md#architecture) is not yet GA. The pattern outlined here shows how the integration between AWS and SAP can be done today and will evolve as those capabilities are released.
:::

[Amazon Quick](https://aws.amazon.com/quicksight/q/) gives users a natural-language chat interface inside AWS. This page describes the **inbound** direction — an Amazon Quick agent **consuming** agents running on SAP Business AI Platform, with the actual agent delegation handled by **AWS AgentCore**.

The integration uses **AWS AgentCore as the bridge**: Quick reaches AgentCore via a connector, and AgentCore handles the communication with the Agent Gateway. The SAP side, running on **SAP Business AI Platform**, exposes Joule Agents, Assistants, and Custom Agents (built with Joule Studio) through the **Agent Gateway**. Identity flows end-to-end — from the user's Cognito session all the way to the agent running on SAP Business AI Platform — without any additional sign-in step.

A user working in Amazon Quick can hand an SAP-specific task to a Joule Agent, Assistant, or Custom Agent and receive the answer in the flow of work. Because every delegation runs under the signed-in user's identity, the SAP authorizations already in place in the downstream system continue to govern what the agent can do, with full end-to-end traceability.

## Architecture

![drawio](./drawio/architecture.drawio)

## Core Components

- **Amazon Quick**: The chat interface inside AWS. Hosts the connector and its Cognito OAuth session. Sends a Cognito ID token as the Bearer credential on every message to AgentCore Gateway.
- **AWS AgentCore Gateway + Runtime**: The managed front door and compute layer. Validates the incoming Cognito token, mints the WorkloadAccessToken, runs the model (via Amazon Bedrock) to select the right agent running on SAP Business AI Platform, and orchestrates the call to SAP Business AI Platform.
- **AWS AgentCore Identity**: The identity bridge between AWS and SAP. Performs the on-behalf-of (OBO) token exchange — exchanges the WorkloadAccessToken for a SAP IAS token scoped to the Agent Gateway, without any user interaction.
- **Amazon Cognito → SAP Cloud Identity Services**: The identity chain. Cognito authenticates the user and issues the ID token; SAP Cloud Identity Services resolves the user by a user identifier (email, in this setup) and issues the gateway-scoped token.
- **Agent Gateway**: The single inbound hub for agent traffic on the SAP side. Routes to the SAP-managed runtimes where the Joule Agents, Assistants, and Custom Agents are deployed.

## Identity and principal propagation

Secure, user-context-aware access is the key design principle — the signed-in user is the principal, their identity established once at the Cognito login and then **carried forward automatically** across every layer.

The chain has three tokens, each issued by a different authority and used for a different hop:

- **Cognito ID token** — the user authenticates via Cognito (OAuth 2.0 authorization code + PKCE) when the connector is first used. The resulting ID token carries the user's identifier (email, in this setup) and is the Bearer credential Quick sends to AgentCore Gateway on every message. Quick silently refreshes it using a cached refresh token, so this login happens only once per connector session.
- **WorkloadAccessToken (WAT)** — once the Cognito ID token passes the Gateway's validation, the AgentCore Runtime hosting layer mints a WAT from it. The WAT binds the Runtime's own workload identity together with the user identity from the ID token, and is injected as a request header before the application code runs.
- **SAP IAS access token** — when the Runtime needs to call a agent running on SAP Business AI Platform, it passes the WAT to **AgentCore Identity**, which performs the on-behalf-of (OBO) exchange with SAP IAS. SAP IAS resolves the user by the same identifier present in the Cognito ID token — email, in this setup — and issues a token scoped to the Agent Gateway with that identifier as its `sub`. No user interaction; no separate SAP login.

Because the user's identifier threads through all three tokens, the Agent Gateway receives a token whose `sub` is the known SAP identity of the signed-in user. SAP applies its own authorization policies against that identity, just as if the user had authenticated directly at the SAP system.

## Integration approach

Connecting Amazon Quick to the Agent Gateway comes down to three pieces of setup:

1. **An MCP connector in Amazon Quick** backed by a Cognito user pool — Quick opens a Cognito login popup on first use and silently refreshes the token on every subsequent conversation. The connector calls the AgentCore Gateway MCP endpoint with the Cognito ID token.
2. **An AWS AgentCore Runtime** hosting the MCP server — the Runtime validates the incoming token, mints the WAT, runs the model (via Amazon Bedrock) to select the right agent running on SAP Business AI Platform, and calls AgentCore Identity for the OBO exchange.
3. **An AgentCore Identity credential provider** pre-configured with the SAP IAS OAuth endpoints and the Agent Gateway resource URN — AgentCore Identity performs the OBO exchange with SAP IAS on the Runtime's behalf, so the Runtime never calls SAP IAS directly and never builds the client assertion.

:::tip Hands-on deep dive
Step-by-step setup — Cognito user pool, AgentCore Gateway and Runtime configuration, AgentCore Identity credential provider, and the Amazon Quick MCP connector — lives in the external cookbook: **Propagating User Identity from Amazon Quick to SAP Using AWS AgentCore** in the SAP-internal `OCTO/aioli` repository. _SAP-internal; currently a draft, pending merge._
:::

## Related Resources

- [Integrating Joule Agents into Your Ecosystem](../readme.md) — the parent reference architecture for external consumption of SAP agents
- [A2A and MCP for Interoperability](../../1-a2a-and-mcp/readme.md) — Agent Gateway, authentication, and A2A protocol details
- [Gemini Enterprise with Agent Gateway](../2-gcp-integration/readme.md) — the equivalent pattern for Gemini Enterprise
- [Microsoft Copilot Studio with Agent Gateway](../3-microsoft-azure-integration/readme.md) — the equivalent pattern for Microsoft Copilot Studio
- [Third-Party MCP Access](../../10-third-party-mcp-access/readme.md) — the complementary MCP / tool-consumption path for third-party agents
- [SAP Help — Assigning the Agent Gateway Consumer System to Formations](https://help.sap.com/docs/CROSS_DOMAIN_AGENTS/85abb1b3c5734138826f02d079b04975/a0465991ba964736a781c275ddd852db.html)
- [SAP Help — Invoking an SAP Agent Through IDP Trust and JWKS-Based Integration](https://help.sap.com/docs/CROSS_DOMAIN_AGENTS/85abb1b3c5734138826f02d079b04975/e9da5158a18649168e040495b26c43bc.html)
- [Amazon QuickSight Q documentation](https://docs.aws.amazon.com/quicksight/latest/user/quicksight-q.html)
- [AWS AgentCore documentation](https://docs.aws.amazon.com/bedrock-agentcore/)
