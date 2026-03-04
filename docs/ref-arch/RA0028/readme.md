---
id: id-ra0027
slug: /ref-arch/ca1d2a3e
sidebar_position: 27
sidebar_custom_props:
  category_index:
    - ai
    - appdev
title: AI Agents at SAP
description: >-
  Build, integrate and orchestrate AI agents. This reference architecture covers low-code and pro-code development, integration with Joule and leveraging agent-to-agent interoperability with A2A and tool connectivity via MCP.
keywords:
  - sap
  - ai agents
  - joule
  - joule studio
  - a2a
  - mcp
  - pro-code
  - low-code
  - btp
  - generative ai
sidebar_label: AI Agents at SAP
image: img/ac-soc-med.png
tags:
  - genai
  - agents
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - YourName
discussion:
last_update:
  author: YourName
  date: 2025-11-15
---

AI agents represent a new paradigm in enterprise software, combining large language models (LLMs) with tools, memory and reasoning capabilities to autonomously execute complex, multi-step tasks. In the SAP ecosystem, AI agents bridge the gap between intelligent automation and core business processes, enabling systems to dynamically adapt, reason and act in real-time.

This reference architecture provides a comprehensive guide to developing, deploying and managing AI agents in your SAP ecosystem powered by SAP Business Technology Platform (BTP). It details the architectural patterns, components and best practices for building both low-code and pro-code agents, integrating them with SAP Joule and ensuring seamless interoperability across the enterprise landscape.

From automating routine workflows to enabling sophisticated analytics on structured data and extending digital processes into the physical world with embodied AI, this guide covers the full spectrum of agentic capabilities within and beyond your SAP ecosystem.

## Architecture

The core architecture for AI agents at SAP is based on the [AI Foundation](https://www.sap.com/products/artificial-intelligence/ai-foundation-os.html) with Joule Studio in SAP Build, Generative AI Hub and additional Foundational AI Technology powered by SAP BTP. This stack provides the necessary services for building, running and managing intelligent and context-aware agents.

![drawio](./drawio/template.drawio)

The solution architecture consists of several key layers:

-   **SAP Business Technology Platform (BTP):** The foundational platform providing core services like SAP AI Core with its [Generative AI Hub](./RA0005/#generative-ai-hub) for e.g., accessing large language models (LLMs) or masking data,  and identity and connectivity services for secure integration.
-   **SAP Joule:** AI-powered SAP co-pilot designed to enhance productivity and decision-making within enterprise environments. Joule orchestrates user requests, grounds them with business context and delegates tasks to the appropriate agents or skills.
-   **Custom Agent Layer:** This layer contains the agents themselves, which can be built using two main approaches and integrated with Joule via the Agent-to-Agent (A2A) protocol:
    -   **Low-Code Agents:** Developed using **Joule Studio**, these agents are implemented through a visual interface, ideal for rapid development and business-focused automation.
    -   **Pro-Code Agents:** Implemented using standard programming languages and frameworks (e.g., Python or TypeScript with LangGraph or AG2), offering maximum flexibility for complex, custom logic.

## Scenarios

This reference architecture addresses a wide range of scenarios, each exploring a different facet of AI agent development and integration in your SAP ecosystem.

-   [Agent & Tool Interoperability](./1-a2a-and-mcp/readme.md): Learn how to use the open protocols A2A (Agent-to-Agent) and MCP (Model Context Protocol) to enable seamless communication and interoperability between AI agents and tools.
-   [Low-Code AI Agents with Joule Studio](./2-low-code-ai-agents/readme.md): Discover how to build and deploy AI agents using the low-code capabilities of Joule Studio in SAP Build.
-   [Pro-Code AI Agents on SAP BTP](./3-pro-code-ai-agents/readme.md): Dive into professional development of custom AI agents using popular frameworks and languages.
-   [Integrating AI Agents with Joule](./4-integrate-ai-agents-with-joule/readme.md): Understand the patterns for integrating both low-code and pro-code agents into Joule for a unified user experience.
-   [Integrating Joule Agents and Tools into Your Ecosystem (WIP)](./5-integrate-joule-agents-and-tools-into-your-ecosystem/readme.md): Explore how to expose SAP-native agents and tools for consumption by third-party clients like systems or agents.
-   [Embodied AI Agents](./6-embodied-ai-agents/readme.md): Extend digital workflows into the physical world by connecting AI agents to robotics and other physical devices.
-   [AI Agents for Structured Data](./7-ai-agents-for-structured-data/readme.md): Enable natural language queries and analytics on structured enterprise data in SAP HANA Cloud and other sources.

## Services and Components

-   [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core?region=all)
-   [Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core)
-   [Joule Studio](https://www.sap.com/products/artificial-intelligence/joule-studio.html)
-   [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud?region=all)
-   [SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation?region=all)
-   [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)
