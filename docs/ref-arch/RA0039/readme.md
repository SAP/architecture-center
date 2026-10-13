---
id: 5hj89h
slug: /ref-arch/5hj89h
sidebar_position: 1
title: SAP Business AI Platform
description:   The SAP Business AI platform brings together deep process context, unified data, and enterprise-grade governance to ensure that AI solutions are reliable, compliant, and impactful.
sidebar_label: SAP Business AI Platform
keywords:
  - sap
  - BAIP
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
draft: true
unlisted: false
contributors:
  - fabianleh
  - s-krishnamoorthy
last_update:
  author: s-krishnamoorthy
  date: 2026-10-06
---
## SAP Business AI Platform

SAP Business AI Platform represents the North Star for enterprise-grade AI: a unified architecture in which every AI agent, every business insight, and every automated decision is grounded in trusted, governed data across the entire enterprise estate—SAP and non-SAP alike.

The platform is built around a single organizing principle: data must not only be accessed and processed—it must be *understood*. Through a semantic layer that binds business meaning to data, SAP Business AI Platform enables agents to reason, decide, and act across the full enterprise data estate with the same confidence and authorization controls that govern human users today.

At the foundation lies **SAP Business Data Cloud (BDC)**, an open, Iceberg-native data lakehouse powered by the Dremio federation engine and Apache Arrow that spans the entire data consumption lifecycle : ingesting SAP and non-SAP data into governed Data Products, making them discoverable through a unified catalog, executing queries and enrichment through a high-performance engine, and elevating data into business meaning through a semantic and ontology layer. Every section below describes a dimension of the SAP BDC Lakehouse; together they form the complete platform picture.  



![drawio](drawio/BAIP.drawio)

## Architecture Overview

The architecture is organized into semantic layers, each building on the one below, forming a coherent stack from raw source data to AI-powered experiences surfaced in SAP Joule.


## Architecture Details

### 1. Data Powering the Enterprise AI

Enterprise data does not live in one place. It is distributed across SAP applications, third-party SaaS platforms, cloud data warehouses, and customer-managed object stores. SAP Business AI Platform meets this reality without forcing consolidation.

**SAP application data** originates in systems customers already run: SAP S/4HANA PCE for financials and operations, SAP SuccessFactors for HR and workforce, SAP Ariba for procurement and spend. These systems are the authoritative source of record for the business processes that matter most. Their data enters BDC through the **FOS pipeline**—a CDC-based extract that flows through an Apache Spark medallion (Bronze → Silver → Gold), landing SAP Primary Data Products in Delta format with Apache UniForm so that Dremio can consume them natively as Iceberg without conversion or duplication.

**Non-SAP data** rests in platforms customers have already invested in: Azure Data Lake Storage, AWS S3, Google Cloud Storage, Snowflake, Databricks, Amazon Redshift, SQL Server, Oracle, and more. The SAP Business AI platform federates it in place through **Dremio's open query engine**—reading it directly over Apache Arrow without a byte of replication.

Enterprise AI data is organized into a layered product model:

- **SAP Primary Data Products** — producer-oriented, canonical-form representations of SAP application data, published with dual ports: a near-real-time SQL port over Arrow Flight and an Apache Iceberg port.
- **Non-SAP Primary Data Products** — non-SAP data registered through the Enterprise Catalog and made available under the same product model as SAP data, zero-copy, in place.
- **Unified and 360 Data Products** — master data fused across systems by **Reltio**, which resolves entities from S/4HANA, SuccessFactors, Ariba, and non-SAP CRM and ERP into golden records with OID key-mapping tables. Dremio joins those golden records with transactional data products to produce 360 views of customer, supplier, or employee that span every source system.
- **Derived Data Products** — consumer-oriented assets that combine SAP and non-SAP data into shapes purpose-built for analytics, predictive scoring, planning, and AI enrichment. A Derived Data Product may join SAP Primary Data Products with live-federated Databricks or Snowflake tables; Dremio executes that join across the estate through pushdown and Apache Arrow without ever copying data.

The result is a structured, governed data product estate that spans the full enterprise, regardless of where the underlying data physically lives.

### 2. Enterprise Catalog — Making All Data Discoverable

Data that cannot be found cannot be used. The **Enterprise Catalog**, powered by **Apache Polaris/Nessie**, is the single system of record that makes every Data Product—SAP and non-SAP—discoverable, governed, and shareable across the enterprise.

The catalog stores table schemas, data product metadata, data lineage, and row- and column-level access policies in one place. Every Data Product registered in the catalog is immediately visible to authorized consumers—agents, BI tools, and external engines—through a consistent metadata interface, regardless of which engine manages the underlying data or where the files physically reside.

**Zero-copy sharing** is a foundational property of the catalog. Engines inside the customer formation—Databricks, Snowflake, and hyperscaler compute—read catalog-registered Data Products in place through Apache Iceberg's REST catalog protocol, with no physical replication and no replication cost passed to the customer. The same Iceberg table that a Joule Studio agent queries is the one a Databricks notebook reads; there is no copy, no sync job, and no divergence. This is a structural replacement for copy-on-write integration patterns, which incur both cost and freshness lag.

Access policies travel with the data. Row- and column-level ABAC policies are defined once in the catalog and enforced at query time on every access path—whether the consumer is a Joule agent, a Power BI dashboard, or a Databricks query. A user who is not authorized to see a column never sees it, regardless of how they reach the data.

The catalog also governs the sharing perimeter. Engines inside the customer formation authenticate to the catalog and read zero-copy under catalog-enforced policies. The catalog boundary is deliberate: it ensures that policy enforcement and metering are never bypassed by giving an external engine direct object storage access. 

### 3. Engine and Compute — The Power Behind the Data

Discoverable data must still be queryable at enterprise scale, at low latency, and at a price point that makes broad consumption economically rational. This is the role of **Dremio**, the open, high-performance query federation engine at the heart of SAP Business Data Cloud.

Dremio is **Apache Iceberg-native and Apache Arrow-accelerated**. It reads SAP Primary Data Products directly from their UniForm Iceberg metadata, executes distributed MPP queries with autonomous reflections and AutoCache, and returns results over Arrow Flight SQL and ADBC (Arrow Database Connectivity) without serialization overhead. Non-SAP estates are reached through Dremio's federation layer: Databricks Unity Catalog, Snowflake Horizon, Google BigQuery, Amazon Redshift, and customer-managed object storage are all queryable through pushdown—Dremio translates and routes the query to the source engine, receives an Arrow record batch, and assembles the result. Nothing moves to a staging area. Nothing is copied.


**AI Core** capabilities run inside this same compute layer. In-place tabular prediction models—**TabPFN** for AI-enriched Data Products and **RPT-1.5** from the Model Garden for retrieval-augmented and embedding scenarios—execute on the Dremio engine without requiring data movement to external ML platforms. Predictive scores, anomaly signals, and demand forecasts are added directly to Derived Data Products in the Gold layer, making every enriched product immediately available to agents and BI consumers through the same query path.

### 4. Semantic Layer — Climbing the Ladder from Data to Action

Queryable data becomes useful to AI when it carries business meaning. The semantic layer is where SAP Business AI Platform makes that translation—turning tables and columns into entities, relationships, and actions that agents can reason over and act on.

**Reltio** anchors the semantic layer in mastered reality. Its entity resolution and golden-record engine fuses master data across systems into Unified Data Products that represent the single authoritative version of a customer, supplier, employee, or asset across the enterprise. 

**SAP BDC Ontology Manager** and the **SAP Business Knowledge Graph (BKG)** extend the semantic layer across the full data estate. The BKG provides business semantics that **AutoSQL** uses to generate accurate queries over Data Products: an agent does not need to know that margin is computed from ACDOCA columns joined to a cost center hierarchy—the BKG carries that knowledge and translates the business question into the right SQL. SAP BDC Ontology Manager contributes two modes: *ontology for context*, materialized as RDF triples with OWL schemas and SHACL governance into the HANA Knowledge Graph for reliable, auditable semantic grounding; and *ontology for operation*, virtually queried via SPARQL-to-SQL translation over live Dremio-managed tables, with **Business Actions** that bind ontology concepts to executable API workflows in SAP Integration Suite. An agent that understands the Customer entity through the ontology can not only answer questions about it but also initiate a credit review, send a notification, or trigger a workflow—directly from the reasoning step.

Together, this layer turns objects into meaning and binds them to business action. Agents built on top of it do not merely read—they understand and do.

### 5. Joule and Analytical Consumption — Enterprise AI at work

With data products governed, discovered, computed, and semantically grounded, the final stage is delivery: getting intelligence to the people and systems that need it, in the form they can act on.

**Joule Studio** is the agentic development and runtime surface. Code-based agents built in Joule Studio consume both structured Iceberg Data Products—via the Dremio, and semantic ontology objects from SAP BDC Ontology manager and the SAP Business Knowledge Graph as typed tools. An agent answering a question that spans SAP S/4HANA finance, SuccessFactors master data, and a non-SAP CRM dataset in 3rd part platforms navigates the ontology to select the right Data Products and tools,  and returns a grounded, explainable answer filtered to exactly what that user is authorized to see. The Joule Harness (V10) hosts both **Autonomous Agents**—pre-built agents for Finance, Spend, and HCM—and **Partner Agents** developed on the platform by customers and ISVs.

**Joule Work Spaces** project dynamically powered BI insights directly into the collaboration surface with real-time updates, driven by Dremio reflections refreshing against the live data estate. Business users see current charts, KPIs, and trend signals without leaving their work context and without waiting for overnight batch refresh. **Joule Conversations** provides the natural-language entry point to the same intelligence stack.


## External Consumption 

Two governed outbound paths reach external consumers:

- **Agent Gateway** — the open door to the agent economy. SAP agents interoperate with third-party agents from Google Gemini, Amazon Bedrock, Microsoft Copilot, and Databricks Agent Bricks over A2A (Agent-to-Agent) protocol and, subsequently, MCP (Model Context Protocol). The Agent Gateway is a controlled, policy-enforced bridge: every cross-agent call respects the same authorization model enforced inside BDC.

- **Analytical Consumption** — the governed path for BI and analytics sharing. External BI tools (Power BI, Tableau, Looker) connect through premium APIs that expose only analytical outcomes, never raw Data Products or underlying Iceberg files, under the same row- and column-level policies enforced across the platform.

The agent-to-agent interoperability and BI consumption are distinct contracts with distinct trust boundaries, and the architecture enforces both without conflating them.

---