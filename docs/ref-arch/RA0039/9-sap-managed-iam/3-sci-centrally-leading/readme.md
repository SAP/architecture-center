---
id: 36dc54
slug: /ref-arch/36dc54
sidebar_position: 3
title: SAP Cloud Identity Services Centrally Leading
description: >-
  Stage 3 of SAP-managed IAM — SAP Cloud Identity Services as the central
  leading system for identities and authorization, as realized in the Autonomous Suite.
keywords:
  - sap
  - cloud identity
  - sap-managed
  - central identity
  - erp saas suite
  - authorization management
  - identity directory
  - SAP Cloud Identity Services
sidebar_label: Stage 3 - SCI Centrally Leading
image: img/ac-soc-med.png
tags:
  - security
  - genai
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

This is the target stage of the [SAP-managed integration](../readme.md) model. **SAP Cloud Identity Services becomes the central leading system** for identities and for authorization assignment across the SAP solutions. The applications no longer act as independent sources of truth; instead they consume identities and policy assignments from the Identity Directory.

This end-state is exemplified by the **Autonomous Suite**, where the suite's applications share one identity authority. It is also the direction of the consolidated landscape described in the [Joule Landscape Recommendation](../4-joule-landscape-recommendation/readme.md).

:::info Disclaimer
The SAP-managed **Autonomous Suite** is currently in **Early Adopter Care (EAC)** and will become available soon. The available integrations starts start with **SAP S/4HANA Cloud Public Edition**, **SAP SuccessFactors**, and **SAP Sales Cloud v2**.
:::

## Architecture

### Component View

The architecture diagram shows the Stage 3 end-state, where SAP Cloud Identity Services is the central leading system for identities and authorization assignment across the suite of SAP applications. The Identity Directory is the single source of truth for users and groups, Identity Provisioning distributes them to the connected applications, and Authorization Management holds the centrally assigned, domain-specific policies. The agentic layer (Agent gateway brokering SAP and Non-SAP Agents and Applications via Agent2Agent and Agent2App, with policy checks) and the governance components - Agent Hub by LeanIX, application and integration provisioning via SAP for Me, Agent Lifecycle Governance via SAP Cloud ALM — complete the picture.

![drawio](drawio/public-sap-iam-suite-arch.drawio "SAP Cloud Identity Services centrally leading — component view with governance")

The following variant provides a focused view of the same centrally led model — the **Autonomous Suite** of applications (for example S/4HANA Cloud Public Edition, SAP SuccessFactors, and SAP Sales Cloud v2) sharing one identity authority — including a legend of the connection and interaction types used across the diagrams.

![drawio](drawio/public-sap-iam-suite-arch2.drawio "SAP Cloud Identity Services centrally leading — ERP SaaS Suite")

### Sequence

![drawio](drawio/public-sap-iam-suite-sd.drawio "Recommended usage of SAP Cloud Identity Services for SAP Joule")

## Concept

Compared to [Stage 2](../2-unified-experience/readme.md), the lead for identity data moves from the applications to SAP Cloud Identity Services:

- The **Identity Directory** is the central user and group store and the single source of truth for identities across the suite of applications.
- **Authorization assignment** is centralized, while **authorization design** remains domain specific. Roles and policies defined by applications (for example via the Authorization Management Service) are stored and assigned to users centrally in the Identity Directory, while the authorizations themselves remain domain specific and often use a different technology stack.

The Global User ID introduced in Stage 1 and used for correlation in Stage 2 now anchors a single, centrally led identity record.

## Flow

1. Identities are maintained centrally in the Identity Directory of SAP Cloud Identity Services. The Identity Lifecycle for the SAP business applications starts in Cloud Identity.
2. Applications participating in the suite are provisioned with Users and Application-Groups from the Identity Directory and trust SAP Cloud Identity Services for authentication.
3. Application-defined policies or roles are published automatically into the Identity Directory and assigned centrally to identities (by the customer).
4. At runtime, applications enforce authorization using assignments that originate from SAP Cloud Identity Services, keeping the suite consistent and compliant.
5. The Suite applications deactivate or set the local IAM tools to only show the records maintained in SAP Cloud Identity Services.

## Characteristics

- **Scope:** the SAP solution suite (for example the ERP SaaS Suite).
- **Users:** centrally led in the Identity Directory with a single Global User ID per identity.
- **Lead for identity data:** SAP Cloud Identity Services (central source of truth).
- **Authorization:** domain-specific roles & policies, centrally assigned in the Identity Directory.
- **Typical use:** the target operating model for a fully SAP-managed suite experience.

## Services and Components

- [SAP Cloud Identity Services - Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services - Identity Provisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?region=all)
- [SAP Cloud Identity Services - Identity Directory](https://api.sap.com/api/IdDS_SCIM/overview)
- [SAP Cloud Identity Services - Authorization Management](https://help.sap.com/docs/identity-authentication/identity-authentication/configuring-authorization-policies?version=Cloud)

## Related

- [Stage 2 — Unified Experience, Application IAM Leading](../2-unified-experience/readme.md) — the previous stage.
- [Joule Landscape Recommendation](../4-joule-landscape-recommendation/readme.md) — the consolidated landscape realizing this end-state.
- [Agent Identity](../../../RA0029/8-ai-agent-identity/readme.md) — centrally led identity extended to AI agents.
