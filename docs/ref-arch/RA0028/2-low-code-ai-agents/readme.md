---
id: id-ra0027-2
slug: /ref-arch/ca1d2a3e/2
sidebar_position: 2
title: Low-Code AI Agents with Joule Studio
description: >-
  Learn how to rapidly develop and deploy AI agents using the low-code capabilities of Joule Studio, built on the Business Agent Foundation (BAF).
keywords:
  - sap
  - ai agents
  - low-code
  - joule studio
  - business agent foundation
  - baf
  - sap build
sidebar_label: Low-Code AI Agents with Joule Studio
---

For many enterprise use cases, the fastest and most efficient way to build and deploy AI agents is through a low-code approach. SAP provides **Joule Studio**, an integrated development environment within SAP Build, designed for creating "content-based" AI agents with minimal coding.

This approach is ideal for business analysts, citizen developers, and professional developers who need to quickly automate business processes, integrate with SAP systems, and extend the capabilities of Joule without getting into the complexities of pro-code frameworks and infrastructure management.

## Architecture

Low-code agents, also known as content-based agents, run on a managed runtime within SAP AI Core called the **Business Agent Foundation (BAF)**. Joule Studio provides the visual interface for defining the agent's logic, tools, and behavior, which is then deployed as metadata to the BAF runtime for execution.

![drawio](./drawio/template.drawio)

The key components of this architecture are:

-   **Joule Studio:** Part of the SAP Build portfolio, Joule Studio is the low-code/no-code environment for developing Joule skills and content-based AI agents. It provides a graphical interface for:
    -   Defining agent instructions and goals.
    -   Configuring tools, including connecting to SAP and third-party APIs (REST/OData).
    -   Orchestrating multi-step reasoning and workflows.
    -   Specifying human-in-the-loop (HITL) interaction points.
-   **Business Agent Foundation (BAF):** The managed runtime environment for low-code agents, hosted on SAP AI Core. BAF executes the agent's "reason and act" loop based on the metadata deployed from Joule Studio. It handles the orchestration, tool invocation, and state management, abstracting the complexity from the developer.
-   **Joule Integration:** When a Joule Studio project is deployed, it automatically creates the necessary artifacts in Joule (like Joule Scenarios and Dialog Functions) to make the agent available to end-users through the Joule copilot interface.
-   **SAP Build Integration:** Being part of SAP Build, Joule Studio allows agents to seamlessly reuse resources from **SAP Build Process Automation**, such as workflows, business rules (decisions), and automations (bots), as tools.

## Characteristics of Low-Code Agents

-   **Configuration-Driven:** Agent behavior is defined through graphical interfaces and configuration, not code. This accelerates development and simplifies maintenance.
-   **Managed Runtime:** Agents run on the scalable and secure BAF environment, with cross-cutting concerns like metering, tracing, and security handled out of the box.
-   **Seamless SAP Integration:** Built-in connectors make it easy to consume SAP APIs and business processes as tools for the agent.
-   **Unified Lifecycle Management:** Joule Studio and SAP Build provide a complete lifecycle management solution, including versioning, deployment to different environments (dev, test, prod), and transport management.
-   **Human-in-the-Loop:** The agent definition can include steps that require human confirmation or input, with Joule facilitating these interactions.

## Flow

1.  **Development:** A developer uses Joule Studio to create an agent. They define the agent's instructions, add tools by connecting to APIs or reusing SAP Build components, and design the overall orchestration logic.
2.  **Deployment:** The developer deploys the project from Joule Studio. This action pushes the agent's definition (metadata) to the Business Agent Foundation (BAF) and registers the agent as a skill within Joule.
3.  **User Interaction:** An end-user interacts with Joule. Joule's orchestrator identifies that the user's request should be handled by the custom-built agent.
4.  **Execution:** Joule delegates the task to the BAF runtime. BAF executes the agent's logic, invoking the necessary tools, managing the conversation state, and handling any human-in-the-loop steps by communicating back with the user through Joule.
5.  **Response:** Once the agent completes its task, BAF returns the final result to Joule, which then presents it to the user.

## When to Use Low-Code Agents

Low-code agents should be the default choice for most enterprise automation scenarios due to their rapid development cycle and lower maintenance overhead. They are particularly well-suited for:

-   Automating well-defined business processes (e.g., "approve purchase order" or "check invoice status").
-   Use cases where business experts or citizen developers are involved in the development process.
-   Scenarios that heavily rely on standard SAP APIs and SAP Build Process Automation capabilities.
-   Projects where speed of delivery and alignment with SAP's standard tooling are key priorities.
