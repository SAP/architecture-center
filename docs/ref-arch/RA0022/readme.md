---
id: id-ra0022
slug: /ref-arch/309338f0eb
sidebar_position: 22
sidebar_custom_props:
  category_index:
    - integration
title: API Managed Integration
description: >-
  Discover how API-managed integration enables omni-channel, secure access to
  business applications while hiding the complexity of heterogeneous landscapes.
  Learn how SAP Integration Suite's API Management capability supports
  governance, security, and simplified consumption of business-critical APIs.
keywords:
  - sap
  - api
  - integration
sidebar_label: API Managed Integration
image: img/logo.svg
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
discussion: 
last_update:
  author: avikSap
  date: 2024-08-01
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
  
4. **Business Data Graph Use Case**: The Graph capability of API Management exposes business data as a semantically connected graph. It simplifies consumption across multiple data sources via a unified API.  
  
5. **Cloud Integration Use Case**: For advanced mediation and transformation requirements, Cloud Integration capability is used to handle scenarios beyond the scope of API Management.  
  
6. **On-Premise Connectivity**: For Cloud2OnPremise scenarios, use SAP Connectivity service with a cloud connector and SAP Destination service to establish secure connections.  
  
7. **Edge Integration Cell**: For local data processing (e.g., compliance requirements), edge integration cell runtime allows managing APIs and running integration scenarios within private landscapes. It is deployed in customer-managed Kubernetes environments.  
  
8. **SAP S/4HANA or SAP ECC Integration**: Use SAP Application Interface Framework for monitoring and error handling in SAP S/4HANA or SAP ECC integration scenarios.  
  
### Characteristics  
  
An architecture for API-managed integration is characterized by:  
  
- **Governed API Consumption**: Govern the full lifecycle of APIs, enforce policies, ensure compliance, and control the integration process.  
- **Decoupled Integration**: Abstract APIs from their implementation using API façades, enabling independent evolution of systems without mutual interference.  
- **Advanced Protection**: Ensure API security through policies, traffic protection, and compliance measures.  
- **Visibility and Analytical Insights**: Centrally collect and analyze API metrics, with options for monetizing API consumption.  
- **Interoperability**: Perform transformations and mediations to enable seamless interoperability between API providers and consumers, including simplified consumption via data graphs.  
  
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
  
## Related Missions  
  
- [Get Started with Integration Suite - API Management](https://discovery-center.cloud.sap/missiondetail/3062/3072/)
