---
sidebar_position: 3
slug: /content-structure
title: Content Structure
sidebar_label: Content Structure
keywords:
 - sap
 - content structure
image: img/logo.svg
tags:
  - community
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - navyakhurana
  - cernus76
  - jmsrpp
last_update:
  author: cernus76
  date: 2025-02-11
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
│  │  │  ├─ solution-diagram-1.svg 
│  │  ├─ readme.md 
│  ├─ 2-second-subfolder/ 
│  │  ├─ drawio/ 
│  │  │  ├─ solution-diagram-2.drawio 
│  │  ├─ images/ 
│  │  │  ├─ image-2.jpg 
│  │  │  ├─ solution-diagram-2.svg 
│  │  ├─ readme.md 
│  ├─ drawio/ 
│  │  ├─ solution-diagram-1.drawio 
│  ├─ images/ 
│  │  ├─ solution-diagram-1.svg 
│  ├─ readme.md 
```

## Example explained
The same example with some explanations:

```bash
ref-arch/
├─ RAXXXX/ <------------------------------ [ Your reference architecture folder ]
│  ├─ 1-first-subfolder/ <---------------- [ First subfolder/subpage for your reference architecture ]
│  │  ├─ drawio/ <------------------------ [ Drawio folder for your solution diagram in drawio format ]
│  │  │  ├─ solution-diagram-1.drawio <--- [ Your solution diagram in drawio format ]
│  │  ├─ images/ <------------------------ [ Images folder ]
│  │  │  ├─ image-1.png <----------------- [ Your image ]
│  │  │  ├─ solution-diagram-1.svg <------ [ The SVG version of your solution diagram - automatically generated ]
│  │  ├─ readme.md <---------------------- [ First subpage of your reference architecture ]
│  ├─ 2-second-subfolder/ <--------------- [ Second subfolder/subpage for your reference architecture ]
│  │  ├─ drawio/ <------------------------ [ Drawio folder for your solution diagram in drawio format ]
│  │  │  ├─ solution-diagram-2.drawio <--- [ Your solution diagram in drawio format ]
│  │  ├─ images/ <------------------------ [ Images folder ]
│  │  │  ├─ image-2.jpg <----------------- [ Your image ]
│  │  │  ├─ solution-diagram-2.svg <------ [ The SVG version of your solution diagram - automatically generated ]
│  │  ├─ readme.md <---------------------- [ Second subpage of your reference architecture ]
│  ├─ drawio/ <--------------------------- [ Drawio folder for your solution diagram in drawio format ]
│  │  ├─ solution-diagram-1.drawio <------ [ Your solution diagram in drawio format ]
│  ├─ images/ <--------------------------- [ Images folder ]
│  │  ├─ solution-diagram-1.svg <--------- [ The SVG version of your solution diagram - automatically generated ]
│  ├─ readme.md <------------------------- [ This is the main page (landing page) of your reference architecture ]
```
