---
id: id-ra0027-3
slug: /ref-arch/ca1d2a3e/3
sidebar_position: 3
title: Pro-Code AI Agents on SAP BTP
description: >-
  Learn how to build custom, pro-code AI agents on SAP BTP using popular frameworks for maximum flexibility and control over complex business logic.
keywords:
  - sap
  - ai agents
  - pro-code
  - a2a
  - mcp
  - langgraph
  - autogen
  - crewai
  - python
  - typescript
sidebar_label: Pro-Code AI Agents on SAP BTP
---

While low-code development accelerates the creation of many AI agents, some scenarios demand the power and flexibility that only a pro-code approach can offer. Pro-code AI agents are implemented using standard programming languages and open-source frameworks, giving developers full control over every aspect of the agent's behavior, from its reasoning logic to its integration with external systems.

This approach is ideal for complex, mission-critical use cases that require deep customization, fine-tuned workflows, or integration with non-standard enterprise systems.

## Architecture

Pro-code agents are typically developed as standalone applications running on SAP BTP (in the Cloud Foundry or Kyma runtime) or another cloud environment. They are integrated into the SAP ecosystem, particularly with Joule, via the **Agent-to-Agent (A2A) protocol**.

![drawio](./drawio/template.drawio)

Key components include:

-   **Agent Runtime:** The application that hosts the agent's logic. This can be built in any language, though Python and TypeScript are the most common choices due to the rich ecosystem of AI and agentic frameworks available.
-   **Agent Framework:** Developers leverage open-source frameworks like **LangGraph**, **AG2 (AutoGen)**, **CrewAI**, or others to structure the agent's logic. These frameworks provide abstractions for core agent components like the reasoning loop, tool usage, memory, and multi-agent collaboration.
-   **A2A Server Endpoint:** To integrate with Joule, the pro-code agent must expose an A2A-compliant server endpoint. This endpoint serves as the entry point for receiving tasks from Joule and sending back responses.
-   **Tool Consumption (MCP Client):** Pro-code agents act as **MCP clients** to discover and consume tools exposed by MCP servers. This allows them to interact with SAP systems, databases, and other APIs in a standardized way.

## Characteristics of Pro-Code Agents

-   **Maximum Flexibility:** Developers have complete control over the agent's internal logic, including the reasoning process, state management, and error handling.
-   **Custom Workflows:** Enables the implementation of highly complex and tailored workflows that go beyond the capabilities of low-code environments.
-   **Bespoke Integrations:** Allows for the creation of custom connectors and adapters to integrate with legacy systems, specialized hardware, or proprietary APIs.
-   **Framework Choice:** Developers can choose the agent framework that best fits their team's skills and the specific requirements of the use case.
-   **Advanced Use Cases:** Ideal for scenarios requiring sophisticated reasoning, dynamic planning, or interaction with environments not easily accessible through standard connectors.

## Popular Agent Frameworks

The `agent-guidance` documentation provides a comprehensive list and comparison of popular open-source agent frameworks. Below is a summary to help guide your selection.

| Framework                     | Language         | Key Differentiator                                                              |
| ----------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| **LangGraph**                 | Python, JS/TS    | Graph-based control flow for complex, cyclic, and stateful multi-agent workflows. |
| **AG2 (AutoGen)**             | Python           | Facilitates cooperation between multiple specialized agents to solve tasks.       |
| **CrewAI**                    | Python           | Role-based agent design for collaborative task execution.                         |
| **Google ADK**                | Python, Go, Java | Optimized for the Google Cloud ecosystem with strong A2A and MCP support.         |
| **Pydantic AI**               | Python           | Type-safe agent construction and automatic self-correction for reliability.     |
| **AI SDK**                    | JS/TS            | TypeScript toolkit from Vercel, ideal for building AI-powered web applications.   |
| **Smolagents**                | Python           |
