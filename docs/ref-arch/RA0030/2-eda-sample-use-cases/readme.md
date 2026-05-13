---
id: id-ra0030-2
slug: /ref-arch/Iiv_4QxS/2
sidebar_position: 2
title: 'EDA Sample Use Cases'
description: 'Sampfle for EDA'
keywords: 
  - bdc
sidebar_label: 'EDA Sample Use Cases'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags: 
  - bdc
contributors: 
  - abhissharma21
  - navyakhurana
last_update:
  date: 2026-05-13
  author: abhissharma21
---

Event-driven architecture use cases are crucial because they highlight real-world applications of this technological strategy. Understanding specific use cases reveals how this architecture is crucial for services that require real-time operations, high responsiveness, and asynchronous communication.

# Event Sources and Event Enablement for SAP ERP Systems

SAP systems generate a variety of business events that can be consumed by other applications or services. Common event sources include:

- SAP ERP
- SAP S/4HANA
- SAP S/4HANA, Public Cloud Edition

The following sections illustrate how these event source systems are enabled to produce events that can be consumed by SAP and non-SAP systems.

![drawio](drawio/diagram-V1TRf5JxTE.drawio)

- SAP ERP
- Using SAP Application Interface Framework (AIF) or Event Add-on for ERP, custom events can be defined and published to SAP Event Mesh or SAP Cloud Application Event Hub.
- Supports notifications and data events
- Supports Inbound and Outbound events
- CloudEvents Format
- SAP S/4HANA
- 600+ SAP standard business events based on ABAP RESTful application programming model.
- Supports Events Extensibility to create custom events using SAP Cloud Application Programming Model (CAP

To build end to end use case for EDA for SAP Enterprise systems, below are the various event enablement options available in SAP ecosystem and the supporting versions for each of the options



