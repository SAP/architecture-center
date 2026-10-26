---
id: cc28e4
slug: /ref-arch/cc28e4
sidebar_position: 3
title: Dremio Lakehouse Compute in SAP BDC
description: How SAP BDC uses Dremio as the lakehouse compute and acceleration engine, building Primary and Derived Data Products across the medallion tiers with reflections, open Iceberg table format, and zero-copy non-SAP access.
sidebar_label: Dremio Lakehouse Compute
keywords:
  - sap
  - bdc
  - business data cloud
  - lakehouse
  - dremio
  - data products
  - iceberg
  - reflections
  - medallion
  - data architecture
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
  author: s-krishnamoorthy
  date: 2026-10-26
---

## Overview


Dremio integrates with SAP Business Data Cloud (BDC) as a high-performance, federated SQL query engine that complements SAP HANA Cloud. It is the lakehouse compute and acceleration engine of the SAP Lakehouse. Its Sonar SQL engine enables direct federated queries across HDLFS and partner object stores, with native Apache Iceberg access, allowing workloads to query distributed data without requiring unnecessary data movement or duplication. 

Within the BDC architecture, running alongside SAP HANA Cloud in the SAP lakehouse runtime, Dremio extends the lakehouse query layer across SAP and non-SAP data, providing a scalable foundation for analytics and agentic AI workloads while complementing SAP HANA Cloud’s data processing, application services, and multi-model capabilities. Dremio’s federation capabilities support high-volume query workloads across heterogeneous data sources.  

Within the data product lifecycle, Dremio consumes data products from the medallion pipeline and accesses eligible non-SAP data in place, then derives and accelerates consumable Data Products delivered through open Iceberg and SQL interfaces, avoiding proprietary lock-in.

Dremio complements Reltio by consuming its Golden Master from the silver tier via Iceberg and transforming it into a gold-tier 360° Master Data Derived Data Product using reflections.

![drawio](drawio/dremio-lakehouse-compute.drawio "Dremio lakehouse compute in SAP BDC")

## Architecture Details


The lakehouse-compute stack is built from these components:

- **Dremio:** The lakehouse compute and acceleration engine providing datalake SQL, distributed processing, and reflections, reading SAP Data Products from FOS and helping create Primary Data products from non-SAP data sources and Derived Data products from SAP and non-SAP data.
- **Federated Object Store (FOS):** The SAP-managed medallion data lake holding the SAP standard Data products from SAP sources.
- **Spark:** Applies change data into raw history and transforms it into standardized SAP Data Products.
- **The Enterprise Catalog  - powered by Apache Polaris:** The unified catalog where every Primary and Derived Data Product is registered and exposed through Delta, Iceberg, and SQL ports for data discovery.
- **SAP HANA Cloud:** A first-class SQL based consumer that reads Data Products via SQL-on-Files and Federation.


## Data product pipeline flow

The pipeline moves data through the medallion tiers from raw source changes to accelerated, openly consumable  Data Products. Spark handles ingestion and transformation, and Dremio handles acceleration and derivation; both operate on data stored in the Federated Object Store, with the resulting Data Products registered through Open Resource Discovery.

1. **Stream source changes.** Source changes stream into the lakehouse from SAP Business Applications through change data capture (CDC), using the Data Subscription API or the ABAP push framework. Raw change events land in the **staging** layer as the entry point to the Federated Object Store.

2. **Consolidate into raw history.** Spark CDC processing applies and consolidates the change data, materializing a continuously maintained fine-grained snapshot into the **bronze** layer — the system-of-record raw history tier.

3. **Transform into Primary Data Products.** A Spark stage transforms and standardizes bronze into Primary Data Products in the **silver** tier, written in UniForm as simultaneous Delta and Iceberg format. Each Primary Data Product is registered in Open Resource Discovery with both Delta and Iceberg ports for broad downstream compatibility.

4. **Primary (non-SAP) Data Products** Non-SAP data does not travel the medallion ingestion path. Instead, Dremio reads it in place and joins it to the same governed surface. Dremio publishes this data as **Primary (non-SAP) Data Products**, so it is unified alongside SAP standard Data Products and can be combined, reflected, and consumed identically, with no copy made.

5. **Accelerate and derive with Dremio.** Dremio reads the silver Primary Data Products through Iceberg, computes reflections, and helps create Derived Data Products into the **gold** layer. Reflections are pre-materialized, physically optimized query accelerators; because they are themselves stored in open Iceberg, acceleration does not cost openness.

6. **Consume across any engine.** Both silver Primary Data Products and gold Derived Data Products are readable through open Iceberg or SQL, including analytics engines, pipelines, agents, and applications. SAP HANA Cloud is a first-class consumer: SQL-on-Files queries Data Products directly on the object store, and Federation virtually joins them with operational HANA data, enabling transactional and analytical workloads without data duplication. Dremio directly powers SAP Joule answer NL based analytical queries, across customer's entire data estate semantically linked over ontology. 


## Dremio Reflections

Dremio Reflections are query-acceleration structures that optimize analytics performance by precomputing and storing data in formats designed for efficient query execution. They allow Dremio’s query optimizer to transparently rewrite queries to use the most appropriate Reflection, reducing the need to repeatedly scan, join, and aggregate underlying data while preserving access through familiar SQL interfaces. By accelerating queries over large-scale data across distributed sources, Reflections can improve query latency, concurrency, and resource efficiency without requiring users to change their queries or maintain separate, manually managed data pipelines.


## Value for customers with Dremio compute engine

- Iceberg based modern industry standard storage lowering their TCO
- Switch from in-memory storage-based pricing to competitive SQL based compute usage-based pricing.
- Easy self service experience to bring together SAP and non-SAP data without moving or copying data.
- Customers embracing multi-cloud strategy can build unified logical semantic layer keeping their storage in place (Databricks, Snowflake, Amazon S3, Azure Storage, GCS & HDLFS) without vendor lock-in
- Customers who have already moved their SAP data to hyperscaler storage can query the data for a fraction of the cost with Dremio.


## Related Resources

- [Dremio Key Concepts](https://docs.dremio.com/dremio-cloud/about/concepts)
- [Data Products in SAP Business Data Cloud](/docs/ref-arch/09be8b)
- [SAP Business Data Cloud](https://www.sap.com/products/data-cloud.html)
- [Apache Iceberg](https://iceberg.apache.org/)
