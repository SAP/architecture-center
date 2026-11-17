---
id: a7f3c1
slug: /ref-arch/a7f3c1
sidebar_position: 1
title: Customer-Managed IAM Integration
description: >-
  Customer-operated IAM for SAP with SAP Cloud Identity Services, covering
  authentication and single sign-on, identity lifecycle, and authorization.
keywords:
  - sap
  - cloud identity
  - identity management
  - customer-managed
  - authentication
  - single sign-on
  - identity lifecycle
  - authorization
  - SAP Cloud Identity Services
sidebar_label: Customer-Managed Integration
image: img/ac-soc-med.png
tags:
  - security
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

In the **customer-managed integration** model, the customer owns and operates the IAM integration for an SAP landscape in which SAP is one vendor among several. [SAP Cloud Identity Services](https://www.sap.com/documents/2024/04/84ada3ed-b87e-0010-bca6-c68f7e60039b.html) is configured as the single, trusted interface between the customer's enterprise IAM tooling (third-party Identity Providers, Identity Management solutions, Identity Governance) and the SAP solutions in the landscape.

This model standardizes how IAM is implemented for SAP SaaS. It provides a centralized location to authenticate users, create and maintain SAP SaaS identities, and assign authorizations — while leaving the heterogeneous enterprise edges under customer control.

## Architecture

![drawio](drawio/public-customer-managed-iam-sd.drawio)

## The Three Pillars

Customer-managed IAM is organized around three pillars, each covered by its own reference architecture:

1. **[Authentication & Single Sign-On](1-authentication-and-single-sign-on/readme.md)** — How SAP applications authenticate users through SAP Cloud Identity Services, acting either as an Identity Provider for the SAP landscape or as a broker (facade) that federates to the customer's corporate Identity Provider via SAML2 or OIDC.

2. **[Identity Lifecycle](2-identity-lifecycle/readme.md)** — How a digital identity is derived from a Workforce Person in a leading master-data system, replicated into the Identity Directory of SAP Cloud Identity Services, and provisioned into target SAP applications via SCIM2 and the Identity Provisioning service.

3. **[Authorization](3-authorization-design/readme.md)** — How domain-specific authorizations (for example SAP S/4HANA roles or SAP BTP Role Collections) are published into the Identity Directory and assigned centrally to identities, while the authorizations themselves remain owned by the respective application domain.

## Characteristics

- The customer is the integrator: trusts, federations, provisioning jobs, and authorization assignments are configured and operated by the customer.
- SAP Cloud Identity Services provides a single interface for third-party Identity Provider integration (authentication) and for identity lifecycle, giving a centralized place to create and maintain SAP SaaS users.
- The model is designed for heterogeneous landscapes where SAP coexists with non-SAP vendors and non-SAP target systems.
- Authorizations remain domain specific; only the assignment is centralized in the Identity Directory.

## Services and Components

- [SAP Cloud Identity Services - Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services - Identity Provisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?region=all)
- [SAP Cloud Identity Services - Identity Directory](https://api.sap.com/api/IdDS_SCIM/overview)

## Related

- [SAP-Managed IAM Integration](../../RA0039/9-sap-managed-iam/readme.md) — the complementary model where SAP operates the IAM integration between SAP solutions.
