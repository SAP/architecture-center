---
id: id-ra0030-3
slug: /ref-arch/LcR6Senh/3
sidebar_position: 30
title: 'Document Posting and System Integration Patterns for SAP Document AI'
description: 'Design robust integration architectures for posting extracted and enriched document data  to SAP S/4HANA, Business ByDesign, and third-party systems with error handling and monitoring.'
keywords: 
  - appdev
  - genai
sidebar_label: 'Document Posting and System Integration Patterns for SAP Document AI'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - appdev
  - genai
contributors:
  - pirnz-sap
last_update:
  date: 2026-05-19
  author: pirnz-sap
---

The final stage of intelligent document processing transforms validated, enriched extraction data into transactional business documents in enterprise systems. The posting layer handles protocol conversion, error recovery, audit logging, and monitoring to ensure reliable document creation in SAP S/4HANA, Business ByDesign, SuccessFactors, and third-party ERPs. Selecting the appropriate integration pattern depends on complexity requirements, governance policies, and operational constraints.

## Architecture

The document posting architecture supports multiple integration patterns with varying complexity and governance characteristics:

![drawio](drawio/document-posting-architecture.drawio)

## Flow

The reference architecture demonstrates different options on how enriched document data posts to target systems :

1. **Direct API Integration** - For point-to-point scenarios with no middleware requirements, SAP Document AI can post directly to target system REST APIs. This pattern minimizes infrastructure costs but requires application-level error handling, retry logic, and monitoring. Suitable for single-purpose automations with predictable data flows.

2. **Cloud Application Programming Model (CAP) application** - CAP services on Cloud Foundry handle both cloud and on-premise integrations with rapid development cycles and native OData support. A CAP service receives extraction notifications from Document AI, performs field mapping and validation and posts to SAP S/4HANA Cloud (via OData APIs), on-premise S/4HANA (via Cloud Connector and OData/RFC), Business ByDesign,... CAP services support lightweight to moderate complexity scenarios leveraging wizards to generate code, BTP authentication, service-to-service calls, and event-driven architecture. 

3. **Integration Suite Orchestration** - SAP Cloud Integration provides enterprise-grade features for moderate to complex scenarios requiring multi-system coordination, protocol conversion, or governed change management. An integration flow (iFlow) receives the Document AI extraction payload, converts to target system protocols (IDoc, SOAP, REST), applies error handling and retry logic, and posts to cloud or on-premise target systems. Integration Suite includes out-of-the-box capabilities that CAP services require custom development for: centralized monitoring dashboards, alert notifications, B2B/EDI processing, pre-built adapters for SAP and third-party systems, versioned artifact deployment with rollback, and API management for external partner access.

## Characteristics

A robust document posting architecture exhibits these characteristics:

- **Multiple integration patterns**: Support CAP services (lightweight), Integration Suite (complex orchestration), Build Process Automation (approval workflows), and direct API calls (point-to-point) to accommodate varying complexity and governance requirements.
- **Protocol flexibility**: Handle diverse target system protocols including OData (SAP S/4HANA Cloud), RFC (SAP ECC), IDoc (SAP on-premise), SOAP (legacy systems), and REST (modern cloud applications).
- **Transactional integrity**: Ensure idempotent posting to prevent duplicate document creation, implement compensating transactions for partial failures, and maintain referential integrity across related documents (invoice references PO and goods receipt).
- **Error recovery**: Distinguish technical errors (retry automatically) from business errors (require human intervention), implement exponential backoff for transient failures, and route unrecoverable errors to exception queues with stakeholder notification.
s
## Examples in an SAP context

SAP Document AI posting patterns enable diverse integration scenarios:

- **Invoice Posting to SAP S/4HANA via OData** - A CAP service receives enriched invoice data (with validated vendor, PO reference, and three-way match confirmation), transforms to S/4HANA A_SupplierInvoice OData entity format mapping enriched fields to header (CompanyCode, DocumentDate, PostingDate, SupplierInvoiceIDByInvcgParty, InvoiceGrossAmount), line items (PurchaseOrder, PurchaseOrderItem, SupplierInvoiceItem, QuantityInPurchaseOrderUnit), tax distribution, and account assignment. Posts via synchronous OData call to S/4HANA Cloud or on-premise system via Cloud Connector. The S/4HANA API validates GL accounts and cost centers, determines posting keys, and creates the accounting document. CAP service handles the HTTP response: success updates Document AI status to "Posted" with S/4HANA document number; validation errors (blocked vendor, invalid GL account) route back to Document AI exception queue with error details.

- **Sales Order Creation via IDoc** - An Integration Suite flow receives enriched customer PO data (with resolved customer ID, validated materials, confirmed pricing, and ATP delivery dates), transforms to ORDERS05 IDoc format mapping to SAP structures: E1EDKA1 (customer header with KUNNR), E1EDP01 (line items with MATNR, quantity, price), E1EDPT1 (partner functions), and E1EDT01 (delivery schedule lines). Sends IDoc to on-premise S/4HANA via Cloud Connector with receiver partner profile configuration. ALE layer routes IDoc to standard sales order processing function module IDOC_INPUT_ORDERS, which creates sales order (transaction VA01) and validates credit limits and stock availability. Success IDoc (ALEAUD) returns with sales order number; error IDoc returns with specific failure codes. Integration flow updates Document AI based on IDoc status and implements retry logic for transient IDoc processing failures.

- **Goods Receipt Posting with Conditional Workflow** - A Build Process Automation process receives enriched delivery note data (with validated PO reference and inspection requirements flag), evaluates business rules to determine posting path: if quality inspection required → creates quality inspection lot via S/4HANA API and assigns to QM inspector for review; if inspection not required → immediately posts goods receipt via WMMBXY IDoc (movement type 101, E1BP2017_GM_HEAD_01 and E1BP2017_GM_ITEM_CREATE structures) to update inventory and create material document. Process tracks IDoc status, handles posting errors (material not found, storage location blocked) with exception notifications, and on success updates Document AI with material document number and notifies accounts payable that goods are received for invoice processing.

## Services and Components

- [SAP Cloud Application Programming Model (CAP)](https://discovery-center.cloud.sap/serviceCatalog/cloud-application-programming-model) - Lightweight posting services 
- [SAP Cloud Integration](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) - Complex orchestration and transformation 
- [SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation) - Approval workflows
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) - Application hosting
- [SAP S/4HANA](https://discovery-center.cloud.sap/serviceCatalog/sap-s4hana) - Target system for financial and logistics documents
- [SAP Business ByDesign](https://discovery-center.cloud.sap/serviceCatalog/sap-business-bydesign) - Target system for mid-market deployments
- [SAP Connectivity Service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service) - On-premise system connectivity via Cloud Connector
- [SAP Alert Notification Service](https://discovery-center.cloud.sap/serviceCatalog/alert-notification) - Error alerting and monitoring

## Resources

- [SAP Cloud Application Programming Model Documentation](https://cap.cloud.sap/docs/)
- [SAP Cloud Integration Documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)
- [SAP Build Process Automation Documentation](https://help.sap.com/docs/build-process-automation)
- [SAP S/4HANA OData APIs](https://api.sap.com/products/SAPS4HANACloud/overview)
- [SAP Cloud Connector Setup Guide](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/cloud-connector)
- [IDoc Documentation for SAP S/4HANA](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE)