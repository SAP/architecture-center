---
id: d1b4e7
slug: /ref-arch/d1b4e7
sidebar_position: 2
title: Unified Experience, Application IAM Leading
description: >-
  Stage 2 of SAP-managed IAM — a unified cross-application experience where
  individual application IAM remains the leading authority for identities.
keywords:
  - sap
  - cloud identity
  - sap-managed
  - unified experience
  - application iam
  - joule
  - SAP Cloud Identity Services
sidebar_label: 2 - Unified Experience
image: img/ac-soc-med.png
tags:
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

This is the second stage of the [SAP-managed integration](../readme.md) model. The managed experience now spans **multiple SAP applications** as one coherent experience — a user engages a single Joule across SAP S/4HANA, SAP SuccessFactors, SAP Ariba and others, rather than a separate scoped experience per application as in [Stage 1](../1-lob-scoped-experience/readme.md).

The decisive characteristic of this stage is that, although the *experience* is unified, the **individual applications' IAM remains the leading authority** for identities and authorizations. SAP Cloud Identity Services unifies authentication and the engagement layer and correlates users through the Global User ID, but it does not yet act as the system of record for identity data. The source of truth is still distributed across the participating applications.

## Architecture

![drawio](drawio/public-stage2-unified-experience-sd.drawio)

## Concept

- The experience is **unified**: one engagement layer by Joule WORK, one conversation, consistent single sign-on across applications.
- Identity data and authorizations are still **led by the applications**: each application remains the authority for its own users and roles.
- SAP Cloud Identity Services provides the connective tissue — authentication, federation, and cross-application correlation via the Global User ID established.

This stage builds directly on the consolidatable users of Stage 1: because the per-application users were already linked during the **consolodation** and got the Global User ID of the **user profile (identity)** which is written back into the connected applications. The **user profile (identity)** can now experience an unified Joule experience across the landscape. 
It is recommended to reach this stage to properly govern Agent Identities and Human Identities. It allows the assignment of agent-policies properly.

## Flow

1. Multiple SAP applications are integrated with SAP Cloud Identity Services for a unified experience (for example a unified Joule WORK).
2. The user authenticates once through SAP Cloud Identity Services for Joule WORK and is correlated across applications via the Global User ID.
3. The unified engagement layer orchestrates across applications; each application continues to resolve identity and authorization against its own IAM.
4. Authorization decisions are enforced by each application using its domain-specific roles, scoped to what the correlated user is permitted to do in that application.
5. The user can be assigned to agents and can consume them.

## Characteristics

- **Scope:** multiple SAP applications, one unified experience.
- **Users:** correlated across applications via the Global User ID.
- **Lead for identity data:** the individual applications (distributed source of truth).
- **Role of SAP Cloud Identity Services:** unified authentication; cross-application correlation.
- **Typical use:** a unified Joule WORK experience spanning several SAP solutions while each application still owns its users.

## Services and Components

- [SAP Cloud Identity Services - Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services - Identity Directory](https://api.sap.com/api/IdDS_SCIM/overview)
- [Joule](https://help.sap.com/docs/joule/integrating-joule-with-sap/introduction?version=CLOUD)

## Related

- [Stage 1 — Line-of-Business–Scoped Experience](../1-lob-scoped-experience/readme.md) — the previous stage.
- [Stage 3 — SAP Cloud Identity Services Centrally Leading](../3-sci-centrally-leading/readme.md) — the next stage.
