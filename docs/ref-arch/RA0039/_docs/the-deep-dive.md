---
id: TBD-deep-dive
slug: /ref-arch/TBD-deep-dive
sidebar_position: 3
title: "Deep Dive: SAP Business AI Platform Architecture"
description: >-
  A deeper, deck-grounded companion to the Unified Narrative. Walks the SAP
  Business AI Platform North Star in detail, organized around the BDC Lakehouse,
  Data Products, Dremio, Reltio, Ontology, Joule, Enterprise Catalog, and the
  adversarial comparison. Grounded strictly in baip.pptx.
keywords:
  - sap
  - business data cloud
  - bdc
  - business ai platform
  - baip
  - lakehouse
  - medallion
  - iceberg
  - uniform
  - dremio
  - reltio
  - polaris
  - ontology
  - joule
  - north star
sidebar_label: Deep Dive
image: img/ac-soc-med.png
tags:
  - ref-arch
  - bdc
  - data
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
unlisted: true
contributors:
  - I769068
last_update:
  author: I769068
  date: 2026-10-02
---

# Deep Dive: SAP Business AI Platform Architecture

*A deeper companion to [the Unified Narrative](./the-unified-narrative.md), grounded in `baip.pptx`. Where the Unified Narrative walks the author's 1a–9 step callouts at one paragraph per layer, this document goes further into the mechanics the deck's deep-dive slides describe, and it is organized around the seven topics in `bai-content.md` with the BDC Lakehouse as the focus.*

*Two notes on how this is written. First, the figures in the deck (TCO ranges, benchmark runtimes, model accuracy) are kept qualitative here on purpose. They come from a target picture and from internal or pre-production runs, so the deck itself is the right place to read the exact numbers in their stated context. This document keeps the shape of each argument rather than quoting the values. Second, this is grounded on the deck. Where a useful phrase comes from the Unified Narrative, it is used only as light connective tissue and only when the deck supports the underlying claim.*

---

## 1. SAP BDC Lakehouse

This is the focus of the document. The BDC Lakehouse is the open foundation the rest of the platform stands on.

### Architecture overview

The goal is to keep data gravity inside the SAP ecosystem while staying open, so that any engine can read the data in place rather than being forced to export it. *(Slides 3, 4, 7)*

The lakehouse is Iceberg-native and organized as medallion layers. The ingestion deep dive lays out the progression as Staging, then Bronze, then Silver, then Gold:

```
SAP Business Apps ──CDC──► Staging ──Spark──► Bronze ──standardize──► Silver (PDPs) ──Dremio/Reflections──► Gold (DDPs)
```

Staging is the entry point into the BDC Federated Object Store. Bronze is the system-of-record raw history tier. Silver holds the Primary Data Products. Gold holds the Derived Data Products, shaped for consumption. *(Slide 25)*

:::note Terminology
`bai-content.md` lists "Delta Lake" and "Unity Catalog" under this topic's Storage & Compute heading. In the North Star deck itself, the lakehouse is Iceberg-native, the Primary Data Products are written in UniForm (simultaneous Delta and Iceberg), and the catalog is the SAP Enterprise Catalog powered by Apache Polaris. Unity Catalog appears in the deck only inside the Databricks do-it-yourself comparison (slide 18), not in the North Star. This document uses the deck's terms.
:::

### Storage and compute

Primary Data Products are written in UniForm, which materializes Delta and Iceberg formats simultaneously, and they are registered in Open Resource Discovery (ORD) with both Delta and Iceberg ports for broad downstream compatibility. The engines named across the stack are FOS, HDLF, Spark, Dremio, and the HANA engines. *(Slides 5, 25)*

HANA Cloud participates as a first-class consumer rather than as a separate silo. It reads Gold and Silver products through SQL-on-Files for direct object-store queries, and it uses Federation to virtually join lakehouse Data Products with native HANA operational data, without moving or duplicating the data. The deck frames this as preserving full openness without proprietary lock-in. *(Slides 25, 27, 28)*

### Data ingestion patterns

The SAP ingestion path, as the deep dive describes it, runs in five moves:

1. Stream source changes from SAP Business Apps via CDC, using the Data Subscription API or the ABAP push framework, landing raw change events into the Staging layer.
2. Apply and consolidate the change data with Spark CDC processing, materializing a continuously maintained fine-grained snapshot into Bronze as the system-of-record raw history tier.
3. Transform and standardize into Primary Data Products using Spark, writing Silver-tier PDPs in UniForm and registering them in ORD with Delta and Iceberg ports.
4. Accelerate and derive Gold Data Products with Dremio, which reads Silver PDPs via Iceberg, computes Reflections (pre-materialized, physically optimized query accelerators), and writes Derived Data Products to Gold, exposed via SQL and Iceberg ports in ORD.
5. Consume across any engine from Gold and Silver via open Iceberg or SQL, including HANA Cloud through SQL-on-Files and Federation. *(Slide 25)*

Non-SAP data is brought in zero-copy through four access routes the deck lays out:

- Non-SAP data from platforms that expose a SQL port, accessed via Polaris and Dremio federation.
- Non-SAP data from object stores that expose Open Table Format as Iceberg, accessed via Polaris and Dremio SQL-on-Files.
- SAP ECC data that a customer has already extracted through non-SAP technology and exposed as OTF / Iceberg, accessed the same way via Polaris and Dremio SQL-on-Files.
- All of the above then published as Dremio custom Primary Data Products via Polaris, treated no differently from SAP-provided Data Products, so they can be combined with SAP data in Derived Data Products and consumed by analytics, Joule, and agents. *(Slide 26)*

### Governance and lineage

One open Polaris catalog governs every engine. The same data read by Databricks, Snowflake, and the hyperscalers is read zero-copy and in place, with the catalog rather than a copy acting as the control point. The governance surface named in the deck includes ORD/CSN, table bindings, policy references, lifecycle events, and audit, with lineage called out as a longer-term direction for the catalog. *(Slides 7, 38, 56)*

---

## 2. Data Products

### Definitions: Primary, Unified/360, and Derived

The deck distinguishes three kinds of Data Product:

- **Primary Data Products.** SAP Primary Data Products are created through the FOS pipeline. Non-SAP Primary Data Products are created via Dremio transformation and published through Polaris.
- **Unified and 360 Data Products.** Reltio fuses master data across systems into Unified Data Products (golden records) and joins across systems into 360 Data Products.
- **Derived Data Products.** These combine SAP and non-SAP data, are semantically rich, and are consumption-oriented across analytical, predictive, planning, and AI-enriched uses. *(Slides 7, 25, 49)*

### Publishing and discovery

Products are registered in Open Resource Discovery as they are written, and surfaced through the Enterprise Catalog and its marketplace. The ingestion deep dive is explicit that both Silver PDPs and Gold DDPs are registered in ORD with their respective ports. *(Slides 25, 38)*

### SAP-managed domains

The domains named across the deck's platform views include Finance, Supply Chain and Procurement, Sales, Spend, and HCM. The flywheel view shows concrete source entities under these domains, for example Journal Entries and Revenue under Finance, Sales Orders under Sales, and Supplier records from both Ariba and S/4 under Procurement. *(Slides 4, 8)*

### Intelligent content

The Derived Data Products are the consumer-facing layer, and the deck gives worked examples that cross SAP and non-SAP sources: a Weighted Sales Pipeline across SAP and Salesforce, Retail Sell-through across SAP and BigQuery, and Unified Customer 360 and Supplier 360 that join across systems. *(Slides 8, 49)*

---

## 3. SAP BDC and Dremio

### Lakehouse federation

Dremio is the federation and SQL-on-Files engine that brings non-SAP data into the lakehouse in place. The four access routes in the Lakehouse section above are all Dremio-driven, and the result is that SAP and non-SAP data can be combined in a single Derived Data Product. *(Slide 26)*

### Virtual data layer: Reflections

Reflections are pre-materialized, physically optimized query accelerators. In the ingestion and UDP deep dives, Dremio reads Silver products via Iceberg, computes Reflections, and writes the Gold-tier Derived Data Products. Reflections are what let the Gold layer serve analytical query patterns quickly without re-copying the underlying data. *(Slides 25, 27, 28)*

### Performance and caching

The deck includes benchmark material comparing engines (TPC-H and TPC-DS runs, and agent round-trip latency and accuracy). These are internal or pre-production runs on specific configurations, so they are best read as early signals in their stated context rather than as a general ranking. The exact figures live in the deck. The qualitative takeaway the deck draws is that the lakehouse engines are competitive on price and performance, with Reflections and HANA's in-memory runtime doing the acceleration work. *(Slides 13–16)*

### Access control

Access is governed through the Polaris-backed catalog, which is the single control point across engines. The deck does not go into row- or column-level security or SSO specifics for this layer, so those `bai-content.md` sub-points are left as named but undetailed in the source.

---

## 4. SAP BDC and Reltio

### MDM integration pattern

Reltio MDM consolidates and resolves entity identity, producing two governed Silver-tier outputs: the UDP Golden Master (a deduplicated, survivorship-resolved master record) and key maps (cross-system ID translation tables that link source-system keys to the unified golden ID). Dremio then reads these Silver UDPs via Iceberg/UniForm and applies Reflections to resolve the Golden Master into a 360 Master Data DDP, the Gold-tier unified view across domains. *(Slide 27)*

### Entity resolution

The deck positions Reltio's entity resolution, survivorship, and merge as managed capabilities out of the box, in contrast to the do-it-yourself path. The adversarial section is explicit that entity resolution is only the first row of what production MDM needs. *(Slides 20, 27)*

### Real-time MDM events

The deck lists match-on-ingest as a real-time, API-driven capability, set against batch-only alternatives. It is named as a capability rather than detailed as an event flow, so this document keeps it at that level. *(Slide 20)*

### Business Partner 360

The 360 products the deck names are Unified Customer 360 and Unified Supplier 360, joining across SAP and non-SAP sources such as Salesforce. These are the trustworthy cross-system inputs that the layers above consume. *(Slides 8, 27)*

### Migration note: Reltio as-is toward the North Star

The Reltio deep dive frames a set of changes to move the current Reltio architecture toward the North Star. The higher-priority ones are: adopt Kubernetes on Gardener, use AI Core as the model garden, use BDC FOS plus Dremio Iceberg as the storage layer, migrate from ElasticSearch to OpenSearch (and investigate HANA capabilities such as vector and text search), use HANA Cloud for relational persistence (evaluating gaps against Dynamo/Spanner/Cosmos), and route the Reltio MCP server via the Agent Gateway. Lower-priority items include moving the agent runtime to AppFND, aligning iPaaS integration, exposing frontend functionality via Joule Studio, and aligning the eventing architecture. *(Slides 42–44)*

---

## 5. Semantic Enrichment and Ontology

### Ontology and knowledge graph

The semantic layer turns objects into meaning and binds them to business action. The deck describes it as the layer that lets agents understand and do, not just read. The named components are Project Narwhal, the Business Knowledge Graph (BKG), and HANA KG, with the Enterprise Knowledge Graph spanning SAP KG and HANA KG. *(Slides 7, 49, 51, 53)*

### Semantic layer mapping and AI grounding

The ontology maps physical data to business terms and relationships, and it is what makes agentic behavior grounded rather than approximate. The contextualize view describes the Knowledge Core as mission-critical business context sitting above the lakehouse, carrying business definitions, data models, active metadata, and cross-domain reasoning. *(Slides 53, 56)*

### AI Core and in-place tabular prediction

Tabular foundation models (TabPFN and RPT-1.5, served through AI Core's Model Garden) run predictions directly on the data products, producing AI-enriched Data Products without a hand-built ML pipeline. The deck's framing is that prediction becomes a property of the data product rather than a separate project, available to agents out of the box. The deck quantifies the accuracy and effort gap against traditional ML, and those figures are left to the deck. *(Slides 7, 49)*

---

## 6. Joule Consumption

### Surfaces: Studio, Spaces, Conversations

Joule Work has three surfaces in the deck: Joule Studio (the authoring surface to build, test, and deploy custom agents over the full estate), Spaces (where dynamically powered BI insights are projected with real-time updates), and Conversations. *(Slides 7, 49)*

### Joule for analytics

Analytical content and BI insights, served through HANA Cloud and SAP Analytics Cloud and surfaced from BI tools, are projected into Joule Work Spaces with real-time updates, so a business user sees current, business-grounded insight in the place they already work. *(Slides 7, 28, 49)*

### Joule Studio and the agent runtime

Joule Studio is where agents are built over the full estate, grounded in the ontology and the governed data products beneath them. The runtime is the Joule Harness (V10), which runs the Autonomous Agents (Finance, Spend, HCM) and Partner Agents, with the Joule Orchestrator (V10) coordinating. *(Slides 7, 49, 51)*

### The two governed consumption doors

The deck depicts two governed ways out of the platform:

- **Agent Gateway.** SAP agents interoperate with the Agent Platforms (Google Gemini, Amazon Bedrock, Microsoft CoPilot, Databricks Agent Bricks) over A2A, and later MCP. The deck frames this as the only approved interface for context sharing with the outside world.
- **Analytical Consumption.** This path shares only analytical outcomes with the outside world, read by BI tools and the Iceberg Data Platforms.

Together these are the agentic door (which shares context) and the analytical door (which shares outcomes). The deck does not describe a token-exchange or credential mechanism for the gateway, so this document does not claim one. *(Slides 7, 49, 51, 54)*

---

## 7. Enterprise Catalog

### One experience, two responsibilities

The catalog is presented as one logical SAP Enterprise Data Catalog experience with two responsibilities behind it:

- **BDC Catalog** owns business discovery, the marketplace, stewardship, and the SAP Data Product lifecycle (activate, deactivate, observe).
- **Dremio Catalog**, built on Apache Polaris, is the lakehouse control plane for tables, namespaces, and transactions, governing Iceberg-backed Data Products from both SAP and customer sources.

The two are kept aligned through shared state (stable IDs, lifecycle events, ORD/CSN, bindings, policy references, and audit), coordinated by BDC Connect. *(Slides 38, 39)*

### Asset registration and the one-grant flow

Both SAP-provided and customer-provided Data Products converge on one governed catalog object. SAP-provided products are auto-provisioned as Iceberg tables and their Data Product. Customer-provided tables are brought in through SAP Dremio, which converts them into a Data Product. From there a single grant flow applies regardless of provenance: catalog policy grants the Data Product object, Apache Ossie exposes only the granted context and semantics to external consumers, and the Iceberg REST Catalog (IRC) resolves the approved tables, with audit and revocation. The default is that nothing is exposed. *(Slide 40)*

### Search, curation, trust, and certification

Discovery, curation, and stewardship sit with the BDC Catalog, while definitions, semantics, and grants sit with the Dremio Catalog. AMS remains the policy authority (RBAC/ABAC), and the Data Product entity carries ORD/CSN and table bindings along with its lifecycle state. The deck notes some coordination mechanics still require validation. *(Slides 38–40)*

---

## 8. Comparison: Adversarial Architecture

The deck frames the same use case built on a Databricks (and Snowflake) do-it-yourself stack against the SAP-native stack. These are early signals from a target picture rather than settled benchmarks, so this section keeps the direction of each argument and leaves the modelled dollar, time, and accuracy figures to the deck. *(Slides 11, 18–22)*

### Build it yourself versus BDC-native, layer by layer

- **The ETL tax (Layer 1).** Building the SAP data foundation yourself means rebuilding the S/4 extraction surface (CDS views, release-specific schema bindings, and column transform rules) along with the semantic and PII-classification layer by hand, and re-doing much of it at every S/4 upgrade. The SAP-native equivalent is subscribing to governed Data Products, with SAP absorbing the release churn. *(Slides 18, 19, 22)*
- **MDM (Layers 2–3).** Open-source entity resolution covers only the first row of what production MDM needs. Survivorship, explainability, data stewardship, match-on-ingest, and governance with an audit trail are greenfield on a do-it-yourself stack. Reltio delivers these as managed capabilities, which turns a build timeline into an integration timeline. *(Slide 20)*
- **Prediction (Layer 4).** Traditional ML in the example is a multi-step pipeline with many decision points and model fits, needing advanced expertise. The tabular foundation model collapses that to a single short step usable by a citizen developer, and the deck reports better accuracy with less complexity. The exact accuracy and effort figures are in the deck. *(Slide 21)*

### Personas

The deck's persona view compares coverage across a Pro-Code Developer / Data Scientist, a Citizen Developer / Data Scientist, and a Line of Business user, and positions SAP BAIP as strongest for the citizen developer and the business user through Joule Studio and Joule Work. *(Slide 11)*

### Decision framework

The through-line the deck draws is that a customer either integrates a platform or builds and maintains one. On the same use case, the deck's position is that the SAP-native stack delivers the outcome faster, at lower TCO, and more accurately, because SAP owns and ships the stack the customer would otherwise rebuild. Every layer above is one a customer would otherwise have to build, maintain, and re-do. *(Slides 12, 22)*

---

## Where the deck is silent

A few `bai-content.md` sub-points are named there but not detailed in `baip.pptx`: row- and column-level security and SSO specifics for Dremio access control, and the precise event mechanics for real-time MDM. These are noted rather than filled in, so the document stays grounded in what the deck actually says.
