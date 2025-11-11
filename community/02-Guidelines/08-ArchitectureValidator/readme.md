---
sidebar_position: 1
slug: /architecture-validator
title: Architecture Validator
description: Architecture Validator
sidebar_label: Architecture Validator
keywords:
    - architecture validator
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
    - vedant-aero-ml
    - Jo-Pa-Mo
last_update:
    author: vedant-aero-ml
    date: 2025-11-11
---

The **Architecture Validator** is an intelligent review assistant designed to help architects and developers ensure solution diagrams meet baseline architectural expectations whether preparing for submission to the SAP Architecture Center or refining them in general practice. It performs automated content checks to support contributors and reviewers in identifying common issues early in the authoring process. Validator provides quick feedback, helping reduce review cycles and improve overall adherence to SAP's prescribed architecting policies.


## Usage Notes
- Only **draw.io** diagrams are supported at this time.
- Since the validator relies on how diagrams are modeled in draw.io, it is recommended to follow the diagramming guidelines provided here:  **[Architecture Modelling Guidelines](<insert link>)** for best validation results.
- Up to **five validations** can run in parallel. If capacity is full, validation will queue briefly.
- Validation typically takes **10–90 seconds**, depending on diagram size, complexity & execution load.
- The validator **supports the review process**, it does not replace human architectural judgment.
- The tool, rules & coverage are evolving and will improve over time.


## Getting Started
1. Log in from the main screen using the option **Login with SAP** or directly click on the **Architecture Validator tile**.
2. Click on the **Architecture Validator** tab from the main screen to enter the tool.
3. Upload your **draw.io** architecture. You could also run up to five diagrams in parallel.
4. Run validation to receive feedback.
5. Adjust your diagram and re-run as needed.

## Feedback and Collaboration
We welcome suggestions, ideas on additional rules and general feedback.
- Please note that **the application does not store uploaded diagrams** due to organizational data and security policies.
- If you wish to engage in a discussion, you are welcome to reach out directly at: **paa@sap.com**

We look forward to your participation and contributions as we continue to refine and enhance the validator experience.