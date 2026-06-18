---
id: b2b40e
slug: /ref-arch/b2b40e
sidebar_position: 2
title: Data Extraction and Enrichment Patterns for SAP Document AI
description: >-
  Design intelligent extraction architectures with schema configuration,
  confidence scoring,  master data enrichment, and business rule validation for
  enterprise document processing.
keywords:
  - appdev
  - genai
sidebar_label: Data Extraction and Enrichment Patterns for SAP Document AI
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

Extracting structured data from unstructured documents is only the first step in intelligent document processing. The enrichment layer transforms raw extraction output into business-ready information by validating data against master records and applying business rules. This approach, extraction followed by enrichment, enables high-accuracy automation while having flexibility for specific business logic.

## Architecture

![drawio](drawio/extraction-enrichment-architecture.drawio)

## Flow

The reference architecture demonstrates how extracted data progresses to ERP-ready payloads:

1. **Intelligent Processing**: Using [SAP Document AI workflows](https://help.sap.com/docs/document-ai/sap-document-ai/workflows), documents are filtered and routed to be extracted using the right schema.
  - **File processing**: Attachments are extracted from mails, documents are split as needed, conditions and custom scripts provide filtering and routing 
  - **[Document classification](https://help.sap.com/docs/document-ai/sap-document-ai/configure-schema-for-classifying-documents-by-type)**: SAP Document AI can do more than just extracting text. Classify document by type or by any other attribute by creating a custom classifier schema with prompted instructions.
  - **LLM-powered extraction**: The extraction engine applies the [selected schema](https://help.sap.com/docs/document-ai/sap-document-ai/schemas) to retrieve structured data from the document. SAP provides more than [30 schemas for different documents](https://help.sap.com/docs/document-ai/sap-document-ai/supported-document-types-embedded-edition-and-premium-edition), and custom schemas can cover any other scenario. LLM models will extract the data, with confidence scores for each field. Processing instructions embedded in the schema guide the model to handle ambiguous cases and organization-specific terminology.

2. **Master Data Enrichment** - SAP Document AI [provides master data enrichment capabilities](https://help.sap.com/docs/document-ai/sap-document-ai/enrichment-data-api) without any custom code. For custom enrichment and validations, use [outbound channels](https://help.sap.com/docs/document-ai/sap-document-ai/outbound-channels) to trigger a CAP application on Cloud Foundry or an Integration Suite flow. These services can update the extraction with the new information.

3. **[Confidence-Based Routing](https://help.sap.com/docs/document-ai/sap-document-ai/automation)** - Documents will go through different [statuses](https://help.sap.com/docs/document-ai/sap-document-ai/document-statuses). Each extracted field includes a confidence score (0-100%). Documents with all fields above the configured threshold (typically 90% for critical fields) proceed automatically. Documents with low-confidence will await for human validation.

4. **[Human in the loop](https://help.sap.com/docs/document-ai/sap-document-ai/view-and-edit-documents-needing-review)**: Low confidence documents and documents that need additional approvals are managed within Document AI workspace. Users review the document and the extractions side by side. Their corrections improve future extractions.

## Examples in an SAP context

- **Invoice three-way match validation** - Document AI extracts invoice header and line items. An enrichment service looks up the referenced purchase order and goods receipt from S/4HANA, performs three-way matching (quantity and price tolerances), and validates tax calculations. High-confidence matched invoices auto-confirm for posting; mismatches route to accounts payable for review.

- **Customer purchase order material validation** - Document AI extracts customer PO fields including material numbers. The enrichment service resolves customer-specific material codes (e.g., "CustPartA123" → internal "MATNR-456") against S/4HANA product catalog, retrieves pricing agreements, and performs ATP (Available-to-Promise) checks. Materials not found or out of stock get flagged for sales team review.

- **Healthcare intake form with compliance validation** - Document AI extracts patient intake forms (patient ID, diagnosis codes, procedure codes, insurance details). Enrichment service validates patient ID against master data, verifies insurance authorization status, validates ICD-10 diagnosis codes, and cross-checks procedure codes against approved treatment plan. Missing insurance authorization triggers exception workflow before processing.

## Services and Components

- [SAP Document AI](https://discovery-center.cloud.sap/serviceCatalog/sap-document-ai) - AI-powered extraction and classification <!-- dc-svc-metadata: {"isPrimary": "true"} dc-svc-metadata -->
- [SAP Cloud Integration](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) - Master data lookups and transformation logic
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) - Enrichment service hosting
- [SAP S/4HANA](https://www.sap.com/products/erp/s4hana-private-edition.html) - Target system for document posting
- [SAP S/4HANA Cloud](https://www.sap.com/products/erp/s4hana.html) - Target system for document posting


## Resources

- [SAP Document AI Documentation](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [Cloud Application Programming Model Documentation](https://cap.cloud.sap/docs/)
- [SAP Cloud Integration Documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)
- [SAP S/4HANA Cloud OData APIs](https://api.sap.com/products/SAPS4HANACloud/overview)
- [SAP S/4HANA Cloud Private Edition APIs](https://api.sap.com/products/SAPS4HANACloudPrivateEdition/apis/all)
