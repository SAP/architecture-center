---
id: 5f90af
slug: /ref-arch/5f90af
sidebar_position: 230
title: API Managed Integration with SAP Integration Suite
description: >-
  Enable secure, omni-channel API access to business apps with SAP Integration
  Suite, simplifying governance, security, and API consumption.
keywords:
  - sap
  - api management
  - sap integration suite
  - api-managed integration
  - api gateway
  - api security
  - api governance
  - business data graph
  - api composition
  - ai agents
  - mcp gateway
  - api lifecycle management
  - api monetization
  - omni-channel api access
  - business ai platform
sidebar_label: API Managed Integration
image: img/ac-soc-med.png
tags:
  - integration
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - avikSap
  - fabianleh
  - rameshvaranganti
discussion: 
last_update:
  author: rameshvaranganti
  date: 2026-10-26
---

Application Programming Interfaces (APIs) enable integration, interoperability, and data sharing between software systems. With the help of an API management solution like the API Management capability within SAP Integration Suite, you can provide omni-channel and secure access to solutions. Furthermore, it allows you to enforce usage policies for APIs, control API access, analyze API consumption, and more.  
  
This reference architecture is based on the concepts of the **SAP Integration Solution Advisory Methodology**. API-managed integration is defined as a cross-use case pattern that complements other integration use case patterns.

## Architecture

![drawio](drawio/api-managed-integration.drawio)
  
### Flow  
  
The reference architecture diagram illustrates the runtime perspective for API-managed integration across Cloud2Cloud, Cloud2OnPremise, and OnPremise2OnPremise domains. Detailed steps include:  
  
1. **API Gateway Protection**: A client application sends an API call intercepted by the API Management capability within SAP Integration Suite, which acts as a protection layer. APIs are exposed as API proxies that abstract endpoint properties and enforce security measures, transformations, governance, and insights.  
  
2. **Predefined API Resources**: SAP Business Accelerator Hub provides API policy templates, APIs, predefined integration flows, and more to enable interoperability between API providers and consumers securely.  
  
3. **Managed API Use Case**: API requests are forwarded to a data source acting as an API provider. This use case is suited for scenarios requiring simple transformations and protocol adaptations supported by API Management.  
  
4. **Business Data Graph Use Case**: The API Composition capability (formerly Graph) of API Management exposes business data as a semantically connected graph. It simplifies consumption across multiple data sources via a unified API.  
  
5. **Cloud Integration Use Case**: For advanced mediation and transformation requirements, Cloud Integration capability is used to handle scenarios beyond the scope of API Management.  
  
6. **On-Premise Connectivity**: For Cloud2OnPremise scenarios, use SAP Connectivity service with a cloud connector and SAP Destination service to establish secure connections.  
  
7. **Edge Integration Cell**: For local data processing (e.g., compliance requirements), edge integration cell runtime allows managing APIs and running integration scenarios within private landscapes. It is deployed in customer-managed Kubernetes environments.  
  
8. **SAP S/4HANA or SAP ECC Integration**: Use SAP Application Interface Framework for monitoring and error handling in SAP S/4HANA or SAP ECC integration scenarios.  

9. **AI Agents as API Consumers**: AI agents, such as Joule agents or third-party MCP clients, call the same governed APIs through the MCP Gateway in SAP Integration Suite. APIs and integration flows are exposed as MCP tools behind the same authentication, traffic, and analytics policies as any other client application. See [AI Agents as API Consumers](#ai-agents-as-api-consumers).  
  
### Characteristics  
  
An architecture for API-managed integration is characterized by:  
  
- **Governed API Consumption**: Govern the full lifecycle of APIs, enforce policies, ensure compliance, and control the integration process.  
- **Decoupled Integration**: Abstract APIs from their implementation using API façades, enabling independent evolution of systems without mutual interference.  
- **Advanced Protection**: Ensure API security through policies, traffic protection, and compliance measures.  
- **Visibility and Analytical Insights**: Centrally collect and analyze API metrics, with options for monetizing API consumption.  
- **Interoperability**: Perform transformations and mediations to enable seamless interoperability between API providers and consumers, including simplified consumption via data graphs.  
- **Agent-Ready Consumption**: Treat AI agents as first-class, governed API consumers rather than bolt-on microservices, using the same policies, identities, and analytics as other client applications.  
  
## API Composition and Authentication Choices

**API Composition** is the current name of the former Graph capability. It exposes a semantically connected Business Data Graph through a unified API. Distinguish this capability from integration logic composed inside an API-centric artifact. See [API Composition release information](https://help.sap.com/docs/api-composition/isuite-api-composition/what-s-new-for-api-composition).

For APIs authenticated by an external OAuth/OIDC provider, define the trusted issuer, intended audiences, and authorization requirements for the target runtime and policy. The external OAuth Authentication Policy supports optional or multiple audience values; optional configuration does not remove the need to decide which consumers should be accepted. Test rejected tokens and insufficient permissions as well as successful calls. See [API Management authentication updates](https://help.sap.com/docs/sap-api-management/sap-api-management/what-s-new-for-sap-api-management).

## AI Agents as API Consumers

AI agents are now direct consumers of enterprise APIs. In an API-managed architecture, they should be treated as first-class integration participants, governed with the same rigor as any other client application, not as bolt-on microservices that call back-end systems directly.

The **MCP Gateway in SAP Integration Suite** is the agent-facing entry point. It exposes SAP and non-SAP APIs, integration flows, and remote MCP servers as governed, MCP-compliant tools. For the architecture of the gateway itself and the supported MCP server creation paths, see [A2A and MCP](../RA0029/1-a2a-and-mcp/readme.md#mcp-gateway-in-integration-suite). For connecting external agent platforms, see [Third-Party MCP Access](../RA0029/10-third-party-mcp-access/readme.md).

When adding agents as API consumers, apply the following principles:

- **One governance plane**: Expose agent tools from the same API proxies and integration flows that serve other channels, so authentication, rate limiting, payload protection, and analytics are enforced once. Avoid separate point-to-point paths created only for agents.
- **Zero Trust by default**: Authenticate every agent call with OIDC, validate the token issuer and audience at the gateway, and propagate the user's identity where the back end needs to apply its own authorizations. Grant agents least-privilege access to the specific operations a business task needs. See [AI Agent Identity](../RA0029/8-ai-agent-identity/readme.md).
- **Curated tool surface**: Select only the operations an agent needs, and review tool names, descriptions, and input schemas, because agents choose tools based on this metadata.
- **Observability**: Monitor tool usage, errors, and latency through [API and MCP analytics](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/analyze-apis-and-mcp-servers) to support compliance and adoption governance.

### API Composition and SAP Knowledge Graph

API Composition (formerly Graph) and SAP Knowledge Graph serve different purposes and should not be confused:

- **API Composition** exposes a semantically connected Business Data Graph through a unified API at runtime. As an API, it can be governed and exposed to agents like any other API in this architecture.
- **SAP Knowledge Graph** provides the ontology and semantic layer over SAP data products that grounds Joule and AI agents in business meaning. See [Ontology and Knowledge Graph](../RA0039/1-sap-lakehouse/5-ontology-kg/readme.md).

## Examples in an SAP Context  
  
SAP does not deliver predefined integration scenarios for API-managed integration. Customers and partners typically implement API management solutions for reasons such as:  
  
- Achieving a consistent and harmonized omni-channel experience.  
- Managing and protecting business-critical API assets.  
- Simplifying integration with SAP and other API providers.  
- Realizing revenue in the cloud-native economy.  
  
## Services and Components  
  
- [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)  
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)  
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?service_plan=lite&region=all)  
  
## Resources  
  
- [SAP Business Accelerator Hub](https://hub.sap.com)  
- [SAP API Management – Overview & Getting started (SAP Community blog post)](https://blogs.sap.com/2016/03/03/sap-api-management-overview-getting-started/)  
- [SAP Integration Suite (SAP Help Portal)](https://help.sap.com/docs/integration-suite)  
- [SAP Integration Solution Advisory Methodology (SAP Help Portal)](https://help.sap.com/docs/architecture_guidance/f64ada51d9f44c83a751b96f955aad5a/85bcc8675d3e42718279bf7b87dafc2d.html?locale=en-US)  
- [SAP Integration Suite (SAP Community topic page)](https://community.sap.com/topics/integration-suite)  
- [Model Context Protocol (MCP) in SAP Integration Suite (SAP Help Portal)](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/model-context-protocol-mcp)  
- [Creating an MCP Server (SAP Help Portal)](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/creating-mcp-server)  
  
## Related Missions  
  
- [Get Started with Integration Suite - API Management](https://discovery-center.cloud.sap/missiondetail/3062/3072/)
