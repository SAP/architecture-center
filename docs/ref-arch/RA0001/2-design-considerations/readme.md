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
  - event-driven patterns
  - eda applications
  - cloud design considerations
  - architecture challenges
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
  date: 2025-10-18
---

## Architecture Principles for building EDA Application
This generic architecture is required to address the events related integration among the systems to achieve the business integration in seamless way. This architecture is specific to use cases where there is 3rd party integration with SAP Cloud systems(for e.g SAP BTP, SAP S/4HANA etc)

The key functionalities and requirements that needs to be met by this architecture are 

1) All the message/events that has been published should be available for subscription. Zero loss of messages.
2) Events transmitted at real-time should be ready to be subscribed by subscriber systems for further processing.
3) Seamless integration with business systems for updating or initiating the business processes in the backend systems. Orchestrate the workflow based on the data received from the events.
4) Ability to monitor and track the messages.
5) Decouple the applications, event messages and service integrations.
6) Should have the capability and tools to identify the critical events for which the enterprise systems needs to get updated based on the event data.
7) Application design should categorize the events based on the type of event(data or notification event)
8) Select the eventing service suitable for business scenario based on the service offerings, transaction volume, flexible broker deployment requirement etc.
9) Ability for secured authentication and authorization mechanism for SAP BTP Integration.
10) Architecture should be capable to connect cloud services, legacy systems, IOT devices and other data scenarios which are part of the heterogeneous landscape.


## Design Considerations for EDA Implementations


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

API-led integrations and event-based integrations go hand in hand very well. SAP Integration Suite supports the eventing infrastructure with the below list of offerings

- SAP Integration Suite, advanced event mesh and Event Mesh Capability of Integration Suite for EDA in Hybrid, Heterogeneous Landscapes.
- SAP Cloud Application Event Hub for EDA in SAP Enterprise Landscape.
- Event Catalogs to understand the standards of events SAP provides and provision to build your own catalog with your events.
- Event Mediation with Cloud Integration capability enables event mapping, event enrichment, event enabling of legacy systems and connectivity to other applications, brokers and adapter through adapters.
   
Below are the features of the services which will help one decide on the choice of the eventing service that needs to be leveraged for EDA Application Development.

  **SAP Integration Suite, advanced event mesh(AEM)** is a distributed multi-broker event mesh which can be used for enterprise EDA implementations with flexible broker deployments. It complements SAP Event Mesh for more demanding use cases and offers benefits like support for very heavy loads or a truly distributed mesh of event brokers. A full set of eventing services including event streaming, event management and monitoring is provided and on top advanced features like dynamic message routing and fine-grained filtering.

  This is the premium, enterprise-grade eventing service for high-performance, high-volume event streaming and management across complex, distributed landscapes. It is powered by Solace PubSub+ technology.


  ***Typical Use Cases:***
  - Real-time streaming of IoT sensor data from edge devices to central analytics platforms.
  - Synchronizing financial data in real-time across global data centers.
  - Handling massive volumes of clickstream data from public-facing websites.
  - Complex, hybrid-cloud integration scenarios requiring guaranteed, high-speed event delivery.

**Event Mesh capability of SAP Integration Suite** is an event broker which will enable implementation of starter or small volume EDA scenarios across SAP and third-party applications. It will enable a start small and expand EDA strategy.Suitable for low to medium EDA scenarios across SAP and non-SAP.It primarily enables "land and expand" strategy which means one can start with EM and then transition to AEM based on the scale of operations.

  SAP Event Mesh is the standard, foundational event broker service on SAP BTP (Business Technology Platform). It is a fully managed, cloud-based service that enables applications and services to communicate through asynchronous events.

  ***Typical Use Cases:***
  - Sending a "Sales Order Created" event from S/4HANA to a BTP application for custom validation.
  - Notifying a third-party logistics system when a "Goods Shipment" is posted.
  - Decoupling microservices built on BTP.

Both the services are fully managed cloud service, connect SAP and non-SAP system, have out of the box support for SAP event sources and support standard protocols.

The key differences are as below


| Feature | SAP Event Mesh Capability, SAP Integration Suite| SAP Integration Suite, Advanced Event Mesh |
|---------|--------------------------|--------------------------------------------|
| **Primary Use Case** | Standard business eventing, BTP extensions, application decoupling | High-performance, high-volume event streaming, complex hybrid/multi-cloud integration |
| **Deployment** | Runs centrally as a service within SAP BTP | Distributed. Deployments options can be **public cloud** administered by SAP (public regions or dedicated regions) or **customer owned regions** in the cloud on on-premise. |
| **Performance** | Good for low-to-moderate volumes (1MB messages, 10GB storage) | Very high-throughput, low-latency (30MB+ messages, 800GB+ storage) |
| **Event Management** | Basic monitoring and management of queues/topics | Full Event Portal for design, discovery, lifecycle management, and governance |
| **Key Features** | Publish-Subscribe, guaranteed delivery | All standard features + Event Streaming, Event Replay, Dynamic Routing, Transactions |
| **Infrastructure Model** | Shared | T-Shirt sizes |
| **Target Scenarios** | SAP to everything | SAP to everything and everything to everything |
| **Interfaces** | REST, JMS, AMQP, MQTT over WebSockets | REST, JMS, AMQP, MQTT over WebSockets and direct |

Apart from the above mentioned SAP Integration Suite, advanced event mesh allows to create network of event brokers, provides advanced event monitoring and analysis, allows dynamic event routing, has capabilities for filtering, event replay and event management.

**SAP Cloud Application Event Hub** is an SAP BTP Service that enables EDA implementations within SAP-centric landscapes. It provides a scalable, reliable eventing platform optimized for SAP applications and services.This is a serverless eventing service that allows seamless integration and event-driven communication between SAP applications, such as SAP S/4HANA, SAP SuccessFactors, and SAP Business Technology Platform (BTP) services. This is managed by SAP and are enabled out of the box for customers. This primarily supports two major scenarios -
- Pre-built event integrations between SAP Cloud Applications. Customers can activate and adapt the event subscription contnt as part of thier E2E business processes.
- Customer and partner(extension) applications built on SAP BTP that need to consume or publish events to SAP systems.

  ***Typical Use Cases:***
  - Route real-time business events from SAP S/4HANA to BTP applications for custom processing.
  - Trigger workflows in SAP BTP based on events from SAP SuccessFactors.
  - Supporting clean core strategies by consuming events from SAP BTP extension applications and integrate with SAP systems.

Refer to [Comprehensive Real-Time Integration Using Event-Driven Architecture](https://www.sap.com/documents/2024/10/f41de944-dc7e-0010-bca6-c68f7e60039b.html) for more details on capabilities in SAP BTP for building EDA Applications. 
  
### SAP BTP Runtime
Refer to the SAP BTP Developer Guide [Understanding Available Technology](https://help.sap.com/docs/btp/btp-developers-guide/understanding-available-technology#loiof3641a5635504edab2c6bb84fa86a42a) to help decide on the runtime choice.

### Business APIs
Explore and discover [SAP Business Accelerator Hub](https://api.sap.com) to consume APIs, events, adapters, business objects details for the extension application. 
In this reference architecture the APIs in the ERP business systems are integrated in the sample applications. To extend the architecture to other SAP Systems or to leverage the events that are configured in the business systems, the content from SAP Business Accelerator Hub provides insights.

## Navigating from Generic Architecture to Specific Architecture for implementing business scenarios

Based on the generic reference architecture, below can be 2 specific architecture which are specific to the two different integration patterns based on different Hyperscaler environment which acts as event producer. 

### Architecture 1 - Event-driven architecture with AWS as the Event Producer

Go to [Integration with Amazon Web Services](../5-aws-iot-integration/readme.md)

### Architecture 2 - Event-driven architecture with Microsoft Azure as the Event Producer

Go to [Integration with Microsoft Azure](../6-azure-iot-integration/readme.md)