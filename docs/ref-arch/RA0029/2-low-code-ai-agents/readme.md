---
id: id-ra0029-2
slug: /ref-arch/ca1d2a3e/2
sidebar_position: 2
title: Low-Code AI Agents with Joule Studio
description: >-
  Learn how to rapidly develop and deploy AI agents using the low-code capabilities of Joule Studio in SAP Build.
keywords:
  - sap
  - ai agents
  - low-code
  - joule studio
  - sap build
  - managed runtime
sidebar_label: Low-Code AI Agents with Joule Studio
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - cap
  - aws
  - gcp
  - azure
  - ibm
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - kay-schmitteckert
discussion:
last_update:
  author: kay-schmitteckert
  date: 2026-03-19
---

For many enterprise use cases, the fastest and most efficient way to build and deploy AI agents is through a low-code approach. SAP provides **Joule Studio** within SAP Build, enabling the creation of custom Joule Skills and AI Agents with minimal coding effort.

This approach is ideal for business analysts, citizen developers and professional developers who need to quickly automate business processes, integrate with SAP systems and extend Joule's capabilities without the complexities of pro-code frameworks and infrastructure management.

## What are Low-Code AI Agents?

Low-code AI agents are designed for rapid development through configuration rather than coding:

-   **Business Content First:** Structured business context and semantic rules drive agent behavior
-   **Low-Code Orchestration:** Multi-step reasoning, tool orchestration and RAG (Retrieval-Augmented Generation) without custom runtimes
-   **Enterprise Integration:** Seamless connection via REST/OData APIs to SAP products, BTP services and third-party applications
-   **Secure & Scalable:** Built on Generative AI Hub with data anonymization, metering and role-based security

## How SAP Implements Low-Code Agents

**Joule Studio** in SAP Build provides a comprehensive low-code platform with two primary capabilities:

-   **Joule Skills:** Automate rule-based, repetitive tasks using APIs, seamlessly integrating into SAP to enhance productivity
-   **AI Agents:** Tackle complex challenges with advanced planning and reasoning, leveraging both Joule Skills and external integrations

For detailed architecture, integration patterns, lifecycle management and comprehensive examples, see [Extend Joule with Joule Studio](../../RA0024/3-extend-joule-with-joule-studio/readme.md).

### Key Components

-   **Joule Studio:** Visual development environment for defining agent instructions, configuring tools, orchestrating workflows and specifying human-in-the-loop interactions. Built with enterprise governance and security from the ground up.
-   **Managed Runtime on SAP AI Core:** Agents run on a scalable and secure runtime environment with built-in metering, tracing and security. Executes agent logic based on metadata deployed from Joule Studio.
-   **Generative AI Hub:** Provides foundation models, document grounding (RAG), prompt optimization and orchestration capabilities including data masking, I/O filtering and translation.
-   **SAP Build Integration:** Seamlessly reuses resources from SAP Build Process Automation, such as workflows, business rules and automations as tools for agents.
-   **Joule Integration:** Deployed agents automatically register as Joule Scenarios and Dialog Functions, making them available to end-users through the Joule interface.

### When to Use Low-Code Agents

Low-code agents should be the default choice for most enterprise automation scenarios:

-   Automating well-defined business processes (e.g., "approve purchase order" or "check invoice status")
-   Use cases where business experts or citizen developers are involved in development
-   Scenarios that heavily rely on standard SAP APIs and SAP Build Process Automation capabilities
-   Projects where speed of delivery and alignment with SAP's standard tooling are priorities
