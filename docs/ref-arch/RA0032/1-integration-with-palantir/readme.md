---
id: id-ra0032-01
slug: /ref-arch/ra0032/integration-with-palantir
sidebar_position: 1
title: Integration with Palantir
description: Explore how SAP Data Accelerator provides SAP customers using Palantir Foundry with a high-throughput, governed path to securely connect SAP data to Foundry.
sidebar_label: Integration with Palantir
keywords:
  - sap
  - palantir
  - data integration
  - analytics
  - data accelerator
image: img/ac-soc-med.png
tags:
  - ref-arch
  - data
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
  - s-krishnamoorthy
last_update:
  author: s-krishnamoorthy
  date: 2026-08-17
---

## Overview

Palantir Foundry is an enterprise data and AI platform used by large organizations to integrate operational data, build AI/ML pipelines, and operationalize decisions.  

For SAP customers using Palantir Foundry, SAP Data Accelerator is the SAP-endorsed connectivity service providing a preferred, high-throughput, governed path for ingesting SAP data into Foundry’s data lineage and transformation engine. 

![drawio](drawio/sap-data-accelerator-palantir.drawio)

## Architecture Details

Palantir Foundry's SAP integration stack includes these deployment components.

- **SAP Data Accelerator:** The core SAP service that provides the secure data path between the customer's SAP landscape and Palantir Foundry.
- **Backend SAP Systems:** Data sources — on-premise and Cloud Private Edition.
- **Foundry Connector:** Installed in the SAP backend system, this add-on registers extraction logic and manages delta queue operations, exposing data to SAP Data Accelerator in a structured format.
- **SAP Cloud Connector:** Provides a secure tunnel from the partner platform into the customer's on-premise or private cloud network — exposing specific backend SAP systems to the DA Hub while keeping the internal network private.
- **Palantir Foundry:** Partner platform consuming SAP data via the SAP Data Accelerator Hub.


### Data Ingestion into Foundry

Once the SAP Data Accelerator connector is configured in Foundry's connection management:

1. **Initial load:** The full dataset is pulled from SAP via SAP Data Accelerator and landed as Foundry datasets with automatic schema detection. 

2. **Incremental sync:** Delta records from SAP Data Accelerator are applied to Foundry datasets, maintaining a current, deduplicated view of SAP data without re-extracting the full table. 

3. **Schema registration:** SAP objects surfaced through SAP Data Accelerator are registered in Foundry's data catalog with lineage tracking — users can trace every dataset back to its SAP source table or CDS view. 

4. **Ontology mapping:** Foundry's Ontology layer can be used to model SAP objects (e.g., `SalesOrder`, `Material`, `Vendor`) as typed Object Types, enabling cross-source joins and semantic search across SAP and non-SAP data. 


### Writeback from Foundry to SAP

Foundry's writeback pipeline uses the SAP Data Accelerator writeback API. This enables user-attributed writebacks — changes committed to SAP are recorded against the Foundry user who triggered the action, not a shared service account. This is critical for audit compliance in regulated industries (financial services, pharma, public sector).

Typical writeback scenarios from Palantir Foundry to SAP include:

- AI-optimized procurement recommendations → SAP purchase requisitions
- Demand planning outputs → SAP planned independent requirements (PIRs)
- Dynamic pricing decisions → SAP condition records
- Workforce scheduling results → SAP HR time entries 


### Security and Governance in the Palantir Context

- **Access control:** Foundry’s fine-grained dataset access policies layer on top of SAP Data Accelerator’s SAP-side authorization. A user in Foundry can only query SAP-derived data if both Foundry and SAP Data Accelerator authorize the access.
- **Data lineage:** All SAP data ingested via SAP Data Accelerator carries lineage metadata through Foundry pipelines — compliance teams can audit which SAP tables fed which AI model or report.
- **Encryption:** Data is encrypted in transit (TLS) between SAP Cloud Connector, SAP Data Accelerator, and Foundry. Foundry applies encryption at rest within its managed storage.
- **User-attributed writeback:** Writeback operations require explicit authorization — changes written to SAP are attributed to the individual user identity, not a shared service account, supporting audit compliance in regulated environments.


## Related Resources

- [SAP Data Accelerator – Product Documentation](https://help.sap.com/docs/sap-data-accelerator)
- [SAP BTP – Cloud Connector Documentation](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/cloud-connector)
- [Palantir Foundry – SAP Integration Overview](https://www.palantir.com/docs/foundry/sap/overview/)
- [Palantir Foundry – SAP Data Accelerator](https://www.palantir.com/docs/foundry/sap/data-accelerator/)
- [Palantir Foundry – SAP Writeback with OAuth 2.0](https://www.palantir.com/docs/foundry/sap/oauth2-writeback/)
- [Palantir Foundry – HyperAuto Overview](https://www.palantir.com/docs/foundry/hyperauto/overview/)

> *This reference architecture document is intended for enterprise architects and integration specialists evaluating or implementing SAP Data Accelerator as a governed data-sharing layer between SAP and partner platforms.*