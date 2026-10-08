---
sidebar_position: 3
slug: /community/content-structure
title: Content Structure for Reference Architectures
description: Learn how to organize folders, diagrams, images, and documentation for consistency and clarity in your SAP Architecture Center contribution.
sidebar_label: Content Structure
keywords:
 - sap
 - content structure
 - reference architecture
 - folder structure
 - drawio
 - business ai platform
image: img/ac-soc-med.png
tags:
  - community
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
last_update:
  author: cernus76
  date: 2026-10-08
---

The content structure has been defined and is identical for all reference architectures.

## Example
Here is an example of the content structure for a reference architecture:

```bash
ref-arch/
├─ RAXXXX/ 
│  ├─ 1-first-subfolder/ 
│  │  ├─ drawio/ 
│  │  │  ├─ solution-diagram-1.drawio 
│  │  ├─ images/
│  │  │  ├─ image-1.png 
│  │  ├─ readme.md 
│  ├─ 2-second-subfolder/ 
│  │  ├─ drawio/ 
│  │  │  ├─ solution-diagram-2.drawio 
│  │  ├─ images/ 
│  │  │  ├─ image-2.jpg 
│  │  ├─ readme.md 
│  ├─ drawio/ 
│  │  ├─ solution-diagram-1.drawio 
│  ├─ images/ 
│  ├─ readme.md 
```

## Example explained
The same example with some explanations:

```bash
ref-arch/
├─ RAXXXX/ <------------------------------ Your RA folder
│  ├─ 1-first-subfolder/ <---------------- First subfolder/subpage for your RA
│  │  ├─ drawio/ <------------------------ Drawio folder for your solution diagram
│  │  │  ├─ solution-diagram-1.drawio <--- Your solution diagram in drawio format
│  │  ├─ images/ <------------------------ Images folder
│  │  │  ├─ image-1.png <----------------- Your image
│  │  ├─ readme.md <---------------------- First subpage of your RA
│  ├─ 2-second-subfolder/ <--------------- Second subfolder/subpage for your RA
│  │  ├─ drawio/ <------------------------ Drawio folder for your solution diagram
│  │  │  ├─ solution-diagram-2.drawio <--- Your solution diagram in drawio format
│  │  ├─ images/ <------------------------ Images folder
│  │  │  ├─ image-2.jpg <----------------- Your image
│  │  ├─ readme.md <---------------------- Second subpage of your RA
│  ├─ drawio/ <--------------------------- Drawio folder for your solution diagram
│  │  ├─ solution-diagram-1.drawio <------ Your solution diagram in drawio format
│  ├─ images/ <--------------------------- Images folder
│  ├─ readme.md <------------------------- This is the main page of your RA
```
