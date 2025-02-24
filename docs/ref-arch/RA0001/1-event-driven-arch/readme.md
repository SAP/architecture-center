---
id: id-ra0001-1
slug: /ref-arch/a06a959120/1
sidebar_position: 1
sidebar_custom_props: {}
title: Introduction and SAP's EDA Strategy
description: Understanding Event-Driven Architecture, Core Concepts and Building Blocks.
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
sidebar_label: Introduction and SAP's EDA Strategy
image: img/logo.svg
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
last_update:
  author: anbazhagan-uma
  date: 2025-01-18
---

## Event-Driven Architecture

Event-driven Architecture (EDA) is a software design pattern for building and integrating systems which focuses on flow of events and resulting reaction triggered by these events. This kind of design pattern is very well suited in a heterogeneous landscape where there are multiple systems, on-premise or cloud-based environments with need to act on real-time events. The need for this pattern implementation is to address real time integration and insights, scalability , loose coupling and resilience.

Modern enterprises which are either cloud-based or hybrid with cloud and on-premise setup embrace the event-driven architecture as part of the integration strategy and API-first strategy. 

## Components of an Event-Driven Architecture

### Event
Event(Business Event) is a significant change in state. The events can be either notification events or data events which are sent from event source to inform about the change. A message holding the event description in an encoded format is sent through an event broker. Event consumers registred with event broker are informed of the event that has occured.

:::info Resources

Sample Notification Event: 
```{"type":"sap.s4.beh.businesspartner.v1.BusinessPartner.Changed.v1","specversion":"1.0","source":"/default/sap.s4.beh/0000000007","id":"fa163e0b-4824-1eec-83f7-32dfc754759c","time":"2021-09-07T08:57:17Z"," datacontenttype":"application/json","data":{"BusinessPartner":"1000187"}}```

:::

### Event Sources
Event Sources are the source of the event and broadcast the event to indicate that it has occurred.In the SAP ecosystem the most common event sources are the different back-end systems like SAP S/4HANA or SAP SuccessFactors solutions.
Explore [Events in SAP Business Accelerator Hub](https://api.sap.com/content-type/Events/events/events)

### Event Brokers
Event Brokers are intermediaries for event routing in a publish-subscribe approach. SAP Integration Suite, advanced event mesh and SAP Integration Suite, Event Mesh Capability are SAP's event brokers.

SAP Integration Suite, advanced event mesh supports an enterprise-wide EDA strategy across SAP and third-party applications in hybrid,heterogeneous landscapes with flexible broker deployments and high(er) requirements towards scalability and resilience.

The Event Mesh capability of SAP Integration Suite enables a “start small and expand” EDA strategy across SAP and third-party applications which starts with the implementation of some low-to-moderate volume EDA scenarios and allows a transition to advanced event mesh to meet growing demand.

### Event Consumers
Event Consumers are software components that subscribe to the event broker to be informed about events. In the SAP ecosystem, several kinds of event consumers are possible, ranging from extension applications on SAP Business Technology Platform to full blown SAP back-ends like SAP S/4HANA.

## SAP's Event-Driven Ecosystem

For businesses now, it is critical to have the system enabled to be able to act as event source as well event consumers. SAP's event-driven ecosystem today include 
- SAP LoB solutions as **Event Sources** as business critical events can be either enabled as data event or notification event. These events can be standard or custom event as well. 
- **Eventing Infrastructure** is enabled with SAP Integration Suite (Advanced Event Mesh,Event Mesh Capability).
- **Event consumers** which can be SAP systems/application or 3rd part applications.

SAP BTP's reference architecuture for EDA can be leveraged to build extension applications for building inbound and outbound scenarios with SAP Business Systems.

## SAP EDA Technology Strategy

SAP Integration Suite is leveraged for EDA in the enterprise. The Event Mesh capability of SAP Integration Suite is an event broker which will enable implementation of starter or small volume EDA scenarios across SAP and third-party applications.The Event Mesh capability will be comparable to the existing SAP Event Mesh7, but it will be bundled into the SAP Integration Suite, standard and premium editions.

SAP Integration Suite, Advanced event mesh serves these enterprise use cases. Enterprises use advanced event mesh as a distributed multi-broker event mesh to distribute, manage, and monitor events across broad enterprise landscapes. Advanced event mesh provides distributed event processing and routing across multiple interconnected brokers in the mesh. The mesh architecture allows for flexible deployments of interconnected brokers on hyperscalers in the cloud or in local customer environments, for example, co-deployed with on-premise applications. Advanced event mesh supports different sizes of brokers and different mesh topologies to scale the mesh according to event levels, serving almost any need with great resilience.

Advanced Event Mesh or Event Mesh Capability in SAP Integration Suite are services that help enterprise third-party applications,on-premise applications and SAP Cloud application either directly or through the SAP Cloud Application Event Hub.

As part of SAP's EDA Strategy, for all the exchange of events with the SAP Cloud Application, the SAP Cloud Application Event Hub Service can be leveraged. 

For more details, refer to [Comprehensive Real-Time Integration Using Event-Driven Architecture](https://www.sap.com/documents/2024/10/f41de944-dc7e-0010-bca6-c68f7e60039b.html)

## Event-Driven Architecture Use Cases

Refer to generic uses cases to understand EDA and suitable business scenarios
[Event-Driven Architecture Use Cases](https://learning.sap.com/learning-journeys/discovering-event-driven-integration-with-sap-integration-suite-advanced-event-mesh/presenting-event-driven-architecture-use-cases_babe31d3-d20d-4370-8f02-2f277f8033d5)
