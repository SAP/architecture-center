---
id: 5hj89h
slug: /ref-arch/5hj89h
sidebar_position: 1
title: SAP Business AI Platform
description: The SAP Business AI platform brings together deep process context, unified data, and enterprise-grade governance to ensure that AI solutions are reliable, compliant, and impactful.
sidebar_label: SAP Business AI Platform
keywords:
  - sap
  - business data cloud
  - bdc
  - lakehouse
  - data architecture
  - data platform
  - dremio
  - reltio
  - ontology
  - joule
  - catalog
image: img/ac-soc-med.png
tags:
  - ref-arch
  - bdc
  - data
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - fabianleh
  - s-krishnamoorthy
last_update:
  author: fabianleh
  date: 2026-10-24
---
## SAP Business AI Platform

The **SAP Business AI Platform** is SAP's enterprise AI foundation providing the infrastructure, data intelligence, and governance required to run trusted AI at enterprise scale. Built on enterprise-grade security, governance, and data frameworks, it is deeply integrated with SAP's business applications and process knowledge. When Joule Work is provisioned, the platform is delivered as an integrated bundle — customers do not need to assemble or operate its components independently.

A core architectural principle runs through the platform: enterprise data must be enriched with business semantics to become actionable intelligence. Through a semantic layer that binds business meaning to data regardless of where it resides, the platform enables agents to reason, decide, and act across the full enterprise data estate with the same confidence and authorization controls that govern human users.

### Agent Gateway

The **Agent Gateway** is the central integration and routing layer of the SAP Business AI Platform. It handles all runtime connectivity between Joule, agents, and backend tools and systems — with centralized authentication, principal propagation, policy enforcement, and tenancy management at every communication hop.

## Three Architectural Pillars - One Platform

SAP structures the platform around three pillars:

| Pillar | Purpose |
|---|---|
| **Build** | Create agents, apps, and automations using BTP tooling and [Joule Studio](/docs/ref-arch/d2ba1e) |
| **Contextualize & Reason** | Ground AI in trusted business data, semantics, and process knowledge |
| **Govern** | Manage, audit, and control AI agents and assets at enterprise scale |

### Layer 1 — Build

The development and execution foundation. Key components:

- **[Joule Studio](/docs/ref-arch/d2ba1e)** — Embeds SAP business context (Knowledge Graph, Domain Models, Business Data Cloud, Signavio, LeanIX) directly into development to create reliable agentic solutions grounded in your systems and workflows. Brings Intent-Based Development to the tools developers already use — VS Code, Git, agentic IDEs, MCP toolchains, and open frameworks — and supports multi-agent orchestration and SAP/non-SAP connectivity through MCP, A2A, and embedded n8n. Delivers governed, production-ready solutions with native observability, access controls, and lifecycle management on the Joule Studio runtime.
- **SAP Integration Suite** — One solution to connect AI agents, applications, data, and business processes across SAP and non-SAP systems. Combines APIs, events, and integration flows; helps teams discover, build, reuse, and automate integrations faster with prebuilt adapters and guided development practices. Provides centralized governance, monitoring, anomaly detection, and event-driven connectivity for trusted agentic workflows.


{/* TODO @I863312: review and update the section below */}
### Layer 2 — Contextualize & Reason (Business Data & Semantics)

Becoming an Autonomous Enterprise requires agents that can understand and act on your full business context — not just your data. This layer closes that gap by unifying SAP and non-SAP business data, process logic, and semantics so every agent can reason and act reliably across the enterprise, while using the right intelligence for every task.

**Universal business context**

- **SAP Business Data Cloud** — Unifies SAP and third-party data alongside the context from business processes, policies, and logic that makes data meaningful. Includes intelligent compute for best-of-breed data and AI workloads and an open data catalog for enterprise-wide governance.

**Process context**

- **SAP Knowledge Graph** — Structures 7.3 million data fields and 452,000 tables into an explicit ontology — a machine-readable map of business entities, processes, and industry-specific rules. Agents reason across relationships rather than retrieve isolated records, producing accurate results instead of plausible guesses.
- **SAP Integration Suite** — Sharpens context by connecting agents to live business events, APIs, and workflows across SAP and third-party applications. Event-driven integration gives agents current operational context rather than historical data.
- **SAP Signavio** — Adds decision logic, exception rules, and operating procedures as reusable process atoms. Makes organizational knowledge — approval thresholds, escalation chains, compliance checkpoints — machine-readable so agents can check conformance and adapt behavior at runtime.

**Model layer**

- **Tabular Foundation Models (SAP-RPT & TabPFN)** — Table-native foundation models for structured business data (ledgers, invoices, supply chain records). Use in-context learning to deliver predictions from tabular data without task-specific model training.
- **SAP Domain Models** — Trained on SAP code, data, metadata, and business processes; deliver higher prediction quality than generic LLMs on SAP-specific tasks. The SAP-ABAP model was trained on 250M+ lines of ABAP code and 30M lines of CDS.
- **Generative AI Models via SAP AI Core** — Access to 50+ leading commercial and open-source foundation models — including Anthropic, OpenAI, Mistral, and Cohere — from a single SAP-managed service.

### Layer 3 — Govern (SAP AI Agent Hub)

**[SAP AI Agent Hub](/docs/ref-arch/jfhsd9)** is the enterprise command center for AI governance — a single platform that brings enterprise architecture discipline to AI agent management, built on SAP LeanIX. It manages agents across five lifecycle stages (Define, Verify, Enforce, Monitor, Optimize) from initial design through decommissioning.

**Business and architecture context**

- **SAP Signavio** — Provides process and agent optimization potential and conformance baselines before deployment, enabling outcome tracking and deviation detection from the first day of operation.
- **SAP LeanIX** — Provides full enterprise architecture context at design time, supporting risk classification and architecture decision records for each created asset.
- **Company memory** — Encodes business processes, relationships, and organizational context so agents reason within the actual operating model of the enterprise, not just against its data.

**Portfolio & policy**

- **SAP AI Agent Hub** — Central entry point for agent governance: unified registry of all agents, MCP servers, and LLMs; discovery across SAP, third-party (Azure, GCP, AWS, ServiceNow, Databricks), and local environments; risk assessment, verification, and EU AI Act compliance classification.
- **SAP LeanIX** — Extends portfolio governance to the full enterprise architecture context, connecting AI assets to business capabilities, application portfolios, and technology lifecycle decisions.

**Identity, access, and data integrity**

- **SAP Cloud Identity Services** — Agent-level SSO and authorization policy enforcement across any landscape, from development through to production; registering an agent in the hub triggers provisioning flows that align role and permission assignments.
- **SAP Access Controls** — Applies access risk analysis with field-level separation-of-duties checks to agent authorization models before any grant is made.
- **Cloud Identity Access Governance** — Governs agent identities across cloud and hybrid environments with workflow-driven provisioning, real-time SoD checks, and deprovisioning at retirement.
- **SAP Business Data Cloud** — Provides data residency controls, region pinning, and principal propagation, ensuring agent identity is passed through to data sources for auditable, policy-aligned access.

**Deployment and runtime controls**

- **SAP Agent Gateway** — The runtime enforcement point: SAP and third-party agents route requests through it; applies access control policies defined in the hub, connects agents to MCP servers, SAP applications, Integration Suite adapters, and external systems.
- **Joule Studio design time** — Enables customers to build and extend SAP agents, defining authorization policies, guardrails, and extensions; integrates with the hub via the LeanIX MCP server so developers work with the right architectural context from day one.
- **Joule Studio runtime** — Provides the underlying infrastructure and enforces a deployment pipeline that requires governance approval before any agent reaches production users.

**Monitoring**

- **SAP Cloud ALM** — Receives session telemetry from SAP-managed agents; delivers dedicated agent dashboards covering evaluation rates, error root causes, session volumes, and performance trends; AI-assisted issue detection and a continuous requirements-to-runtime record supporting audit and incident investigation.
- **SAP Signavio Process Intelligence** — Agent behavior mining: ingests execution traces via a dedicated connector, surfaces process conformance issues, cost drivers, and performance benchmarks to identify redundant or underperforming agents.
- **SAP SuccessFactors** — Provides the organizational dimension, mapping agents to business units and roles; supports workforce planning as agents reshape job functions and required competencies.



## Deployment Model

SAP Business AI Platform follows a **SAP-managed by default** deployment philosophy, designed to reduce operational complexity while preserving enterprise-grade flexibility. Core platform services — including SAP AI Core, the Generative AI Hub, Joule, and the AI Agent Hub — are fully operated, maintained, and secured by SAP. This means customers benefit from continuous updates, built-in governance, and enterprise security controls without the burden of infrastructure management.

At the same time, the platform is architected for extensibility. Organizations can build and deploy custom AI agents, skills, and business applications within their own SAP cloud environments, retaining full ownership and control over proprietary logic and data. This dual model — SAP-managed foundation with customer-controlled extensions — enables enterprises to move fast on standard scenarios while preserving the ability to differentiate where it matters.

Underlying the entire platform is a **hyperscaler-agnostic** infrastructure. SAP AI Core runs across AWS, Azure, and Google Cloud Platform, ensuring workload portability and eliminating vendor lock-in at the infrastructure level. AI Foundation services, including the Generative AI Hub and AI Launchpad, are delivered as multi-tenant cloud services, with access to a broad ecosystem of frontier large language models — from OpenAI, Google, Anthropic, Meta, Mistral, and others — all governed through a single, policy-enforced access layer.

Interoperability is a first-class concern: third-party AI systems and non-SAP agents connect via open standards (A2A protocol, MCP, REST/OData), making SAP Business AI Platform a composable foundation for heterogeneous enterprise AI landscapes.

## 9. References

| Resource | URL |
|---|---|
| SAP Business AI Platform | https://www.sap.com/products/ai-platform.html |
| Agentic AI Reference Architecture | https://architecture.learning.sap.com/docs/ref-arch/98efa0 |
| SAP AI Core Documentation | https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core |
| SAP AI Golden Path | https://architecture.learning.sap.com/docs/ai-golden-path |
| Securing SAP Business AI Architectures | https://community.sap.com/t5/technology-blog-posts-by-sap/securing-sap-business-ai-architectures-trust-boundaries-and-secure-data/ba-p/14295118 |


{/* TODO @I863312: review and update the section below */}

### Agent Gateway

The **Agent Gateway** is the central integration and routing layer of the SAP Business AI Platform. It handles all runtime connectivity between Joule, agents, and backend tools and systems — with centralized authentication, principal propagation, policy enforcement, and tenancy management at every communication hop.

## Three Architectural Pillars - One Platform

SAP structures the platform around three pillars:

| Pillar | Purpose |
|---|---|
| **Build** | Create agents, apps, and automations using BTP tooling and [Joule Studio](/docs/ref-arch/d2ba1e) |
| **Contextualize & Reason** | Ground AI in trusted business data, semantics, and process knowledge |
| **Govern** | Manage, audit, and control AI agents and assets at enterprise scale |

### Layer 1 — Build

The development and execution foundation. Key components:

- **[Joule Studio](/docs/ref-arch/d2ba1e)** — Embeds SAP business context (Knowledge Graph, Domain Models, Business Data Cloud, Signavio, LeanIX) directly into development to create reliable agentic solutions grounded in your systems and workflows. Brings Intent-Based Development to the tools developers already use — VS Code, Git, agentic IDEs, MCP toolchains, and open frameworks — and supports multi-agent orchestration and SAP/non-SAP connectivity through MCP, A2A, and embedded n8n. Delivers governed, production-ready solutions with native observability, access controls, and lifecycle management on the Joule Studio runtime.
- **SAP Integration Suite** — One solution to connect AI agents, applications, data, and business processes across SAP and non-SAP systems. Combines APIs, events, and integration flows; helps teams discover, build, reuse, and automate integrations faster with prebuilt adapters and guided development practices. Provides centralized governance, monitoring, anomaly detection, and event-driven connectivity for trusted agentic workflows.


{/* TODO @I863312: review and update the section below */}
### Layer 2 — Contextualize & Reason (Business Data & Semantics)

Becoming an Autonomous Enterprise requires agents that can understand and act on your full business context — not just your data. This layer closes that gap by unifying SAP and non-SAP business data, process logic, and semantics so every agent can reason and act reliably across the enterprise, while using the right intelligence for every task.

**Universal business context**

- **SAP Business Data Cloud** — Unifies SAP and third-party data alongside the context from business processes, policies, and logic that makes data meaningful. Includes intelligent compute for best-of-breed data and AI workloads and an open data catalog for enterprise-wide governance.

**Process context**

- **SAP Knowledge Graph** — Structures 7.3 million data fields and 452,000 tables into an explicit ontology — a machine-readable map of business entities, processes, and industry-specific rules. Agents reason across relationships rather than retrieve isolated records, producing accurate results instead of plausible guesses.
- **SAP Integration Suite** — Sharpens context by connecting agents to live business events, APIs, and workflows across SAP and third-party applications. Event-driven integration gives agents current operational context rather than historical data.
- **SAP Signavio** — Adds decision logic, exception rules, and operating procedures as reusable process atoms. Makes organizational knowledge — approval thresholds, escalation chains, compliance checkpoints — machine-readable so agents can check conformance and adapt behavior at runtime.

**Model layer**

- **Tabular Foundation Models (SAP-RPT & TabPFN)** — Table-native foundation models for structured business data (ledgers, invoices, supply chain records). Use in-context learning to deliver predictions from tabular data without task-specific model training.
- **SAP Domain Models** — Trained on SAP code, data, metadata, and business processes; deliver higher prediction quality than generic LLMs on SAP-specific tasks. The SAP-ABAP model was trained on 250M+ lines of ABAP code and 30M lines of CDS.
- **Generative AI Models via SAP AI Core** — Access to 50+ leading commercial and open-source foundation models — including Anthropic, OpenAI, Mistral, and Cohere — from a single SAP-managed service.

### Layer 3 — Govern (SAP AI Agent Hub)

**[SAP AI Agent Hub](/docs/ref-arch/jfhsd9)** is the enterprise command center for AI governance — a single platform that brings enterprise architecture discipline to AI agent management, built on SAP LeanIX. It manages agents across five lifecycle stages (Define, Verify, Enforce, Monitor, Optimize) from initial design through decommissioning.

**Business and architecture context**

- **SAP Signavio** — Provides process and agent optimization potential and conformance baselines before deployment, enabling outcome tracking and deviation detection from the first day of operation.
- **SAP LeanIX** — Provides full enterprise architecture context at design time, supporting risk classification and architecture decision records for each created asset.
- **Company memory** — Encodes business processes, relationships, and organizational context so agents reason within the actual operating model of the enterprise, not just against its data.

**Portfolio & policy**

- **SAP AI Agent Hub** — Central entry point for agent governance: unified registry of all agents, MCP servers, and LLMs; discovery across SAP, third-party (Azure, GCP, AWS, ServiceNow, Databricks), and local environments; risk assessment, verification, and EU AI Act compliance classification.
- **SAP LeanIX** — Extends portfolio governance to the full enterprise architecture context, connecting AI assets to business capabilities, application portfolios, and technology lifecycle decisions.

**Identity, access, and data integrity**

- **SAP Cloud Identity Services** — Agent-level SSO and authorization policy enforcement across any landscape, from development through to production; registering an agent in the hub triggers provisioning flows that align role and permission assignments.
- **SAP Access Controls** — Applies access risk analysis with field-level separation-of-duties checks to agent authorization models before any grant is made.
- **Cloud Identity Access Governance** — Governs agent identities across cloud and hybrid environments with workflow-driven provisioning, real-time SoD checks, and deprovisioning at retirement.
- **SAP Business Data Cloud** — Provides data residency controls, region pinning, and principal propagation, ensuring agent identity is passed through to data sources for auditable, policy-aligned access.

**Deployment and runtime controls**

- **SAP Agent Gateway** — The runtime enforcement point: SAP and third-party agents route requests through it; applies access control policies defined in the hub, connects agents to MCP servers, SAP applications, Integration Suite adapters, and external systems.
- **Joule Studio design time** — Enables customers to build and extend SAP agents, defining authorization policies, guardrails, and extensions; integrates with the hub via the LeanIX MCP server so developers work with the right architectural context from day one.
- **Joule Studio runtime** — Provides the underlying infrastructure and enforces a deployment pipeline that requires governance approval before any agent reaches production users.

**Monitoring**

- **SAP Cloud ALM** — Receives session telemetry from SAP-managed agents; delivers dedicated agent dashboards covering evaluation rates, error root causes, session volumes, and performance trends; AI-assisted issue detection and a continuous requirements-to-runtime record supporting audit and incident investigation.
- **SAP Signavio Process Intelligence** — Agent behavior mining: ingests execution traces via a dedicated connector, surfaces process conformance issues, cost drivers, and performance benchmarks to identify redundant or underperforming agents.
- **SAP SuccessFactors** — Provides the organizational dimension, mapping agents to business units and roles; supports workforce planning as agents reshape job functions and required competencies.


![drawio](drawio/BAIP.drawio)

## Deployment Model

SAP Business AI Platform follows a **SAP-managed by default** deployment philosophy, designed to reduce operational complexity while preserving enterprise-grade flexibility. Core platform services — including SAP AI Core, the Generative AI Hub, Joule, and the AI Agent Hub — are fully operated, maintained, and secured by SAP. This means customers benefit from continuous updates, built-in governance, and enterprise security controls without the burden of infrastructure management.

At the same time, the platform is architected for extensibility. Organizations can build and deploy custom AI agents, skills, and business applications within their own SAP cloud environments, retaining full ownership and control over proprietary logic and data. This dual model — SAP-managed foundation with customer-controlled extensions — enables enterprises to move fast on standard scenarios while preserving the ability to differentiate where it matters.

Underlying the entire platform is a **hyperscaler-agnostic** infrastructure. SAP AI Core runs across AWS, Azure, and Google Cloud Platform, ensuring workload portability and eliminating vendor lock-in at the infrastructure level. AI Foundation services, including the Generative AI Hub and AI Launchpad, are delivered as multi-tenant cloud services, with access to a broad ecosystem of frontier large language models — from OpenAI, Google, Anthropic, Meta, Mistral, and others — all governed through a single, policy-enforced access layer.

Interoperability is a first-class concern: third-party AI systems and non-SAP agents connect via open standards (A2A protocol, MCP, REST/OData), making SAP Business AI Platform a composable foundation for heterogeneous enterprise AI landscapes.

## 9. References

| Resource | URL |
|---|---|
| SAP Business AI Platform | https://www.sap.com/products/ai-platform.html |
| Agentic AI Reference Architecture | https://architecture.learning.sap.com/docs/ref-arch/98efa0 |
| SAP AI Core Documentation | https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core |
| SAP AI Golden Path | https://architecture.learning.sap.com/docs/ai-golden-path |
| Securing SAP Business AI Architectures | https://community.sap.com/t5/technology-blog-posts-by-sap/securing-sap-business-ai-architectures-trust-boundaries-and-secure-data/ba-p/14295118 |




---