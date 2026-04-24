---
sidebar_position: 7
title: Build AI Agents
description: >-
  Build, integrate and orchestrate AI agents on SAP BTP using Joule Studio, SAP Cloud
  SDK for AI, A2A and MCP protocols.
keywords:
    - sap
    - ai agents
    - joule
    - joule studio
    - a2a
    - mcp
    - pro-code
    - low-code
    - sap cloud sdk for ai
sidebar_label: Build AI Agents
image: img/ac-soc-med.png
tags:
    - ai-golden-path
    - genai
    - agents
    - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
last_update:
  author: SAP
  date: '2026-04-23'
---

# Build AI Agents on SAP BTP

AI agents are autonomous software components that use large language models (LLMs) to reason, plan and take actions on behalf of users. They go beyond simple chatbots by dynamically selecting tools, retrieving context and orchestrating multi-step workflows to accomplish complex business tasks.

SAP provides a comprehensive platform for building, deploying and running AI agents on SAP Business Technology Platform (BTP). Powered by the [SAP AI Foundation](https://www.sap.com/products/artificial-intelligence/ai-foundation-os.html), it delivers the services, models and infrastructure for intelligent agent development — from foundation model access and orchestration to enterprise data integration and secure connectivity. This guide focuses on **how** to build agents and **how** to connect them — covering the development approaches, integration patterns and interoperability standards that make up SAP's agentic AI strategy.

## How to Build Agents

SAP supports two complementary development approaches for building AI agents, each optimized for different skill sets and complexity requirements. Both produce agents that integrate with Joule — SAP's central AI copilot — and leverage the same underlying AI infrastructure on SAP BTP.

### Low-Code Agents with Joule Studio

For many enterprise use cases, the fastest path to a production-ready agent is through **Joule Studio** in SAP Build. This low-code approach is ideal for business analysts, citizen developers and professional developers who need to quickly automate business processes without managing custom runtimes or infrastructure.

**What Joule Studio provides:**

- **Visual development**: Define agent instructions, configure tools and orchestrate workflows through a drag-and-drop interface
- **Multi-step reasoning**: Configuration-driven orchestration with planning, RAG (Retrieval-Augmented Generation) and tool chaining
- **Managed runtime**: Agents run on SAP AI Core with built-in metering, tracing and security
- **Automatic Joule registration**: Deployed agents are immediately available to users through the Joule interface
- **Enterprise integration**: Connect to SAP and third-party systems via REST/OData APIs, SAP Build Process Automation workflows and business rules

**When to choose low-code:**

- Automating well-defined business processes (e.g., "approve purchase order", "check invoice status")
- Business experts or citizen developers are involved in development
- Scenarios that rely heavily on standard SAP APIs and SAP Build capabilities
- Speed of delivery and alignment with SAP's standard tooling are priorities

**Resources:**

- **[SAP Architecture Center: Low-Code AI Agents with Joule Studio](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/2)**
- **[SAP Architecture Center: Extend Joule with Joule Studi](https://architecture.learning.sap.com/docs/ref-arch/06ff6062dc/3)**

### Pro-Code Agents with SAP Cloud SDK for AI

For complex, mission-critical use cases requiring deep customization, SAP BTP provides a full pro-code development stack. Pro-code agents give developers complete control over reasoning logic, state management and system integration while leveraging SAP's enterprise-grade AI infrastructure.

**What the pro-code stack provides:**

- **[SAP Cloud SDK for AI](https://sap.github.io/ai-sdk/)**: The primary SDK for building AI applications on SAP BTP, providing type-safe abstractions for the Generative AI Hub, foundation models and orchestration services in Java, Python and TypeScript/JavaScript. Integrates with popular agent frameworks via LangChain and other adapters.
- **Agent framework flexibility**: Integrate popular agent frameworks like LangGraph, AG2 (AutoGen), CrewAI, Smolagents, Google ADK, Pydantic AI and others
- **Backend flexibility**: Use any backend framework (e.g., Python with Flask/FastAPI, Node.js, Java Spring Boot) or leverage the [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/) for Java and JavaScript/TypeScript with built-in enterprise patterns for data management and service integration.
- **AI Foundation**: The [Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core) in SAP AI Core provides foundation model access across multiple providers ([Availability of Generative AI Models](https://me.sap.com/notes/3437766)) with enterprise features including prompt registry and prompt optimization. Its orchestration service offers a harmonized API that combines content generation with grounding, templating, data masking, content filtering and translation in a single pipeline call. SAP HANA Cloud's Vector Engine enables Retrieval Augmented Generation (RAG) patterns through similarity search, while its Knowledge Graph Engine provides semantically connected enterprise data for advanced reasoning.
- **A2A integration**: Agents expose A2A-compliant server endpoints for seamless Joule integration and external consumption

**When to choose pro-code:**

- Advanced customization with complete control over reasoning and orchestration
- Complex, multi-step, conditional, or dynamic workflows requiring programmatic control
- Custom connectors for legacy systems, specialized hardware, or proprietary APIs
- Specific framework requirements matching team skills (LangGraph, CrewAI, etc.)
- Performance optimization needs (prompt engineering, model selection, caching)

**Resources:**

- **[SAP Architecture Center: Pro-Code AI Agents on SAP BTP](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/3)**

### Choosing Your Approach

| Criteria | Low-Code (Joule Studio) | Pro-Code (SDK + Frameworks) |
|----------|------------------------|-----------------------------|
| **Target audience** | Business analysts, citizen developers, professional developers | Professional developers, AI engineers |
| **Development speed** | Rapid — visual configuration | Flexible — full coding required |
| **Orchestration control** | Configuration-driven | Full programmatic control |
| **Framework choice** | Managed by Joule Studio | LangGraph, AG2, CrewAI, Smolagents, Google ADK, Pydantic AI and more |
| **Runtime** | Managed on SAP AI Core | SAP BTP (Cloud Foundry or Kyma) |
| **Joule integration** | Automatic registration | Manual via A2A protocol |
| **Best for** | Standard business process automation | Complex workflows, custom integrations, specialized AI scenarios |

Both approaches are complementary — start with low-code for rapid prototyping and standard scenarios and move to pro-code when requirements demand deeper customization.

## Agent Interoperability

A key aspect of SAP's agentic AI strategy is ensuring agents can communicate across system boundaries — both inward (external systems consuming SAP agents) and outward (Joule orchestrating external agents). This bidirectional interoperability is built on open standards.

### Open Standards: A2A and MCP

SAP has adopted two open standards to create a decoupled, interoperable agent ecosystem:

- **Agent2Agent (A2A)**: The [A2A protocol](https://a2a-protocol.org/latest/) is SAP's **preferred standard for multi-agent collaboration** and vendor-to-vendor interoperability. It enables agents to delegate tasks, inquire about capabilities and exchange information in a structured manner: regardless of the framework they were built with.

- **Model Context Protocol (MCP)**: The [MCP protocol](https://modelcontextprotocol.io/) standardizes how AI agents discover, understand and interact with external tools. SAP uses MCP **internally** to provide Joule Agents with semantically enriched access to SAP business capabilities, including domain knowledge from SAP Knowledge Graph.

**Architectural rationale:** For external interoperability between vendors and third-party agents, SAP prioritizes A2A over direct MCP server exposure. This ensures enterprise-grade security, governance and controlled access to SAP systems while maintaining the flexibility of open standards.

**Resources:**

[SAP Architecture Center: A2A and MCP for Interoperability](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/1)

### Outbound: Integrate Your Agents with Joule

For AI agents to deliver value in an enterprise context, they must be accessible through a familiar interface. Joule serves as the central orchestrator and entry point for all user interactions, routing requests to the right agent based on intent.

The integration pattern depends on how the agent was built:

- **Low-code agents** integrate automatically — deploying from Joule Studio creates all necessary Joule artifacts (scenarios, dialog functions) and registers the agent in Joule's catalog. No manual configuration required.

- **Pro-code agents** integrate via the A2A "Bring Your Own Agent" (BYOA) pattern — the agent exposes an A2A server endpoint and a Joule Scenario is configured to call it. This supports synchronous communication (60-second response window), asynchronous callbacks for long-running tasks and multi-turn conversations with context handling.

Both patterns ensure that end users interact with all agents — whether low-code or pro-code — through the same Joule conversational interface.

**Resources:**

[SAP Architecture Center: Integrating AI Agents with Joule](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/4)

### Inbound: Expose Joule Agents to Your Ecosystem

SAP agents are not limited to consumption within the SAP landscape. Through the **Agent Gateway**, Joule Agents can be exposed for consumption by third-party applications and external agentic systems via the A2A protocol.

**What the Agent Gateway provides:**

:::info Agent Gateway Availability
The Agent Gateway is not yet generally available (GA). Current architecture supports unidirectional (outbound) communication. Key components enabling full bidirectional capabilities are expected to be released soon.
:::

- A publicly accessible A2A endpoint managed by SAP
- A2A 0.3.0 specification support with HTTP+JSON transport
- Authentication via SAP Cloud Identity Services (IAS) App2App tokens
- Support for both synchronous and asynchronous (callback-based) responses

**Use cases for external consumption:**

- **Third-party AI platforms**: Google Vertex AI, Microsoft Copilot Studio and AWS Bedrock can delegate SAP-specific tasks to Joule Agents
- **Custom applications**: Mobile apps, partner applications and custom chatbots can access Joule Agent capabilities
- **Cross-system orchestration**: External orchestration platforms can coordinate multi-system workflows involving Joule Agents

**Resources:**

[SAP Architecture Center: Integrating Joule Agents into Your Ecosystem](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/5)

## Services and Components

| Service | Purpose |
|---------|---------|
| [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core?region=all) | Runtime environment for AI operations and managed agent execution |
| [Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core) | Central access point to foundation models across providers (Azure OpenAI, AWS Bedrock, Google Vertex AI and more), with orchestration service (harmonized API), prompt registry, prompt optimization and enterprise features like data masking and content filtering |
| [Joule Studio](https://www.sap.com/products/artificial-intelligence/joule-studio.html) | Low-code agent development in SAP Build |
| [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud?region=all) | Vector Engine for similarity search and RAG patterns; Knowledge Graph Engine for semantically connected enterprise data and advanced reasoning |
| [SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation?region=all) | Workflows, business rules and automations as agent tools |
| [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all) | Enterprise integration and API management |
| [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/cloud-identity-services?region=all) | Authentication, authorization and identity federation |

## Resources

**Reference Architectures:**

- [Agentic AI & AI Agents — Overview](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e)
- [A2A and MCP for Interoperability](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/1)
- [Low-Code AI Agents with Joule Studio](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/2)
- [Extend Joule with Joule Studio](https://architecture.learning.sap.com/docs/ref-arch/06ff6062dc/3)
- [Pro-Code AI Agents on SAP BTP](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/3)
- [Integrating AI Agents with Joule](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/4)
- [Integrating Joule Agents into Your Ecosystem](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/5)

**Documentation & Learning:**

- [A2A Protocol Specification](https://a2a-protocol.org/latest/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Joule Development Guide](https://help.sap.com/docs/joule/joule-development-guide-ba88d1ec6a1b442098863d577c19b0c0/development)
- [SAP AI Foundation](https://www.sap.com/products/artificial-intelligence/ai-foundation-os.html)
