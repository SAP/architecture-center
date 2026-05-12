---
id: id-ra0026-2
slug: /ref-arch/083f2d968e/2
sidebar_position: 1
sidebar_custom_props:
    category_index: []
title: Warehouse Pick & Place
description: >-
  Learn how Embodied AI & robotics can automate warehouse operations for picking, placing, sorting, and other warehouse tasks.
keywords:
  - sap
  - joule
  - embodied AI agents
  - physical AI
  - robotics
  - robots
  - logistics
sidebar_label: Warehouse Pick & Place
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
  date: 2026-05-11
---

Warehouse automation is typically divided into physical and digital automation.
Existing warehouse automation physical devices like Autonomous Mobile Robots (AMRs) can automate movement of items.
In the digital world, warehouse AI agents can create and manage transfer orders, but can't physically pick items.

Embodied AI agents for warehouse pick & place cases combine these approaches: AI agents with physical bodies are able to complete warehouse tasks end-to-end.

:::info Want to Try Embodied AI in your Warehouse?
[Get in touch with SAP to discuss](https://url.sap/embodied-ai).
:::


## Key Capabilities

Embodied AI for warehouse operations addresses the following **challenges**:

1. **High Demand Fluctuation**: demand variation requires constant scaling of manual labor
2. **Inventory Inaccuracy**: discrepancies between physical stock and digital records cause delayed shipments and over-ordering
3. **Throughput Stagnation**: process bottlenecks hinder throughout increase

Typical **business benefits** include:

1. **Accelerated Order Processing**: handle high frequency warehouse tasks reducing processing time
2. **Increase Uptime**: autonomous robots can operate on off-hours, night shifts maximizing warehouse throughput.  
3. **Precise Inventory Control**: robot led cycle counting increases stock accuracy.
4. **Operational Cost Reduction**: fast exception handling minimize the impact of process and physical problems lowering overall operational cost.



## Architecture

![drawio](drawio/reference-architecture-warehouse.drawio)

## Key Components

### Warehouse Management Software

There are two SAP solutions associated with warehouse operations:

1. [SAP Extended Warehouse Management (EWM)](https://www.sap.com/products/scm/extended-warehouse-management.html)
2. [SAP Logistics Management (LGM)](https://www.sap.com/products/scm/logistics-management.html)

### Embodied AI Agents

Embodied AI agents for warehouse operations have three main skills:

1. **Warehouse Physical Operations**: pick, place, sort, pack, and complete other physical tasks in the warehouse as specific in warehouse management systems like SAP EWM
2. **Semantic Understanding of Business Objects**: understand domain-specific terminology and the meaning behind what data attributes from warehouse management systems imply for physical task execution, such as order priority or and handling requirements
3. **Warehouse Destination Recognition**: be able to navigate to correct bin locations using warehouse layout data and instructions in tasks.

### Partner Technologies and Hardware

Warehouse operations tasks require **manipulation** (handling objects).
This means **wheeled humanoids** and **bipedal humanoids** are a good fit for this use case.

From an **intelligence perspective**, such robots typically need good visual sensors, haptic sensors, and other forms of perception to accurately perceive and handle the objects to be handled.

## Examples in an SAP Context

- [SAP Expands Physical AI Partnerships and Demonstrates Success of New Robotics Pilots](https://news.sap.com/2025/11/sap-physical-ai-partnerships-new-robotics-pilots/)
- [BITZER Helps SAP Pioneer Project Embodied AI](https://news.sap.com/2026/01/bitzer-sap-pioneer-project-embodied-ai/)
- [Martur Fompak wins Innovation Award](https://www.sap.com/discover/sap-innovation-awards/index.html?pdf-asset=b8f5f23c-437f-0010-bca6-c68f7e60039b&page=1)
- [Accenture, Vodafone Procure & Connect and SAP Pilot Humanoid Robotics in Warehouse Operations](https://newsroom.accenture.com/news/2026/accenture-vodafone-procure-connect-and-sap-pilot-humanoid-robotics-in-warehouse-operations)

## Resources

- [SAP Extended Warehouse Management (EWM)](https://www.sap.com)
- [SAP Logistics Goods Management (LGM)](https://www.sap.com)
