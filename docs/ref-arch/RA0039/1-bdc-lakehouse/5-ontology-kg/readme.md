---
id: e15602
slug: /ref-arch/e15602
sidebar_position: 5
title: Ontology Manager
description: >-
  The ontology and knowledge graph layer on top of SAP BDC data products,
  adding semantics and enabling agents to reason over governed enterprise data.
sidebar_label: Ontology Manager
keywords:
  - sap
  - business data cloud
  - ontology
  - knowledge graph
  - semantics
  - joule
  - sparql
  - owl
  - rdf
  - shacl
  - ontop
  - obda
image: img/ac-soc-med.png
tags:
  - data
  - bdc
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - I769068
  - I550585
last_update:
  author: I550585
  date: 2026-10-22
---
### Ontology Manager

Data Products bring governed, versioned enterprise data into the BDC Lakehouse. Dremio federates and computes across it. Reltio resolves identities into trusted golden records. Ontology Manager adds the semantic layer — formal definitions of business concepts, their relationships, constraint rules, and the mappings that connect them to the underlying SAP and non-SAP Data Products. Built on open W3C standards — RDF, OWL, SPARQL, and SHACL — this semantic layer is what elevates governed Data Products into a knowledge graph that Joule can reason over, not just query.

With Ontology Manager in SAP BDC, Joule operates over a semantic knowledge layer comprising formal concept definitions, governed relationships, constraint rules, and ontology-to-data mappings across SAP and non-SAP Data Products in the BDC Lakehouse. This semantic grounding enables Joule to resolve queries with precision — identifying the relevant business concepts, traversing their relationships across the ontology, and retrieving data from the appropriate governed Data Products without requiring system-specific knowledge. Where reasoning leads to a decision, Business Actions provide the execution layer — allowing Joule to act on that decision directly, invoking workflows, APIs, or ML inferences in connected systems, with every action attributed to the end user's identity, governed by access controls, and fully auditable.

### Architecture

![drawio](./drawio/ontology-kg.drawio)

### Key Capabilities

**Ontology Modeling**
- Generate from a data source — AI-assisted wizard suggests concept names, relationship hints, and join inferences from schema metadata
- Import an existing ontology or start from a blank canvas — both editable in the visual editor with real-time validation
- W3C compliant — ontology files, mappings, and constraints are generated in standard formats (OWL, RDF, SHACL, OBDA) automatically; users model in business terms without needing to work directly with semantic web standards

**Virtual Knowledge Graph**
- Query the ontology live across SAP and non-SAP Data Products — SPARQL queries are translated to SQL at runtime with no data movement or ETL required
- Filter pushdown ensures queries are executed efficiently at the source, minimising data transfer

**SHACL Governance**
- Preflight validation before publishing — catch constraint violations before any data is touched
- Enforces business rules: required fields, value ranges, cardinality, and cross-entity consistency

**Materialized Knowledge Graph**
- Fully managed Apache Spark pipeline running on the SAP Business AI Platform materializes the ontology into the SAP HANA Cloud Knowledge Graph as RDF triples
- Supports auditable, persistent semantic grounding for compliance and lineage use cases

**Business Actions**
- Bridges the gap between insight and action — Business Actions make the ontology executable, not just queryable
- Invoke ML inferences, trigger workflows (SAP Build, n8n), or call backend systems (S/4 OData APIs, SAP Integration Suite APIs, and more) — bound to any ontology concept via the visual editor, with principal propagation so user identity flows through to the target system

**Query Editor**
- Visual query builder — select concepts, filters, and relationships; SPARQL is generated automatically
- SPARQL editor — inspect or edit the generated query directly for full technical control

**Joule Integration via MCP**
- Ontology Manager exposes an MCP server — Joule draws semantic knowledge of the ontology, its concepts, relationships, and governed data directly from the MCP tools
- With that grounding, Joule can execute SPARQL queries and trigger Business Actions with the end user's identity carried through every step

### What is an Ontology and Knowledge Graph?

An ontology is a formal model of the concepts, relationships, and rules in a business domain. A Knowledge Graph applies that model to real data — concepts mapped to source tables, attributes to columns, relationships derived from business rules. It gives agents a governed, navigable view of enterprise data that is independent of the physical schema beneath it.

Ontology Manager sits on top of BDC Data Products and turns tables and columns into a live business ontology. It delivers this in three steps:

1. **Model** — turn SAP and non-SAP Data Products into a live ontology in minutes
2. **Reason** — query the Knowledge Graph with SPARQL; OWL 2 QL reasoning expands queries across linked Data Products automatically, without agents needing to know the source schema
3. **Execute** — bind Business Actions to S/4 and Line of Business apps; Joule carries decisions through with principal propagation

### Value for Customers

- **Joule understands your business, not just your data** — Ontology Manager gives Joule a formal model of business concepts, relationships, and rules across SAP and non-SAP Data Products. Joule resolves questions in business terms, not schema columns, and acts on the result with the end user's identity carried through every step.
- **Reason over SAP and non-SAP Data Products** — Ontology Manager unifies SAP and non-SAP Data Products into a single semantic model. Agents query across source boundaries without needing to know the underlying schema of each system.
- **Rapid time to value** — Ontology Manager infers concepts, relationships, and mappings from SAP and non-SAP Data Products automatically. A governed semantic layer is live in minutes rather than months of manual data modelling.
- **Agents query live data, never a copy** — every agent query is translated to SQL at runtime and executed directly on BDC Data Products with filter pushdown. No ETL pipelines, no data replication, no staleness.
- **Every answer is governance-backed** — Ontology Manager enforces SHACL constraints at authoring time. By the time an agent queries, the data it reasons over has already been validated against the business rules the organisation defined.
- **From insight to decision** — agents derive insights from semantic knowledge and live data queries across the ontology, then invoke Business Actions directly — triggering workflows, APIs, or ML models — with every action attributed to the end user's identity and fully auditable.

### Related Resources

- [SHACL Shapes Constraint Language](https://www.w3.org/TR/shacl/)
- [SPARQL 1.1](https://www.w3.org/TR/sparql11-overview/)
