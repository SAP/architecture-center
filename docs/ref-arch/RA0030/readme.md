---
id: id-ra0030
slug: /ref-arch/LcR6Senh
sidebar_position: 30
title: 'Intelligent Document Processing with SAP Document AI'
description: 'Architect end-to-end intelligent document processing solutions using SAP Document AI to automate  extraction, validation, and posting of business documents to enterprise systems.'
keywords: 
  - appdev
  - genai
sidebar_label: 'Intelligent Document Processing with SAP Document AI'
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

Enterprises process vast volumes of business documents daily—invoices, purchase orders, receipts, delivery notes—often requiring manual data entry into enterprise systems. Intelligent document processing (IDP) transforms this operational burden by leveraging AI to automatically extract, validate, and route document data to systems of record. SAP Document AI provides pre-trained models and generative AI capabilities to automate document processing, enabling organizations to reduce manual effort, accelerate cycle times, and improve data accuracy.

This reference architecture provides comprehensive guidance for designing, implementing, and operating IDP solutions with SAP Document AI. From multi-channel document ingestion to AI-powered extraction, master data enrichment, and system integration, this guide covers architectural patterns, service selection criteria, and best practices for building production-ready document processing pipelines.

## Architecture

An end-to-end intelligent document processing solution with SAP Document AI follows a four-layer architecture pattern separating document intake, AI extraction, data enrichment, and system integration:

“drawio/idp-architecture-overview.drawio” could not be found.

The architecture centers around **SAP Document AI** as the core extraction engine, with custom enrichment and integration services on **SAP BTP** connected to **SAP Cloud Solutions** and **third-party systems**:

- **Ingest Layer:** Multi-channel document intake supporting email (Outlook 365), mobile capture (SAP Mobile Start), web UI upload, and REST API submission. Optional pre-processing middleware handles format conversion, document splitting, and routing. See [Document Ingestion Patterns](app://obsidian.md/1-ingestion/readme.md).
- **Process Layer:** SAP Document AI classifies documents and extracts structured data using generative AI. Pre-built schemas for invoices, purchase orders, and delivery notes alongside custom schemas for organization-specific documents. Confidence scoring routes high-accuracy extractions (>90%) for automatic processing while sending ambiguous cases to human validation workspaces.
- **Enrich Layer:** Enrichment services (CAP, Integration Suite) augment extracted data with enterprise context through master data lookups (vendor, material, GL accounts), business rule validation (PO matching, three-way match), and external system calls (exchange rates, tax validation). Transforms raw AI output into ERP-ready payloads. See [Data Extraction and Enrichment Patterns](app://obsidian.md/2-enrichment/readme.md).
- **Post Layer:** Integration services post validated documents to SAP S/4HANA, Business ByDesign, and third-party systems using CAP services for lightweight scenarios, Integration Suite for complex orchestration, Build Process Automation for approval workflows, or direct APIs for point-to-point connections. See [Document Posting and System Integration Patterns](app://obsidian.md/3-posting/readme.md).

## Flow

The reference architecture demonstrates how documents flow from capture through AI extraction to system posting:

1. **Document Capture** - Documents arrive through native SAP Document AI channels (web UI, Outlook 365 email, SAP Mobile Start) or via REST API calls from external systems. Optional pre-processing middleware intercepts documents for format conversion (TIFF to PDF), document splitting, preliminary classification, and metadata enrichment before submission to Document AI.
2. **AI Classification and Extraction** - SAP Document AI classifies the document type (invoice, purchase order, delivery note, custom document) and selects the appropriate extraction schema. Generative AI models extract structured data with field-level confidence scores: HIGH (>90%), MEDIUM (60-90%), LOW (<60%). Schema configuration includes custom field definitions, processing instructions, and validation rules.
3. **Confidence-Based Routing** - Documents with all critical fields above threshold (typically 90%) proceed automatically to enrichment. Low-confidence extractions route to human validation workspace where users review, correct, and approve. User corrections feed back to improve model accuracy.
4. **Enrichment and validation** - Enrichment services receive extraction results via HTTP webhook notification. Services perform lookups against SAP S/4HANA master data (vendor master via A_BusinessPartner OData API, material master via A_Product, GL account via A_GLAccountInChartOfAccounts), validate business rules (PO existence checks, three-way matching), and enrich with external data (currency exchange rates, tax rates).
5. **System Posting** - Integration services post documents to target systems: CAP services call S/4HANA OData APIs (A_SupplierInvoice, A_SalesOrder), Integration Suite converts to IDoc format (INVOIC02, ORDERS05) for on-premise systems via Cloud Connector, Build Process Automation orchestrates approval workflows before posting, or direct REST API calls for third-party systems.

## Characteristics

An intelligent document processing architecture with SAP Document AI can be characterized as follows:

- **AI-powered extraction**: Generative AI models extract structured attributes from unstructured documents with 85-95% accuracy, reducing manual data entry.
- **Multi-channel intake**: Documents enter from email, mobile apps, APIs, or web upload, providing flexibility for diverse business processes.
- **Confidence-based routing**: Automated confidence scoring enables straight-through processing for high-confidence documents while routing ambiguous cases to human review.
- **Extensible enrichment**: HTTP notification hooks enable custom post-processing logic for master data lookups, business rule validation, and system-specific transformations.
- **Hybrid integration**: Support for multiple integration technologies (CAP, Integration Suite, Build Process Automation) accommodates varying complexity and governance requirements.
- **Human-in-the-loop**: Built-in validation workspace allows users to review and correct extractions, with corrections feeding back to improve AI model accuracy.

## Examples in an SAP context

SAP Document AI enables automation across diverse document processing scenarios:

- [**Invoice processing in SAP Ariba Central Invoice Management**](https://www.sap.com/products/spend-management/ariba-invoicing.html): Centralize invoice processing with SAP Business Network, available on SAP Business Technology Platform for SAP S/4HANA Cloud Public Edition.
- [**Sales order automation in SAP S/4HANA Cloud**](https://help.sap.com/docs/SAP_S4HANA_CLOUD/a376cd9ea00d476b96f18dea1247e6a5/2dcf49a616b842b096e0a3cad4dac458.html?locale=en-US): Speed up order completion, reduce redundant tasks, and lower the risk of human errors to avoid delays in sales order deliveries.
- [**Automatic receipt processing in SAP Concur ExpenseIt**](https://www.concur.com/products/expenseit): Capture receipts, extract information, and analyze images with on-device machine learning (ML) models to boost productivity and audit efficiency.
- [**Automatic quality certificate processing in SAP S/4HANA Cloud Public Edition**](https://www.sap.com/products/erp/s4hana-cloud-public-edition-processing-of-incoming-quality-certificates-with-sap-document-ai.html): Save 70% of time processing quality certificates.* Fast, automatic processing improves productivity and reduces production losses.

## Examples

Take a look at the following examples that build upon or implement elements of this reference architecture:

- **CAP Enrichment Service** (TODO: Add GitHub repo URL) - Cloud Application Programming Model service demonstrating master data lookup, business rule validation, and data transformation for extracted document data.
- **CAP Posting Service** (TODO: Add GitHub repo URL) - CAP service showing OData API integration patterns for posting invoices and sales orders to SAP S/4HANA Cloud.
- **Build Process Automation Approval Workflow** (TODO: Add GitHub repo URL) - SBPA process template for document approval workflows with configurable routing rules and exception handling.

## Services and Components

- [SAP Document AI](https://discovery-center.cloud.sap/serviceCatalog/sap-document-ai) - AI-powered document classification and extraction
- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/guides/) - Lightweight enrichment and post-processing services
- [SAP Cloud Integration](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) - Complex transformations and protocol conversions
- [SAP Build Process Automation](https://discovery-center.cloud.sap/serviceCatalog/sap-build-process-automation) - Workflow orchestration and approval processes
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) - Application runtime environment
- [SAP S/4HANA](https://www.sap.com/products/erp/s4hana-private-edition.html) - Target system for document posting
- [SAP S/4HANA Cloud](https://www.sap.com/products/erp/s4hana.html) - Target system for document posting

## Resources

- [SAP Document AI Documentation](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [SAP Discovery Center - Document AI](https://discovery-center.cloud.sap/serviceCatalog/document-information-extraction)
- [Cloud Application Programming Model](https://cap.cloud.sap/docs/)
- [SAP Cloud Integration Documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)
- [SAP Build Process Automation Documentation](https://help.sap.com/docs/build-process-automation)

## Related Missions

- [Get Started with Document AI and Generative AI](https://discovery-center.cloud.sap/missiondetail/4422/4708/)
- [Facilitate Invoice Validation - Leveraging SAP Document AI](https://discovery-center.cloud.sap/missiondetail/4464/4750/)

