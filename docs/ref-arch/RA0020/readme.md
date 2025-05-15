---
id: id-ra0020
slug: /ref-arch/61f6a1db63
sidebar_position: 20
sidebar_custom_props:
  category_index:
    - integration
title: Business to Business Integration
description: >-
  Discover SAP's Business-to-Business (B2B) Integration architecture for
  efficient electronic document exchange with trading partners. Learn about
  design and runtime perspectives, flow, SAP Integration Suite capabilities,
  security, scalability, and more.
keywords:
  - sap
  - b2b
  - integration
sidebar_label: Business to Business Integration
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

With the help of business-to-business (B2B) integration, you can electronically exchange business documents with other organizations. It allows you to extend your business processes beyond your organization’s boundaries to include your business partners such as customers and suppliers. To enable electronic data exchange with those business partners, you need to align with them on common B2B standards, which include document types, transport protocols, partner identification, security features, and more.

This reference architecture is based on the concepts of the **SAP Integration Solution Advisory Methodology**. Here, B2B integration is defined as an integration use case pattern that belongs to the process integration style. The diagram shows the runtime perspective for B2B integration covering the integration domains Cloud2Cloud and Cloud2OnPremise.

## Architecture

![drawio](drawio/business-to-business-integration.drawio)

### Flow

The flow and diagram include both the design-time and runtime perspectives, allowing you to better understand the scope, purpose, and interplay of the technical components and solutions for B2B integration. The first three steps belong to the design-time perspective and are typically performed by an integration developer. The remainder describes the runtime perspective of how B2B documents are exchanged with one or more trading partners.

Let’s take a look at each step in detail:

1. **Cloud Integration**: The Cloud Integration capability within SAP Integration Suite allows you to exchange B2B documents between business solutions (cloud or on-premise, SAP or 3rd party) with trading partners using B2B standards (such as EDIFACT, ANSI X.12, IDoc) and protocols (such as AS2) in a reliable and secure fashion.

2. **SAP Business Accelerator Hub**: Provides predefined integration flows, APIs, adapters, and more to build custom integration flows deployed on Cloud Integration, including templates for Trading Partner Management and Integration Advisor.

3. **Integration Advisor**: This capability within SAP Integration Suite is used to define and document interfaces (message implementation guidelines) and mappings (mapping guidelines) for B2B scenarios efficiently. It includes an intelligent and crowd-sourced proposal service that proposes message implementation guidelines and mapping guidelines with the best fit for a given trading partner. This is achieved by analyzing how such messages and mappings were designed for other trading partners with the same business context (e.g., industry classification, business process, geo-political location). As a result, you can speed up the content creation to deployment process by almost 60%. Out of these guidelines, you can generate runtime artifacts deployable on Cloud Integration.

4. **Trading Partner Management**: This capability manages trading partner agreements, which are complete B2B scenarios, reusing partner profile information such as identifiers, interface, and mapping information derived from Integration Advisor. The agreements specify how B2B messages are exchanged with a specific trading partner (e.g., required identifiers, acknowledgment handling, B2B standards, and versions used). Once created and activated, the information is pushed to the Partner Directory within Cloud Integration.

5. **Runtime Execution**: At runtime, predefined generic integration flows on Cloud Integration can dynamically read trading partner agreement information from the partner directory to enable the exchange of B2B messages with a dedicated trading partner.

6. **On-Premise Integration**: Whenever the integration scenario involves an on-premise solution (Cloud2OnPremise), it is recommended to use the SAP Connectivity service with a cloud connector and SAP Destination service to establish a secure connection from SAP BTP to the on-premise landscape.

7. **SAP S/4HANA or SAP ECC Integration**: When the integration scenario involves SAP S/4HANA or SAP ECC, the SAP Application Interface Framework can enable integration monitoring and error handling for business users.

### Characteristics

An architecture for B2B integration can be characterized as follows:

- **Inter-organizational data exchange**: B2B integration involves the exchange of business documents between two or more organizations, aiming for a high level of automation.
- **Management of trading partner-related information**: B2B integration requires managing B2B relationships with many trading partners, including reusable information relevant for setting up a B2B scenario, such as trading partner identification, supported B2B standards, acknowledgment handling, service level agreements, and more.
- **Support of B2B standards**: B2B integration relies on agreed standardized formats (such as EDIFACT, ANSI X.12, SAP IDoc) that also include trading partner identifiers and protocols (such as AS2, HTTPS) to ensure compatibility and interoperability between systems.
- **Secured communication**: As B2B documents are exchanged over the public internet, you need to establish secure communication channels (transport-level security) and configure digital encryption and digital signing of messages (message-level security).
- **Scaling design and runtime environment**: B2B integration requires a scalable solution that can accommodate the growth of trading partner networks and increasing data load. This may include optimized features for trading partner onboarding and management and processing bulk data.

## Examples in an SAP Context

Many SAP solutions, such as SAP S/4HANA Cloud, offer public APIs for B2B integration scenarios. Examples of applying the reference architecture for B2B integration for cloud deployment include:

- [Supplier Invoice - Create (B2B, Inbound, Asynchronous)](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/91af7f8d3acd47da90d33aaacfcd0d59/a7deb63f4a9a43c2850933cb4c77f53d.html?q=Supplier%20Invoice%20-%20Create%20(B2B,%20Inbound,%20Asynchronous)%20&locale=en-US) in SAP S/4HANA.
- [Sales Order/Customer Return - Create, Update, Cancel (B2B)](https://help.sap.com/docs/SAP_S4HANA_CLOUD/03c04db2a7434731b7fe21dca77440da/4261582b6ca44d008c72be11b9a400e2.html?q=%22EDI%22%20Sales&locale=en-US) in SAP S/4HANA Cloud.
- [Manage Just-In-Time Calls](https://help.sap.com/docs/SAP_S4HANA_CLOUD/d35113ee62644d3abee1aaec148291d9/2963c5246b334cca8787cc1aa4cd587c.html?q=%22EDI%22%20Just&locale=en-US) in SAP S/4HANA Cloud.

## Reasonable Alternatives

Alternative architectures and solution options for B2B integration for cloud deployment include:

- **API Managed Integration**: In some cases, public web services-based APIs can be used for exchanging business data with trading partners. This requires standardized API-based integration approaches within an industry, including agreements on API types (such as SOAP, REST), document formats (such as predefined XML schemas), security requirements, and more.  
  Example: Exchange of transport-related information in the automotive industry, as defined by the German Association of the Automotive Industry (VDA), includes standards like [VDA4998 REST-API for transport track and trace](https://www.vda.de/en/news/publications/publication/vda-4998---rest-api-for-transport-track---trace---v1.0--2021-06).

- **SAP Business Network and SAP Ariba Solutions**: Instead of interacting with individual trading partners, you can join the SAP Business Network or SAP Ariba solutions for sourcing, procurement, and supplier management. These enable organizations to collaborate as customers or suppliers.  
  Example: Use [SAP Integration Suite, managed gateway for spend management and SAP Business Network](https://help.sap.com/docs/sisgw?locale=en-US) to integrate SAP ERP and SAP S/4HANA backend systems with trading partners and SAP Ariba solutions. Suppliers can also choose alternative integration options like online, EDI, or API-based approaches ([How Suppliers connect to SAP Business Network](https://help.sap.com/docs/business-network-for-trading-partners/introduction-to-business-network/how-suppliers-connect-to-sap-business-network?locale=en-US)).

## Services and Components

- [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?service_plan=lite&region=all)

## Resources

- [SAP Business Accelerator Hub](https://hub.sap.com)
- [SAP Application Interface Framework](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK_OVERVIEW)
- [SAP Integration Suite (SAP Help Portal)](https://help.sap.com/docs/integration-suite)
- [SAP Integration Solution Advisory Methodology (SAP Help Portal)](https://help.sap.com/docs/architecture_guidance/f64ada51d9f44c83a751b96f955aad5a/85bcc8675d3e42718279bf7b87dafc2d.html?locale=en-US)
- [SAP Integration Suite (SAP Community topic page)](https://community.sap.com/topics/integration-suite)
- [Integration Advisor: Overview of components for building B2B integration content and further reading (SAP Community blog post)](https://blogs.sap.com/2021/09/28/integration-advisor-overview-of-components-for-building-b2b-integration-content-and-further-reading/)
- [Announcement: SAP Trading Partner Management and B2B Monitoring brand new capabilities of SAP Integration Suite is released! (SAP Community blog post)](https://blogs.sap.com/2021/12/17/announcement-sap-trading-partner-management-and-b2b-monitoring-brand-new-capabilities-of-sap-integration-suite-is-released/)

## Related Missions

- [Get started with SAP Integration Suite](https://discovery-center.cloud.sap/missiondetail/3258/3327/)