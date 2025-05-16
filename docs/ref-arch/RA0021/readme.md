---
id: id-ra0021
slug: /ref-arch/58f6d88e9a
sidebar_position: 21
sidebar_custom_props:
  category_index:
    - integration
title: Application to Application Integration
description: >-
  Learn how application-to-application (App2App) integration facilitates the
  exchange of transactional data across internal company processes by connecting
  business applications in a near real-time manner. This reference architecture
  highlights SAP Integration Suite&#39;s role in enabling seamless data flow and
  interoperability between cloud and on-premise solutions.
keywords:
  - sap
  - app2app
  - integration
sidebar_label: Application to Application Integration
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
discussion: 
last_update:
  author: avikSap
  date: 2024-08-01
---

With the help of application-to-application (App2App) integration, you can exchange transactional data along internal company processes by connecting involved business applications in a (near-) real-time fashion. Messages are used for exchanging transactional data, which trigger the execution of the next process step in a connected business solution. Transactional data refers to data about ongoing business activities such as physical goods movement or sales order documents.

This reference architecture is based on the concepts of the **SAP Integration Solution Advisory Methodology**. App2App integration is defined as an integration use case pattern that belongs to the process integration style. The diagram illustrates the runtime perspective for App2App integration, covering the integration domains Cloud2Cloud, Cloud2OnPremise, and OnPremise2OnPremise.

## Architecture

![drawio](drawio/application-to-application-integration.drawio)

### Flow

The message flow for application-to-application integration is outlined as follows:

1. **Message Generation**: An SAP or third-party cloud solution issues transactional data as messages. The message comprises a header (e.g., receiver information) and a payload (e.g., business data).

2. **Direct Exchange**: Direct message exchange is possible when the outbound API of the sender and the inbound API of the receiver are aligned. This option is suited for simple landscapes or custom-built/partner solutions with aligned APIs.

3. **Cloud Integration**: For unaligned APIs between sending and receiving solutions (Cloud2Cloud, Cloud2OnPremise), the Cloud Integration capability within SAP Integration Suite applies mediations (e.g., receiver determinations, filtering) and transformations (e.g., structure mappings, protocol conversion). It enables decoupled integration, error handling, and more.

4. **Predefined Integration Flows**: SAP Business Accelerator Hub provides predefined integration flows, APIs, adapters, and more, which can be configured and deployed on Cloud Integration.

5. **On-Premise Connectivity**: For Cloud2OnPremise scenarios, use the SAP Connectivity service with a cloud connector and SAP Destination service to establish secure connections.

6. **Edge Integration Cell**: For data compliance and governance requirements, the edge integration cell runtime enables processing data locally within customer-managed private landscapes. It is an optional extension to SAP Integration Suite, designed for private Kubernetes environments.

![Edge Integration Cell (design, runtime and operations view)](images/a2a-edge-integration-cell-diagram.png)

7. **SAP S/4HANA or SAP ECC Integration**: Use the SAP Application Interface Framework for integration monitoring and error handling when involving SAP S/4HANA or SAP ECC.

### Characteristics

- **Use of Asynchronous Communication**: Preferred for most App2App integration scenarios, it eliminates tight coupling between business applications and increases resilience. Use SOAP, REST, or OData for asynchronous communication. Synchronous communication is used only when required (e.g., availability-to-promise checks).
- **Directed Messages**: Messages are used to exchange transactional data between sender and receiver(s). Receivers are determined within the sending system (logical receiver) or the integration technology (physical receiver).
- **Support for Exception Handling**: Proper handling of transmission failures due to issues like unavailability of receiving solutions or incorrect message content.
- **Transport and Message-Level Security**: Ensure secured communication over the public internet (transport-level security) and use digital encryption/signatures to protect message content (message-level security).

## Examples in an SAP Context

SAP delivers predefined App2App integration scenarios for end-to-end business processes spanning multiple SAP business applications. Examples include:

- **Lead-to-Cash Process**: Exchange sales orders between SAP Commerce Cloud and SAP S/4HANA for [cloud deployment](https://hub.sap.com/dfd/LC1C1-DFDTransactionalDataFlows).
- **External Workforce Process**: Replicate service entry sheets or timesheets from SAP Fieldglass Vendor Management System to SAP S/4HANA for [cloud deployment](https://hub.sap.com/dfd/EW1H1-DFDTransactionalDataFlows).
- **Acquire-to-Decommission Process**: Exchange maintenance orders between SAP S/4HANA and SAP Service and Asset Manager for [hybrid deployment](https://hub.sap.com/dfd/AD1H2-DFDDataFlows).

## Reasonable Alternatives

For selected SAP solutions, additional integration technologies tailored to specific needs are available:

- **SAP Integration Suite, Managed Gateway for Spend Management and SAP Business Network**: Formerly known as SAP Ariba Cloud Integration Gateway, this solution facilitates integration of SAP ERP or SAP S/4HANA systems with SAP intelligent spend solutions and SAP Business Network. It includes self-service wizards, automated testing, and real-time monitoring. Learn more: [Content Transformation Service](https://help.sap.com/docs/sisgw/sap-ariba-cloud-integration-gateway-installation-guide/content-transformation-as-service?locale=en-US).

## Services and Components

- [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?service_plan=lite&region=all)

## Resources

- [SAP Business Accelerator Hub](https://hub.sap.com)
- [SAP Application Interface Framework](https://help.sap.com/docs/SAP_APPLICATION_INTERFACE_FRAMEWORK_OVERVIEW)
- [SAP Integration Suite (SAP Help Portal)](https://help.sap.com/docs/integration-suite)
- [SAP Integration Solution Advisory Methodology (SAP Help Portal)](https://help.sap.com/docs/integration-suite)
- [SAP Integration Suite (SAP Community topic page)](https://community.sap.com/topics/integration-suite)

## Related Missions

- [Get started with SAP Integration Suite](https://discovery-center.cloud.sap/missiondetail/3258/3327/)
- [Publish Documents from SAP S/4HANA Cloud to SharePoint](https://discovery-center.cloud.sap/missiondetail/3324/3365/)
- [Extract your Ariba Spend Data using SAP Integration Suite](https://discovery-center.cloud.sap/missiondetail/4038/4245/)