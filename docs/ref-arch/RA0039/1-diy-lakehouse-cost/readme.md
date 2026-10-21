---
id: id-ra0039-diy-lakehouse-cost
slug: /ref-arch/ra0039-diy-lakehouse-cost
sidebar_position: 2
title: True Cost of a DIY Lakehouse
description: What it takes to prepare SAP and non-SAP data for AI on an external analytics stack, across ETL, master data management, machine learning, ontology, and agentic AI, compared with SAP Business Data Cloud.
sidebar_label: True Cost of a DIY Lakehouse
keywords:
  - sap
  - business data cloud
  - bdc
  - lakehouse
  - delta sharing
  - data products
  - etl
  - anomaly detection
  - business knowledge graph
  - ontology
  - agents
image: img/ac-soc-med.png
tags:
  - ref-arch
  - bdc
  - data
  - databricks
  - agents
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
  - seeobjectively
  - mponce
last_update:
  author: seeobjectively
  date: 2026-10-14
---

## Overview

It is a deceptively simple question: *"Why not just build this on an external lakehouse ourselves?"* Getting SAP data into a general-purpose analytics stack is clearly possible. The connectors exist, the compute is available, and the open-source ecosystem is deep. The real question is not whether it can be done, but what you take on when you do it.

This reference architecture follows the do-it-yourself (DIY) path layer by layer and sets out what you have to build, operate, and govern yourself when SAP data lands in an external stack, next to what SAP Business Data Cloud (BDC), Joule, and the BDC catalog provide out of the box.

The comparison is platform-neutral. It concerns the engineering effort inherent in the non-SAP path, not the merits of any single lakehouse vendor.

:::note Scope
This page summarizes the qualitative comparison across the five layers. It intentionally omits cost, effort, and benchmark figures, which depend heavily on landscape size, release cadence, and scope. Treat the directional claims here as a starting point for your own estimation.
:::

![drawio](drawio/diy-vs-bdc-layers.drawio "DIY lakehouse vs SAP BDC across the five layers")

## The five layers

The journey from raw SAP tables to agent-ready data decomposes into five layers. Each one is a place where the DIY path accrues work that the SAP-native path does not.

### Layer 1: ETL (SAP source + non-SAP data)

The entry point is extraction. Relevant data is identified across SAP business applications (for example Ariba, SAP S/4HANA, SAP SuccessFactors) and the corresponding tables from non-SAP systems (cloud object stores, data warehouses, operational databases). Pipelines then extract and load it, from SAP interfaces such as CDS views and from the non-SAP sources, before any modeling can begin.

- **DIY:** You discover, extract, and reconcile the bindings between CDS views and their underlying release-specific schemas, then re-do that work on every S/4 upgrade. On top of the raw extract you hand-build the semantic layer (release abstraction, internationalized business labels, key and unit-of-measure semantics, and field-level data-protection tagging) before the data is usable downstream.
- **SAP BDC:** You subscribe to governed Data Products with stable, versioned contracts. SAP absorbs the release churn, so the extraction surface and the semantic layer are maintained for you rather than rebuilt by you.

### Layer 2: Master data management (MDM)

Raw extracts have to be deduplicated, merged, and resolved into golden records before anyone can trust them. Entity resolution, matching the same customer, material, or supplier across systems, is only the first row of what production MDM requires.

- **DIY:** Entity-resolution libraries can accelerate matching, but the team must still select, integrate, and operate the surrounding production capabilities: survivorship rules, explainability and match auditing, data stewardship with human review and override, match-on-ingest, and a governed audit trail. These capabilities require an operational application and governance model, not only notebooks.
- **SAP BDC:** A managed MDM capability (Reltio) delivers these functions out of the box: configurable survivorship, reviewable stewardship, real-time match-on-ingest, and lineage-backed governance. The effort becomes integration, not construction.

### Layer 3: ML (prediction and anomaly detection)

With trusted data in place, the analytical workload (forecasting, prediction, and anomaly detection) runs on top of the gold layer.

- **DIY:** Traditional ML engineering is a multi-step pipeline: feature work, model selection, many cross-validation fits, hyperparameter search, threshold calibration, and model hosting, all requiring data-science expertise. Automated ML reduces the number of decisions but removes neither the data scientist nor the accuracy ceiling.
- **SAP BDC:** Tabular foundation models can shift work from per-use-case model training toward applying and evaluating a shared model, reducing model-selection and training-pipeline effort while still requiring validation on the target enterprise dataset.

### Layer 4: Ontology

Analytics and agents need more than tables; they need business meaning. Table metadata and catalog semantics have to be combined into an ontology that describes what the data *means* (the entities, relationships, and business concepts) and not just where it sits.

- **DIY:** You hand-build the ontology from table metadata and semantics, author it in a general-purpose modeling tool, and keep it in step with every schema and pipeline change. The result is a bespoke semantic model you own and maintain indefinitely, with no business knowledge baked in beyond what you encode yourself.
- **SAP BDC:** This is where the SAP-native path pulls decisively ahead. The SAP Business Knowledge Graph (BKG) encodes SAP's business semantics (the entities, relationships, and process context already understood by SAP applications) and a dedicated ontology editor lets you extend and curate it. The BKG is the layer that turns governed data into business meaning without you reconstructing SAP's domain knowledge by hand. It is the hardest part of the stack to replicate, because it is not just tooling. It is the accumulated semantics of SAP's applications.

### Layer 5: Agentic AI

The top of the stack is where the foundational data layers are consumed by conversational agents and headless (programmatic) agents.

- **DIY:** You design, wire, and operate the agent layer yourself: grounding agents in your data, governing their access, and maintaining the integration as the layers beneath them change.
- **SAP BDC:** Joule and Genie agents consume the governed data products, ontology, and semantics directly, turning them into agentic and analytical actions without a custom integration layer.

## How to read this comparison

Across all five layers the pattern is the same: the external stack can reach the same end state, but it does so by rebuilding capabilities that the SAP-native path treats as managed infrastructure. For an architect, the decision is therefore less about feasibility and more about where the organization wants to spend its engineering and governance effort: on building and maintaining the stack, or on the business problems that sit above it.
