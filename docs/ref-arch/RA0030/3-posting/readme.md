---
id: c62bee
slug: /ref-arch/c62bee
sidebar_position: 3
title: Document Posting and System Integration Patterns for SAP Document AI
description: >-
  Design robust integration architectures for posting extracted and enriched
  document data  to SAP S/4HANA, Business ByDesign, and third-party systems with
  error handling and monitoring.
keywords:
  - appdev
  - genai
sidebar_label: Document Posting and System Integration Patterns for SAP Document AI
image: img/logo.svg
tags:
  - appdev
  - genai
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - pirnz-sap
discussion: 
last_update:
  author: pirnz-sap
  date: 2026-06-03
---

The final stage of intelligent document processing transforms validated, enriched data into business documents in enterprise systems. Selecting the appropriate integration pattern depends on complexity requirements, governance policies, and operational constraints.

## Architecture

![drawio](drawio/document-posting-architecture.drawio)

## Flow

[Outbound channels](https://help.sap.com/docs/document-ai/sap-document-ai/outbound-channels?locale=en-US&version=LATEST) in SAP Document AI can notify external systems when documents are on a specific step, and can include the extraction results:

1. **Direct API Integration**: For point-to-point scenarios with no middleware requirements, SAP Document AI can post directly to target system REST APIs. This pattern minimizes infrastructure costs but requires application-level error handling, retry logic, and monitoring. Suitable for single-purpose automations with predictable data flows.

2. **Integration Suite Orchestration**: Enterprise-grade features for scenarios requiring multi-system coordination, protocol conversion, or governed change management. An integration flow (iFlow) receives the Document AI extraction payload, converts to target system protocols (IDoc, SOAP, REST), applies error handling and retry logic, and posts to cloud or on-premise target systems. 

3. **Cloud Application Programming Model (CAP) application**: Handles both cloud and on-premise integrations with rapid development cycles and native OData support. A CAP service receives extraction notifications from Document AI, performs field mapping and posts to SAP S/4HANA Cloud (via OData APIs), on-premise S/4HANA (via Cloud Connector and OData/RFC), Business ByDesign...

## Examples in an SAP context

- **Invoice posting to S/4HANA via OData** - A CAP service receives enriched invoice data (validated vendor, PO reference, three-way match confirmed) and posts to S/4HANA's A_SupplierInvoice OData API. The API validates GL accounts and creates the accounting document. Success updates Document AI with the S/4HANA document number; validation errors (blocked vendor, invalid account) route back to Document AI exception queue with error details.

- **Sales order creation via IDoc** - Integration Suite flow transforms enriched customer PO data into ORDERS05 IDoc format and sends to on-premise S/4HANA via Cloud Connector. The ALE layer creates the sales order (VA01) and validates credit limits and stock availability. Success IDoc returns with sales order number; error IDoc triggers retry logic or routes to exception handling.

- **Goods receipt posting with conditional workflow** - Build Process Automation evaluates enriched delivery note data to determine posting path. If quality inspection is required, it creates a quality inspection lot via S/4HANA API and assigns to QM inspector. If inspection is not required, it immediately posts goods receipt via WMMBXY IDoc (movement type 101) to update inventory. Success notifies accounts payable that goods are received and ready for invoice processing.

## Services and Components

- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/guides/)  - Lightweight posting services 
- [SAP Cloud Integration](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) - Complex orchestration and transformation 
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) - Application hosting
- [SAP S/4HANA](https://www.sap.com/products/erp/s4hana-private-edition.html) - Target system for document posting
- [SAP S/4HANA Cloud](https://www.sap.com/products/erp/s4hana.html) - Target system for document posting

## Resources

- [SAP Document AI Documentation](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [Cloud Application Programming Model Documentation](https://cap.cloud.sap/docs/)
- [SAP Cloud Integration Documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)
- [SAP S/4HANA Cloud OData APIs](https://api.sap.com/products/SAPS4HANACloud/overview)
- [SAP S/4HANA Cloud Private Edition APIs](https://api.sap.com/products/SAPS4HANACloudPrivateEdition/apis/all)
- [SAP Cloud Connector Setup Guide](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/cloud-connector)
