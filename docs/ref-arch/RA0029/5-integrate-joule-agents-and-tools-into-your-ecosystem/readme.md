---
id: id-ra0029-5
slug: /ref-arch/ca1d2a3e/5
sidebar_position: 5
title: Integrating Joule Agents into Your Ecosystem
description: >-
  Learn how to expose Joule agents for consumption by third-party applications and external systems using the Agent Gateway with the A2A protocol.
keywords:
  - sap
  - ai agents
  - joule
  - integration
  - ecosystem
  - a2a
  - agent gateway
  - third-party
sidebar_label: Integrating Joule Agents into Your Ecosystem
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - cap
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
discussion:
last_update:
  author: kay-schmitteckert
  date: 2026-05-06
---

:::info Disclaimer
The Agent Gateway is not yet generally available (GA). As a result, the current architecture supports unidirectional (outbound) communication only.

This reflects a transitional state - key components enabling full bidirectional capabilities are expected to be released soon and will evolve the architecture accordingly.
:::

While a primary use case is integrating external agents *into* Joule, the architecture is designed to be bidirectional. Agents built within the SAP ecosystem can also be exposed for consumption by third-party applications and external agentic systems. This enables SAP to act as a central hub of enterprise intelligence that can be leveraged across a heterogeneous IT landscape.

This outbound interoperability is achieved through the **Agent Gateway**, which exposes Joule Agents via the **Agent2Agent (A2A) protocol**.

## Architecture for External Consumption

To make SAP-native agents available externally, they are exposed through the **Agent Gateway**, a secure, publicly accessible endpoint that enables external systems to consume Joule Agents in a standardized way.

![drawio](./drawio/architecture.drawio)

## Agent Gateway

SAP provides the **Agent Gateway** that enables external clients and applications to consume Joule Agents through the A2A protocol. This represents the **inbound direction** where external systems call into SAP to leverage Joule's capabilities.

**Key Characteristics:**

-   **External Endpoint:** Accessible via a SAP-managed domain
-   **Protocol Support:** A2A 0.3.0 specification with HTTP+JSON transport
-   **Authentication:** Secured through SAP Cloud Identity Services (IAS) App2App tokens with named user context
-   **Asynchronous Processing:** Supports callback-based responses for long-running agent executions

**How It Works:**

1. **Authentication:** External clients authenticate using IAS App2App dependencies, establishing a trust relationship between the external application and Joule
2. **Agent Invocation:** The external client invokes a specific Joule Scenario by providing capability and scenario identifiers
3. **Execution:** The Agent Gateway routes the request to the appropriate Joule Agent (whether low-code or pro-code)
4. **Response:** The client receives responses either synchronously (task submission confirmation) or asynchronously (via callback URL for long-running tasks)

## Flow for External Consumption

1.  **Discovery:** External applications discover available Joule Agents through service registries or API catalogs where Agent Gateway endpoints are published
2.  **Authentication Setup:** The external application establishes an IAS App2App trust relationship with Joule to enable secure communication
3.  **Invocation:** The external application (acting as an A2A client) sends a request to the Agent Gateway endpoint, specifying the target Joule Scenario and providing the necessary input data
4.  **Execution:** The Agent Gateway routes the request to the appropriate Joule Agent, which executes its logic and may invoke internal tools or integrate with SAP systems
5.  **Response:** The agent returns a response via the A2A protocol. For long-running tasks, the agent can use asynchronous callbacks to notify the external application when processing is complete
6.  **Security & Audit:** All interactions are secured through SAP BTP's identity and trust management services. Enterprise-grade security includes SAP Cloud Identity Services, role-based access control and comprehensive audit logging through SAP Cloud ALM

## Use Cases for External Consumption

**Third-Party AI Platforms:**
-   Google Vertex AI agents can delegate SAP-specific tasks to Joule Agents
-   Microsoft Copilot Studio can invoke Joule Agents for SAP business processes
-   AWS Bedrock AgentCore can integrate with Joule Agents for enterprise workflows

**Custom Applications:**
-   Mobile applications can access Joule Agent capabilities for field operations
-   Partner applications can leverage SAP business logic through Joule Agents
-   Custom chatbots can delegate complex SAP tasks to specialized Joule Agents

**Cross-System Orchestration:**
-   External orchestration platforms can coordinate multi-system workflows involving Joule Agents
-   Integration platforms can expose Joule Agents as reusable services in broader automation scenarios

For detailed implementation guidance on the Agent Gateway, authentication setup and A2A protocol specifications, see [A2A and MCP for Interoperability](../1-a2a-and-mcp/readme.md).

By providing the Agent Gateway, SAP enables external systems to consume Joule Agents as part of their own workflows, positioning SAP as a central, interoperable component of the modern enterprise AI ecosystem.
