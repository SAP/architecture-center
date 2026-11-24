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
  - api-centric integration
  - api artifact
  - integration cell
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
  date: 2026-11-18
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

10. **API-Centric Integration Use Case**: When API governance and lightweight orchestration belong together, an API artifact combines security, traffic management, and integration logic in a single artifact. It is deployed to the SAP-managed Integration Cell or to an Edge Integration Cell. See [API-Centric Integration with the API Artifact](#api-centric-integration-with-the-api-artifact).  
  
### Characteristics  
  
An architecture for API-managed integration is characterized by:  
  
- **Governed API Consumption**: Govern the full lifecycle of APIs, enforce policies, ensure compliance, and control the integration process.  
- **Decoupled Integration**: Abstract APIs from their implementation using API façades, enabling independent evolution of systems without mutual interference.  
- **Advanced Protection**: Ensure API security through policies, traffic protection, and compliance measures.  
- **Visibility and Analytical Insights**: Centrally collect and analyze API metrics, with options for monetizing API consumption.  
- **Interoperability**: Perform transformations and mediations to enable seamless interoperability between API providers and consumers, including simplified consumption via data graphs.  
- **Agent-Ready Consumption**: Treat AI agents as first-class, governed API consumers rather than bolt-on microservices, using the same policies, identities, and analytics as other client applications.  

## API-Centric Integration with the API Artifact

API-centric integration introduces the **API artifact**, which combines security, traffic management, and integration logic in a single design-time and runtime model. API artifacts are deployed either to the SAP-managed **Integration Cell** runtime or to a customer-managed **Edge Integration Cell**. To use the Integration Cell, activate it in SAP Integration Suite under **Settings → Runtimes → Integration Cell**. API artifacts sit between two established options: the classic API proxy in API Management and an API proxy in front of a Cloud Integration iFlow. See [API-Centric Integration (SAP Help Portal)](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/api-centric-integration).

### Benefits of a Unified API Artifact

- **Fewer independently maintained artifacts**: In the traditional architecture, API governance resides in the API proxy while integration processing resides in the iFlow. In an API artifact, governance and mediation are configured together, which reduces the number of artifacts to maintain and simplifies change coordination.
- **Fewer runtime transitions**: When the API artifact replaces the proxy-to-iFlow handoff, a request can pass through fewer runtime transitions. SAP does not state a guaranteed performance improvement for this unified architecture, and backend calls and network latency still apply, so measure the actual benefit for each scenario.
- **Clear scope of consolidation**: An API artifact consolidates the API governance and mediation responsibilities into one artifact. It does not make the entire solution a single deployment: backend systems and their deployments remain separate.

### Choosing Between API Proxy, API Artifact, and API Proxy with iFlow

| Option | Choose it when | Typical capabilities | Example |
|---|---|---|---|
| **API proxy** (classic API Management) | The backend already performs all business logic. The backend can be SAP S/4HANA, another backend API, or a Cloud Integration endpoint. The API layer protects and governs access without exposing the backend URL. | Application registration, OAuth authentication and authorization, rate limiting, quota and spike arrest for third-party consumers, IP filtering, threat protection, API versioning and lifecycle management, API analytics, and publication to the Developer Hub. | SAP S/4HANA already exposes a customer OData API. The consuming application needs controlled access with OAuth, quota enforcement, and monitoring. |
| **API artifact** (API-centric integration) | API governance is needed together with lightweight orchestration, in one artifact. | OAuth and authorization, request and response transformation, payload validation, data enrichment, multiple synchronous backend calls, sequential or conditional orchestration, API composition and simplification, and MCP exposure of eligible APIs. | An API aggregates data from several backend calls, validates and enriches the payload, and returns a simplified response. See [API-Centric Integration on SAP Integration Suite – Part 1](https://community.sap.com/t5/technology-blog-posts-by-sap/api-centric-integration-on-sap-integration-suite-part-1-build-and-deploy/ba-p/14438357). |
| **API proxy with iFlow** (API Management and Cloud Integration) | The scenario needs integration capabilities beyond the API layer. | Complex message mapping and transformation, multiple adapter types, asynchronous processing, durable message handling, exception subprocesses and recovery, long-running or multi-stage processes, and reuse of existing iFlows and integration components. | SAP SuccessFactors Intelligent Services sends hire, rehire, or manager-change events that carry only the event type and employee identifiers. Cloud Integration enriches the message from multiple SAP SuccessFactors portlets, applies complex mapping to the target format, delivers it, handles exceptions, and returns a status back to SAP SuccessFactors. |

### Deciding Factors

Complexity matters, but **capability fit matters more than complexity alone**. A simple integration can still require an iFlow if it needs an adapter that the selected API artifact runtime does not support. An API with several backend calls can still fit an API artifact well if those calls and transformations are supported. Evaluate the following questions:

- **Capability fit**: Can the API artifact perform the required processing with its supported mediation steps and adapters?
- **Runtime and connectivity**: Does the solution need SAP-managed execution, customer-managed edge execution, private connectivity, or a particular adapter?
- **Lifecycle model**: Is a unified API artifact preferred, or is there a reason to keep separate API and integration lifecycles?
- **Team skills**: Does the team have mature Cloud Integration expertise and reusable iFlows, or the skills to develop and operate API-centric integration?

### Runtime Choice: Integration Cell or Edge Integration Cell

Runtime choice is part of the API artifact decision. An API artifact can fit the functional requirements and still be unsuitable for a particular runtime or network topology. The key distinction is not simply performance: it is where the runtime must operate and which systems it must reach.

- **Integration Cell (default)**: The SAP-managed, cloud-native runtime. Use it when the API artifact can run in SAP-managed infrastructure and reach its backends from there, for example through SAP Connectivity service and SAP Destination service. Some creation methods, such as creating an API artifact from an API provider, are available only for Integration Cell.
- **Edge Integration Cell**: The customer-managed runtime, deployed in the customer's Kubernetes environment. Use it when the runtime must operate inside a private landscape, for example to keep data processing local for compliance requirements or to reach systems that are only accessible within the customer network. API artifacts deployed on Edge Integration Cell can't be exposed as MCP servers; MCP servers run on Integration Cell.

### Considerations Before Selecting an API Artifact

An API artifact brings API governance and integration processing together, but it does not provide unrestricted feature parity with every Cloud Integration iFlow capability or every classic API Management policy. Validate the following areas before selecting an API artifact:

1. **Supported integration steps, adapters, and policies**: Confirm that every step, adapter, and policy the scenario needs is supported on the selected runtime.
2. **MCP server restrictions**: When an API artifact is exposed as an MCP server, confirm which policies and processing steps apply to the MCP server.
3. **OpenAPI specification compatibility**: Confirm that the API specification can be imported. For example, MCP server creation requires OpenAPI 3.0, so older Swagger 2.0 specifications must be converted first.
4. **Service-plan and licensing prerequisites**: Confirm that the SAP Integration Suite service plan includes API-centric integration and the target runtime. See [SAP Note 2903776](https://me.sap.com/notes/2903776).
5. **Migration of existing API proxies**: Plan how existing API proxies move to API artifacts, or whether they remain in classic API Management.

### Example: SAP S/4HANA Sales Order API Exposed to AI Agents

An organization wants to expose sales order information from SAP S/4HANA to external applications and AI agents. The API must provide OAuth-based access, rate limiting, and payload mapping, while allowing authorized agents to discover and invoke it through MCP.

```text
External applications and AI agents
        │
        ▼
API artifact (Integration Cell) ── exposed as MCP server for authorized agents
        │
        ▼
SAP S/4HANA sales order API (OData or REST endpoint)
```

This scenario fits an API artifact for the following reasons:

- **More than a simple proxy**: The API requires payload mediation as well as API governance, so a classic API proxy alone is not enough.
- **MCP exposure from the same artifact**: An eligible REST or OData API artifact deployed on Integration Cell can also be exposed as an MCP server, subject to the documented MCP requirements. See [How Model Context Protocol (MCP) Server Enables AI Integration (SAP Help Portal)](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/how-model-context-protocol-mcp-enables-ai-integration-with-apis). For all MCP server creation paths, see [Creating MCP Server Artifacts on Integration Cell](../RA0029/1-a2a-and-mcp/readme.md#creating-mcp-server-artifacts-on-integration-cell).
- **Runtime constraint**: MCP exposure requires Integration Cell. Edge Integration Cell is not supported for this API artifact-to-MCP scenario.
  
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
- **SAP Knowledge Graph** provides the ontology and semantic layer over SAP data products that grounds Joule and AI agents in business meaning.

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
