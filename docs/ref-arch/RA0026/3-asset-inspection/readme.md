---
id: id-ra0026-3
slug: /ref-arch/083f2d968e/3
sidebar_position: 1
sidebar_custom_props:
    category_index: []
title: Asset Inspection
description: >-
  Learn how Embodied AI & robotics can automate asset management processes, including asset and site inspection.
keywords:
  - sap
  - joule
  - embodied AI agents
  - physical AI
  - robotics
  - robots
  - asset management
sidebar_label: Asset Inspection
image: img/ac-soc-med.png
tags:
  - genai
  - agents
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - adelyafatykhova
  - niklasweidenfeller
  - AjitKP91
  - pra1veenk
  - anbazhagan-uma
  - eagle-dai
discussion:
last_update:
  author: adelyafatykhova
  date: 2026-05-12
---

Warehouse automation is typically divided into physical and digital automation.
Existing warehouse automation physical devices like Autonomous Mobile Robots (AMRs) can automate movement of items.
In the digital world, warehouse AI agents can create and manage transfer orders, but can't physically pick items.

Embodied AI agents for warehouse pick & place cases combine these approaches: AI agents with physical bodies are able to complete warehouse tasks end-to-end.

:::info Want to Try Embodied AI?
[Get in touch with SAP to discuss](https://url.sap/embodied-ai).
:::


## Key Capabilities

Embodied AI for asset inspections addresses the following **challenges**:

1. **Unplanned Downtime Costs**: reactive maintenance leads to equipment failure and production losses
2. **Diagnostic Inaccuracy**: technicians often arrive at assets without the context, leading to low fix rates
3. **Manual Inspection Risks**: sending personnel into hazardous or remote areas for routine visual checks increases safety liability


Typical **business benefits** include:

1. **Accelerated Order Processing**: handle high frequency warehouse tasks reducing processing time
2. **Increase Uptime**: autonomous robots can operate on off-hours, night shifts maximizing warehouse throughput.  
3. **Precise Inventory Control**: robot led cycle counting increases stock accuracy.
4. **Operational Cost Reduction**: fast exception handling minimize the impact of process and physical problems lowering overall operational cost.


## Architecture

![drawio](drawio/reference-architecture-asset.drawio)

## Key Components

### Asset-Related Software

Inspection "missions" for robots can come from multiple SAP applications.
These include the following:

1. [SAP Asset Performance Management (APM)](https://www.sap.com/products/scm/apm.html)
2. [SAP Field Service Management (FSM)](https://www.sap.com/products/scm/field-service-management.html)

Observations during the inspection and inspection results can also be stored accordingly in these applications, for human reference and for further use by other digital agents.

Note that it's not only about a source system for tasks - these applications also contain valuable context, guardrails, and other capabilities that can be applied during the inspection.

### Embodied AI Agents

Embodied AI agents for autonomous inspections have three main skills:

1. **Asset Localization**: understanding which physical world assets correspond to which business objects
2. **Context-Aware Visual Inspection**: this includes the navigation and perception skills required to compare observations against context data and expected status
3. **Anomaly Investigation and Reporting**: when something unusual or unexpected occurs, the agent is able to conduct further investigation to capture more observations as needed, reporting the findings and notifying further systems, agents, and users

## Examples in an SAP Context

- [SAP Expands Physical AI Partnerships and Demonstrates Success of New Robotics Pilots](https://news.sap.com/2025/11/sap-physical-ai-partnerships-new-robotics-pilots/)
- [BITZER Helps SAP Pioneer Project Embodied AI](https://news.sap.com/2026/01/bitzer-sap-pioneer-project-embodied-ai/)
- [Martur Fompak wins Innovation Award](https://www.sap.com/discover/sap-innovation-awards/index.html?pdf-asset=b8f5f23c-437f-0010-bca6-c68f7e60039b&page=1)
- [Accenture, Vodafone Procure & Connect and SAP Pilot Humanoid Robotics in Warehouse Operations](https://newsroom.accenture.com/news/2026/accenture-vodafone-procure-connect-and-sap-pilot-humanoid-robotics-in-warehouse-operations)

## Resources

- [SAP Extended Warehouse Management (EWM)](https://www.sap.com)
- [SAP Logistics Goods Management (LGM)](https://www.sap.com)
