---
id: id-ra0027-4
slug: /ref-arch/ca1d2a3e/4
sidebar_position: 4
title: Integrating AI Agents with Joule
description: >-
  Learn the architectural patterns for integrating both low-code and pro-code AI agents with Joule, SAP's AI copilot, for a unified user experience.
keywords:
  - sap
  - ai agents
  - joule
  - integration
  - joule studio
  - a2a
  - pro-code
  - low-code
sidebar_label: Integrating AI Agents with Joule
---

For AI agents to deliver value in an enterprise context, they must be easily accessible to end-users within their natural workflow. In the SAP ecosystem, **Joule** is the single, trusted AI copilot that provides a consistent conversational interface across all SAP applications.

Therefore, a critical step in the agent development lifecycle is integrating your custom-built agents—whether low-code or pro-code—with Joule. This ensures that users can interact with your agent's specialized capabilities through the same familiar interface they use for all other SAP-related tasks.

## Architecture of a Unified Experience

Joule acts as the central orchestrator and entry point for all user interactions. When a user makes a request, Joule's planning and reasoning engine determines the best way to fulfill it. This may involve using a built-in skill, retrieving information, or delegating the task to a custom AI agent.

The integration pattern differs slightly depending on whether the agent is a low-code (content-based) or pro-code agent.

![drawio](./drawio/template.drawio)

### Integrating Low-Code Agents

The integration of low-code agents built with **Joule Studio** is a seamless and largely automated process.

**Flow:**

1.  **Development & Deployment:** When you build an agent in Joule Studio and deploy it, the platform handles the integration work behind the scenes.
2.  **Artifact Generation:** The deployment process automatically creates all the necessary Joule artifacts, including a **Joule Scenario** and a **Joule Dialog Function**.
3.  **Joule Registration:** This scenario is registered in Joule's **Scenario Catalog**, making the agent's capabilities known to Joule's orchestrator.
4.  **Execution:** When a user's prompt matches the agent's purpose, Joule invokes the corresponding Dialog Function, which in turn delegates the execution to the **Business Agent Foundation (BAF)** runtime where the agent logic resides.

This tight integration means that developers using Joule Studio don't need to manually manage API endpoints or integration protocols. The platform abstracts away the complexity, allowing them to focus on the agent's business logic.

### Integrating Pro-Code Agents

Pro-code agents, which run in their own independent runtime environments, are integrated with Joule using the open **Agent-to-Agent (A2A) protocol**.

**Flow:**

1.  **Expose an A2A Endpoint:** The pro-code agent must be designed as an **A2A server**, exposing an HTTP endpoint that adheres to the A2A protocol specification. This is the contract through which Joule will communicate with the agent.
2.  **Create a Joule Scenario:** In Joule, you must manually create a **Joule Scenario** to represent the pro-code agent.
3.  **Configure the Dialog Function:** Within this scenario, you add a **Joule Dialog Function** with an action of type `agent-request`.
4.  **Point to the A2A Endpoint:** You configure this Dialog Function to call the A2A endpoint of your pro-code agent.
5.  **Execution:** At runtime, when a user's request triggers this scenario, Joule acts as an **A2A client**. It sends a request to your agent's A2A endpoint, waits for the response, and then presents the result to the user.

This A2A-based pattern provides a clean, decoupled architecture that allows any A2A-compliant agent, regardless of the framework it's built with, to be plugged into the Joule ecosystem. It supports both synchronous (request/response) and asynchronous (long-running) agent executions, with Joule managing the user interaction throughout the process.

## Summary of Integration Patterns

| Agent Type          | Integration Mechanism                                  | Key Characteristics                                                                                             |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Low-Code Agents** | Automated via **Joule Studio** deployment              | - Seamless and automatic.<br/>- No manual configuration needed.<br/>- Tightly integrated with SAP Build lifecycle. |
| **Pro-Code Agents** | Manual configuration via the **A2A Protocol** | - Decoupled and open-standard based.<br/>- Requires creating a Joule Scenario and pointing it to the agent's A2A endpoint.<br/>- Maximum flexibility. |

By supporting both of these patterns, SAP provides a comprehensive framework that balances ease of use for rapid development with the power and flexibility needed for highly custom, pro-code agent implementations.
