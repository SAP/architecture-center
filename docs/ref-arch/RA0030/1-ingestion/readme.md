---
id: id-ra0030-1
slug: /ref-arch/LcR6Senh/1
sidebar_position: 1
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
  date: 2026-06-03
  author: pirnz-sap
---

Business documents arrive through diverse channels. Emails, but also faxes, chats in messaging apps, ftp servers... The document ingestion accommodates these varied sources while ensuring auditability and reliable delivery to SAP Document AI for processing. The ingestion layer serves as the entry point, responsible for document capture, optional pre-processing, and submission to the AI extraction service.

## Architecture

The document ingestion architecture supports multiple intake channels with optional pre-processing and routing logic:

![drawio](drawio/document-ingestion-architecture.drawio)

## Flow

The reference architecture demonstrates how documents from various sources reach SAP Document AI:

1. **Native Intake Channels**: SAP Document AI provides out-of-the-box ingestion capabilities. These channels require minimal configuration and provide immediate document processing capabilities.
  - **[Inbound Channels](https://help.sap.com/docs/document-ai/sap-document-ai/create-inbound-channel)**: Connect directly to Outlook inboxes and Sharepoint folders to automatically process items as they arrive
  - **[SAP Document AI workspace UI](https://help.sap.com/docs/document-ai/sap-document-ai/upload-new-documents)**: Upload one or multiple documents to process directly in SAP Document AI
  - **[Mobile integration](https://help.sap.com/docs/joule-work-mobile/administration-guide-sap-build-work-zone-setup/sap-document-ai)**: SAP Joule Work mobile app allow users to take pictures of the documents to process them

2. **[API-Based Integration](https://api.sap.com/api/document_information_extraction_api_v2/path/FileService_uploadFile)**: For document sources that are not supported out of the box, or to support complex routing and transformation scenarios, the API can be used to upload documents:
  - SAP Integration Suite: Leverage the adapters and enterprise-grade flows to bring documents from different sources
  - SAP Cloud Application Programming (CAP) model application: Keep track on the documents processed and offer custom UIs using databases and Fiori Elements

## Examples in an SAP context

- **Email-based supplier invoice intake** - Suppliers send invoices to dedicated email addresses (ap@company.com). Document AI monitors the Outlook 365 inbox, extracts PDF attachments, and starts processing automatically. Email metadata (sender, timestamp) provides audit trail.

- **Mobile expense receipt capture** - Field employees photograph receipts using SAP Joule Work mobile app. The app uploads images to Document AI with employee metadata (employee ID, cost center), enabling immediate processing without manual data entry.

- **EDI-to-Document AI validation** - Integration Suite flow receives EDI 810 (invoice) or 850 (purchase order) messages from trading partners, converts them to PDF for archival compliance, and uploads to Document AI. The AI validates EDI payload structure and enriches with S/4HANA master data, combining EDI automation with human-reviewable document archives.

- **Ariba Network invoice validation** - A CAP service subscribes to Ariba invoice events, retrieves invoice PDFs via Ariba API, and uploads to Document AI. The AI catches discrepancies between supplier-entered data and S/4HANA master data before posting, adding a validation layer beyond Ariba's built-in checks.

## Services and Components

- [SAP Document AI](https://discovery-center.cloud.sap/serviceCatalog/sap-document-ai) - AI-powered document classification and extraction 
- [SAP Cloud Integration](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) - Complex transformations and protocol conversions
- [SAP Joule Work mobile app](https://www.sap.com/products/mobile/mobile-start.html) - Mobile document capture
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) - Application runtime environment

## Resources

- [SAP Document AI Documentation](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [Document AI OData API Reference](https://api.sap.com/api/document_information_extraction_api_v2/overview)
- [SAP Cloud Integration Documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)
- [Joule Work Mobile App Documentation](https://help.sap.com/docs/JOULE_WORK_MOBILE)
- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/guides/)