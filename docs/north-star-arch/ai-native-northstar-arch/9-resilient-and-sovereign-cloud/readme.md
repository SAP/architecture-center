---
id: id-nsa-9
sidebar_position: 9
slug: /ai-native-north-star-architecture/resilient-and-sovereign-cloud
sidebar_custom_props:
    category_index: []
title: The Resilient and Sovereign Cloud
description: >-
    SAP's resilient and sovereign cloud strategy delivers AI-native workloads across public, private, sovereign, and on-site deployment models. Operational excellence is ensured through high availability, elasticity, AI-enabled operations, OpenTelemetry observability, and sustainable infrastructure — all governed to meet local compliance and data sovereignty requirements.
keywords:
    - sovereign cloud
    - public cloud
    - private cloud
    - sovereign cloud on-site
    - multi-tier deployment
    - high availability
    - cloud resilience
    - AI-enabled operations
    - OpenTelemetry
    - SAP Cloud ALM
    - cloud elasticity
    - cloud portability
    - disaster recovery
    - sustainable cloud
    - renewable energy
    - data sovereignty
    - compliance
    - North Star Architecture
    - NSA
    - enterprise cloud
sidebar_label: 9. The Resilient and Sovereign Cloud
image: img/ac-soc-med.png
tags:
    - ai-native-north-star
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
pagination_prev: north-star-arch/ai-native-northstar-arch/ecosystem/id-nsa-8
pagination_next: north-star-arch/ai-native-northstar-arch/customer-specific-development-services/id-nsa-10
contributors:
discussion:
last_update:
    author: SAP
    date: 2026-10-26
---

The system of context, the ecosystem, and the agents that operate within them are only as valuable as the infrastructure they run on. An AI-native enterprise runs on an intelligent, resilient cloud that delivers reliable, scalable performance worldwide. **Cloud delivery and operations** provide a unified operating model across hyperscalers and SAP data centers, and **global availability** comes from a federated architecture that balances latency, sustainability, compliance, and cost to meet enterprise-grade SLAs. 

## Multitier deployment – public, private and sovereign cloud

The system of context, the ecosystem, and the agents that operate within them are only as valuable as the infrastructure they run on. An AI-native enterprise runs on an intelligent, resilient cloud that delivers reliable, scalable performance worldwide. The cloud strategy at SAP balances latency, sustainability, compliance, and cost through a multitier deployment model:
- **Public cloud** provides shared, multitenant infrastructure at economies of scale. 
- **Private cloud** offers single-tenant models with maximum flexibility.
- **SAP Sovereign Cloud** offerings help organizations adopt cloud technologies while maintaining control over their data, infrastructure, and compliance in line with local laws and regulations, including the use of compliant large language models.
- **SAP Sovereign Cloud On-Site** offerings provide sovereign cloud capabilities within a customer’s selected or owned data centers. 

## Global Availability and Rollout Strategy 

In today’s digital landscape, SAP cloud solutions must meet diverse customer needs, comply with complex regulations, and deliver services efficiently worldwide. To achieve this, SAP uses a multi-tier deployment and operations strategy that maximizes reach, flexibility, security, and cost efficiency. This chapter outlines the foundational models and principles SAP uses to deploy its cloud services and explains how public, private, and sovereign clouds serve different industries and regions while ensuring compliance, resilience, and innovation.

SAP follows a global multi-tier Deployment and Operations Strategy to optimize the overall deployment footprint and TCO. Deployments can be categorized as:

- **Public Cloud:** A shared, multi-tenant architecture that operates at economies of scale to deliver innovation quickly and at best TCO. It is the baseline deployment model for most customers. Delivery of Public Cloud solutions follows the 4+1 infrastructure strategy.

- **Sovereign Cloud:** Delivers enhanced cloud capabilities for security-hardened, regulated, and (where applicable) classified workloads requiring strict regulatory, security, and confidentiality controls. It offers stronger sovereignty across data, operational, technical, and legal dimensions. Sovereignty extends to AI workloads — model availability varies by region, requiring region-based model routing and prompt optimization through Gen AI Hub to maintain consistent quality across sovereignty boundaries. Delivery follows the 4+1 infrastructure strategy in shared data-center facilities that meet sovereignty standards and regulations.

- **Sovereign Cloud Onsite (SCOS):** Uses SAP Cloud Infrastructure (SCI) and SAP BTP to deliver sovereign-cloud capabilities inside customers’ data centers. Operations follow sovereign-cloud standards and are performed by local operations teams. All applications run on an isolated SCI and must not call or consume services from external hyperscalers or third parties. To accelerate deployment and scaling, operations and lifecycle management will be standardized and simplified, including a reduction in third-party tools.

- **Private Cloud:** Delivers SAP-operated products in single-tenant models, giving customers individual control of systems and environments while still optimizing for efficient, standardized operational and architectural concepts. Private Cloud offers the highest flexibility in cloud delivery.

Continuously increasing [data localization restrictions](https://sap.sharepoint.com/:w:/t/CPAInfrastructure/EUbDKJrlVFtMge7PMcTrE-8BTflEeKnJmGOft7SeYJNhPg?e=uEJ5be) limit cross-regional delivery of cloud solutions. Our design principle is to keep customer business data within country borders where regulated and to clearly document exceptions to create transparency. This aligns with customer expectations, reduces delivery complexity, and future-proofs delivery in changing regulatory and geopolitical environments. It is also important to align SLOs and disaster-recovery expectations between service producers and consumers. Services can be consumed non-regional for TCO reasons as described in “[Non-regional services: Implementation Options](https://sap.sharepoint.com/:w:/t/CPAInfrastructure/Ecd4DFnJuEJNli1iwTH1iesB3TlAU4_qouChqj4g5pp7EA?e=cZfQx2&wdLOR=cD2395A54-D68F-1A44-90B9-ABA8BB886C24),” while still meeting the boundary conditions mentioned above.

In our **Multi-Cloud Strategy**, Public Cloud and Sovereign Cloud deployments follow the 4+1 infrastructure strategy globally. Sovereign Cloud Onsite targets SAP Cloud Infrastructure as the sole platform, whereas Private Cloud may offer selected additional infrastructure options beyond 4+1 (for example, IBM Cloud, StackIT, and potentially others).

**Delivery from SAP-managed Cloud Infrastructure** provides a hyperscaler-independent option for cloud products and must be a design consideration for solutions. It also enables delivery into Sovereign Cloud Onsite and future models such as SAP Cloud for Defence. For all deployment models, standardized software packaging, delivery, operations, and lifecycle management are required. Environments, tools, services, and applications used internally at SAP must be productized with sovereign-cloud requirements in mind.

**High availability and resilience** are critical for SAP cloud deployments supporting mission-critical workloads. For the most critical locations, long-distance multi-region disaster recovery is a target offering. BTP as the platform for SAP cloud solutions will provide core disaster-recovery capabilities. In-metro DR will serve as a fallback to fail over across short distances as an interim step or in smaller regions where long-distance in-country DR locations are not available.

**Location Strategy and Geo Expansion**
SAP delivers Public Cloud solutions from 18 countries as a baseline in 2025. The availability of SAP BTP as the strategic platform for SAP cloud products forms the basis for SAP’s cloud location strategy. Expansion into additional locations (country and infrastructure) will occur selectively after careful business-case evaluation and potential analysis. Delivery from new locations will be evaluated from a cross-product and Business Suite perspective. 

## Cloud Delivery and Operations 

SAP solutions must be secure, reliable, scalable, sustainable and cost-optimized. SaaS delivery lets SAP and customers save costs by leveraging synergies, reusing services and infrastructure, but only if the following foundational requirements are met.

**Resilience**
Resilience is a key quality of a cloud product, covering both unplanned and planned outages. SaaS solutions usually come with a service level agreement (SLA) of around 99.9xx percent availability; for example, 99.99 percent translates to about unavailability of system for 8.6 seconds per day.

SAP has experienced outages due to the heterogeneous nature of the product landscape and varying levels of resilience, leading to business disruptions for customers. To address planned and unplanned outages, we are striving to:

- **Define** aligned and minimal downtime windows, ideally near zero downtime, across applications, platform, and infrastructure.
- **Standardize** resilience definitions and metrics, availability calculations, and criteria to classify features by business criticality, and standardize tooling such as backup and recovery, central failover tooling, and monitoring. 
- **Establish** a standardized “shift-left to platform” architecture with agreed patterns, technologies, and services such as SAP HANA Cloud.
- **Implement** architecture concepts and operational procedures that enable zero or near-zero downtime maintenance.

More details can be found [here](https://sap.sharepoint.com/sites/209131/Shared Documents/WG Resilience/Resilience Vision Document/2025-07 WG_Resilience_Vision_Document.pdf).

**Portability**
Cloud solutions must be portable across multiple infrastructure environments to allow flexibility in target and deployment model selection, including Sovereign Cloud on-site. Portability at tenant, system, and landscape level enables relocation of cloud workloads across infrastructure platforms and countries to balance capacities and optimize TCO.

SAP must be able to shift workloads quickly between cloud providers, including SAP Cloud Infrastructure, in response to market forces and to reduce the risk of vendor lock-in. Many SAP workloads cannot easily be shifted because they are designed to run only on a particular provider’s infrastructure or depend on specific platform services. The goal is to minimize dependency on cloud platform providers by shifting to SAP platform and hyperscaler-agnostic services like Gardener, SAP HANA Cloud, App Foundation (SDK, programming model, observability, and so on), and a curated, exchangeable set of platform services. Connectivity to customer environments follows the same principle: private network (Private Link) paths keep SAP-to-customer traffic off the public internet, with Cloud Connector layering application-level capabilities where needed, all governed through the Unified Outbound Gateway.

**Elasticity**
Elasticity is the ability of a SaaS or PaaS application or service to adjust capacity automatically with demand, minimizing idle cost while preserving peak load performance. It should be managed as a continuous loop of designing for efficiency, monitoring utilization and spend, and iteratively right-sizing. We realize this by containerizing applications to enable fast start-up and fine-grained horizontal scaling, using Kyma or plain Kubernetes operated with Gardener, or alternatives such as Cloud Foundry or the ABAP Cloud Runtime that provide managed scaling and operational abstractions. Container runtime guidance is available through CDE-57R1 (previously TG57). Containerization also reduces environmental impact by avoiding idle resource consumption.

We recommend adopting a stateless programming model so workloads can elastically adjust to demand, externalizing state to managed databases, caches, and queues, and designing idempotent APIs. On the data tier, SAP HANA Cloud contributes to elasticity through built-in capabilities that adapt compute, memory, and storage to load and capacity requirements.

**Open Component Model**
We adopt the Open Component Model for software components to streamline compliance, deployment, and reporting. It is already used in Hyperspace, SAP SuccessFactors, Kyma, Steampunk, SAP Analytics Cloud, Apeiro projects, and more.

**AI-enabled Operations**
Building on the platform-level OpenTelemetry (OTEL) standardization, AI-enabled infrastructure operations (AIOps) provide enhanced visibility and intelligence across infrastructure and application layers. This observability covers agents and applications end-to-end, capturing not only operational health but also what agents do, how they reason, where they act, and whom they call. 
Automated, continuous monitoring enables early detection of anomalies, predictive issue resolution, self-healing workflows and data-driven insights for capacity and performance optimization. This data serves a dual purpose: they keep operations reliable—reducing manual intervention in routine tasks like data center rollouts—and they become a feedback signal for continuous agent improvement, adding to the context that informs future reasoning and decisions. This proactive management reduces operational expenses and improves customer experience.
Telemetry-based alerts will be routed to ServiceNow for SAP-managed operations, with selected customer-facing alerts surfaced through SAP Cloud ALM. Audit events will use a common format carried through OpenTelemetry to provide a consistent record of activity across agents and services.

**Sustainability**
SAP advances sustainable cloud operations through a multilayered infrastructure strategy that reduces the environmental impact of data centers, in line with the global environmental policy. This includes running 100% of SAP-owned data centers on renewable energy, optimizing workloads, and collaborating closely with cloud infrastructure suppliers to help ensure their services and hardware align with the sustainability strategy at SAP. 

**Customer Supportability for AI scenarios**
This requires clear documentation, explainability, debugging tools, and strong logging and tracing so issues can be reproduced and resolved consistently. With these foundations, support teams can handle AI incidents confidently and independently, sustaining customer trust at scale. More details at [AI Supportability for AI use cases](https://rise.articulate.com/share/31sOeGR1Cp6iq64xUvp-KVpnR0iO2Pje#/). 

In this evolution,[SAP Cloud ALM](https://support.sap.com/en/alm/sap-cloud-alm/operations.html) extends from application-centric operations to AI-aware operations, supporting customers with the tools, workflows, and insights required to operate AI scenarios reliably at scale. 
Operating at scale serves every customer; differentiated value is created where each customer's context is unique, and that is the role of Development Services.
