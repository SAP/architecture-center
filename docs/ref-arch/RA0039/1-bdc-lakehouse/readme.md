---
id: 56442f
slug: /ref-arch/56442f
sidebar_position: 1
title: SAP Business Data Cloud Lakehouse
description: >-
  Open Lakehouse foundation for governed SAP and non-SAP Data Products that support analytical and agentic consumption.
sidebar_label: SAP BDC Lakehouse
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
  - guilherme-segantini
  - mponce
last_update:
  author: guilherme-segantini
  date: 2026-10-23
---

SAP BDC Lakehouse is the unified platform for managing SAP and non-SAP data across multi-cloud, hybrid and on-premise environments. Enterprise data architectures for AI require continuous, context-rich understanding of data across systems and domains. This architecture describes the Lakehouse layer, where that foundation is built. SAP and non-SAP data is refined into trusted Data Products on open formats, enriched with master data, business semantics and business relationships, shared zero-copy with platforms such as Snowflake and BigQuery  through the Enterprise Catalog, and surfaced through Joule as agentic and analytical actions.

## Architecture

![drawio](./drawio/bdc_lakehouse.drawio)

:::info Disclaimer
The architecture diagram is in progress and derives from the BAIP architecture diagram. This page is updated when the diagram is final.
:::

Data lands as Parquet and is managed as Apache Iceberg tables. UniForm projects that single physical copy as Apache Iceberg. A Data Product is a governed, versioned dataset registered in the catalog and available to engines that support its published Apache Iceberg representation, a consumable SAP-managed or non-SAP managed asset rather than a raw table. Data Products are tiered as Primary (SAP), Primary (Non-SAP), Unified & 360 and Derived Data Products.

The [SAP Business AI Platform](../readme.md) describes five layers that carry data from source systems to SAP Joule. The Lakehouse is the data foundation beneath them, where SAP and non-SAP data becomes governed Data Products. It separates storage, table format, catalog and compute into independent layers, so a single copy of data serves many engines and adding or replacing an engine moves no data. The components below carry out these layers.

### Components

-   **Foundation Services:** SAP-managed pipeline that produces Data Products automatically via FOS, HDLF, Spark and Dremio, which stream data updates from SAP-managed Line of Business applications via CDC using either the Data Subscription API or the ABAP push framework. Spark consolidates those changes through a Bronze, Silver and Gold medallion, landing them in a Bronze system-of-record store and standardizing them into **Primary Data Products (SAP)** written in UniForm, published as Apache Iceberg, and registered in Open Resource Discovery with a versioned contract. The pipeline absorbs release churn internally, so Primary Data Products (SAP) retain their contracts, versions and open formats across S/4HANA upgrades.
- **Dremio:** Dremio provides federation and compute across layers. It publishes non-SAP data in place, without duplication, as custom **Primary Data Products (Non-SAP)**, joins Unified & 360 Data Products into **Derived Data Products** and computes **Reflections** that accelerate query performance.
- **Enterprise Catalog:** The single catalog and authorization point for every Data Product in the lakehouse, powered by Apache Polaris. As an Iceberg REST catalog it lets Iceberg-compatible engines read the same tables zero-copy under one set of policies.
- **Reltio:** Resolves source master data into Golden Master records and cross-system key maps. These outputs let the Lakehouse build Unified & 360 Data Products and trustworthy cross-system joins. 
- **SAP BDC Ontology Manager and Business Knowledge Graph:** The semantic layer that binds Data Products to business terms, relationships and actions, grounding agents in what a record means. 
- **Consumption:** Governed Data Products are consumed through two paths. Dremio serves federated SQL over Arrow Flight SQL and ADBC for queries, joins across sources and reflections-accelerated reads, and is also the query path for BI tools such as Power BI, Tableau and Looker. External engines such as Snowflake, BigQuery and Microsoft Fabric read the same Data Products zero-copy in place through the Enterprise Catalog Iceberg REST path for AI, machine learning and analytics workloads, including enrichment on AI Core with the TabPFN and RPT tabular models, which write predictive scores back as Derived Data Products.

## Storage and Compute

The storage and compute layers write a single copy of data once and serve it to many engines. Apache Iceberg is the primary format for cross-engine interoperability, with Iceberg-compatible engines reading it in place.

- **Open Formats:** Data lands as Parquet and is exposed as Apache Iceberg tables. UniForm generates Apache Iceberg metadata for that single physical copy, so Iceberg-compatible consumers read it natively without conversion or duplication. The format metadata is set when the table is created, which keeps fresh writes readable across engines from first load.
- **Dremio Compute and Federation:** Dremio runs SQL directly against Iceberg sources, federates across SAP and non-SAP catalogs without moving data, and computes Reflections that accelerate query performance. It publishes non-SAP sources as custom Primary Data Products (Non-SAP) and joins Unified & 360 Data Products into Derived Data Products. 
- **HANA Cloud Engine:** SAP HANA Cloud participates as a first-class consumer through SQL-on-Files and Federation, reading the Apache Iceberg representation of the same UniForm tables for transactional and analytical workloads without a separate copy.

## Data Products

The Lakehouse produces governed Data Products in four tiers: Primary (SAP), Primary (Non-SAP), Unified & 360 and Derived Data Products. Each tier builds on the tiers beneath it, progressing from refined SAP changes through cross-system joins to use-case-specific outputs.

1. **Primary Data Products (SAP):** The Foundation Services pipeline streams SAP business application changes through change data capture. Spark consolidates the changes into a system-of-record store on a scheduled cadence of full-load and incremental runs, and standardizes them into Primary Data Products (SAP) written in UniForm, published as Apache Iceberg, and registered in Open Resource Discovery. SAP absorbs release churn so downstream consumers do not rebuild extraction logic when SAP S/4HANA upgrades.
2. **Primary Data Products (Non-SAP):** The Enterprise Catalog provides access to SAP and non-SAP Data Products. For Iceberg-compatible platforms, Dremio federation and SQL-on-Files transform and publish the data as custom Primary Data Products (Non-SAP). The Enterprise Catalog enables zero-copy, in-place access through the shared Polaris catalog.
3. **Unified & 360 Data Products:** Reltio MDM, with Dremio and MDG, resolves source master data into Golden Master records. Key maps translate source-system identifiers to unified golden OID identifiers. Dremio joins Unified & 360 Data Products into Derived Data Products, such as a Customer 360 across SAP S/4HANA and Salesforce.
4. **Derived Data Products:** Engines combine any of the other Data Product types, Primary (SAP), Primary (Non-SAP) and Unified & 360, reading them through their published Apache Iceberg representation, compute Reflections and write products for specific use cases. Apache Iceberg is the primary representation for cross-engine interoperability. A weighted sales pipeline across SAP and Salesforce is an example of a Derived Data Product.

Shared governed Data Products reduce duplication by enabling consumers to access common products rather than creating private copies. This supports consistent data access across sources, consumers and agents.

## Governance and Lineage

Governance is enforced at the catalog and query-engine layers. Apache Polaris provides consistent catalog, namespace and table authorization for engines that access Iceberg tables through the Iceberg REST Catalog. Role-based access control is provided, fine-grained security, lineage and catalog metadata for queries executed. Engines that access the same tables through another query path enforce their own row-level and column-level policies.

- **Catalog-Level Access Across Engines:** Apache Polaris authorizes catalog, namespace and table access for Iceberg REST Catalog clients. Polaris blocks unauthorized table access and issues path-scoped credentials for authorized reads. This control applies consistently across participating engines, including Dremio, Spark, Trino and other compatible Iceberg clients.
- **Access Control through Roles and Privileges:** Dremio uses role-based access control. System roles ADMIN and PUBLIC together with custom roles carry privileges, which are granted to roles rather than to individual users. Most privileges inherit down the hierarchy from Organization to Project to Source to Folder to the Tables, Views and Visualizations beneath them, so a grant at a higher level applies to the objects within its scope. OWNERSHIP is the exception and is never inherited. A view carries a privilege chain where the owner's access to the underlying table determines whether the view resolves, so a grant on a view exposes the table's data without a direct grant on the table.
- **Dremio-Mediated Fine-Grained Security:** Dremio implements row-access and column-masking policies as SQL user-defined functions attached to tables, views and columns. A policy reads the querying user identity and role membership through built-in functions such as `query_user()` and `is_member()`, then determines which rows return or how a column value is masked. Dremio applies these policies during query planning for queries executed through Dremio. Other engines enforce their own row-level and column-level policies when they access the same Iceberg tables directly.
- **Lineage:** Dremio produces a dataset-level lineage graph that shows the source, parent datasets and child datasets of a dataset. A change traces forward to the datasets that depend on it and backward to the sources it draws from. The graph is available in the user interface with interactive navigation and through the Catalog API lineage endpoint, which returns the same source, parent and child relationships programmatically. Lineage visibility requires SELECT or READ METADATA on the related datasets.
- **Catalog Metadata:** Wikis document datasets and labels categorise them, both with AI assistance, which supports discovery and search across the catalog. Dremio records job history, visible to users with VIEW JOB HISTORY or READ METADATA, which reports who ran which queries.

### Additional Resources

- [Data Products in SAP Business Data Cloud](/ref-arch/09be8b)
- [Dremio Lakehouse Compute in SAP BDC](/ref-arch/cc28e4)
- [Entity Unification with Reltio in SAP BDC](/ref-arch/6bf1fa)
- [SAP Business Data Cloud](https://www.sap.com/products/data-cloud.html)
- [SAP BDC Master Data Governance](https://www.sap.com/products/data-cloud/master-data-governance.html)
- [SAP Knowledge Graph](https://www.sap.com/products/artificial-intelligence/knowledge-graph.html)
