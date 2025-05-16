---
id: id-ra0001-2
slug: /ref-arch/fbdc46aaae/2
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Design Considerations for EDA Applications
description: >-
  Understand key challenges, key design patterns and key considerations from
  platform, technical services,when building event-driven architecture based
  applications.
keywords:
  - sap
  - btp
  - integration
  - event-driven architecture
  - azure
  - aws
  - genai
  - cloud application programming model
  - cap
  - eda
sidebar_label: Design Considerations for EDA Applications
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
discussion: 
last_update:
  author: anbazhagan-uma
  date: 2025-03-18
---

## Architecture Principles for building EDA Application
This generic architecture is required to address the events related integration among the systems to achieve the business integration in seamless way. This architecture is specific to use cases where there is 3rd party integration with SAP Cloud systems(for e.g SAP BTP, SAP S/4HANA etc)

The key functionalities and requirements that needs to be met by this architecture are 

1) All the message/events that has been published should be available for subscription. Zero loss of messages.
2) Events transmitted at real-time should be ready to be subscribed by subscriber systems for further processing.
3) Seamless integration with business systems for updating or initiating the business processeses in the backend systems. orchestrate the workflow based on the data received from the events.
4) Ability to monitor and track the messages.
5) Decouple the applications, event messages and service integrations.
6) Should have the capability and tools to identify the critical events for which the enterprise systems needs to get updated based on the event data.
7) Application design should categorize the events based on the type of event(data or notification event)
8) Select the eventing service suitable for business scenario based on the service offerings, transaction volume, flexible broker deployment requirement etc.
9) Ability for secured authentication and authorization mechanism for SAP BTP Integration.
10) Architecture should be capable to connect cloud services, legacy systems, IOT devices and other data scenarios which are part of the heterogenous landscape.


## Design Considerations for EDA Implementations

![drawio](drawio/e2b-cc.drawio)



For the above architecture, it is important to look at the different technology options available and select the best suited options based on the business/technical scenario for integration.
Key Considerations from Platform or Services perspective - 

- Publishing events(critical events/all events that are generated from the event producer system)
- Format of the event message which is compatible and applicable in all the systems.
- Choice of SAP BTP Runtime environment to run the Events-To-Business Actions Framework.
- Choice of the eventing services in SAP BTP. Next section provide details on the SAP BTP Eventing services and decision approach for selecting the service for consumption.
- Select the APIs from SAP Business Accelerator Hub for integration with SAP Systems.
- API Integration options(direct integration(Cloud Connector or Private Link Service) or via SAP Cloud Integration Service)
- Ensuring secured API access in SAP BTP as well as SAP Systems via SAP Cloud Identity Services.

### Eventing services

API led integrations and event based integrations go hand in hand very well. SAP Integration Suite supports the eventing infrastructure with the below list of offerings
- SAP Integration Suite,advanced event mesh and Event Mesh Capability of Integration Suite.
- Event Catalogs to understand the standards of events SAP provides and also provision to build your own catalog with your events.
- Event Mediation with Cloud Integration capability enables event mapping, event enrichment, event enabling of legacy systems and connectivity to other applications, brokers and adapter through adapters.
  
Below are the features of the services which will help one decide on the choice of the eventing service that needs to be leveraged for EDA Application Development.

    - **SAP Integration Suite, advanced event mesh(AEM)** is a distributed multi-broker event mesh which can be used for enterprise EDA implementations with flexible broker deployments. It complements SAP Event Mesh for more demanding use cases and offers benefits like support for very heavy loads or a truly distributed mesh of event brokers. A full set of eventing services including event streaming, event management and monitoring is provided and on top advanced features like dynamic message routing and fine-grained filtering.

    - **Event Mesh capability(EM)** (Event Mesh Capability of SAP Integration Suite) is an event broker which will enable implementation of starter or small volume EDA scenarios across SAP and third-party applications. It will enable a start small and expand EDA strategy.Suitable for low to medium EDA scenarios across SAP and non-SAP.It primarily enables "land and expand" strategy which means one can start with EM and then transition to AEM based on the scale of operations.

Both the services are fully managed cloud service, connect SAP and non-SAP system, have out of the box support for SAP event sources and support standard protocols.
The key differences are as below

| Feature | Event Mesh capability of SAP Integration Suite | SAP Integration Suite,advanced event mesh |
| :---: | :---: | :---: |
Infrastructure Model | Shared | T-Shirt Sizes|
Connecting SAP and non-SAP systems | BTP Deployment | Private and Public Cloud|
Message Size and Storage | 1MB/10GB | Up to 30MB/Up to 6TB|
Typical use case size | Small to Medium | Small to Ultra-large|

Apart from the above mentioned SAP Integration Suite, advanced event mesh allows to create network of event brokers, provides advanced event monitoring and analysis, allows dynamic event routing, has capabilities for filtering, event replay and event management.

Refer to [Comprehensive Real-Time Integration Using Event-Driven Architecture](https://www.sap.com/documents/2024/10/f41de944-dc7e-0010-bca6-c68f7e60039b.html) for more details on capabilities in SAP BTP for building EDA Applications. 
  
### SAP BTP Runtime
Refer to the SAP BTP Developer Guide [Understanding Available Technology](https://help.sap.com/docs/btp/btp-developers-guide/understanding-available-technology#loiof3641a5635504edab2c6bb84fa86a42a) to help decide on the runtime choice.
### Business APIs
Explore and discover [SAP Business Accelerator Hub](https://api.sap.com) to consume APIs, events, adapters, business objects details for the extension application. 
In this reference architecture the APIs in the ERP business systems are integrated in the sample applications. To extend the architecture to other SAP Systems or to leverage the events that are configured in the business systems, the content from SAP Business Accelerator Hub provides insights.

## Navigating from Generic Architecture to Specific Architecture for implementing business scenarios

Based on the generic reference architecture, below can be 2 specific architecture which are specific to the two different integration patterns based on different Hyperscaler environnement which acts as event producer. 

### Architecture 1 - Event-driven architecture with AWS as the Event Producer

Go to [Integration with Amazon Web Services](../3-aws-iot-integration/readme.md)

### Architecture 2 - Event-driven architecture with Microsoft Azure as the Event Producer

Go to [Integration with Microsoft Azure](../4-azure-iot-integration/readme.md)