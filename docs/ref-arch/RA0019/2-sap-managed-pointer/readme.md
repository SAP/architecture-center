---
id: 7f21ac
slug: /ref-arch/7f21ac
sidebar_position: 2
title: SAP-Managed IAM Integration
description: SAP-operated IAM integration between SAP solutions, delivered as part of the SAP Business AI Platform — entry point to the SAP-managed model covered in the AI Platform reference architectures.
keywords:
  - sap
  - cloud identity
  - identity management
  - sap-managed
  - business ai platform
  - joule
  - agent identity
  - SAP Cloud Identity Services
sidebar_label: SAP-Managed Integration
image: img/ac-soc-med.png
tags:
  - security
  - genai
  - sap-managed
  - agents
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sapgunnar
discussion: 
last_update:
  author: sapgunnar
  date: 2026-10-27
---

The **SAP-managed integration** model is the complementary counterpart to the [Customer-Managed Integration](../1-customer-managed/readme.md) within Identity Access Management for SAP. In this model, SAP operates the IAM integration *between SAP solutions* as part of a managed experience — the foundation for unified experiences such as [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html) and the agentic capabilities of the SAP Business AI Platform.

Because it is delivered as part of the platform, the full SAP-managed IAM reference architecture is maintained under the **SAP Business AI Platform**. Use the links below to continue.

## SAP-Managed IAM Integration

The SAP-managed model is described as a progression of maturity stages, from a line-of-business–scoped experience toward SAP Cloud Identity Services as the central leading system — as realized in the ERP SaaS Suite.

- **[SAP-Managed IAM Integration — Overview](../../RA0039/9-sap-managed-iam/readme.md)** — the SAP-operated IAM model and its maturity stages.
- **[Stage 1 — Line-of-Business–Scoped Experience](../../RA0039/9-sap-managed-iam/1-lob-scoped-experience/readme.md)**
- **[Stage 2 — Unified Experience, Application IAM Leading](../../RA0039/9-sap-managed-iam/2-unified-experience/readme.md)**
- **[Stage 3 — SAP Cloud Identity Services Centrally Leading](../../RA0039/9-sap-managed-iam/3-sci-centrally-leading/readme.md)**
- **[Joule Landscape Recommendation](../../RA0039/9-sap-managed-iam/4-joule-landscape-recommendation/readme.md)**
- **[Non-SAP Agent Principal Propagation](../../RA0039/9-sap-managed-iam/5-non-sap-agent-principal-propagation/readme.md)**

## Related

- [Customer-Managed IAM Integration](../1-customer-managed/readme.md) — the complementary model where the customer operates the IAM integration.
- [Agent Identity](../../RA0029/8-ai-agent-identity/readme.md) — SAP-managed identity for AI agents.
