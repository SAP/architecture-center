# Modern Data Stack: Core Concepts

- OLTP vs. OLAP distinction is the foundation
  - OLTP: transactional systems (e.g., S/4HANA) writing records daily
  - OLAP: offline analytics layer, separate from the transactional system
- Traditional stack: BW/BW recipe extracts to a cold store, cubes built on top, dashboards on cubes
  - Storage and query engine bundled in one box (Oracle, HANA, etc.)
- Modern stack: storage and compute are decoupled
  - Data lands in object store (S3 or HANA HDFS) as Parquet files (columnar, binary, schema-carrying)
  - Query engine pulls data from object store to process

### Open Formats and Catalog Layer

- Parquet: base open format, serialized columnar binary stored in S3
- Delta: DataBricks’ table format on top of Parquet, read via Unity Catalog
- Iceberg: open alternative to Delta; exposed via Polaris (REST API layer)
- Polaris: catalog for Iceberg tables, analogous to Unity Catalog for Delta
- Unity Catalog: DataBricks-specific catalog, not a generic open format
- Compute engines (e.g., Spark, Dremio) sit above the catalog layer and query either Unity or Polaris
- BI dashboards consume models/queries produced at the warehouse/engine layer
- Medallion architecture: raw cryptic tables cleaned and curated into consumable tiers

### Whiteboard: Architecture Layers Sketched

- Left side (OLTP): Apps write to S/4HANA, backed by HANA; iFOS and S/4 feed into HDL via BW/ETL; CDC noted
- Right side (OLAP): Spark/Spark RDD and Dremio as compute/query engines
  - Delta and Iceberg formats sit on S3 (object store)
  - Polaris as REST API catalog above Iceberg; Unity Catalog above Delta
  - Marquee and Delta Engine also noted as compute options
- Data product (DP) layer at top: DP products with L3 tables, exposed as CSV/DPDoc
  - Path A: CDS views (300 + view) joined via SQL transforms
  - Path B: direct DP product exposure
- Open questions noted on board:
  1. Delta to Iceberg: costs, contract implications
  2. Zero-copy: cross-system query and compute
  3. iFOS and HDL stack
  4. Medallion: dig into format
  5. Data product definition (DPD): dig into format and possibilities (e.g., ML)

### End-to-End Architecture Walkthrough 

- Dremio / BDC to ingest and expose SAP and non-SAP data consistently
- Reltio to resolve identities and create cross-system golden records (e.g., linking Salesforce and S/4HANA)
- Ontology modeling to define semantics agents need to understand combined data
- Joule Studio agents grounded in those semantically rich data products
- Prior Labs models in Dremio for in-database prediction/classification via SQL, avoiding more complex AI Core workflows
- Strategic goal: keep data gravity inside the SAP ecosystem while staying open
  - Refreshed BDC architecture retires outdated Datasphere/federation content
  - Articulates why the SAP stack can outperform alternatives such as direct Databricks ingestion
- Next step: map everything proposed against the architecture layers (storage, catalog, compute, BI) and clarify how BDC connects to each