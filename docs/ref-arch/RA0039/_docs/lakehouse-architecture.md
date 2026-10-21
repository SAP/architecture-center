# BDC Lakehouse Architecture

*Reference material for the BDC Lakehouse sub-page of the SAP Business AI Platform reference architecture (RA0039). Grounded in `the-unified-narrative.md`, `baip.pptx`, and `architecture.png`. Covers steps 1a through 4 of the North Star layered model.*

---

## Sources and consumers

BDC Lakehouse sits at the center of a broader data flow. Two categories of sources feed it from below. Several categories of consumers draw from it above.

**Sources:**

- **SAP Source Systems** supply structured transactional data via Procurement (Ariba), Finance (SAP S/4HANA PCE), Sales, HCM, and others. These feed step 1a through the FOS pipeline.
- **Non-SAP Data (Object Stores and Relational)** covers Azure (ADLS, SQL Server), AWS (S3, Redshift), GCS, Oracle, and other external stores. These feed step 1b through BDC Connect and the Enterprise Catalog.

**Consumers:**

- **SAP applications and platforms** consume governed data products for analytical and operational use.
- **Non-SAP Data Platforms** (Databricks, Snowflake, and hyperscalers) read Lakehouse data zero-copy via the Enterprise Catalog (Powered by Polaris). BDC Connect also enables active integrations with these platforms in both directions.
- **BI Tools** (Power BI, Tableau, Looker) consume analytical outcomes via the Analytical Consumption layer above the Lakehouse.
- **SAP agents** (Finance, Spend, HCM autonomous agents and partner agents, built and run via Joule Harness V10) consume data products and semantic context grounded in the Lakehouse.
- **External agent platforms** (Google Gemini, Amazon Bedrock, Microsoft CoPilot, Databricks Agent Bricks) interoperate with SAP agents through the Agent Gateway, which exposes governed context without exporting raw data.

---

## Step 1a — Primary Data Products (SAP data)

The Foundation Services pipeline (FOS, HDLF, Spark, Dremio) streams source changes from SAP business applications via CDC, using the Data Subscription API or the ABAP push framework. Spark consolidates these into a Bronze system-of-record tier. From Bronze, the pipeline standardizes data into Silver-tier Primary Data Products written in UniForm format (simultaneous Delta and Iceberg), then registers them in Open Resource Discovery.

The Primary Data Products at this layer include: Supplier (Ariba), Supplier (S/4), Journal Entries, Sales Orders, and Customer (S/4).

The architectural value here is that SAP absorbs release churn. Primary Data Products are governed, versioned, and open, so downstream consumers do not rebuild extraction logic when S/4 upgrades. The products are open-format from the start, readable by any Iceberg-compatible engine.

---

## Step 1b — Primary Data Products (non-SAP data) and the Enterprise Catalog

Non-SAP data is accessed through the Enterprise Catalog (Powered by Polaris) and BDC Connect. Dremio federation and SQL-on-Files transform and publish this data as custom Primary Data Products, treated no differently from SAP ones.

Non-SAP Primary Data Products at this layer include: Customer (Salesforce), CRM Opportunities (Salesforce), and POS TXN (BigQuery).

The Enterprise Catalog governs all engines through a single open Polaris catalog. Non-SAP Data Platforms (Databricks, Snowflake, hyperscalers) read the same data zero-copy, in place, with no duplication. BDC Connect also enables active two-way integrations with these platforms, serving as both an inbound access path and an exposure mechanism.

The control point is the catalog, not a copy. Non-SAP data joins the estate without leaving its home system.

---

## Step 2 — Unified and 360 Data Products

Reltio MDM (with Dremio and MDG) consolidates source master data from S/4, Ariba, Salesforce, and other systems into a Golden Master: a deduplicated, survivorship-resolved record with key maps that translate source-system IDs to a unified golden ID.

Dremio reads these Silver Unified Data Products and computes Gold-tier 360 Data Products by joining across systems. Examples in the architecture: Unified Supplier 360 (joining Ariba and S/4 supplier data) and Unified Customer 360 (joining S/4 and Salesforce customer data).

This step is what enables trustworthy cross-system queries. Without resolved identity, a join across SAP and Salesforce is guesswork. With golden records and key maps in place, the 360 products are reliable inputs for everything above them.

---

## Step 3 — Derived Data Products

Derived Data Products are the consumer-facing Gold layer. The Gold engines (FOS, HDLF, Dremio, and HANA) read the Silver Primary and Unified products via Iceberg, compute Reflections (pre-materialized query accelerators), and write Gold-tier products shaped for specific use cases.

Examples in the architecture:

- **Marketing Cost (SAP)** and **Revenue (SAP)** -- SAP-only derived products
- **Weighted Sales Pipeline (SAP and Salesforce)** -- cross-system, joining SAP sales orders with Salesforce CRM opportunities
- **Retail Sell-thru (SAP and BigQuery)** -- cross-system, joining SAP retail data with BigQuery POS transactions

HANA Cloud participates as a first-class consumer through SQL-on-Files and Federation. Reflections provide query acceleration without materializing redundant copies.

These products are semantically rich and purpose-built. That is what distinguishes them from raw tables: they are already shaped for an analyst or an agent to consume directly.

---

## Step 4 — Ontology and Knowledge Graph

The ontology layer (Project Narwhal, the Business Knowledge Graph, HANA KG) maps physical data objects to business terms and relationships, then binds those terms to actions. It sits above the derived data products and spans the full width of the Lakehouse in the architecture diagram, signaling that it applies across all products beneath it.

The distinction this layer creates: an agent that reads a row can return a value; an agent grounded in the ontology understands what the row means and what business action it is connected to. Semantics plus the golden master from step 2 is what keeps agent answers consistent and explainable.

For architects, this is the layer that makes the difference between a data platform and a platform capable of grounding autonomous agents. The layers below produce trusted, open data. The ontology turns that data into meaning.

---

## How the layers relate

Each layer accumulates on the one below it and cannot be shortcut:

- Step 1a and 1b produce open, governed, versioned Primary Data Products from SAP and non-SAP sources.
- Step 2 resolves identity across those sources, making cross-system joins trustworthy.
- Step 3 builds consumer-oriented Gold products on top of that trusted foundation.
- Step 4 adds business meaning and binds objects to actions, enabling agents to understand and act rather than just retrieve.

The shared-lineage property -- every consumer reading from the same governed products rather than private copies -- is what makes the platform coherent as it scales across sources, consumers, and agents.
