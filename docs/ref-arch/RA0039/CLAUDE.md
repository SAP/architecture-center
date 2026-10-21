# Context

This project involves content development of a reference architecture called `BDC Lakehouse` . It will be a sub-page as part of a master architecture called `SAP usiness AI Platform` also known as `RA0039`. 

- {working_folder} = `architecture-center/docs/ref-arch/RA0039`.
- {lakehouse_working_folder} = `{working_folder}/2-bdc-lakehouse`. 
- BDC Lakehouse Target Markdown File path = {lakehouse_working_folder}/README.md
- Ground your knowledge based on the complete architecture found at`{working_folder}/docs/the-unified-narrative.md`. Only a sub-portion of this narrative belong to BDC Lakehouse, steps 1a, 1b, 2, 3 and 4. 
- Master architecture diagram, including BDC Lakehouse found at `{working_folder}/docs/architecture.png`
- Topics of the master reference architecture can be found at `{working_folder}/docs/bai-content.md`.
- As a good example of content type, structure, tone, refer to this existing reference architecture `architecture-center/docs/ref-arch/RA0029/readme.md`.
- Overview on SAP Business Data Cloud BDC = `architecture-center/docs/ref-arch/RA0013/README.md`



# References

- Powerpoint on North Star BAIP/BDC `{working_folder}/docs/baip.pptx`
- BDC cockpit mockup: Shows Dremio integrated directly inside BDC, looking and feeling like a native SAP product.
- Layers of a data platform: `sap-data-egress-adversarial/kt/intro.md#1-the-mental-model--layers-of-a-data-platform`
- Dremio Stack: `sap-data-egress-adversarial/kt/dremio-sap-stack.md#2-the-dremio-stack-layer-by-layer`

## BDC Lakehouse proposed topics

### Architecture Overview (open formats, medallion layers, SAP-managed Data Products, Non-SAP Managed Data Products)
- `sap-data-egress-adversarial/kt/intro.md` -- layered platform mental model (storage / file format / table format / catalog / compute), lakehouse definition, medallion pattern explained
- `sap-data-egress-adversarial/src/medallion/README.md` -- OTIF golden records: why each medallion layer exists and what question it answers
- `sap-data-egress-adversarial/docs/architecture.md` -- end-to-end data flow with silver DDL (view) and gold DDL (Delta table)

### Storage & Compute (UniForm, Apache Polaris catalog, Dremio/HANA engines)
- `sap-data-egress-adversarial/src/s4-diy-egress/docs/s4-diy-egress-architecture.md` -- Delta + Iceberg UniForm rationale, why properties must be set at create time; also covers SAP extraction (see below)
- Note: the SAP-native stack is Iceberg-native with UniForm (simultaneous Delta + Iceberg) and the SAP Enterprise Catalog powered by Apache Polaris. Unity Catalog and Delta Lake appear only in the Databricks DIY comparison (`sap-data-egress-adversarial/kt/databricks-basics.md`), not in the North Star.

### Data Ingestion Patterns (batch, streaming, SAP extraction)
- `sap-data-egress-adversarial/src/s4-diy-egress/docs/s4-diy-egress-architecture.md` -- full SAP extraction architecture: OData V4 surface, corp-side push to Databricks, batch scheduling options (Route A vs. B)
- `sap-data-egress-adversarial/src/s4-diy-egress/docs/s4-diy-silver-transform.md` -- bronze-to-silver transform rules, typing logic, and Iceberg UniForm on silver tables

### Governance & Lineage (data quality, audit, access control)
- `sap-data-egress-adversarial/docs/integration.md` -- BDC data product catalog, lineage tracing from S/4HANA, column-level security via Delta Sharing, write-back of AI results as governed products
- `sap-data-egress-adversarial/docs/narrative-coverage-map.md` -- coverage map linking architecture steps to governance and lineage themes across reference architectures and TechEd sessions

# Responses Format

Be concise and structure headings when answering complex questions

# Business AI Platform Overview 
SAP's data architecture vision, from raw SAP application data all the way through to AI agents consuming semantically rich data products. This covers the target state architecture, the adversarial Databricks comparison work, the DIY egress pipeline the team built, and the role of tabular foundation models (TabPFN and RPT) in enriching data products.

## Architecture Vision

The goal of the master reference architecture, including its sub-pages, is to cover  everything that flows out of the architecture center, starting from SAP business applications (S/4HANA, SuccessFactors, Rebate, etc.) all the way to agents consuming rich, joined data.

Key components in the target state include:

- BDC Lakehouse as the central platform, built on open standards (Iceberg, Parquet, Polaris catalog)
- Dremio acquired to serve as the compute and federation engine on top of object store
- Reltio acquired to provide cross-application join keys, linking the same entity (e.g., a person) across multiple SAP and non-SAP modules
- Business ontology and knowledge graph layer on top of data products, enriching them further
- TabPFN and RPT predictive models feeding into agents
- Joule as the primary UI experience, with expert UIs for deeper work, to avoid the "30 disjointed tabs" problem

The BDC cockpit mockup (shared in the "Lake House Tech Ed Party" Teams chat) shows Dremio integrated directly inside BDC, looking and feeling like a native SAP product.

## Adversarial / DIY Egress Work

A side-by-side comparison to pressure-test the BDC value proposition against a pure Databricks stack. The two goals were:

1. Find holes in the SAP architecture diagram by building the best possible experience in Databricks

### How the DIY pipeline works

The pipeline avoids ODP/RFC (which violates SAP's API policy and was the source of the Siemens escalation). Instead:

- An ABAP OData service was created in S/4HANA via ADT (activated by Claude), wrapping CDS views and publishing one OData endpoint per data product
- Currently covers 17 data products, 228 tables landing in Databricks
- Data is pushed as Parquet files into Azure Databricks and mounted as Iceberg tables in a catalog called "otif demo S4"
- Bronze layer: raw data from CDS views via the ABAP service
- Silver layer: normalization, null cleanup, zero-padding removal, schema prefix cleanup
- Gold layer: fully modeled data products, with BDC data products also present for comparison

The full lineage and SQL transformations are in the "DIY egress" repo (data-egress-adversarial).

The cost estimate for rolling this yourself (without SAP data products): roughly $2 to $3 million, based on back-of-envelope analysis using Perplexity for market rates.

## Dremio 

Dremio connects to both BDC and the Databricks Iceberg catalog. It federates queries on the fly without moving data, running SQL directly against remote Iceberg-compatible sources.

Key points:

- Dremio will no longer be sold as a standalone product; it will only be sold as part of BDC
- In the short term, it is the practical federation and compute layer
- Sangeetha's data federation work will stop being promoted (not immediately turned off, but no longer the path forward)
- Dremio has a rich REST API and an MCP server, making it accessible from Claude Code and agents

## Tabular Foundation Models (TabPFN and RPT)

SAP now has two tabular foundation models in its portfolio:

- RPT 1.6 (from SAP's own work)
- TabPFN 3.5

Both are deployed on AI Core in the "dsus10" sub-account. There is a known issue adding AI Core subscriptions to OctoDev due to an internal plan conflict; a helpdesk ticket is likely needed.

The value of these models: zero-shot regression and classification on tabular data, no manual feature engineering or model fitting. You write a SQL SELECT with an AI predict function, pass in training data, and get predictions back. No need to configure XGBoost or any algorithm manually.

Vision: a stored procedure calls the AI Core endpoint iteratively over table data, producing AI-enriched gold data products with minimal effort. This replaces the batch inference work on RA BDC+AI Core.

The TabPFN client repo for reference: https://github.com/priorlabs/tabpfn-client

## BDC Lakehouse Target README Proposed Topics

The following topics are proposed for the target Markdown file at `{lakehouse_working_folder}/README.md`:

- **Architecture Overview** -- open formats (Iceberg, Parquet), medallion layers (bronze / silver / gold)
- **Storage & Compute** -- UniForm (Delta + Iceberg), Apache Polaris catalog, Dremio and HANA engines
- **Data Ingestion Patterns** -- batch, streaming, SAP extraction
- **Governance & Lineage** -- data quality, audit, access control

---

## Tech Ed Hands-On Session (Deadline: October 16)

For the Tech Ed, a hands-on lab is planned to cover:

- Use a branded version of Dremio (matching the BDC mockup)
- Ingest data from a third-party source (likely an S3 bucket, possibly Databricks)
- Model an ontology between SAP and non-SAP data
- Build a Joule agent on top
- Incorporate TabPFN predictions

What is still not built (items 4 and 5 in the architecture):

- ML enrichment of a gold data product
- Ontology modeling with Databricks Genie
- Agent built on top