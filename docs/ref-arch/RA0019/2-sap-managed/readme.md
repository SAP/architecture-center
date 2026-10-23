---
id: b2e9d4
slug: /ref-arch/b2e9d4
sidebar_position: 2
title: SAP-Managed IAM Integration
description: >-
  SAP-operated IAM integration between SAP solutions for unified experiences
  such as Joule and the SAP Business AI Platform, described as three maturity
  stages toward SAP Cloud Identity Services as the central leading system.
keywords:
  - sap
  - cloud identity
  - sap-managed
  - identity management
  - joule
  - business ai platform
  - erp saas suite
  - agent identity
  - SAP Cloud Identity Services
sidebar_label: SAP-Managed IAM Integration
image: img/ac-soc-med.png
tags:
  - security
  - sap-managed
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
discussion: 
last_update:
  author: sapgunnar
  date: 2026-10-13
---

In the **SAP-managed IAM integration** model, SAP operates the IAM integration *between SAP solutions* as part of a managed experience. The customer continues to federate its users to [SAP Cloud Identity Services](https://www.sap.com/documents/2024/04/84ada3ed-b87e-0010-bca6-c68f7e60039b.html), but the trust, provisioning, and authorization wiring that connects the SAP solutions to each other is pre-configured and operated by SAP.

This model is what makes cross-application SAP experiences possible — [SAP Task Center](https://pages.community.sap.com/topics/task-center), [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html), and the agentic capabilities of the [SAP Business AI Platform](https://www.sap.com/products/artificial-intelligence/ai-platform.html). These experiences require a trusted, consistently available, single identity interface in the landscape with a known set of features. Without SAP Cloud Identity Services as that interface, they could not be offered.

## Architecture

![drawio](drawio/public-sap-managed-iam-stages-sd.drawio)

## Three Maturity Stages

SAP-managed integration is not a single switch — it is a progression. As more SAP solutions are consolidated under a shared identity, the experience becomes more unified and SAP Cloud Identity Services takes on an increasingly leading role. We describe three stages:

1. **[Line-of-Business–Scoped Experience](1-lob-scoped-experience/readme.md)** — The SAP-managed experience is scoped to an individual line-of-business application. Each application keeps its own users, but those users are *consolidatable*: their cached records in the Identity Directory can later be linked under a common Global User ID for cross-application correlation. This is the natural entry point for customers adopting a managed experience such as Joule application-by-application.

2. **[Unified Experience, Application IAM Leading](2-unified-experience/readme.md)** — A single, unified experience now spans multiple SAP applications, but the individual applications' IAM remains the authority for identities and authorizations. SAP Cloud Identity Services unifies authentication and the engagement layer without yet owning the lead for identity data. The experience is unified; the system of record is still distributed across applications.

3. **[SAP Cloud Identity Services Centrally Leading](3-sci-centrally-leading/readme.md)** — SAP Cloud Identity Services becomes the central *leading* system for identities and for authorization assignment across the SAP solutions. Applications consume identities and policy assignments from the Identity Directory rather than acting as independent sources. This is the target end-state, exemplified by the **SAP Autonomous Suite**, and it aligns with the consolidated landscape in the [Joule Landscape Recommendation](4-joule-landscape-recommendation/readme.md).

Together these stages describe a migration path: from scoped and consolidatable, through unified-but-distributed, to centrally led.

## Landscape Recommendation

The [Joule Landscape Recommendation](4-joule-landscape-recommendation/readme.md) applies the SAP-managed model to a concrete setup, showing how SAP Cloud Identity Services and the SAP Business AI Platform are organized across staged and consolidated landscapes.

## Coexistence with an Existing Customer IDM

Adopting the SAP-managed model does **not** require re-engineering an existing identity landscape. **Processes already running against SAP Cloud Identity Services continue to run unchanged.** The customer's own Identity Management (IDM) solution remains the system of record for its people — who employees are, how they join/move/leave, and which access they receive — and the SAP-managed provisioning coexists in the *same* SCI tenant alongside those processes without colliding with, overwriting, or disturbing the objects the customer's IDM already governs.

### User groups vs. application groups — the main concern

A frequent question when SAP-managed provisioning is introduced is what happens to the groups a customer already maintains. The distinction between two kinds of groups in SAP Cloud Identity Services is central:

- **IAS user groups (commonly used).** It is common for customers to drive **user groups** in SAP Cloud Identity Services from their IDM, typically following a **name-pattern** convention. These groups are **customer(IDM)-owned** and stay fully under customer control.
- **Application groups (less commonly used).** **Application groups** express roles, groups, and policies from different SAP technologies for a specific application tenant and are what the SAP Business AI Platform needs to build the complete *user → (role →) authorization* picture. These are **less commonly used** by customers today, and in the SAP-managed model they are the groups SAP replicates and maintains (SAP-managed), so the platform always has current authorization data without customer effort.

The main concern — that an SAP-managed provisioning job writing into SCI would interfere with the customer's existing IDM-owned groups and processes — is addressed by an explicit **ownership boundary at the Cloud Identity API (IdDS/SCIM) level**:

- The **customer IDM technical user shouldn't manipulate SAP-managed (application) groups** in the stages where Cloud Identity is not leading.
- The **SAP-managed provisioning technical user will not manipulate IDM-owned groups**, and on user objects it may update **only** link/correlation attributes — never the customer's IDM-owned lifecycle attributes or group memberships.
- For the stage with Cloud Identity as leading entity for the business application each **SAP-managed group is defined by the application** and all attributes except "members" and "displayname" are immutable for the external IDM — while **membership assignments remain mutable**, so the customer can add or remove members as the business requires in such a scenario.

This separation of responsibilities means the customer keeps every control it has today, gains a clearly auditable split of ownership, and can go live without changing its side. Over time, the model opens up more choice — moving to the suite approach on a **per-application basis**, where the customer's IDM can progressively take over membership of the SAP-managed application groups, application by application.

## Extending to AI Agents

The SAP-managed model is the foundation for identity of autonomous AI actors. The [Agent Identity](../../RA0029/8-ai-agent-identity/readme.md) reference architecture extends SAP-managed IAM to AI agents: SAP Cloud Identity Services stores agent identities alongside human identities, and the SAP Agent Gateway enforces policy at every communication hop. Agent Identity is best understood as the agentic continuation of this SAP-managed integration story.

For the specific case of third-party agents acting against SAP solutions, see [Non-SAP Agent Principal Propagation](5-non-sap-agent-principal-propagation/readme.md), which describes how a non-SAP agent's principal is securely propagated through SAP Cloud Identity Services and the SAP Agent Gateway.

## Characteristics

- SAP operates the IAM integration between SAP solutions; the customer federates for authentication to SAP Cloud Identity Services and consumes the managed experience.
- The model matures from line-of-business scope toward SAP Cloud Identity Services as the central leading system.
- It is the identity foundation for unified experiences (Joule, Task Center) and for agent identity.

## Services and Components

- [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/cloud-identity-services?region=all)
- [SAP Business AI Platform](https://www.sap.com/products/artificial-intelligence/ai-platform.html)
- [Joule](https://help.sap.com/docs/joule/integrating-joule-with-sap/introduction?version=CLOUD)

## Related

- [Customer-Managed IAM Integration](../1-customer-managed/readme.md) — the complementary model where the customer operates the IAM integration.
- [Agent Identity](../../RA0029/8-ai-agent-identity/readme.md) — SAP-managed identity for AI agents.
- [Non-SAP Agent Principal Propagation](5-non-sap-agent-principal-propagation/readme.md) — how a third-party agent's principal is propagated to SAP solutions.
