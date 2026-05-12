---
id: id-ra0029-8
slug: /ref-arch/RA0029/8
sidebar_position: 7
sidebar_custom_props:
  category_index: []
title: Agent Identity
description: >-
  The Agent Identity is the representation of the artifacts of an agent required to follow proper Identity Access Management and especially Agent Governance procedures. The Agent Identity allows enterprises to define and restrict how and what an agent can do within certain boundaries. The Agent Identity concept allows a generic way to manage agent access to limit unnecessary "chatty" communication between agents by establishing several policy enforcement points to fail early in the process.
keywords:
  - sap
  - ai integration
  - identity
  - agent identity
  - agent governance
  - governance
  - access
  - identity access management
sidebar_label: Agent Identity
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
  - sapgunnar
discussion:
last_update:
  author: sapgunnar
  date: 2026-05-10
---

The **Agent Identity** is a foundational concept within the SAP AI Agent Governance framework. It represents the identity artifacts required to authenticate, authorize, and govern AI agents operating within an SAP landscape. Just as human users require identity records to access enterprise systems, AI agents—whether built on SAP technology or by third parties—require a dedicated identity that defines their boundaries, permissions, and allowed interactions.

SAP Cloud Identity Services acts as the central identity hub for both human identities and agent identities. By storing agent identities alongside human identities in the Identity Directory, enterprises gain a unified governance model that leverages existing IAM infrastructure—including authentication, federation, identity provisioning, and authorization management—for the new class of autonomous AI actors.

SAP Joule serves in this perspective as the **engagement layer** for human-to-agent interaction. Users interact with SAP Joule through application clients (mobile/desktop), and Joule orchestrates conversations with agents running on SAP technology. The authentication of both the user and the agents involved is managed through SAP Cloud Identity Services, ensuring that every interaction is identity-aware and governed.

The **SAP Agent Gateway** plays a dual role in this architecture:

- **External A2A interface**: The Agent Gateway exposes an Agent-to-Agent (A2A) protocol interface that allows third-party agents to communicate with agents running on SAP technology. External agents authenticate through SAP Cloud Identity Services before being granted access, and policy enforcement points validate whether the requesting agent identity is authorized for the requested interaction.

- **Internal agent communication**: Within the SAP-managed landscape, the Agent Gateway wraps agent-to-agent communication between SAP Joule's orchestrator and backend agents. It applies policy checks at each hop—verifying agent identity, checking authorization policies, and ensuring that agents only access the tools and data they are permitted to use (APIs or tools).

This architecture establishes multiple **policy enforcement points** that allow the system to fail early—rejecting unauthorized or out-of-scope agent requests before they propagate deeper into the landscape. This reduces unnecessary inter-agent communication and ensures that agent governance is enforced consistently across the entire SAP ecosystem.

## Architecture

### High-Level Overview (L0)

The following diagram shows the major components of the SAP Joule integration from an IAM perspective at a leadership level. SAP Cloud Identity Services act as the central interface containing the SAP-landscape-relevant human identities and agent identities. SAP Cloud Identity Services integrates with the SAP applications in scope in an SAP-managed way. This architecture is a key pillar in the Agent Governance framework for an SAP landscape.

![drawio](./drawio/agent-identity-l0.drawio)

### Detailed Architecture (L2)

The detailed architecture expands on the high-level view, showing the internal structure of SAP Cloud Identity Services (Identity Directory, Identity Provisioning, Identity Authentication, Authorization Management), the SAP Agent Gateway with its conversation and A2A interfaces, policy enforcement points, and the integration with governance services such as SAP LeanIX Agent Hub, SAP Cloud ALM for Agent Lifecycle Governance, and SAP Autonomous Suite Provisioning.

The Agent Identity is a mandatory requirement to ensure the secure authentication and authorization of AI Agents in an SAP landscape.

![drawio](./drawio/agent-identity-l2.drawio)

### Key Architectural Concepts

#### SAP Cloud Identity Services as the Agent Identity Store

SAP Cloud Identity Services serves as the single source of truth for both human and agent identities within the SAP landscape:

- **Identity Directory** stores agent identities and human identities, each with a Global User ID that enables cross-application identity linking.
- **Identity Authentication** handles the authentication of agents (and humans) using protocols such as OIDC, including federation with third-party identity providers.
- **Identity Provisioning** synchronizes agent identity records and their associated role/group assignments across connected SAP applications.
- **Authorization Management** defines and enforces what each agent identity is permitted to do, expressed through application groups and policies.

#### SAP Joule as the Engagement Layer

SAP Joule is the brand which contains several SAP Business AI aspects like the conversational AI interface through which business users interact with AI agents:

1. The user accesses SAP Joule through an application client (mobile or desktop).
2. SAP Joule authenticates the user via SAP Cloud Identity Services (with optional federation to a corporate Identity Provider).
3. The Joule orchestrator determines which agents and functions the user is authorized to invoke.
4. Conversations are routed to the appropriate agents, with each interaction governed by the user's identity and the agent's permitted scope.

#### SAP Agent Gateway for A2A Communication

The SAP Agent Gateway is a technical component wihtin the customer landscape but besides the A2A external endpoint transparent for the customer and fully SAP-managed. It provides the communication fabric for agent interactions:

- **External (A2A interface for third parties)**: Third-party agents connect to the Agent Gateway using the A2A protocol. Before any interaction, the third-party agent must authenticate through SAP Cloud Identity Services. The gateway enforces policy checks to validate whether the external agent's identity is authorized to communicate with the target SAP agent.

- **Internal (SAP-managed agent communication)**: When the Joule orchestrator dispatches work to agents on SAP technology, the Agent Gateway wraps the communication. It applies policy checks and authorization verification at each step, ensuring agents only invoke permitted APIs or tools on the target SAP applications (cloud or private cloud).

- **Policy enforcement points** exist at multiple levels: at the gateway entry (it checks if the calling user (human/agent) has access to call the dedicated agent), before agent-to-agent hand-off , and at the target application (The policy enforcement point between an agent and the API/tools/MCP will be released in H2/2026). The authZ check in the SAP Cloud application is built on the well established authorization concepts of SAP applications. This layered approach ensures unauthorized requests are rejected early, minimizing unnecessary network traffic and processing.

## Services & Components

| Service / Component | Role in Agent Identity Architecture |
|---|---|
| **SAP Cloud Identity Services** | Central identity hub for human and agent identities (authentication, provisioning, authorization) |
| **SAP Joule** | the Business AI features combined. In this document mainly the engagement layer for human-to-agent conversation, orchestration of agent invocations |
| **SAP Agent Gateway** | A2A external interface for third-party agents; internal wrapper for SAP agent-to-agent communication with policy enforcement |
| **SAP LeanIX Agent Hub** | Agent Governance — cataloging and managing agent landscapes |
| **SAP Cloud ALM** | Agent Lifecycle Governance — managing the lifecycle of agents from development to decommissioning |
| **SAP4ME** | Provisioning of agent identities and configurations across the SAP landscape |
| **SAP Private Cloud (S/4HANA cloud private edition)** | Backend SAP application connected via Cloud Connector with local IAM integration (with classic support of customer managed IAM flows) |
| **SAP Cloud Solutions** | SAP cloud applications integrated via SAP-managed IAM flows (with classic support of customer managed IAM flows)|

## Example Use Cases

- **Third-party agent accessing SAP data**: An external procurement agent (built on a non-SAP platform) needs to query purchase order status in SAP S/4HANA. It authenticates against the A2A interface of the Agent Gateway with a token from the Cloud Identity (IAS), its agent identity is validated against policies in SAP Cloud Identity Services, and only if authorized, the request is forwarded to the SAP procurement agent. The agent does not get credentials to the backend, the Agent Gateway handles the connection.

- **Cross-application agent orchestration**: A user asks SAP Joule to "reconcile last month's invoices." Joule's orchestrator identifies that this requires agents in both SAP S/4HANA (finance) and SAP Ariba (procurement). Each agent's identity is checked against its permitted scope before execution, and the Agent Gateway ensures the inter-agent communication adheres to defined policies in intersection with the user-access to finance/procurement.

- **Agent lifecycle governance**: An enterprise architect uses SAP LeanIX Agent Hub to register a new AI agent, which triggers SAP4ME and the possibility to activate the "Autonomous Suite" Provisioning. This creates the corresponding agent identity in SAP Cloud Identity Services and registers the agent in the Unified Services with the related Agent Cards.
