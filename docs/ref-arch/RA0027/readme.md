---
id: id-ra0027
slug: /ref-arch/AVbz5BXZ
sidebar_position: 1
title: 'Reference Architecture for Event-Driven Applications'
description: 'Description for ref arch'
sidebar_label: 'Reference Architecture for Event-Driven Applications'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - aws
  - azure
  - genai
contributors:
  - abhissharma21
  - AjitKP91
  - anbazhagan-uma
last_update:
  date: 2025-10-13
  author: abhissharma21
---

Customers are transitioning to cloud services and embracing a new digital core to achieve greater agility and business process innovation. This shift needs automation and real-time integration with their ERP systems, ensuring the entire ecosystem operates at the pace of the business. As part of digital transformation, enterprises are adopting API-First and Event-First Strategy and embracing event-drive architecture as part of their transformation journey. The need for building flexible and real-time responsive systems is important.

This reference architecture offers guidance for developing applications based on Event-Driven Architecture (EDA) on SAP Business Technology Platform (BTP).

# Architecture

![drawio](drawio/diagram-rjgcx0BDpj.drawio)

This architecture can be leveraged to build event-based integration scenarios from different systems/applications (providers) into the SAP ecosystem (consumers) using SAP BTP. This uses asynchronous communication via message broker. This features a CAP-based application framework (Events-To-Business Actions Framework) which allows you to configure set of actions for a particular business scenario. Based on the events category and type, respective actions are triggered in SAP Line of Business (LoB) applications. It also uses SAP Integration Suite, advanced event mesh / Event Mesh capability in SAP Integration Suite, SAP Build Process Automation, SAP HANA Cloud, SAP Destination Service, SAP Connectivity service with cloud connector. An alternative architecture can be considered with SAP Private Link service for integrating SAP BTP and SAP S/4HANA in scenarios where both SAP BTP and SAP S/4HANA run on the same Hyperscaler environment (Microsoft Azure or AWS). The reference applications with Microsoft Azure and AWS demonstrates and helps to build end-to-end event-based integration scenario.

# Architecture Components

Learn about the roles and interactions of the key services and components in the Reference Architecture to understand how the different services are leveraged to achieve real-time event integration scenarios.

### SAP Integration Suite for Event Broker

For asynchronous communication, the EDA solution offerings from SAP are SAP Integration Suite, advanced event mesh and SAP Integration Suite, event mesh capability. EDA enables clean core strategy by leveraging the data from all applications to build extension applications on SAP BTP.

Advanced event mesh is a distributed multi-broker event mesh designed to manage and monitor events across enterprise landscapes, including SAP and third-party applications, services, and technologies. It provides centralized visibility and control, distributed event processing, and flexible deployments, making it essential for large businesses.

The Event Mesh capability of SAP Integration Suite (“Event Mesh capability” for short) is an event broker which will enable implementation of starter or small volume EDA scenarios across SAP and third-party applications.

As per [SAP Integration Solution Advisory Methodology (ISA-M)](https://help.sap.com/docs/sap-btp-guidance-framework/sap-integration-solution-advisory-methodology/catalog-of-integration-use-case-patterns),either of the options can be selected based on the eventing requirements.



