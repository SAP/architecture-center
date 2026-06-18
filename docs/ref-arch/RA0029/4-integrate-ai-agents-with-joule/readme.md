---
id: id-ra0029-4
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
  date: 2026-05-04
---

:::info Disclaimer
The Agent Gateway is not yet generally available (GA). As a result, the current architecture supports unidirectional (outbound) communication only.

This reflects a transitional state - key components enabling full bidirectional capabilities are expected to be released soon and will evolve the architecture accordingly.
:::

For AI agents to deliver value in an enterprise context, they must be easily accessible to end-users within their natural workflow. In the SAP ecosystem, **Joule** is the single, trusted AI copilot that provides a consistent conversational interface across all SAP applications.

Therefore, a critical step in the agent development lifecycle is integrating your custom-built agents—whether low-code or pro-code—with Joule. This ensures that users can interact with your agent's specialized capabilities through the same familiar interface they use for all other SAP-related tasks.

## Architecture of a Unified Experience

Joule acts as the central orchestrator and entry point for all user interactions. When a user makes a request, Joule's planning and reasoning engine determines the best way to fulfill it. This may involve using a built-in skill, retrieving information, or delegating the task to a custom AI agent.

The integration pattern differs slightly depending on whether the agent is built with Joule Studio (low-code) or using frameworks (pro-code).

![drawio](./drawio/architecture.drawio)

### Integrating Low-Code Agents

The integration of low-code agents built with **Joule Studio** is a seamless and largely automated process.

**Flow:**

1.  **Development & Deployment:** When you build an agent in Joule Studio and deploy it, the platform handles the integration work behind the scenes.
2.  **Artifact Generation:** The deployment process automatically creates all the necessary Joule artifacts, including a **Joule Scenario** and a **Joule Dialog Function**.
3.  **Joule Registration:** This scenario is registered in Joule's **Scenario Catalog**, making the agent's capabilities known to Joule's orchestrator.
4.  **Execution:** When a user's prompt matches the agent's purpose, Joule invokes the corresponding Dialog Function, which in turn delegates the execution to the managed runtime on SAP AI Core where the agent logic resides.

This tight integration means that developers using Joule Studio don't need to manually manage API endpoints or integration protocols. The platform abstracts away the complexity, allowing them to focus on the agent's business logic.

### Integrating Pro-Code Agents (Bring Your Own Agent)

Pro-code agents, which run in their own independent runtime environments, are integrated with Joule using the open **Agent2Agent (A2A) protocol**. This "Bring Your Own Agent" (BYOA) approach enables integration of code-based agents built with any framework that supports A2A.

Joule prepares an A2A message request using the `message/send` method with a user utterance in accordance with the [Agent2Agent (A2A) Protocol, version 0.3.0](https://a2a-protocol.org/v0.3.0/specification/).

**Integration Flow:**

1.  **Expose an A2A Endpoint:** The pro-code agent must be designed as an **A2A server**, exposing an HTTP endpoint that adheres to the A2A protocol specification. This is the contract through which Joule will communicate with the agent.
2.  **Create a Joule Scenario:** In Joule, you must manually create a **Joule Scenario** to represent the pro-code agent.
3.  **Configure the Dialog Function:** Within this scenario, you add a **Joule Dialog Function** with an action of type `agent-request`.
4.  **Point to the A2A Endpoint:** You configure this Dialog Function to call the A2A endpoint of your pro-code agent.
5.  **Execution:** At runtime, when a user's request triggers this scenario, Joule acts as an **A2A client**. It sends a request to your agent's A2A endpoint, waits for the response and then presents the result to the user.

**Key Integration Capabilities:**

-   **Synchronous Communication:** Joule expects a response from the agent server within 60 seconds. The agent's response handling is delegated to capability development or scripting within dialog functions.
-   **Asynchronous Communication:** For long-running tasks, Joule supports asynchronous updates using push notifications. The A2A server actively notifies a Joule-provided webhook when significant task updates occur.
-   **Multi-Turn Conversations:** For agents that require runtime context handling, Joule enables the usage of context and task IDs generated by the agent server. These IDs can be captured from the agent response and propagated in subsequent agent requests.

To ensure secure communication and validate server updates, an Identity Authentication Service (IAS) App2App trust relationship must be established between Joule and the target agent server.

This A2A-based pattern provides a clean, decoupled architecture that allows any A2A-compliant agent, regardless of the framework it's built with, to be plugged into the Joule ecosystem. It supports both synchronous and asynchronous agent executions, with Joule managing the user interaction throughout the process.

For detailed action definitions, authentication setup and implementation guidance, see [Bring Your Own Agent](https://help.sap.com/docs/joule/joule-development-guide-ba88d1ec6a1b442098863d577c19b0c0/code-based-agents-bring-your-own-agent) in the Joule Development Guide. For architectural context on A2A integration patterns, see [A2A and MCP for Interoperability](../1-a2a-and-mcp/readme.md).

## Summary of Integration Patterns

| Agent Type          | Integration Mechanism                                  | Key Characteristics                                                                                             |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Low-Code Agents** | Automated via **Joule Studio** deployment              | - Seamless and automatic.<br/>- No manual configuration needed.<br/>- Tightly integrated with SAP Build lifecycle. |
| **Pro-Code Agents** | Manual configuration via the **A2A Protocol** | - Decoupled and open-standard based.<br/>- Requires creating a Joule Scenario and pointing it to the agent's A2A endpoint.<br/>- Maximum flexibility. |

By supporting both of these patterns, SAP provides a comprehensive framework that balances ease of use for rapid development with the power and flexibility needed for highly custom, pro-code agent implementations.

## Examples
Take a look at the following examples that build upon or implement elements of the Reference Architecture:
- [Reference Implementation for A2A-Compliant Pro-Code Agents on SAP BTP with Joule Integration](https://github.com/SAP-samples/btp-joule-a2a-pro-code-agent): Modular reference implementation covering a full-fledged agentic scenario end to end including Joule Integration via the A2A Protocol.
- [SAP A2A Agent Toolkit Plugin](https://github.com/SAP-samples/joule-a2a-agent-toolkit/): Build, deploy, and connect AI agents to SAP Joule via the A2A (Agent-to-Agent) protocol on BTP Cloud Foundry - all from Claude Code.
- [Joule A2A: Connect Code Based Agents into Joule](https://community.sap.com/t5/technology-blog-posts-by-sap/joule-a2a-connect-code-based-agents-into-joule/ba-p/14329279): Shows how to integrate a custom Python LangGraph ReAct AI agent into Joule using pro-code extensibility and A2A integration.