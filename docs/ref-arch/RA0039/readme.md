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

At the foundation lies **SAP Business Data Cloud (BDC)**, an open, Iceberg-native data lakehouse powered by the Dremio federation engine and Apache Arrow that spans the entire data consumption lifecycle: ingesting SAP and non-SAP data into governed Data Products, making them discoverable through a unified catalog, executing queries and enrichment through a high-performance engine, and elevating data into business meaning through a semantic and ontology layer. Every section below describes a dimension of the SAP Lakehouse; together they form the complete platform picture.  

![drawio](drawio/BAIP.drawio)

## Architecture Overview

The architecture is organized into semantic layers, each building on the one below, forming a coherent stack from raw source data to AI-powered experiences surfaced in SAP Joule. 


## Architecture Details

### 1. Data Powering the Enterprise AI

Enterprise data does not live in one place. It is distributed across SAP applications, third-party SaaS platforms, cloud data warehouses, and customer-managed object stores. SAP Business AI Platform meets this reality without forcing consolidation.

**SAP application data** originates in systems customers already run: SAP S/4HANA PCE for financials and operations, SAP SuccessFactors for HR and workforce, SAP Ariba for procurement and spend. These systems are the authoritative source of record for the business processes that matter most. Their data enters BDC through the **FOS pipeline**—a CDC-based extract that flows through an Apache Spark medallion (Bronze → Silver → Gold), landing Primary Data Products (SAP) in Delta format with Apache UniForm so that Dremio can consume them natively as Iceberg without conversion or duplication.

**Non-SAP data** rests in platforms customers have already invested in: Azure Data Lake Storage, AWS S3, Google Cloud Storage, SQL Server, Oracle, and more. The SAP Business AI platform federates it in place through **Dremio's open query engine**—reading it directly over Apache Arrow without a byte of replication.

Enterprise AI data is organized into a layered product model:

- **Primary Data Products (SAP)** — Producer-oriented, canonical-form representations of SAP application data, published with dual ports: a near-real-time SQL port over Arrow Flight and an Apache Iceberg port.
- **Primary Data Products (Non-SAP)** — Non-SAP data created via Dremio and registered through the Enterprise Catalog and made available under the same product model as SAP data, zero-copy, in place.
- **Unified & 360 Data Products** — Master data fused across systems by **Reltio**, which resolves entities from S/4HANA, SuccessFactors, Ariba, and non-SAP CRM and ERP into golden records with OID key-mapping tables. Dremio joins those golden records with transactional data products to produce 360 views of customer, supplier, or employee that span every source system.
- **Derived Data Products** — Consumer-oriented assets, created from Joule via Data Product creation agent, that combine SAP and non-SAP data into shapes purpose-built for analytics, predictive scoring, planning, and AI enrichment. A Derived Data Product may join Primary Data Products (SAP or non-SAP) with live-federated Databricks or Snowflake tables; Dremio executes that join across the estate through pushdown and Apache Arrow without ever copying data.

The result is a structured, governed data product estate that spans the full enterprise, regardless of where the underlying data physically lives.

### 2. Enterprise Catalog — Making All Data Discoverable

Data that cannot be found cannot be used. The **Enterprise Catalog**, powered by **Apache Polaris**, is the single system of record that makes every Data Product—SAP and non-SAP—discoverable, governed, and shareable across the enterprise.

The catalog stores table schemas, data product metadata, data lineage, and row- and column-level access policies in one place. Every Data Product registered in the catalog is immediately visible to authorized consumers—agents, BI tools, and external engines—through a consistent metadata interface, regardless of which engine manages the underlying data or where the files physically reside.

**Zero-copy sharing** is a foundational property of the catalog. Authorized engines inside the customer formation—Databricks, Snowflake, and hyperscaler compute—read catalog-registered Data Products in place, with no physical replication and no replication cost passed to the customer. The same Iceberg table, for example,  that a Joule Studio agent queries is the one a Databricks notebook reads; there is no copy, no sync job, and no divergence. This is a structural replacement for copy-on-write integration patterns, which incur both cost and freshness lag.

Access policies travel with the data. Row- and column-level ABAC policies are defined once and enforced at query time on every access path—whether the consumer is a Joule agent, a dashboard, or a direct SQL query. A user who is not authorized to see a column never sees it, regardless of how they reach the data.

The catalog also governs the sharing perimeter. Engines inside the customer formation authenticate to the catalog and read zero-copy under catalog-enforced policies. The catalog boundary is deliberate: it ensures that policy enforcement and metering are never bypassed by giving an external engine direct object storage access. 

### 3. Engine and Compute — The Power Behind the Data

Discoverable data must still be queryable at enterprise scale, at low latency, and at a price point that makes broad consumption economically rational. This is the role of **Dremio**, the open, high-performance query federation engine at the heart of SAP Business Data Cloud.

Dremio is **Apache Iceberg-native and Apache Arrow-accelerated**. It reads SAP Primary Data Products directly from their UniForm Iceberg metadata, executes distributed MPP queries with autonomous reflections and AutoCache, and returns results over Arrow Flight SQL and ADBC (Arrow Database Connectivity) without serialization overhead. Non-SAP estates are reached through Dremio's federation layer: Customer-managed object storage, SQL server and various other sources are all queryable through pushdown—Dremio translates and routes the query to the source engine, receives an Arrow record batch, and assembles the result. Nothing moves to a staging area. Nothing is copied.

**SAP AI Core** — SAP AI Core provides the managed AI execution and operations layer, enabling the deployment, orchestration, governance, and scaling of AI models and workflows. In-place tabular prediction models—**TabPFN** for AI-enriched Data Products and **RPT-1.5** from the Model Garden for retrieval-augmented and embedding scenarios execute on the Dremio engine without requiring data movement to external ML platforms. Predictive scores, anomaly signals, and demand forecasts are added directly to Derived Data Products in the Gold layer, making every enriched product immediately available to agents and BI consumers through the same query path.

**SAP HANA Cloud** — SAP HANA Cloud plays the role of a database, intelligent compute, and multi-model processing layer within SAP Business Data Cloud (BDC), while Dremio compute complements it with its federation capabilities that support high-volume query workloads across heterogeneous data sources.  


### 4. Semantic Layer — Climbing the Ladder from Data to Action

Queryable data becomes useful to AI when it carries business meaning. The semantic layer is where SAP Business AI Platform makes that translation—turning tables and columns into entities, relationships, and actions that agents can reason over and act on.

**Reltio** anchors the semantic layer in mastered reality. Its entity resolution and golden-record engine fuses master data across systems into Unified Data Products that represent the single authoritative version of a customer, supplier, employee, or asset across the enterprise. 

**SAP BDC Ontology Manager** and the **SAP Business Knowledge Graph (BKG)** extend the semantic layer across the full data estate. The BKG provides business semantics that **AutoSQL** uses to generate accurate queries over Data Products: an agent does not need to know that margin is computed from ACDOCA columns joined to a cost center hierarchy—the BKG carries that knowledge and translates the business question into the right SQL. SAP BDC Ontology Manager contributes two modes: *ontology for context*, materialized as RDF triples with OWL schemas and SHACL governance into the HANA Knowledge Graph for reliable, auditable semantic grounding; and *ontology for operation*, virtually queried via SPARQL-to-SQL translation over live Dremio-managed tables, with **Business Actions** that bind ontology concepts to executable API workflows in SAP Integration Suite. An agent that understands the Customer entity through the ontology can not only answer questions about it but also initiate a credit review, send a notification, or trigger a workflow—directly from the reasoning step.

Together, this layer turns objects into meaning and binds them to business action. Agents built on top of it do not merely read—they understand and do.

### 5. Joule and Analytical Consumption — Enterprise AI at work

With data products governed, discovered, computed, and semantically grounded, the final stage is delivery: getting intelligence to the people and systems that need it, in the form they can act on.

**Joule Studio** is the agentic development and runtime surface. Code-based agents built in Joule Studio consume both structured Iceberg Data Products via Dremio and semantic ontology objects from SAP BDC Ontology manager and the SAP Business Knowledge Graph as typed tools. An agent answering a question that spans SAP S/4HANA finance, SuccessFactors master data, and a non-SAP CRM dataset in 3rd-party platforms navigates the ontology to select the right Data Products and tools,  and returns a grounded, explainable answer filtered to exactly what that user is authorized to see. The Joule Harness hosts both **Autonomous Agents**—pre-built agents for Finance, Spend, and HCM—and **Partner Agents** developed on the platform by customers and ISVs.

**Joule Work Spaces** project dynamically powered BI insights directly into the collaboration surface with real-time updates, driven by Dremio reflections refreshing against the live data estate. Business users see current charts, KPIs, and trend signals without leaving their work context and without waiting for overnight batch refresh. **Joule Conversations** provides the natural-language entry point to the same intelligence stack.


## External Consumption 

Governed outbound paths reach external consumers:

- **Agent Gateway** — the open door to the agent economy. SAP agents interoperate with third-party agents from Google Gemini, Amazon Bedrock, Microsoft Copilot, and Databricks Agent Bricks over A2A (Agent-to-Agent) protocol and, subsequently, MCP (Model Context Protocol). The Agent Gateway is a controlled, policy-enforced bridge: every cross-agent call respects the same authorization model enforced inside BDC.

- **Analytical Consumption** — the path for external BI and analytics tools. External consumers access governed analytical interfaces and results through supported connectivity mechanisms, with access controlled by the applicable authorization and data-governance policies.

- **BDC Connect — Open Data Sharing**: The governed data-product exchange path between SAP Business Data Cloud and supported external data platforms. It enables secure, zero-copy sharing of business-ready data products while preserving business context and governance, using open sharing protocols and supported table formats such as Apache Iceberg where available.



---