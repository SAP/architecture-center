---
id: id-ra0019
slug: /ref-arch/20c6b29b1e
sidebar_position: 19
sidebar_custom_props:
  category_index:
    - appdev
    - opsec
    - ai
title: SAP IAM integration with SAP Cloud Identity Services
description: >-
  This reference architecture describes the authentication, identity lifecycle
  flows and how to assign and design roles (authorizations) for the SAP SaaS via
  the SAP Cloud Identity Services.
keywords:
  - sap
  - identity
  - ias
  - ips
  - security
  - cloud identity
  - business suite
  - cloud erp
  - idm
  - iag
  - access
  - single sign-on
  - SAP Cloud Identity Services
  - Identity Provisioning
  - Identity Authentication
sidebar_label: Identity Access Management
image: img/logo.svg
tags:
  - security
  - genai
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
  date: 2025-05-13
---

These reference architectures delve into the critical aspects of Identity Access Management (IAM) for SAP, focusing on essential elements such as user storage, replication, and identity lifecycle.

Identity Access Management consists of three main pillars:

- Authentication & Single Sign-On
- Identity Lifecycle
- Authorization

The [SAP Cloud Identity Services](https://www.sap.com/documents/2024/04/84ada3ed-b87e-0010-bca6-c68f7e60039b.html) serve as the designated Identity and Access Management interface for SAP SaaS integrations.

## Architecture

![drawio](drawio/public-sap-iam-sd.drawio)

In an SAP landscape, user data is stored across all service providers. To ensure consistency and synchronization across these different environments, replication is essential.

Single sign-on protocols such as SAML2 and OIDC play a vital role in this process. These protocols facilitate transferring selected attributes during authentication (federation). However, their efficacy can decrease when a user is offline but needs adjustments or, importantly, deletion.

To address such issues and maintain an uninterrupted identity lifecycle, SAP utilizes SCIM2. SCIM2 assists in replicating users and groups into SAP solutions, ensuring a consistent and updated user landscape.

The authorization design hinges on the specific domain and often on the technology in use. For example, an SAP S/4HANA role differs from an SAP BTP Role Collection in its design, but both must be assigned to the user to provide access.

These reference architectures derive from knowledge gathered from customer projects, where SAP is one vendor in a heterogeneous landscape. The goal is to standardize the way IAM is implemented for SAP SaaS. These architectures consider a single interface approach for 3rd party Identity Provider integrations (authentication), as well as for the Identity Lifecycle in order to provide a centralized location to create and maintain an SAP SaaS user.

Moreover, these reference architectures take into account new SAP apps and features that operate across other SAP solutions such as ([SAP Task Center](https://pages.community.sap.com/topics/task-center) or [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html)). These applications require a trusted, consistently available, single interface in the landscape, with a known set of features, all of which would not be available without the SAP Cloud Identity Services.