---
id: id-ra0027-5
slug: /ref-arch/ca1d2a3e/5
sidebar_position: 5
title: Integrating Joule Agents and Tools into Your Ecosystem
description: >-
  Learn how to expose Joule agents and tools for consumption by third-party applications and external systems using open standards like A2A and MCP.
keywords:
  - sap
  - ai agents
  - joule
  - integration
  - ecosystem
  - a2a
  - mcp
  - third-party
sidebar_label: Integrating Joule Agents into Your Ecosystem
---

While a primary use case is integrating external agents *into* Joule, the architecture is designed to be bidirectional. Agents and tools built within the SAP ecosystem can also be exposed for consumption by third-party applications and external agentic systems. This enables SAP to act as a central hub of enterprise intelligence that can be leveraged across a heterogeneous IT landscape.

This interoperability is achieved by adhering to the same open standards—**Agent-to-Agent (A2A)** and **Model Context Protocol (MCP)**—that are used for inbound integration.

## Architecture for External Consumption

To make SAP-native agents and tools available externally, they must be exposed through secure, discoverable endpoints. This allows external systems to interact with them in a standardized way.

![drawio](./drawio/template.drawio)

### Exposing Agents via A2A

Any agent built on SAP BTP, whether it's a low-code agent running on the **Business Agent Foundation (BAF)** or a pro-code agent, can be exposed as an **A2A server**.

-   **Low-Code Agents (BAF):** The BAF runtime provides an out-of-the-box capability to expose a content-based agent via an A2A endpoint. This can be configured within Joule Studio or the BTP cockpit, making the agent's capabilities available to any external A2A-compliant client.
-   **Pro-Code Agents:** Pro-code agents are designed from the ground up to be A2A servers, so they are inherently ready for external consumption.

An external system (e.g., a third-party application, a custom chatbot, or another AI agent) can then act as an **A2A client** to delegate tasks to the SAP-hosted agent.

### Exposing Tools via MCP

Similarly, business capabilities and data can be exposed as tools via **MCP servers**.

-   **Central Tool Gateway:** For third-party consumption, SAP provides a central tool gateway that manages security, access control, and discoverability for SAP MCP tools.
-   **Native MCP Servers:** For use cases requiring more flexibility, application teams can implement their own native MCP servers using CAP or RAP plugins and expose them securely through SAP BTP.

This allows external agents to discover and use SAP business functions—like "create sales order" or "fetch product availability"—as part of their own reasoning processes, grounding their actions in authoritative enterprise data and logic.

## Flow for External Consumption

1.  **Discovery:** An external agent or application discovers an SAP-hosted agent or tool.
    -   For agents, this might happen through a service registry where A2A endpoints are published.
    -   For tools, the external agent would query the SAP tool gateway's MCP manifest to see the available tools.
2.  **Invocation:** The external system invokes the SAP agent or tool.
    -   **Agent-to-Agent:** The external application (acting as an A2A client) sends a request to the SAP agent's A2A endpoint. The SAP agent then executes its logic, potentially using its own internal tools, and returns a response via the A2A protocol.
    -   **Tool-to-Agent:** The external agent (acting as an MCP client) makes a call to an SAP tool via the central tool gateway's MCP endpoint. The gateway routes the request to the appropriate backend service, which executes the function and returns the result.
3.  **Secure Communication:** All interactions are secured through SAP BTP's identity and trust management services, ensuring that external systems are properly authenticated and authorized to access the exposed agents and tools.

By embracing open standards for both inbound and outbound integration, SAP positions its AI agent architecture as a central, interoperable component of the modern enterprise, capable of both consuming external intelligence and providing core enterprise intelligence to the broader ecosystem.
