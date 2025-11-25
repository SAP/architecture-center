---
id: id-ra0005-11
slug: /ref-arch/e5eb3b9b1d/11
sidebar_position: 11
sidebar_custom_props:
  category_index: []
title: Building Code-Based Agents
description: >-
  Build AI agents using popular frameworks like AWS Strands, LangGraph,
  Microsoft Agent Framework, Google Agent Development Kit, and CrewAI on SAP BTP
  with Kyma Runtime for custom enterprise automation.
keywords:
  - sap
  - ai agents
  - code-based agents
  - aws strands
  - langgraph
  - microsoft agent framework
  - google agent development kit
  - crewai
  - kyma runtime
sidebar_label: Building Code-Based Agents
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - aws
  - azure
  - gcp
  - kyma
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
   - seeobjectively
last_update:
    author: seeobjectively
    date: 2025-11-25
---

Code-Based Agents on SAP Business Technology Platform (BTP) enable developers to implement sophisticated AI agent workflows using popular frameworks. This approach provides maximum flexibility for building custom agent logic, complex orchestration patterns, and tailored integrations that go beyond low-code configuration capabilities. By leveraging frameworks such as AWS Strands, LangGraph, Microsoft Agent Framework, Google Agent Development Kit, and CrewAI, developers can create enterprise-grade AI agents that seamlessly integrate with SAP services and external systems.

This reference architecture demonstrates the implementation using **AWS Strands**, but developers have the flexibility to choose any agent framework that best fits their specific requirements and technical preferences.

## Architecture

![drawio](./drawio/code-based-agents.drawio)

The architecture illustrates how code-based agents operate within SAP BTP using Kyma Runtime as the deployment platform. At the core, agent frameworks run as containerized workloads in Kyma Pods, providing the orchestration and reasoning capabilities needed for complex multi-step workflows. The architecture supports multiple deployment patterns:

### Core Components

**Kyma Runtime** serves as the cloud-native runtime environment, hosting agent applications in Pods. Each Pod can contain:
- **Tools**: Custom business logic and integrations exposed as callable functions
- **Strands Agent**: The agent orchestration layer managing workflow execution
- **LiteLLM**: A unified interface for accessing multiple LLM providers

**Generative AI Hub** through SAP AI Core provides centralized access to foundation models and LLMs. The architecture supports both:
- **Partner-built models**: Accessed via HTTPS through providers like Amazon Bedrock (Amazon Nova, Anthropic Claude, Amazon Titan)
- **SAP-hosted models**: Available directly through Foundation Model Access

**SAP HANA Cloud** enables agents to leverage enterprise data through:
- **Vector Engine**: Semantic search and similarity matching for contextual retrieval
- **Knowledge Graph Engine**: Structured relationship queries and reasoning over connected data

**Open Telemetry Module** integrated with **SAP Cloud Logging** provides observability for agent execution, enabling monitoring, debugging, and performance optimization.

**Authentication and Security** is managed through **SAP Cloud Identity Service** and **SAP Credential Store**, ensuring secure access to models and enterprise systems.

### Agent Frameworks

While this reference architecture demonstrates implementation using AWS Strands, the design supports multiple agent frameworks. Developers can choose the framework that best aligns with their requirements.

The choice of framework depends on factors such as existing cloud infrastructure, required integrations, team expertise, and specific use case requirements. All frameworks can be deployed on SAP BTP's Kyma Runtime and integrated with SAP AI Core's Generative AI Hub.

## Implementation Patterns

Code-based agents on BTP follow several key patterns:

### Memory and State Management
Agents maintain context across multi-turn interactions using:
- In-memory state for short-term context
- Vector storage in HANA Cloud for long-term memory
- Conversation history for continuity
- Custom persistence layers for domain-specific state

### Orchestration Strategies
Different frameworks support various orchestration approaches:
- **ReAct (Reasoning + Acting)**: Iterative thought-action-observation loops
- **Plan-and-Execute**: Upfront planning followed by sequential execution
- **Multi-Agent**: Specialized agents collaborating on subtasks
- **Reflexion**: Self-reflection and error correction cycles

## Deployment Considerations

When deploying code-based agents on BTP, consider:

**Scalability**: Kyma's Kubernetes foundation enables horizontal scaling of agent workloads based on demand.

**Observability**: Leverage OpenTelemetry integration for comprehensive tracing of agent execution, tool invocations, and LLM calls.

**Cost Management**: Monitor token usage and API calls through SAP AI Core's metering capabilities to optimize costs.

**Security**: Implement proper authentication flows using SAP Cloud Identity Service and secure credential management through SAP Credential Store.

**Performance**: Use LiteLLM for unified access to multiple model providers, enabling fallback strategies and load distribution.

## When to Use Code-Based Agents

Code-based agents are the right choice when:

- **Complex Logic Required**: Business rules and workflows exceed low-code capabilities
- **Custom Integrations Needed**: Specialized connectors or adapters are necessary
- **Framework-Specific Features**: Leveraging unique capabilities of specific agent frameworks
- **Fine-Grained Control**: Precise control over reasoning steps, memory, and tool selection
- **Advanced Patterns**: Implementing sophisticated orchestration like multi-agent systems or self-improving agents

For simpler scenarios focused on rapid deployment within the SAP ecosystem, consider [Content-Based Agents](../5-ai-agents/readme.md#content-based-agents) using Joule Studio's Agent Builder.

## Services & Components

For a comprehensive list of services, components and descriptions, please explore the Introduction on [Services & Components](./#services--components).

Additional components specific to this architecture:

- [SAP BTP, Kyma runtime](https://discovery-center.cloud.sap/serviceCatalog/kyma-runtime/?region=all) is a fully managed Kubernetes runtime based on the open-source project "Kyma". This cloud-native solution allows developers to extend SAP solutions with serverless functions and combine them with containerized microservices.

- [SAP Cloud Logging](https://discovery-center.cloud.sap/serviceCatalog/cloud-logging?region=all) is an instance-based and environment-independent observability service that builds upon OpenSearch to store, visualize, and analyze application logs, metrics, and traces from SAP BTP Cloud Foundry, Kyma, and other environments.

## Examples

Examples of code-based agent implementations:

- [AWS Strands documentation](https://aws.amazon.com/bedrock/agents/)
- [LangGraph tutorials and examples](https://langchain-ai.github.io/langgraph/tutorials/)
- [Microsoft Agent Framework documentation](https://learn.microsoft.com/en-us/semantic-kernel/agents/)
- [Google Agent Development Kit documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/agents)
- [CrewAI examples](https://docs.crewai.com/examples)

## Resources

For more information related to code-based agents:

- [AI Agent Development Approaches](../5-ai-agents/readme.md#ai-agent-development-approaches)
- [Agent Evaluation Framework](../5-ai-agents/readme.md#agent-evaluation)
- [SAP AI Core Documentation](https://help.sap.com/docs/sap-ai-core)
- [Kyma Runtime Documentation](https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-environment)
- [LiteLLM Documentation](https://docs.litellm.ai/)
