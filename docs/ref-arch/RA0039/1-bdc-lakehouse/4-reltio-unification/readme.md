---
id: 6bf1fa
slug: /ref-arch/6bf1fa
sidebar_position: 4
title: Entity Unification with Reltio in SAP BDC
description: How SAP Business Data Cloud uses Reltio to resolve duplicate records from SAP and non-SAP sources into trusted, unified data products through AI-assisted match review, survivorship, and governed merge into a golden record.
sidebar_label: Reltio Unification
keywords:
  - sap
  - business data cloud
  - bdc
  - reltio
  - master data management
  - mdm
  - entity resolution
  - golden record
  - data products
  - survivorship
  - unified customer 360
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
  - seeobjectively
  - s-krishnamoorthy
last_update:
  author: seeobjectively
  date: 2026-10-23
---

## Overview

A single real-world entity rarely exists as a single record in the data estate of a complex organization. The same customer can appear as a CRM contact, an e-commerce account, a mobile sign-up, and an ERP business partner. Each has its own identifier, spelling, partial attributes, and consent state. Analytics and AI built on top see several entities where there is one.

Within the SAP Lakehouse, Reltio is the managed master data management (MDM) capability that resolves these fragments into a single trusted golden record in real-time, then publishes it back into the lakehouse as a governed data product. This reference architecture describes the unification pattern (reference data management, data quality, match & merge, data governance, relationship management, entity 360, publication) and how it fits the medallion data flow across BDC, Reltio, and Dremio. The pattern is entity-type-agnostic: the same shape produces a unified Customer 360, Supplier 360, and other domains.

![drawio](drawio/reltio-unification.drawio "Master data unification with Reltio in SAP BDC")

## Architecture Details

The unification layer sits in the silver tier of the Federated Object Store ( FOS). It takes governed per-source data products as input and feeds the ontology, analytics, and Joule agents above it - - directly connects Joule to the same silver-tier storage where Reltio writes Golden Masters. If Golden Master UDPs are in BDC object store, Joule consuming them there puts them in parity scope. Depict the SAP Lakehouse terminology to distinguish from BDC Lakehouse . Its components:

- **Per-source data products (PDPs):** The governed inputs. SAP master data (S/4HANA, SuccessFactors, Ariba) is ingested as PDPs. Non-SAP data (Salesforce, Snowflake, BigQuery, object stores) is accessed "zero-copy" as Dremio-published custom PDPs via Apache Polaris and SQL-on-Files. Reltio consumes data products, not raw tables. This is the decoupling boundary that keeps source churn out of the MDM layer.
- **Reltio (Master Data Management):** The real-time data unification engine that resolves entity identity and relationships across the PDPs and produces the Golden Master. Reltio also harmonizes reference data across sources as part of the real-time ingestion and acts as a data quality layer to identify data issues and perform actions such as address validation, phone and email pattern validation etc.
- **Golden Master UDP:** The deduplicated, survivorship-resolved record. It is written back into the silver tier as a governed Unified Data Product (UDP), with a crosswalk preserving lineage to every contributing source.
- **Dremio "360" DDP:** The gold-tier reflection. It reads the silver UDP via Iceberg/UniForm and joins the Golden Master into a unified 360° view across all domains.
- **SAP Enterprise Catalog (Apache Polaris):** Discovery and open-table governance for the published data products.

### Identity matching

Matching is deliberately multi-strategy, not a single similarity threshold. Reltio combines three methods:

- **Rules based:** exact and fuzzy matching on any attribute of any entity.
- **AI-powered matching:** ML similarity that produces a relevance score.
- **Transitive matching:** if A matches B and B matches C, configured transitive rules can place A, B, and C in one match group even when A and C do not match directly.

Each candidate match carries a method, a relevance score, and a confidence label. By default, matching runs in real time whenever a record is created or updated. Depending on configuration, qualifying matches can merge automatically while lower-confidence matches route to a steward or an AI agent for resolution. That split between automation and review is the primary throughput-versus-accuracy control.

### Survivorship and the golden record

Survivorship is rule-driven and applied per attribute in real-time. Different attributes earn their surviving value (the operational value) from different sources under different rules, rather than one source winning the whole record. The rules are declarative configuration, not code, and all contributing values are retained for audit even though only the operational value is surfaced. Reltio ships a range of strategies that are mapped per attribute, for example:

- **Last Update Date (recency):** the most recently updated value wins. This is the default strategy.
- **Source priority:** the value from the highest-priority source system wins.
- **Oldest / min / max value:** selection by creation date or by value.
- **Frequency:** most frequently occurring value wins.
- **Crosswalk-based:** the operational value follows the winning crosswalk of a primary attribute or the winning entity.

Numerous other survivorship strategies are available.

Multiple survivorship groups can be defined per entity type, with one default and others selectable by user role. The view of the "golden record" is generated in real-time based on the user's role-based access and associated survivorship group.

### Crosswalk and lineage

Every record contains a crosswalk back to each contributing source system and its native identifier within that source. The contributing records are linked, not destroyed. That gives the pattern three properties:

- **Traceability:** any surviving operational value traces to the source that won it, and all contributing values are retained.
- **Reversibility:** a merge can be unmerged in real-time, restoring the contributing records as distinct entities along with their related entities, because their lineage and merge history are kept.
- **Incremental processing:** matching and merging run in real-time on each create or update, so a changed source record re-triggers matching for the affected entity rather than requiring a full batch reprocess.

The crosswalk also lets a consumer join the 360° product back to a specific source system's transactional data when needed.

### Stewardship

Low-confidence matches and data-quality exceptions surface in a Match Review workspace, where a steward confirms or rejects each candidate side by side or in bulk. Attribute-level validations (for example missing consent, missing privacy preferences, or missing required fields) travel with the record, so the steward sees completeness and compliance, not just string similarity. Automation handles the volume. Humans and AI agents resolve the ambiguous tail. Every decision is auditable.

### Data flow across the medallion tiers

The pattern moves master data from raw per-source extracts to a governed 360° product. The key subtlety: Reltio does not sit between the silver and gold tiers. It writes its output back into the silver tier, and the gold tier is a Dremio reflection over it.

1. **Ingest → silver PDPs.** SAP sources are ingested as PDPs into the FOS. Non-SAP sources are accessed via zero-copy as Dremio custom PDPs. Both land on the same governed surface.
2. **Reltio → Golden Master.** Reltio resolves identity across the silver PDPs and produces the Golden Master UDP, written back into the silver tier with all source crosswalks and relationships.
3. **Dremio → "360" DDP.** Dremio reads the silver UDP via Iceberg/UniForm, applies reflections (pre-computed, physically materialized accelerators), and joins the Golden Master into the gold-tier 360° Master Data DDP.
4. **Expose to consumers.** The Golden Master UDP is readable as an open Iceberg table or through SQL. The 360° DDP is exposed through Dremio SQL; direct Iceberg access requires it to be explicitly materialized and published as an Iceberg data product.
5. **HANA Cloud as a first-class consumer.** SQL-on-Files queries the UDP directly on the object store. Federation virtually joins the 360° DDP with HANA operational data for analytical and hybrid queries, without duplicating the lakehouse data.

## Key Design Decisions

| Decision | Trade-off |
| --- | --- |
| **Auto-merge threshold** | A higher confidence bar means fewer bad merges but more steward load. A lower bar means more automation and more risk. The relevance score and confidence label are the control. |
| **Match strategy mix** | Rules alone are explainable but brittle. Probabilistic matching raises recall but needs tuning. Transitive matching closes groups but risks over-merging. The pattern uses all three together. |
| **Survivorship per attribute** | Recency, source-priority, oldest/min/max, and crosswalk-based strategies are chosen per attribute, not globally. Attributes with regulatory weight, such as consent and privacy state, warrant deliberate per-attribute rules rather than a blanket default. |
| **Match-on-ingest vs. batch** | Real-time resolution keeps the 360° product fresh. Periodic batch reconciliation is simpler but lags. |
| **Publication format** | SQL and reflections suit operational consumers. Open Iceberg suits engine-neutral analytics. BDC supports both. |
| **Reversibility** | Keeping contributing records and crosswalks makes merges reversible and auditable at some storage cost. A destructive merge is lighter but lossy. The pattern is non-destructive. |

## Related Resources

- [SAP Business Data Cloud](https://www.sap.com/products/data-cloud.html)
- [Reltio Multidomain Master Data Management](https://www.reltio.com/)
- [Apache Iceberg](https://iceberg.apache.org/)
- [Apache Polaris](https://polaris.apache.org/)

> *This reference architecture is intended for enterprise and data architects evaluating how master data unification is delivered as a managed capability within SAP Business Data Cloud.*
