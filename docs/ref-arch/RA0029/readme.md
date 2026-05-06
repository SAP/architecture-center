---
id: id-ra0029
slug: /ref-arch/ca1d2a3e
sidebar_position: 300
sidebar_custom_props:
  category_index:
    - ai
    - appdev
title: Agentic AI & AI Agents
description: >-
  Build, integrate and orchestrate AI agents on SAP BTP. This reference architecture covers low-code agents with Joule Studio, pro-code agents with SAP Cloud SDK for AI, bidirectional integration with Joule and Agent2Agent (A2A) interoperability.
keywords:
  - sap
  - ai agents
  - joule
  - joule studio
  - a2a
  - agent2agent
  - mcp
  - pro-code
  - low-code
  - btp
  - generative ai hub
  - sap cloud sdk for ai
sidebar_label: Agentic AI & AI Agents
image: img/ac-soc-med.png
tags:
  - genai
  - agents
  - appdev
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
  - micinit
discussion:
last_update:
  author: kay-schmitteckert
  date: 2026-03-19
---

:::info Disclaimer
The Agent Gateway is not yet generally available (GA). As a result, the current architecture supports unidirectional (outbound) communication only.

This reflects a transitional state - key components enabling full bidirectional capabilities are expected to be released soon and will evolve the architecture accordingly.
:::

AI agents represent a new paradigm in enterprise software, combining large language models (LLMs) with tools, memory and reasoning capabilities to autonomously execute complex, multi-step tasks. In the SAP ecosystem, AI agents bridge the gap between intelligent automation and core business processes, enabling systems to dynamically adapt, reason and act in real-time.

This reference architecture provides a comprehensive guide to developing, deploying and managing AI agents in your SAP ecosystem powered by SAP Business Technology Platform (BTP). It details the architectural patterns, components and best practices for building both low-code and pro-code agents, integrating them with Joule through bidirectional A2A communication and ensuring seamless interoperability across the enterprise landscape.

From automating routine workflows to enabling sophisticated analytics on structured data and extending digital processes into the physical world with embodied AI, this guide covers the full spectrum of agentic capabilities within and beyond your SAP ecosystem.

## Architecture

The core architecture for AI agents at SAP is based on the [AI Foundation](https://www.sap.com/products/artificial-intelligence/ai-foundation-os.html), providing the services for building, running and managing intelligent agents across the enterprise landscape.

![drawio](./drawio/architecture.drawio)

The architecture centers around **Joule** as the orchestrator, with custom agents on **SAP BTP** connected to **SAP Cloud Solutions** and **3rd Party Systems**:

-   **Joule:** Central AI copilot providing unified user interface and orchestration. Routes requests to agents and skills, manages conversations and enables bidirectional A2A communication through the Agent Gateway (inbound) and Joule Capabilities (outbound).

-   **Custom Agents on SAP BTP:** Two development approaches - **Low-Code** via Joule Studio with visual configuration and automatic Joule registration and **Pro-Code** using SAP Cloud SDK for AI with frameworks (LangGraph, AG2, CrewAI, Smolagents) integrated via A2A protocol.

-   **Generative AI Hub:** Foundation models, prompt optimization, orchestration capabilities (grounding, templating, data masking, I/O filtering) and vector search via SAP HANA Cloud.

-   **SAP Cloud Solutions:** Seamless integration with SAP S/4HANA, SuccessFactors, Business Data Cloud, Concur, Customer Experience and Business Networks.

-   **3rd Party Integration:** External (AI) platforms (Google Cloud, Microsoft Azure, AWS, IBM Cloud) and (AI) clients consume Joule Agents via the Agent Gateway or are orchestrated by Joule. MCP Servers and APIs provide tools and data sources.

-   **Security:** SAP Cloud Identity Services manages authentication, authorization and identity federation across all connections.

## Development Approaches

SAP supports two complementary paths for building AI agents, each optimized for different development needs and complexity requirements.

**Low-Code with Joule Studio:** Build agents through visual configuration in SAP Build for rapid development and deployment. Joule Studio provides configuration-driven orchestration with multi-step reasoning, RAG capabilities and seamless SAP integration. Agents automatically register with Joule and run on a managed runtime. See [Low-Code AI Agents with Joule Studio](./2-low-code-ai-agents/readme.md).

**Pro-Code with SAP Cloud SDK for AI:** Develop agents using Python or TypeScript with full programmatic control. Integrate popular frameworks like LangGraph, AG2, CrewAI and Smolagents with CAP for orchestration. Agents connect via A2A protocol for maximum flexibility in complex scenarios. See [Pro-Code AI Agents on SAP BTP](./3-pro-code-ai-agents/readme.md). Specialized use cases: [AI Agents for Structured Data](./7-ai-agents-for-structured-data/readme.md) and [Embodied AI Agents](./6-embodied-ai-agents/readme.md).

## Integration Patterns

AI agents integrate with Joule through bidirectional A2A communication, enabling seamless orchestration and external consumption.

**Inbound Integration (Agent Gateway):** External systems consume Joule Agents through a publicly accessible gateway supporting synchronous and asynchronous A2A patterns. Third-party platforms like Google Vertex AI, Microsoft Copilot Studio and AWS Bedrock can delegate SAP-specific tasks to Joule Agents. See [Integrating Joule Agents into Your Ecosystem](./5-integrate-joule-agents-and-tools-into-your-ecosystem/readme.md).

**Outbound Integration (Bring Your Own Agent):** Joule orchestrates external code-based agents built with any A2A-compliant framework. Supports synchronous communication, asynchronous callbacks for long-running tasks and multi-turn conversations with context handling. See [Integrating AI Agents with Joule](./4-integrate-ai-agents-with-joule/readme.md).

**Open Standards Strategy:** SAP embraces A2A as the preferred standard for multi-agent collaboration and uses MCP internally for semantic tool connectivity. See [Agent & Tool Interoperability](./1-a2a-and-mcp/readme.md).

## Services and Components

-   [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core?region=all)
-   [Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core)
-   [Joule Studio](https://www.sap.com/products/artificial-intelligence/joule-studio.html)
-   [SAP Cloud SDK for AI](https://help.sap.com/docs/sap-cloud-sdk)
-   [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud?region=all)
-   [SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation?region=all)
-   [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)
-   [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/cloud-identity-services?region=all)

## Examples
Take a look at the following examples that build upon or implement elements of the Reference Architecture:
- [Reference Implementation for A2A-Compliant Pro-Code Agents on SAP BTP with Joule Integration](https://github.com/SAP-samples/btp-joule-a2a-pro-code-agent): Modular reference implementation covering a full-fledged agentic scenario end to end including Joule Integration via the A2A Protocol.
- [SAP A2A Agent Toolkit Plugin](https://github.com/SAP-samples/joule-a2a-agent-toolkit/): Build, deploy, and connect AI agents to SAP Joule via the A2A (Agent-to-Agent) protocol on BTP Cloud Foundry - all from Claude Code.