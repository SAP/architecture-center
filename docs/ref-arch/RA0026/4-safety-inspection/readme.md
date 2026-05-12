---
id: id-ra0026-4
slug: /ref-arch/083f2d968e/4
sidebar_position: 1
sidebar_custom_props:
    category_index: []
title: Safety Inspection
description: >-
  Discover Embodied AI for health & safety inspection
keywords:
  - sap
  - joule
  - embodied AI agents
  - physical AI
  - robotics
  - robots
sidebar_label: Safety Inspection
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

Embodied AI agents for health & safety inspection provide continuous, objective safety monitoring embedded into daily operations.

:::info Want to Try Embodied AI?
[Get in touch with SAP to discuss](https://url.sap/embodied-ai).
:::

## Architecture

![drawio](drawio/reference-architecture-safety.drawio)

## Key Components

### Safety-Related Software

Health and safety related "missions" and "tasks" for robots are derived from compliance regulations, safety checklists, and other such processes.
The relevant SAP application for health and safety is [SAP S/4HANA for EHS workplace safety (EHS)](https://www.sap.com/products/scm/safety-management-software.html).

Observations during the safety inspection and inspection results can also be stored accordingly, for human reference and for further use by other digital agents.

Note that it's not only about a source system for tasks - these applications also contain valuable context, guardrails, and other capabilities that can be applied during the inspection.

## Examples in an SAP Context

- [SAP and UnternehmerTUM Drive Co-Innovation in Embodied AI](https://news.sap.com/2026/03/sap-utum-drive-co-innovation-embodied-ai/)
- [How Swiss Robotics Company ANYbotics and SAP Are Turning Dirty, Dusty, and Dangerous Industrial Inspections into Business Insights](https://architecture.learning.sap.com/news/2026/03/30/anybotics-industrial-inspections-into-business-insights)


## Resources

- [SAP S/4HANA for EHS workplace safety (EHS)](https://www.sap.com/products/scm/safety-management-software.html)
