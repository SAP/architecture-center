---
id: 5c3cce
slug: /ref-arch/5c3cce
sidebar_position: 1
title: Line-of-Business–Scoped Experience
description: >-
  Stage 1 of SAP-managed IAM — a line-of-business–scoped managed experience with
  consolidatable users sharing a Global User ID in SAP Cloud Identity Services.
keywords:
  - sap
  - cloud identity
  - sap-managed
  - line of business
  - consolidatable users
  - global user id
  - joule
  - SAP Cloud Identity Services
sidebar_label: LoB-Scoped Experience
image: img/ac-soc-med.png
tags:
  - genai
  - security
  - sap-managed
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
  date: 2026-10-13
---

This is the first stage of the [SAP-managed integration](../readme.md) model. The SAP-managed experience is introduced for a **single line-of-business application** — for example activating Joule for SAP S/4HANA Cloud, or for SAP SuccessFactors — without yet requiring a landscape-wide consolidation of identities.

Each line-of-business application continues to keep its own users. What makes this stage *managed* rather than merely isolated is that every user is cached (hidden) in the Identity Directory of SAP Cloud Identity Services from the connected applications. This allows the SAP Business AI Platform to use SAP Cloud Identity Services as its Identity and Access Management interface and as a central user and role store for filtering agentic communication.

## Architecture

![drawio](drawio/public-stage1-lob-scoped-sd.drawio)

## Concept

- Cached users exist per line-of-business application, scoped to that application's experience.
- These users can later be *consolidated* into a unified experience without re-onboarding — this is what enables the move to [Stage 2](../2-unified-experience/readme.md).

Authentication for the scoped experience runs through SAP Cloud Identity Services for the SAP Business AI Platform (and SAP Joule WORK). Each connected SAP business application remains with the configured authentication and user lifecycle flows; each of those tenants acts in this scenario like an IdP. The successful authentication within one of the business applications is enough to initiate the session in Cloud Identity for the Business AI Platform. Authorization for the application remains defined and assigned within that application's domain.

## Flow

1. The customer activates the SAP-managed experience (for example Joule) for one or more line-of-business applications.
2. The application is integrated with SAP Cloud Identity Services. All roles or groups from the connected application get replicated as (visible) application-groups into the Identity Directory.
3. Each application user gets (hidden) cached in the Identity Directory with the assigned application-groups.
4. The user interacts with the scoped experience; identity and authentication are governed by SAP Cloud Identity Services, while authorization stays within the application.

## Characteristics

- **Scope:** one line-of-business application at a time.
- **Users:** application-owned, but consolidatable.
- **Lead for identity data:** the application.
- **Role of SAP Cloud Identity Services:** authentication interface and identity-linking anchor.
- **Typical use:** first adoption of Joule or another managed experience, before landscape-wide unification.

## Services and Components

- [SAP Cloud Identity Services - Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services - Identity Directory](https://api.sap.com/api/IdDS_SCIM/overview)
- [Joule](https://help.sap.com/docs/joule/integrating-joule-with-sap/introduction?version=CLOUD)

## Related

- [SAP-Managed IAM Integration](../readme.md) — overview of the three stages.
- [Stage 2 — Unified Experience, Application IAM Leading](../2-unified-experience/readme.md) — the next stage.
