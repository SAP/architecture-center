---
id: id-ra0029-3
slug: /ref-arch/ca1d2a3e/3
sidebar_position: 3
title: Pro-Code AI Agents on SAP BTP
description: >-
  Learn how to build custom, pro-code AI agents on SAP BTP using SAP Cloud SDK for AI with popular frameworks like LangGraph, AutoGen and CrewAI for maximum flexibility and control over complex business logic.
keywords:
  - sap
  - ai agents
  - pro-code
  - a2a
  - mcp
  - sap cloud sdk for ai
  - cap
  - generative ai hub
  - langgraph
  - autogen
  - crewai
  - smolagents
sidebar_label: Pro-Code AI Agents on SAP BTP
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
  date: 2026-03-19
---

For complex, mission-critical use cases that require deep customization, fine-tuned workflows, or integration with non-standard enterprise systems, SAP BTP provides a comprehensive pro-code development stack. Pro-code AI agents offer developers full control over every aspect of the agent's behavior, from reasoning logic to system integration, while leveraging SAP's enterprise-grade AI infrastructure.

## Architecture

Pro-code agents on SAP BTP are built using the **SAP Cloud SDK for AI**, which provides seamless integration with SAP's Generative AI Hub, foundation models and enterprise services. The **SAP Cloud Application Programming Model (CAP)** serves as the orchestration framework for structuring agent use case logic, data management and service integration.

![drawio](./drawio/reference-architecture-generative-ai-pro-code.drawio)

The architecture consists of several integrated layers:

### Development & Orchestration Layer

-   **SAP Cloud SDK for AI:** The primary SDK for building pro-code agents on SAP BTP. Provides type-safe abstractions for interacting with Generative AI Hub, foundation models and AI-specific services. Supports both Python and TypeScript/JavaScript development and integrates with popular agent frameworks like LangGraph, AG2 (AutoGen), CrewAI, Smolagents and others.
-   **SAP Cloud Application Programming Model (CAP):** Framework that structures agent use case logic, data management and service integration. CAP provides domain modeling, service exposure and seamless connectivity to SAP and non-SAP systems.

### AI Services Layer

-   **Generative AI Hub:** Central AI capabilities platform delivered as features within SAP AI Core and SAP AI Launchpad:
    -   **SAP AI Launchpad:** Centralized interface for managing AI scenarios, deployments and configurations
    -   **SAP AI Core:** Runtime environment providing the foundation for AI operations
    -   **Harmonized Orchestration Service Layer:** Unified API layer providing access to foundation models with built-in capabilities including:
        -   **Prompt Registry & Optimization:** Centralized prompt management and optimization services
        -   **Orchestration Capabilities:** Grounding, templating, data masking, I/O filtering and translation
        -   **Foundation Model Access:** Unified access to both partner-built (Azure OpenAI, AWS Bedrock, Google Vertex AI) and SAP-built foundation models

### Data & Knowledge Layer

-   **SAP HANA Cloud:** Provides critical data services for AI agents:
    -   **Vector Engine:** High-performance vector search for semantic retrieval and RAG (Retrieval-Augmented Generation) patterns
    -   **Knowledge Graph Engine:** Semantic business knowledge and relationships encoded in SAP Knowledge Graph, enabling agents to reason over enterprise domain models with full business context

### Connectivity & Integration Layer

-   **SAP Connectivity Service:** Secure connectivity to on-premise systems via SAP Cloud Connector
-   **SAP Destination Service:** Centralized destination management for accessing SAP Cloud Solutions, third-party applications and on-premise systems via HTTPS protocols
-   **Integration with SAP Systems:** Seamless connectivity to SAP S/4HANA, SAP SuccessFactors, SAP Concur, SAP Customer Experience, SAP Business Networks and other SAP Cloud Solutions

### Agent Integration Layer

-   **Agent2Agent (A2A) Protocol:** Pro-code agents expose A2A-compliant server endpoints to integrate with Joule, enabling external systems to delegate tasks to custom agents
-   **Model Context Protocol (MCP):** Agents act as MCP clients to discover and consume tools from MCP servers, accessing SAP business capabilities and third-party services in a standardized way

## Development Workflow

1.  **Development:** Developers implement agent logic using SAP Cloud SDK for AI with their chosen agent framework (LangGraph, AG2, CrewAI, etc.). They define use case orchestration, data models and integration points using CAP.
2.  **Foundation Model Access:** The agent leverages Generative AI Hub's harmonized orchestration service layer to access foundation models through a unified API, utilizing prompt templates, grounding data and safety controls (data masking, I/O filtering).
3.  **Data & Knowledge Integration:** Agents query SAP HANA Cloud's Vector Engine for semantic search and leverage Knowledge Graph for domain-specific reasoning over SAP business objects.
4.  **Service Integration:** Through CAP's built-in connectivity, agents access SAP and non-SAP systems using SAP Destination Service and SAP Connectivity Service, ensuring secure and governed integrations.
5.  **Deployment:** Applications are deployed to SAP BTP (Cloud Foundry or Kyma runtime) using CI/CD pipelines, with automated testing and rollout strategies.
6.  **A2A Exposure:** Once deployed, the agent exposes an A2A server endpoint, making it discoverable and consumable by Joule and other A2A-compliant clients.

## When to Use Pro-Code Agents

Pro-code agents are ideal for scenarios that require:

-   **Advanced Customization:** Complete control over reasoning logic, state management and orchestration beyond configuration-driven approaches
-   **Complex Workflows:** Multi-step, conditional, or dynamic workflows that require programmatic control
-   **Bespoke Integrations:** Custom connectors and adapters for legacy systems, specialized hardware, or proprietary APIs not covered by standard connectivity
-   **Framework Flexibility:** Use of specific AI frameworks (LangGraph, AG2/AutoGen, CrewAI, Smolagents) that best match team skills and technical requirements
-   **Performance Optimization:** Fine-tuned control over prompt engineering, model selection, caching strategies and resource utilization
-   **Enterprise-Scale Operations:** Scenarios requiring sophisticated error handling, retry logic, circuit breakers and observability integration

## Agent Frameworks

SAP Cloud SDK for AI supports integration with popular open-source agent frameworks, allowing developers to leverage proven patterns for structuring agent logic:

| Framework                     | Language         | Key Differentiator                                                              |
| ----------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| **LangGraph**                 | Python, JS/TS    | Graph-based control flow for complex, cyclic and stateful multi-agent workflows |
| **AG2 (AutoGen)**             | Python           | Facilitates cooperation between multiple specialized agents to solve tasks       |
| **CrewAI**                    | Python           | Role-based agent design for collaborative task execution                         |
| **Smolagents**                | Python           | Lightweight agent framework with tool-use optimization                           |
| **Google ADK**                | Python, Go, Java | Optimized for Google Cloud ecosystem with strong A2A and MCP support             |
| **Pydantic AI**               | Python           | Type-safe agent construction and automatic self-correction for reliability       |
| **AI SDK**                    | JS/TS            | TypeScript toolkit from Vercel, ideal for building AI-powered web applications   |

These frameworks integrate with SAP Cloud SDK for AI to access Generative AI Hub services, SAP HANA Cloud data and enterprise connectivity while maintaining full control over agent orchestration patterns.

## Specialized Use Cases

Pro-code agents enable advanced scenarios that require deep technical customization:

-   [AI Agents for Structured Data](../7-ai-agents-for-structured-data/readme.md): Build agents that enable natural language queries and analytics on structured enterprise data in SAP HANA Cloud, leveraging vector search and knowledge graphs.
-   [Embodied AI Agents](../6-embodied-ai-agents/readme.md): Extend digital workflows into the physical world by connecting AI agents to robotics and other physical devices for autonomous operations.

## Examples
Take a look at the following examples that build upon or implement elements of the Reference Architecture:
- [Reference Implementation for A2A-Compliant Pro-Code Agents on SAP BTP with Joule Integration](https://github.com/SAP-samples/btp-joule-a2a-pro-code-agent): Modular reference implementation covering a full-fledged agentic scenario end to end including Joule Integration via the A2A Protocol.
- [SAP A2A Agent Toolkit Plugin](https://github.com/SAP-samples/joule-a2a-agent-toolkit/): Build, deploy, and connect AI agents to SAP Joule via the A2A (Agent-to-Agent) protocol on BTP Cloud Foundry - all from Claude Code.