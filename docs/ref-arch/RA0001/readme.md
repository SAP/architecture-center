---
id: id-ra0001
slug: /ref-arch/fbdc46aaae
sidebar_position: 1
sidebar_custom_props:
  category_index:
    - integration
    - appdev
    - aws
    - azure
title: Designing Event-Driven Applications
description: >-
  Guidance for developing applications based on Event-Driven Architecture (EDA)
  patterns and Cloud Application Programming (CAP) framework.
keywords:
  - sap
  - event-driven applications
  - eda patterns
  - cap framework
  - business event processing
  - advanced event mesh
  - event mesh
sidebar_label: Designing Event-Driven Applications
image: img/ac-soc-med.png
tags:
  - azure
  - aws
  - genai
  - integration
  - appdev
  - eda
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - anbazhagan-uma
  - pra1veenk
  - AjitKP91
  - swatimaste00
  - anirban-sap
discussion: 
last_update:
  author: anbazhagan-uma
  date: 2025-10-10
---

Customers are transitioning to cloud services and embracing a new digital core to achieve greater agility and business process innovation. This shift needs automation and real-time integration with their ERP systems, ensuring the entire ecosystem operates at the pace of the business. As part of digital transformation, enterprises are adopting API-First and Event-First Strategy and embracing event-driven architecture as part of their transformation journey. The need for building flexible and real-time responsive systems is important.

Event-driven architecture (EDA) is well-known approach for designing and building software systems in enterprise integration. This is well-suited to modern environments for addressing scalability, loose coupling and building resilient applications.

This reference architecture offers guidance for developing applications based on Event-Driven Architecture (EDA) on SAP Business Technology Platform (BTP).

## Architecture

![drawio](drawio/eda_ref_arch.drawio)

This architecture can be leveraged to build event-based integration scenarios between SAP and non-SAP Systems. The event producers and consumers can be either of the systems.
EDA architectural patterns focus on seamless flow of events and the resulting reactions and notifications triggered by these events.EDA solutions are based on multiple connected event brokers, which mediate the communication of event messages between event publishers and event consumers.
Along with APIs, events are a method of facilitating real-time process integration for intelligent enterprises. SAP cloud applications increasingly support event-driven architecture concepts.
It’s frequent for SAP applications to act as event publishers (as systems of records), but, as event-driven concepts become more popular, they can also act as event consumers. 

Note: All business events supported by SAP are published on [SAP Business Accelerator Hub](https://api.sap.com) which can be used for building event-driven extensions in SAP BTP.

## Flow 

The following depicts the different integration flows among different systems for event-driven scenarios.

1. The events are triggered from source systems or applications. The event producer systems can be SAP or non-SAP systems.
2. These events are published on to SAP Integration Suite, advanced event mesh / Event Mesh capability. 
3. Event consumer systems(SAP or non-SAP systems) subscribe the events from SAP Integration Suite, advanced event mesh / Event Mesh capability.
4. Depicts events consumption scenario. SAP BTP CAP extension application also can subscribe and consume the event information from advanced event mesh. Post processing of the event, the required action is triggered in the SAP S/4HANA system using the SAP Destination Service and SAP Connectivity service leveraging a cloud connector. If SAP S/4HANA and SAP BTP are running on the same Hyperscaler, communication with SAP S/4HANA happens via the SAP Private Link Service.
5. Depicts SAP Cloud Application Event Hub in the diagram that enables EDA implementations across the SAP Intelligent Enterprise suite. This can be used for event integration between SAP cloud application and applications built on SAP BTP.
6. Depicts event publish scenarios where 
    - SAP On-Premise/private systems publish SAP Standard events to advanced event mesh. 
    - Third-party application publish events using Advanced event mesh connectors.

## Architecture Components in event-driven architecture

SAP BTP plays significant roles in enabling clean core development, integrating, and building event-driven applications with technical services available. SAP BTP features SAP Integration Suite and SAP Integration Suite, advanced event mesh to support EDA.

### SAP Integration Suite, advanced event mesh

For asynchronous communication, the EDA solution offerings from SAP are SAP Integration Suite, advanced event mesh and SAP Integration Suite, event mesh capability. EDA enables clean core strategy by leveraging the data from all applications to build extension applications on SAP BTP.

Advanced event mesh is a distributed multi-broker event mesh designed to manage and monitor events across enterprise landscapes, including SAP and third-party applications, services, and technologies. It provides centralized visibility and control, distributed event processing, and flexible deployments, making it essential for large businesses.
In the enterprise scenario, advanced event mesh acts as backbone to help enterprises integrate third-party applications, on-premise application and SAP cloud applications.

### SAP Event Mesh capability of SAP Integration Suite
The Event Mesh capability of SAP Integration Suite (“Event Mesh capability” for short) is an event broker which will enable implementation of starter or small volume EDA scenarios across SAP and third-party applications. This service will enable a 'start small and expand' EDA strategy.This will be used if enterprise wants to implement small volume event integration scenarios across SAP and third-party applications.

As per [SAP Integration Solution Advisory Methodology (ISA-M)](https://help.sap.com/docs/sap-btp-guidance-framework/sap-integration-solution-advisory-methodology/catalog-of-integration-use-case-patterns),either of the options can be selected based on the eventing requirements.

### Cloud Integration capability of SAP Integration Suite

This capability plays an important roles in EDA in the following scenarios
- For providing **event mediation** functionality such as mapping of event structures and data, enrich event payloads etc.
- Acts as **event bridge** between third-party event brokers or applications and SAP EDA technology services.

### Event-Enabling of SAP Applications
SAP delivers standard events to support modular cloud ERP.For any development of derived events(extending SAP Standard events) or defining custom events,ABAP RESTful Application Programming Model(RAP) can be leveraged. For older releases of SAP S/4HANA and SAP ECC releases(since NW 7.31), the SAP Application Interface Framework(AIF) supports the development of custom events and customer interfaces for SAP Business Objects, IDoc Interfaces, and BAPI/RFC Functional Module interfaces.

### SAP Cloud Application Event Hub Service
This service will provide access to all business events in the SAP intelligent enterprise suite in the cloud. Supported SAP cloud applications will be natively connected to SAP Cloud Application Event Hub. This is an SAP BTP service.


## Services and Components

Below are the list of services that are must-have to implement this architecture. 

- **[SAP Integration Suite, advanced event mesh/ Event Mesh capability of SAP Integration Suite](https://discovery-center.cloud.sap/viewServices?category=integration)**

    - **[SAP Integration Suite, advanced event mesh](https://discovery-center.cloud.sap/serviceCatalog/advanced-event-mesh?region=all)**: This is a complete event streaming, event management, and monitoring platform that incorporates best practices, expertise, and technology for event-driven architecture (EDA) on a single platform.

    - **[Event Mesh capability of SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/event-mesh?region=all)**: This capability can be used if an enterprise applications to communicate through asynchronous events.

- **[SAP Cloud Application Event Hub](https://discovery-center.cloud.sap/serviceCatalog/sap-cloud-application-event-hub?service_plan=standard&region=all&commercialModel=btpea)**: This service supports SAP's strategic event-driven architecture initiative to create a well-defined, easily consumable and extensible ecosystem for exchanging SAP business events.

- **[SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)**: SAP Integration Suite is an industry-leading and enterprise-grade integration platform-as-a-service that helps businesses seamlessly connect and integrate their applications, data, and processes within their organization and beyond.

- **[SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime?region=all)**: The SAP BTP, Cloud Foundry runtime lets you develop polyglot cloud-native applications and run them on the SAP BTP Cloud Foundry environment.

-  **[Connectivity Service or Private Link Service, if both the platform are on the either Azure/AWS Infrastructure](https://discovery-center.cloud.sap/servicessearch/connectivity)**

    - **[SAP Connectivity Service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)**: SAP Connectivity service lets you establish connectivity between your cloud applications and on-premise systems running in isolated networks.

    - **[SAP Private Link service](https://discovery-center.cloud.sap/serviceCatalog/private-link-service?service_plan=standard&region=all&commercialModel=cloud)**: SAP Private Link service establishes a private connection between selected SAP BTP services and selected services in your own IaaS provider accounts. By reusing the private link functionality of our partner IaaS providers, it lets you access your services through private network connections to avoid data transfer via the public Internet.

- **[SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination?service_plan=lite&region=all&commercialModel=cloud)**: The Destination service lets you retrieve the backend destination details you need to configure applications in the Cloud Foundry environment.


## Examples

- Event-driven SAP Integration Suite,advanced event mesh scenario for buffering extreme peak loads. 
When releasing new products or promotions, the number of concurrent sales orders via webshop as well as stores increase. The extreme amount of concurrent orders cannot be handles using synchronous approaches. With the below event-driven architecture setup, the web shop stays active as AEM buffers the extreme peak loads and brokers can be started up for specific time frames helping with backends from high loads.

![drawio](drawio/eda_pattern1.drawio)

[Additional Event-Driven Architecture Use Cases](https://learning.sap.com/learning-journeys/discovering-event-driven-integration-with-sap-integration-suite-advanced-event-mesh/presenting-event-driven-architecture-use-cases_babe31d3-d20d-4370-8f02-2f277f8033d5)

## Resources
For more information related to this reference architecture, you can check out the following resources:

- [SAP Samples | GitHub ](https://github.com/SAP-samples/btp-events-to-business-actions-framework)
- [Blog Collection | SAP Integration Suite, advanced event mesh](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-integration-suite-advanced-event-mesh-blog-collection/ba-p/14111943)
- [SAP Developers | Publish and Subscribe to Events in SAP Integration Suite, advanced event mesh](https://developers.sap.com/tutorials/pubsub-view-events.html#51cb3f1a-5861-4802-a4a1-2f154eb40e0b)
- [SAP Learning Journey - Discovering Event-Driven Integration with SAP Integration Suite, Advanced Event Mesh](https://learning.sap.com/learning-journeys/discovering-event-driven-integration-with-sap-integration-suite-advanced-event-mesh/describing-sap-s-event-driven-ecosystem_ebe634bf-a91d-4276-b538-a3f4026c0f61)


