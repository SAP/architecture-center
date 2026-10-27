---
id: 89ab6b
slug: /ref-arch/89ab6b
sidebar_position: 200
title: SAP IAM integration with SAP Cloud Identity Services
description: >-
  Design authentication and role management flows for SAP SaaS with SAP Cloud
  Identity Services.
keywords:
  - sap
  - cloud identity
  - identity management
  - security
  - authentication
  - single sign-on
  - access authorizations
  - SAP Cloud Identity Services
sidebar_label: Identity Access Management
image: img/ac-soc-med.png
tags:
  - security
  - genai
  - agents
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sapgunnar
  - gunnar-kosche_sap
discussion: 
last_update:
  author: sapgunnar
  date: 2026-10-27
---

These reference architectures delve into the critical aspects of Identity Access Management (IAM) for SAP, focusing on essential elements such as user storage, replication, identity lifecycle, authentication, and authorization — and increasingly on identity for autonomous AI actors.

The [SAP Cloud Identity Services](https://www.sap.com/documents/2024/04/84ada3ed-b87e-0010-bca6-c68f7e60039b.html) serve as the designated Identity and Access Management interface for SAP SaaS integrations.

## Two Integration Models

IAM for SAP can be realized in two complementary ways, and this reference architecture is structured accordingly:

- **[Customer-Managed Integration](1-customer-managed/readme.md)** — The customer owns and operates the IAM integration. SAP Cloud Identity Services is configured by the customer as the single interface for third-party Identity Provider integration (authentication), identity lifecycle, and central authorization assignment across a heterogeneous landscape where SAP is one of several vendors. This model keeps the classic three pillars:
  - Authentication & Single Sign-On
  - Identity Lifecycle
  - Authorization

- **[SAP-Managed Integration](../RA0039/9-sap-managed-iam/readme.md)** — SAP operates the IAM integration between SAP solutions as part of a managed experience (for example Joule and the SAP Business AI Platform). The customer still federates to SAP Cloud Identity Services, but the integration between the SAP solutions themselves is pre-wired and operated by SAP. This model is described as a progression of three maturity stages, from a line-of-business–scoped experience toward SAP Cloud Identity Services as the central leading system — as realized in the ERP SaaS Suite.

The two models are not mutually exclusive. Most landscapes combine them: customer-managed flows govern the heterogeneous enterprise edges (third-party IdPs, non-SAP targets, enterprise identity lifecycle), while SAP-managed flows connect SAP solutions to each other for unified experiences such as Joule and agentic AI.

## Architecture

![drawio](drawio/public-sap-iam-sd.drawio)

In an SAP landscape, user data is stored across all service providers. To ensure consistency and synchronization across these different environments, replication is essential.

Single sign-on protocols such as SAML2 and OIDC play a vital role in this process. These protocols facilitate transferring selected attributes during authentication (federation). However, their efficacy can decrease when a user is offline but needs adjustments or, importantly, deletion.

To address such issues and maintain an uninterrupted identity lifecycle, SAP utilizes SCIM2. SCIM2 assists in replicating users and groups into SAP solutions, ensuring a consistent and updated user landscape.

The authorization design hinges on the specific domain and often on the technology in use. For example, an SAP S/4HANA role differs from a "Role Collection" in its design, but both must be assigned to the user to provide access.

These reference architectures derive from knowledge gathered from customer projects, where SAP is one vendor in a heterogeneous landscape. The goal is to standardize the way IAM is implemented for SAP SaaS. The customer-managed architectures consider a single interface approach for 3rd party Identity Provider integrations (authentication), as well as for the Identity Lifecycle in order to provide a centralized location to create and maintain an SAP SaaS user.

Moreover, these reference architectures take into account new SAP apps and features that operate across other SAP solutions such as ([SAP Task Center](https://pages.community.sap.com/topics/task-center) or [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html)). These applications require a trusted, consistently available, single interface in the landscape, with a known set of features, all of which would not be available without the SAP Cloud Identity Services. This is where the SAP-managed integration model applies, and it extends to the identity of AI agents through the [Agent Identity](../RA0029/8-ai-agent-identity/readme.md) reference architecture.
