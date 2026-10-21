# Architecture Overview — three draft versions

*Scratch file for review. Each version is a candidate for the `## Architecture Overview` section of `README.md` (currently lorem ipsum). All three are grounded in `the-unified-narrative.md`, `the-deep-dive.md`, and `lakehouse-architecture.md`, covering steps 1a, 1b, 2, 3, and 4. Pick one (or mix), and I'll place it in README.md.*

---

## Version A — Layered walk (follows the medallion flow)

The BDC Lakehouse is the open foundation of the SAP Business AI Platform. It is an Iceberg-native lakehouse. SAP and non-SAP data land in open formats (Iceberg and Parquet), refine through medallion layers and publish as governed Data Products that any engine reads in place.

A Data Product is a governed, versioned dataset in an open format, registered in the catalog with a stable contract and readable by any Iceberg-compatible engine. It is a managed, consumable asset rather than a raw table. The Lakehouse produces several kinds, each described below.

The Lakehouse moves data through four layers of the North Star model. Each layer builds on the one beneath it.

- **Primary Data Products (SAP data):** The Foundation Services pipeline (FOS, HDLF, Spark, Dremio) streams source changes from SAP business applications through change data capture. Spark consolidates these changes into a Bronze system-of-record tier and standardizes them into Silver-tier Primary Data Products written in UniForm, registered in Open Resource Discovery. SAP absorbs the release churn, so downstream consumers do not rebuild extraction logic when SAP S/4HANA upgrades.
- **Primary Data Products (non-SAP data):** Non-SAP data from Azure, AWS, GCS and Oracle enters through the Enterprise Catalog powered by Apache Polaris and BDC Connect. Dremio publishes it as custom Primary Data Products governed identically to SAP products. One open Polaris catalog governs every engine, and platforms such as Databricks and Snowflake read the same data zero-copy and in place without duplication.
- **Unified and 360 Data Products:** Reltio MDM, with Dremio and MDG, resolves identity across systems into a Golden Master with key maps that translate source-system identifiers to a unified golden identifier. Dremio joins these into Gold-tier 360 Data Products such as a Customer 360 across SAP S/4HANA and Salesforce.
- **Derived Data Products:** The Gold engines (FOS, HDLF, Dremio, HANA) read the Silver products, compute Reflections and write consumer-facing Derived Data Products for a specific use case such as a weighted sales pipeline across SAP and Salesforce. HANA Cloud participates as a first-class consumer through SQL-on-Files and Federation.

The Ontology and Knowledge Graph layer (Project Narwhal, the Business Knowledge Graph, HANA KG) sits above these layers. It maps physical data objects to business terms and binds those terms to actions. The layer grounds an agent in the meaning of a record and the business action it connects to, beyond retrieval of a value.

Two acquired engines operate across the layers rather than within one. **Dremio** is the federation and compute engine. It federates non-SAP data in place, publishes it as custom Primary Data Products, joins across systems and computes the Reflections that accelerate the Gold layer. **Reltio** is the master data engine. It resolves entity identity into golden records with cross-system key maps, which is the step that makes every join above it trustworthy.

Shared lineage holds the platform together. Every consumer reads from the same governed Data Products rather than from private copies, which keeps the platform coherent as it scales across sources, consumers and agents.

---

## Version A+ — Version A with the scope gap closed

*Keeps Version A's detailed medallion walk unchanged. Adds an inbound/consumer frame to the opening and a consumer beat before the close, drawn from Versions 4 and 5, so the overview covers the full inbound → internals → consumer arc.*

The BDC Lakehouse is the open foundation of the SAP Business AI Platform. It is an Iceberg-native lakehouse. SAP and non-SAP sources supply data on the inbound side, the Lakehouse refines it through medallion layers and publishes governed Data Products that any engine reads in place, and consumer applications apply the result to analytical and agentic outcomes.

A Data Product is a governed, versioned dataset in an open format, registered in the catalog with a stable contract and readable by any Iceberg-compatible engine. It is a managed, consumable asset rather than a raw table. The Lakehouse produces several kinds, each described below.

The Lakehouse moves data through four layers of the North Star model. Each layer builds on the one beneath it.

- **Primary Data Products (SAP data):** The Foundation Services pipeline (FOS, HDLF, Spark, Dremio) streams source changes from SAP business applications through change data capture. Spark consolidates these changes into a Bronze system-of-record tier and standardizes them into Silver-tier Primary Data Products written in UniForm, registered in Open Resource Discovery. SAP absorbs the release churn, so downstream consumers do not rebuild extraction logic when SAP S/4HANA upgrades.
- **Primary Data Products (non-SAP data):** Non-SAP data from Azure, AWS, GCS and Oracle enters through the Enterprise Catalog powered by Apache Polaris and BDC Connect. Dremio publishes it as custom Primary Data Products governed identically to SAP products. One open Polaris catalog governs every engine, and platforms such as Databricks and Snowflake read the same data zero-copy and in place without duplication.
- **Unified and 360 Data Products:** Reltio MDM, with Dremio and MDG, resolves identity across systems into a Golden Master with key maps that translate source-system identifiers to a unified golden identifier. Dremio joins these into Gold-tier 360 Data Products such as a Customer 360 across SAP S/4HANA and Salesforce.
- **Derived Data Products:** The Gold engines (FOS, HDLF, Dremio, HANA) read the Silver products, compute Reflections and write consumer-facing Derived Data Products for a specific use case such as a weighted sales pipeline across SAP and Salesforce. HANA Cloud participates as a first-class consumer through SQL-on-Files and Federation.

The Ontology and Knowledge Graph layer (Project Narwhal, the Business Knowledge Graph, HANA KG) sits above these layers. It maps physical data objects to business terms and binds those terms to actions. The layer grounds an agent in the meaning of a record and the business action it connects to, beyond retrieval of a value.

Two acquired engines operate across the layers rather than within one. **Dremio** is the federation and compute engine. It federates non-SAP data in place, publishes it as custom Primary Data Products, joins across systems and computes the Reflections that accelerate the Gold layer. **Reltio** is the master data engine. It resolves entity identity into golden records with cross-system key maps, which is the step that makes every join above it trustworthy.

Joule Work (Conversations, Spaces and Studio), AI Core and the Joule Harness consume these governed products and the semantic layer, driving analytical and agentic outcomes from trusted data.

Shared lineage holds the platform together. Every consumer reads from the same governed Data Products rather than from private copies, which keeps the platform coherent as it scales across sources, consumers and agents.

---

## Version B — Principle-first (states the design goal, then the layers)

The BDC Lakehouse is the open data foundation of the SAP Business AI Platform. The design goal keeps data gravity inside the SAP ecosystem while the platform stays open. An Iceberg-native lakehouse with an Apache Polaris catalog lets any engine read data zero-copy and in place. SAP and non-SAP data refine into trusted Data Products, enrich with master data and business semantics and catalogue for discovery.

A Data Product is a governed, versioned dataset in an open format, registered in the catalog with a stable contract and readable by any Iceberg-compatible engine. It is a managed, consumable asset rather than a raw table.

Three principles shape the architecture:

- **Open storage:** Data is stored in open formats (Iceberg and Parquet). Primary Data Products are written in UniForm, which materializes Delta and Iceberg simultaneously, so any Iceberg-compatible engine (Databricks, Snowflake, the hyperscalers) reads the same data without copies. The catalog is the single control point across engines.
- **Trusted data products:** Data refines through medallion layers, a progression from a raw Bronze tier to a cleaned Silver tier to a consumption-ready Gold tier. A Bronze system-of-record tier holds raw history, Silver holds governed Primary Data Products and Reltio-resolved golden records, and Gold holds consumer-facing Derived Data Products for a specific use. A golden record is a single deduplicated master record for an entity, resolved from several source systems. SAP ships and maintains these products, so consumers start from trusted data and avoid rebuilding extraction logic at every SAP S/4HANA upgrade.
- **Business meaning:** An Ontology and Knowledge Graph layer (Project Narwhal, the Business Knowledge Graph, HANA KG) maps physical objects to business terms and binds those terms to actions. Agents act on data grounded in the meaning of each object.

The Lakehouse covers five layers of the North Star model: Primary Data Products for SAP data and non-SAP data, Unified and 360 Data Products, Derived Data Products and the Ontology and Knowledge Graph. The layers beneath produce open governed data and the ontology turns that data into meaning. Together they distinguish a data platform from one that grounds autonomous agents.

---

## Version C — Concise (shortest, sets up the detail sections)

The BDC Lakehouse is the open foundation of the SAP Business AI Platform. It is an Iceberg-native lakehouse where SAP and non-SAP data refine into trusted Data Products, enrich with master data and business semantics and catalogue for discovery.

A Data Product is a governed, versioned dataset in an open format, registered in the catalog with a stable contract and readable by any Iceberg-compatible engine. It is a managed, consumable asset rather than a raw table.

Data is stored in open formats (Iceberg and Parquet) and refines through medallion layers (Bronze for raw history, Silver for governed products, Gold for consumption-ready products). One open Apache Polaris catalog governs every engine, and external platforms such as Databricks and Snowflake read the same data zero-copy and in place. The catalog is the single control point across engines.

The Lakehouse spans five layers of the North Star model:

| Layer | Output |
|-------|--------|
| **Primary Data Products (SAP)** | Governed Silver products from SAP sources through the FOS pipeline |
| **Primary Data Products (non-SAP)** | Non-SAP data published as custom products through the Enterprise Catalog |
| **Unified and 360 Data Products** | Reltio golden records (deduplicated master records resolved across systems) and cross-system 360 views |
| **Derived Data Products** | Consumer-facing Gold products accelerated by Dremio Reflections |
| **Ontology and Knowledge Graph** | Business meaning that binds data objects to actions |

Each layer builds on the one beneath it. The layers beneath produce open governed data and the ontology turns that data into meaning an agent acts on. The sections that follow describe each layer in detail.

---
---

# Versions 4-6 — reframed around the four pillars

*These are built on the component model: four outer pillars (SAP sources in, non-SAP data in, BDC Connect powered by Polaris, consumer apps out) surrounding the BDC Lakehouse, whose four internal layers are Primary Data Products, Unified & 360 Data Products, Derived Data Products, and Ontology & Knowledge Graph.*

---

## Version 4 — Pillars then layers (two clear halves)

The BDC Lakehouse is the open data foundation of the SAP Business AI Platform. Four pillars frame it. SAP and non-SAP sources supply data on the inbound side, the Lakehouse refines that data into governed Data Products, BDC Connect governs every engine that reads them, and consumer applications apply the result to analytical and agentic outcomes.

A Data Product is a governed, versioned dataset in an open format, registered in the catalog with a stable contract and readable by any Iceberg-compatible engine. It is a managed, consumable asset rather than a raw table. The layers inside the Lakehouse each produce a different kind.

**The four pillars**

- **SAP Source Systems:** SAP S/4HANA, Ariba and SuccessFactors supply structured transactional data through change data capture. These feed the Primary Data Product layer through the Foundation Services pipeline.
- **Non-SAP Data:** Object stores and relational systems across Azure, AWS, GCS and Oracle enter the Lakehouse through Dremio federation. Access occurs in place without duplication.
- **BDC Connect, powered by Apache Polaris:** One open catalog governs every engine and connects the Lakehouse to external Data Platforms. Databricks, Snowflake and the hyperscalers read the same data zero-copy in both directions.
- **Consumer applications:** Joule Work (Conversations, Spaces and Studio), AI Core and the Joule Harness consume governed products and semantic context. These applications drive analytical and agentic outcomes.

**Inside the Lakehouse**

The Lakehouse refines data through four layers. Each layer builds on the one beneath it.

- **Primary Data Products:** SAP transactions and in-place non-SAP data become governed open products in UniForm format, which materializes Delta and Iceberg simultaneously. The Foundation Services pipeline registers each product in Open Resource Discovery.
- **Unified and 360 Data Products:** Reltio resolves identity across systems into golden records, each a single deduplicated master record for an entity. Dremio joins these records into cross-system 360 views such as Customer 360 across SAP S/4HANA and Salesforce.
- **Derived Data Products:** Consumer-facing products take shape for a specific use case, for example a weighted sales pipeline across SAP and Salesforce. Dremio Reflections accelerate them and HANA Cloud reads them as a first-class consumer.
- **Ontology and Knowledge Graph:** Project Narwhal, the Business Knowledge Graph and HANA KG map data objects to business terms and bind those terms to actions. This layer grounds agent behavior in the meaning of each object.

**Two engines carry the Lakehouse**

Two acquired engines operate across these layers rather than within a single one.

- **Dremio** is the federation and compute engine. It brings non-SAP data into the Lakehouse in place, publishes it as custom Primary Data Products through Polaris, joins across systems to build 360 and Derived Data Products, and computes Reflections that accelerate the Gold layer without re-copying data.
- **Reltio** is the master data engine. It fuses master data across systems into golden records with key maps that link source-system identifiers to a unified golden identifier, and it provides survivorship, match-on-ingest and governed resolution. This resolved identity makes every cross-system join above it trustworthy.

Shared lineage holds the platform together. Every consumer reads from the same governed products rather than from private copies.

---

## Version 5 — Flow-oriented (inbound, refinement, governance, consumption)

The BDC Lakehouse is the open foundation of the SAP Business AI Platform. It operates as one governed flow. Data enters from across the enterprise, refines into trusted products, resolves under a single open catalog and reaches the applications and agents that act on it.

**Inbound sources.** Two categories of data feed the Lakehouse. SAP Source Systems (SAP S/4HANA, Ariba, SuccessFactors) stream structured transactional data through change data capture. Non-SAP Data from object stores and relational systems (Azure, AWS, GCS, Oracle) enters in place without duplication.

**Refinement layers.** The Lakehouse refines data through four layers that add trust and meaning. A Data Product is a governed, versioned dataset in an open format, registered in the catalog with a stable contract and readable by any Iceberg-compatible engine. Each layer produces a different kind:

- **Primary Data Products:** SAP and non-SAP sources become open governed products written in UniForm (Delta and Iceberg). The pipeline registers each product in Open Resource Discovery.
- **Unified and 360 Data Products:** Reltio produces golden records and Dremio builds cross-system 360 views resolved by identity.
- **Derived Data Products:** Consumer-facing Gold products take shape for a use case and Dremio Reflections accelerate them.
- **Ontology and Knowledge Graph:** The semantic layer binds data objects to business actions.

**Governance.** Governance spans all four layers. One open Apache Polaris catalog acts as the control point across every engine, from Primary Data Products through to the semantic layer. BDC Connect links the Lakehouse to external Data Platforms (Databricks, Snowflake, the hyperscalers), which read the same data zero-copy and in place in both directions.

**Consumption.** Joule Work (Conversations, Spaces, Studio), AI Core and the Joule Harness consume the governed products and the semantic layer. These applications produce analytical and agentic outcomes from trusted data.

The flow forms one path from raw data to working agents. Every consumer reads from the same governed products rather than from private copies.

---

## Version 6 — Diagram-anchored (prose keyed to the architecture picture)

The BDC Lakehouse is the open data foundation of the SAP Business AI Platform. Four components frame the Lakehouse and four layers sit within it. The architecture diagram reads from the outside in.

A Data Product is a governed, versioned dataset in an open format, registered in the catalog with a stable contract and readable by any Iceberg-compatible engine. It is a managed, consumable asset rather than a raw table. Each layer within the Lakehouse produces a different kind.

**The components around the Lakehouse**

| Component | Role |
|-----------|------|
| **SAP Source Systems** | Structured transactional data from SAP S/4HANA, Ariba and SuccessFactors, streamed through change data capture |
| **Non-SAP Data** | Object stores and relational systems across Azure, AWS, GCS and Oracle, read in place without copies |
| **BDC Connect (powered by Polaris)** | The open catalog connecting the Lakehouse to external Data Platforms and governing every engine in both directions |
| **Consumer applications** | Joule Work (Conversations, Spaces, Studio), AI Core and the Joule Harness, consuming products and semantics |

**The layers within the Lakehouse**

| Layer | Output |
|-------|--------|
| **Primary Data Products** | Governed open products in UniForm (Delta and Iceberg) from SAP and non-SAP sources |
| **Unified and 360 Data Products** | Reltio golden records (deduplicated master records resolved across systems) and cross-system 360 views |
| **Derived Data Products** | Consumer-facing Gold products accelerated by Dremio Reflections |
| **Ontology and Knowledge Graph** | Business meaning that binds data objects to actions |

The design goal keeps data gravity inside the SAP ecosystem while the platform stays open. The Lakehouse stores data in open formats, refines it through these layers and governs it under one catalog, so external platforms read the same data without copies. The layers beneath produce open governed data and the ontology turns that data into meaning an agent can act on. The sections that follow describe each layer in detail.
