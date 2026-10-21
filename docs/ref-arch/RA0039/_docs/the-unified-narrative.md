---
id: TBD-unified-narrative
slug: /ref-arch/TBD-unified-narrative
sidebar_position: 2
title: "The Unified Narrative: SAP Business AI Platform"
description: >-
  A single end-to-end narrative of the SAP Business AI Platform North Star,
  walking the stack layer by layer from SAP and non-SAP data ingestion through
  data products, master data, ontology, AI enrichment, agents, and governed
  consumption. Intended as grounding material for teams and agents.
keywords:
  - sap
  - business data cloud
  - bdc
  - business ai platform
  - baip
  - lakehouse
  - dremio
  - reltio
  - ontology
  - joule
  - north star
sidebar_label: Unified Narrative
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

# The Unified Narrative: SAP Business AI Platform

*Grounded in `baip.pptx`, slide 7 (North Star | The Semantic Layers), and the cleaned-up North Star layered diagram. The numbered steps below follow the author's own 1a–9 callouts, which are consistent across slides 7, 49, 51, and 54, and across the diagram.*

---

## Component reference

The exact engine and component labels for each layer, read from the North Star diagram. The narrative uses these names throughout.

| Step | Layer | Engines / components | Produces | External consumer |
|------|-------|----------------------|----------|-------------------|
| **1a** | Primary Data Products (SAP) | FOS, HDLF, Spark, Dremio | Primary Data Products — SAP Data | — |
| **1b** | Enterprise Catalog + non-SAP ingress | Enterprise Catalog (Powered by Polaris), BDC Connect | Primary Data Products — non-SAP Data | Iceberg Data Platforms (zero-copy) |
| **2** | Unified & 360 Data Products | MDM: Reltio, Dremio & MDG | Unified & 360 Derived Data Products (SAP & non-SAP) | — |
| **3** | Derived Data Products | FOS, HDLF, Dremio & HANA engines | Derived Data Products (consumption oriented: AI/agentic & analytical) | — |
| **4** | Ontology & Knowledge Graph | Narwhal, BKG, HANA | Ontology, KG | — |
| **5** | AI Core | Model Garden, RPT-1.5, TabPFN | AI-enriched Data Products | — |
| **6** | Joule Studio | Joule Harness (V10): Autonomous Agents (Finance, Spend, HCM), Partner Agents | Agents | — |
| **7** | Joule Work Spaces | Spaces (within Joule Work, alongside Conversations) | BI insights in-context | BI Tools (Power BI, Tableau, Looker) |
| **8** | Agent Gateway | Agent Gateway | A2A / MCP interoperability | Agent Platforms (Google Gemini, Amazon Bedrock, Microsoft CoPilot, Databricks Agent Bricks) |
| **9** | Analytical Consumption | Analytical Consumption | Analytical outcomes only | BI Tools, Iceberg Data Platforms |

Sources beneath the stack: **SAP Source Systems** (Ariba, SAP S/4HANA PCE, SuccessFactors, …) and **Non-SAP Data** (Azure ADLS and SQL Server, AWS S3 and Redshift, GCS, Oracle, …).

---

## The thesis

SAP's position is to keep data gravity inside the SAP ecosystem while staying open: an Iceberg-native lakehouse with an Apache Polaris catalog that any engine can read zero-copy, in place. *(Slides 3, 4, 7)*

What makes this more than a lakehouse is the semantic path that runs through it. Raw transactions become open, AI-ready data products; master data is fused into golden records; derived products combine SAP and non-SAP data; an ontology turns those objects into meaning and binds them to business action. The result is a single path from data at the bottom to agents at the top, built so that agents can understand and act, not just read. *(Slides 7, 49, 56)*

The sections that follow walk that path step by step.

### End-to-end lineage

Reading the stack as one flow (slides 7, 25–28, 49):

```
SAP sources (S/4, SuccessFactors, Ariba)  ─┐
                                            ├─► [1a/1b] Primary Data Products (Silver, Iceberg/UniForm, Polaris-governed)
Non-SAP sources (ADLS, S3, Oracle, …) ─────┘            │
                                                        ▼
                                   [2] Reltio → UDP Golden Master + 360 DDPs (Gold)
                                                        │
                                                        ▼
                                   [3] Dremio → Derived Data Products (Gold, Reflections)
                                                        │
                                                        ▼
                                   [4] Ontology / KG (Narwhal, BKG) — meaning + actions
                                                        │
                                                        ▼
                                   [5] TabPFN / RPT-1.5 → AI-enriched Data Products
                                                        │
                                                        ▼
                                   [6] Joule Studio → agents over the whole estate
                                                        │
                            ┌───────────────────────────┼───────────────────────────┐
                            ▼                            ▼                            ▼
             [7] BI insights → Joule Work      [8] Agent Gateway → A2A/MCP   [9] Analytical consumption
                                                                              (outcomes only)
```

Downstream steps consume governed products and semantic assets rather than private copies. That shared-lineage property is what the rest of this document unpacks.

---

## 1a — Primary Data Products (SAP data)

> SAP Primary Data Products are created through the FOS pipeline.

Raw SAP transactions become open, AI-ready Primary Data Products: one canonical source of truth. The Foundation Services pipeline (FOS, HDLF, Spark, Dremio) streams source changes from SAP business applications via CDC (Data Subscription API or the ABAP push framework), consolidates them with Spark into a Bronze system-of-record tier, and standardizes them into Silver-tier Primary Data Products written in UniForm (simultaneous Delta and Iceberg), registered in Open Resource Discovery. *(Slides 7, 25, 49, 51; North Star diagram, layer 1a)*

For an architect, the point is that SAP absorbs the release churn. The Primary Data Products are governed, versioned, and open, so downstream consumers never rebuild extraction logic when S/4 upgrades. *(Slides 19, 22)*

## 1b — Primary Data Products (non-SAP data) and the open catalog

> Non-SAP Primary Data Products via Dremio transformation. The Enterprise Catalog powered by Polaris exposes non-SAP data as Primary Data Products and governs all engines. Databricks, Snowflake, and hyperscalers read the same data zero-copy, in place.

Non-SAP data (Azure ADLS and SQL Server, AWS S3 and Redshift, GCS, Oracle, and others) is accessed in place through the Enterprise Catalog (Powered by Polaris) and BDC Connect, via Dremio federation or SQL-on-Files, then published as custom Primary Data Products, treated no differently from SAP ones. One open Polaris catalog governs every engine. The same data is read zero-copy by the Iceberg Data Platforms (Databricks, Snowflake, and the hyperscalers), with no duplication. *(Slides 7, 26, 40, 51; North Star diagram, layer 1b)*

Non-SAP data joins the estate without leaving its home, and the catalog, not a copy, is the control point. *(Slides 26, 38)*

## 2 — Unified and 360 Data Products

> Reltio fuses master data across systems into Unified Data Products golden records, and joins across systems into 360 Data Products.

Reltio MDM (with Dremio and MDG) consolidates source master data (S/4, SuccessFactors, Ariba, and non-SAP sources) into a Golden Master: a deduplicated, survivorship-resolved record with key maps that translate source-system IDs to the unified golden ID. Dremio then reads and joins these Silver Unified Data Products into 360 Data Products in the Gold tier, for example a unified Customer 360 or Supplier 360 that joins across SAP and Salesforce. *(Slides 7, 27, 42–44; North Star diagram, layer 2)*

This step is what lets a question span systems. Without resolved identity, a cross-system join is guesswork; with it, the 360 products are trustworthy inputs for everything above. *(Slides 9, 20)*

## 3 — Derived Data Products

> Derived Data Products combine SAP and non-SAP data, semantically rich and consumer oriented (analytical, predictive, planning, AI-enriched).

Derived Data Products are the consumer-facing layer. The Gold engines (FOS, HDLF, Dremio & HANA engines) read the Silver Primary and Unified products via Iceberg, compute Reflections (pre-materialized query accelerators), and write Gold-tier Derived Data Products shaped for a use case: a Weighted Sales Pipeline across SAP and Salesforce, Retail Sell-through across SAP and BigQuery, and similar. HANA Cloud participates as a first-class consumer through SQL-on-Files and Federation. *(Slides 7, 25, 28, 49; North Star diagram, layer 3)*

These are the products an analyst or an agent actually consumes. They are semantically rich and purpose-built, which is what separates them from raw tables. *(Slides 7, 8)*

## 4 — Ontology and Knowledge Graph

> Turns objects into meaning and binds to business action: the semantic layer that lets agents understand and do, not just read.

The ontology layer (Project Narwhal, the Business Knowledge Graph, HANA KG) maps physical data to business terms and relationships, and binds those terms to actions. This is the difference between an agent that can retrieve a row and one that understands what the row means and what it can do with it. *(Slides 7, 49, 53)*

For architects, this is the layer that makes agentic behavior grounded rather than approximate. Semantics plus the golden master is what keeps answers consistent. *(Slides 4, 56)*

## 5 — In-place tabular prediction

> In-place tabular prediction models to power agents out of the box. TabPFN is used to create AI-enriched Data Products.

Tabular foundation models (TabPFN and RPT-1.5, served via AI Core's Model Garden) run predictions directly on the data products. A churn or OTIF-risk model becomes an AI-enriched Data Product without a hand-built ML pipeline. In the deck's example, a prediction is produced on the fly rather than after a months-long build. *(Slides 7, 9, 49; North Star diagram, layer 5 / AI Core)*

The architectural shift here is that prediction stops being a separate project. It becomes a property of the data product, available to agents out of the box. *(Slides 12, 21)*

## 6 — Build and run agents over the estate

> Build and run agents over the entire data estate comprising SAP and non-SAP data, semantically linked over an ontology.

Joule Studio is the authoring surface: build, test, and deploy custom agents over the full estate, grounded in the ontology and the governed data products beneath them. The runtime is the Joule Harness (V10), which runs the Autonomous Agents (Finance, Spend, HCM) and Partner Agents. This is where the layers below pay off, because every agent inherits open data, resolved identity, semantics, and in-place prediction. *(Slides 7, 49, 51; North Star diagram, layer 6 / Joule Studio + Joule Harness V10)*

## 7 — Joule Work Spaces

> Dynamically powered BI insights projected into Joule Work spaces with real-time updates.

In the diagram, step 7 is **Spaces**, one of the three surfaces inside Joule Work alongside Conversations and Joule Studio. Analytical content and BI insights (served through HANA Cloud and SAP Analytics Cloud, and surfaced from BI tools like Power BI, Tableau, and Looker) are projected into Joule Work Spaces with real-time updates. The business user sees current, business-grounded insight in the place they already work, rather than switching tools. *(Slides 7, 28, 50; North Star diagram, layer 7 / Spaces)*

## 8 — The open door to the agent economy

> The open door to the agent economy. SAP agents interoperate with third-party agents over A2A and later MCP.

The Agent Gateway (with the Joule Orchestrator, V10) is the controlled boundary to the outside agent world. SAP agents interoperate with the Agent Platforms (Google Gemini, Amazon Bedrock, Microsoft CoPilot, Databricks Agent Bricks) over A2A, and later MCP. Identity propagates through token exchange so no agent holds backend credentials. *(Slides 7, 49, 51; North Star diagram, layer 8 / Agent Gateway)*

This is the one approved interface for sharing context outward. SAP opens a governed door rather than exporting data. *(Slides 49, 54)*

## 9 — Analytical consumption

> The open door to analytical consumption. This shares only analytical outcomes with the outside world.

The analytical path shares only outcomes, not raw data. BI Tools (Power BI, Tableau, Looker) and the Iceberg Data Platforms read governed, analytical results. Combined with step 8, these are the two governed consumption paths depicted at the top of the stack: the agentic path shares context, while the analytical path shares outcomes rather than copies. *(Slides 7, 24, 51; North Star diagram, layer 9 / Analytical Consumption)*

---

## Why SAP: the proof point

The adversarial comparison in the deck (slides 11–22) frames the same use case built on Databricks DIY versus the SAP-native stack. It is worth reading as early signals from a target picture rather than settled benchmarks, but the pattern is consistent across the layers. *(Slides 11, 12, 17, 18)*

**Layer 1 — the ETL tax.** Building the SAP data foundation yourself means rebuilding roughly 202 CDS views, 953 release-specific schema bindings, and 408 transform rules, plus the semantic and PII-classification layer by hand. The deck estimates 9–18 months and a 3-year TCO around $2–4M, much of it the ETL tax that is paid again at every S/4 upgrade. The SAP-native equivalent is subscribing to governed Data Products, with SAP absorbing the release churn (step 1a). *(Slide 19)*

**Layers 2–3 — MDM.** Open-source entity resolution covers only the first row of what production MDM needs. Survivorship, explainability, stewardship, match-on-ingest, and governance are greenfield on a DIY stack, estimated at roughly 12–24 months and $0.5–1.2M. Reltio delivers all six out of the box, turning a build timeline into an integration timeline (step 2). *(Slide 20)*

**Comparison layer 4 (North Star step 5) — prediction.** Traditional ML (XGBoost) in the example is 11 steps, 7 decision points, and 300 model fits for a ROC-AUC around 0.90, needing advanced ML expertise. TabPFN is 1 step, 0 decisions, 1 fit, reaching ROC-AUC around 0.97, usable by a citizen developer (step 5). Better accuracy with less complexity. *(Slides 12, 21)*

**The sum.** Aggregated across layers 1–4, the deck puts the DIY Databricks architecture at a 3-year TCO of roughly $4–9M, versus integration cost only for the BDC-native stack. The through-line is simple: on the same use case, SAP delivers the outcome faster, at lower TCO, and more accurately, because it owns and ships the stack the customer would otherwise rebuild. *(Slide 22)*

This is the closing argument for the whole narrative. Every step above is a layer a customer would otherwise have to build, maintain, and re-do. SAP's position is to deliver that path as a platform, open at the edges and governed in the middle. *(Slides 7, 22, 56)*

---

## In short: what this means for customers

Customers already own the data that matters. The question is how quickly they can turn it into decisions and agents they can trust, without rebuilding plumbing every time your systems change.

SAP Business AI Platform gives customers one governed path from raw data to working agents:

- **Keep the data where it is.** SAP and non-SAP sources join one open lakehouse. Non-SAP data is read in place with no copies, so your existing Databricks, Snowflake, and cloud investments still work.
- **Start from trusted data, not a blank page.** Governed Data Products and resolved golden records arrive ready to use. SAP absorbs the upgrade churn, so you stop paying the ETL tax every release.
- **Get to answers in hours, not months.** Predictions run directly on your data products, and agents are grounded in business meaning, so answers are consistent and explainable.
- **Open the door on customer terms.** Agents interoperate with Google, Microsoft, Amazon, and partner agents through one governed gateway that shares context without exporting raw data, while a separate analytical path shares governed outcomes only.

The result is a faster time to value, a lower total cost of ownership, and more accurate outcomes on the same use case, because you integrate a platform instead of building and maintaining one. That is the value: less to build, less to maintain, and a trusted foundation for the autonomous enterprise. *(Slides 7, 12, 22, 56)*
