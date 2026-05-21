---
id: id-ra0030-1
slug: /ref-arch/LcR6Senh/1
sidebar_position: 30
title: 'Document Ingestion Patterns for SAP Document AI'
description: 'Design flexible document intake architectures supporting email, API, mobile capture,  and enterprise system integration for intelligent document processing.'
keywords: 
  - appdev
  - genai
sidebar_label: 'Document Ingestion Patterns for SAP Document AI'
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

Business documents arrive through diverse channels. Emails, but also faxes, chats in messaging apps, ftp servers... The document ingestion accommodates these varied sources while ensuring auditability and reliable delivery to SAP Document AI for processing. The ingestion layer serves as the entry point, responsible for document capture, optional pre-processing, and submission to the AI extraction service.

## Architecture

The document ingestion architecture supports multiple intake channels with optional pre-processing and routing logic:

![drawio](drawio/document-ingestion-architecture.drawio)

## Flow

The reference architecture demonstrates how documents from various sources reach SAP Document AI:

1. **Native Intake Channels**: SAP Document AI provides out-of-the-box ingestion capabilities through its web UI (manual upload), Microsoft Outlook 365 email integration (automated inbox monitoring), and SAP Joule Work mobile app integration (mobile photo capture with metadata). These channels require minimal configuration and provide immediate document processing capabilities.

2. **API-Based Integration**: For document sources that are not supported out of the box, or to support complex routing and transformation scenarios, the API can be used to upload documents:
  - SAP Integration Suite: Leverage the adapters and enterprise-grade flows to bring documents from different sources
  - SAP Cloud Application Programming (CAP) model application: Keep track on the documents processed and offer custom UIs using databases and Fiori Elements

## Characteristics

A flexible document ingestion architecture exhibits these characteristics:

- **Multi-channel support**: Fetch the the documents wherever they are: mail, fax, mobile, chat, Joule, FTP...
- **Format agnostic**: Document AI supports many formats out of the box: documents, images, email body, excel...
- **Pre-processing flexibility**: Use custom middleware for complex custom logic: filtering, routing...
- **Scalability**: Handle variable document volumes with auto-scaling Cloud Foundry applications or serverless integration flows.

## Examples in an SAP context

SAP Document AI ingestion patterns support diverse document capture scenarios:

- **Email-Based Supplier Invoice Intake** - Configure Microsoft Outlook 365 integration to monitor dedicated email addresses (ap@company.com, invoices@company.com). Suppliers send invoices as email attachments or inline PDF. Document AI automatically extracts attachments, classifies them, and initiates extraction without manual upload. Email metadata (sender, subject, timestamp) becomes audit trail attributes.

- **Mobile Expense Receipt Capture** - Field employees photograph receipts using SAP Joule Work mobile app after meals or purchases. The app uploads images directly to Document AI with employee metadata (employee ID, cost center, business trip ID). Receipts process immediately without manual submission to expense system, reducing reimbursement cycle time.

- **EDI-to-Document AI Bridge** - An Integration Suite flow receives inbound EDI 810 (invoice) or 850 (purchase order) messages from trading partner networks, converts EDI segments to human-readable PDF format for compliance and archival, uploads the PDF to Document AI with EDI data as pre-extraction metadata, and Document AI validates the EDI payload structure and enriches with master data lookups. This hybrid approach maintains EDI automation benefits while enabling human review and document archive requirements.

- **SAP Ariba Network Invoice Forwarding** - Suppliers submit invoices through Ariba Network. A CAP service subscribes to Ariba Network invoice events, retrieves invoice PDF and structured data via Ariba API, uploads to Document AI for extraction (leveraging AI to catch discrepancies in supplier-entered data), and enriches with S/4HANA master data before posting. This provides additional validation layer beyond Ariba's built-in checks.

## Services and Components

- [SAP Document AI](https://discovery-center.cloud.sap/serviceCatalog/sap-document-ai) - AI-powered document classification and extraction 
- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/guides/) - Lightweight enrichment and post-processing services
- [SAP Cloud Integration](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) - Complex transformations and protocol conversions
- [SAP Joule Work mobile app](https://www.sap.com/products/mobile/mobile-start.html) - Mobile document capture
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) - Application runtime environment

## Resources

- [SAP Document AI Documentation](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [Document AI REST API Reference](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [SAP Cloud Integration Documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)
- [SAP Mobile Start Documentation](https://help.sap.com/docs/SAP_MOBILE_START)
- [SAP Cloud Connector Setup Guide](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/cloud-connector)