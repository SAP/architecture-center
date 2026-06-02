---
id: id-ra0030-0
slug: /ref-arch/LcR6Senh/0
sidebar_position: 0
title: 'Document Processing with SAP Document AI'
description: 'Architect end-to-end document processing solutions using SAP Document AI to automate  extraction, validation, and posting of business documents to enterprise systems.'
keywords: 
  - appdev
  - genai
sidebar_label: 'Document Processing with SAP Document AI'
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
  date: 2026-06-03
  author: pirnz-sap
---
 
Enterprises process vast volumes of business documents daily—invoices, purchase orders, receipts, delivery notes—often requiring manual data entry into enterprise systems. Document processing (IDP) transforms this operational burden by leveraging AI to automatically extract, validate, and route document data to systems of record. SAP Document AI provides pre-trained models and generative AI capabilities to automate document processing, enabling organizations to reduce manual effort, accelerate cycle times, and improve data accuracy.

This reference architecture provides comprehensive guidance for designing and implementing, IDP solutions with SAP Document AI. From multi-channel document ingestion to AI-powered extraction, master data enrichment, and external system integrations, this guide covers architectural patterns, service selection criteria, and best practices for building document processing pipelines.

## Architecture

An end-to-end document processing solution with SAP Document AI follows a three-layer architecture pattern separating document intake, extraction and enrichment, and posting:

![Overview of scenario](drawio/idp-architecture-overview.drawio)

The architecture centers around **SAP Document AI** as the core extraction engine and user interface, with optional enrichment and integration services on **SAP BTP**:

## Flow

The reference architecture demonstrates how documents flow from capture through AI extraction to system posting:

1. **Ingestion Layer:** For automatic processing, use SAP Document AI inbound channels for Outlook and Sharepoint. For manual uploads, SAP Document AI covers desktop and mobile scenarios with the Document AI workspace UI and Joule Work mobile app. Optional pre-processing middleware handles other document channels (fax, messaging apps, ...) and complex pre-processing or routing requirements. See [Document Ingestion Patterns](../1-ingestion/readme.md).
2. **Extraction and enrichment Layer:** Classify and extract the document. Enrichment scenarios you can make use of Integration Suite flows or a CAP application to augment extracted data. See [Data Extraction and Enrichment Patterns](../2-enrichment/readme.md).
  - **AI Classification and Extraction**: Using SAP Document AI workflows, documents are split, classified and extracted with the right schema
  - **Enrichment and validation**: Document AI provides enrichment capabilities for business objects. For custom enrichment scenarios you can make use of SAP Document AI outbound notifications and Integration Suite flows or a CAP application to augment extracted data.
  - **Confidence-Based auto-confirm**: Documents with all critical fields above a threshold (typically 90%) can be automatically confirmed to push them to the next step.
  - **Human in the loop**: Users review and confirm low confidence documents within SAP Document AI workspace
3. **Posting Layer:** Use outbound notifications to post the results to external systems. See [Document Posting and System Integration Patterns](../3-posting/readme.md).

## Characteristics

An document processing architecture with SAP Document AI can be characterized as follows:

- **AI-powered extraction**: Generative AI models extract structured attributes from unstructured documents with 85-95% accuracy, reducing manual data entry.
- **Multi-channel intake**: Documents enter from email, mobile apps, APIs, or web upload, providing flexibility for diverse business processes.
- **Confidence-based routing**: Automated confidence scoring enables straight-through processing for high-confidence documents while routing ambiguous cases to human review.
- **Extensible enrichment**: HTTP notification hooks enable custom post-processing logic for master data lookups, business rule validation, and system-specific transformations.
- **Hybrid integration**: Support for multiple integration technologies (CAP, Integration Suite, Build Process Automation) accommodates varying complexity and governance requirements.
- **Human-in-the-loop**: Built-in validation workspace allows users to review and correct extractions, with corrections feeding back to improve AI model accuracy.

## Examples in an SAP context

SAP Document AI enables automation across diverse document processing scenarios:

- **[Invoice processing in SAP Ariba Central Invoice Management](https://www.sap.com/products/spend-management/ariba-invoicing.html)**: Centralize invoice processing with SAP Business Network, available on SAP Business Technology Platform for SAP S/4HANA Cloud Public Edition.
- **[Sales order automation in SAP S/4HANA Cloud](https://help.sap.com/docs/SAP_S4HANA_CLOUD/a376cd9ea00d476b96f18dea1247e6a5/2dcf49a616b842b096e0a3cad4dac458.html?locale=en-US)**: Speed up order completion, reduce redundant tasks, and lower the risk of human errors to avoid delays in sales order deliveries.
- **[Automatic receipt processing in SAP Concur ExpenseIt](https://www.concur.com/products/expenseit)**: Capture receipts, extract information, and analyze images with on-device machine learning (ML) models to boost productivity and audit efficiency.
- **[Automatic quality certificate processing in SAP S/4HANA Cloud Public Edition](https://www.sap.com/products/erp/s4hana-cloud-public-edition-processing-of-incoming-quality-certificates-with-sap-document-ai.html)**: Save 70% of time processing quality certificates.* Fast, automatic processing improves productivity and reduces production losses.


## Services and Components

- [SAP Document AI](https://discovery-center.cloud.sap/serviceCatalog/sap-document-ai) - AI-powered document classification and extraction 
- [SAP Cloud Integration](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) - Complex transformations and protocol conversions
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) - Application runtime environment
- [SAP S/4HANA](https://www.sap.com/products/erp/s4hana-private-edition.html) - Target system for document posting
- [SAP S/4HANA Cloud](https://www.sap.com/products/erp/s4hana.html) - Target system for document posting

## Resources

- [SAP Document AI Documentation](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [Cloud Application Programming Model](https://cap.cloud.sap/docs/)
- [SAP Cloud Integration Documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)

## Related Missions

- [Get Started with Document AI and Generative AI](https://discovery-center.cloud.sap/missiondetail/4422/4708/)
- [Facilitate Invoice Validation - Leveraging SAP Document AI](https://discovery-center.cloud.sap/missiondetail/4464/4750/)
