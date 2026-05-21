---
id: id-ra0030-2
slug: /ref-arch/LcR6Senh/2
sidebar_position: 30
title: 'Data Extraction and Enrichment Patterns for SAP Document AI'
description: 'Design intelligent extraction architectures with schema configuration, confidence scoring,  master data enrichment, and business rule validation for enterprise document processing.'
keywords: 
  - appdev
  - genai
sidebar_label: 'Data Extraction and Enrichment Patterns for SAP Document AI'
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

Extracting structured data from unstructured documents is only the first step in intelligent document processing. The enrichment layer transforms raw extraction output into business-ready information by validating data against master records, applying business rules, and augmenting with enterprise context. This two-phase approach—extraction followed by enrichment—enables high-accuracy automation while maintaining flexibility for organization-specific business logic.

## Architecture

The extraction and enrichment architecture separates AI-powered data capture from business-specific validation and augmentation:

![drawio](drawio/extraction-enrichment-architecture.drawio)

## Flow

The reference architecture demonstrates how extracted data progresses to ERP-ready payloads:

1. **Intelligent Processing**:
  - **Document classification**: SAP Document AI receives a document and classifies it using multi-model LLM models. The classification engine identifies the document type (invoice, purchase order, delivery note, custom document) and selects the appropriate extraction schema. 
  - **LLM-powered extraction**: The extraction engine applies the selected schema to retrieve structured data from the document. SAP provides more than 30 schemas for different documents, and custom schemas can cover any other scenario. LLM models will extract the data, with confidence scores for each field. Processing instructions embedded in the schema guide the model to handle ambiguous cases and organization-specific terminology.

2. **Master Data Enrichment** - SAP Document AI [provides master data enrichment capabilities](https://help.sap.com/docs/document-ai/sap-document-ai/enrichment-data-api) without any custom code. For custom enrichment and validations, use outbound channels to trigger a CAP application on Cloud Foundry or an Integration Suite flow. These services can update the extraction with the new information.

3. **Confidence-Based Routing** - Each extracted field includes a confidence score (0-100%). Documents with all fields above the configured threshold (typically 90% for critical fields) proceed automatically. Documents with low-confidence will await for human validation. In Document AI's workspace, users can review and correct extractions. These user corrections feed back to improve AI model accuracy over time.

4. **Human in the loop**: Low confidence documents and documents that need additional approvals are managed within Document AI workspace. Users review the document and the extractions side by side. Their corrections improve future extractions.

## Characteristics

An effective extraction and enrichment architecture exhibits these characteristics:

- **Vision extraction**: Generative AI models understand document structure and semantics, not just text positions, achieving 85-95% extraction accuracy across document variations.
- **Schema-driven processing**: Pre-built content schemas for common document types (invoices, POs) and custom schemas for organization-specific documents define what data to extract and how to validate it.
- **Extensible enrichment**: HTTP notification hooks enable custom logic for enrichment and organization-specific business rules and integration with enterprise systems.
- **Confidence-based automation**: Automated confidence scoring enables straight-through processing for high-confidence documents (70-80% of volume) while routing ambiguous cases to human review.
- **Human-in-the-loop**: Built-in validation workspace allows users to review and correct low-confidence extractions, with corrections improving future AI accuracy.

## Examples in an SAP context

SAP Document AI extraction and enrichment patterns enable diverse automation scenarios:

- **Invoice Three-Way Match Validation** - Document AI extracts supplier invoice header (invoice number, date, vendor ID, total amount) and line items (material, quantity, unit price) with confidence scores. Enrichment service receives the extraction via HTTP notification, looks up vendor master data (payment terms, bank account, tax classification) from S/4HANA, retrieves the referenced purchase order to validate line item materials and prices, fetches the corresponding goods receipt to confirm quantities received, performs three-way matching logic (invoice quantity ≤ goods receipt quantity ≤ PO quantity, invoice amount within ±5% tolerance), validates tax calculations based on vendor tax jurisdiction, and updates Document AI with enrichment results (matched PO number, GR document, validation status). High-confidence matched invoices auto-confirm; mismatches or low-confidence extractions route to human review.

- **Customer Purchase Order Material Validation** - Document AI extracts customer PO fields (customer PO number, order date, buyer information, shipping address, line item materials, quantities, requested delivery dates). Enrichment service matches extracted buyer company name and address against customer master in S/4HANA to resolve customer ID, validates each extracted material number against the product catalog (including customer-specific material cross-references like "CustPartA123" → "MATNR-456"), retrieves current pricing agreements for the customer, performs ATP (Available-to-Promise) check to calculate realistic delivery dates, and enriches the extraction with resolved customer ID, internal material numbers, agreed prices, and available delivery dates. Materials not found in catalog or unavailable items get flagged for manual sales review.

- **Healthcare Document Extraction with Compliance Validation** - Document AI extracts patient intake forms using a custom schema (patient ID, diagnosis codes, procedure codes, insurance provider, policy number). Enrichment service validates extracted patient ID against patient master system to confirm patient exists and demographics match, looks up insurance coverage details and authorization status from insurance system, validates diagnosis codes against ICD-10 standard to ensure extracted codes are valid and current, cross-checks procedure codes against the patient's approved treatment plan to ensure medical necessity, and calculates expected reimbursement amounts based on insurance coverage rates. Enriched extraction includes validated patient demographics, insurance verification status, code validation results, and reimbursement estimates. Missing or invalid insurance authorization triggers exception handling workflow.

## Services and Components

- [SAP Document AI](https://discovery-center.cloud.sap/serviceCatalog/document-information-extraction) - AI-powered extraction and classification <!-- dc-svc-metadata: {"isPrimary": "true"} dc-svc-metadata -->
- [SAP Cloud Application Programming Model (CAP)](https://discovery-center.cloud.sap/serviceCatalog/cloud-application-programming-model) - Enrichment service development
- [SAP Cloud Integration](https://discovery-center.cloud.sap/serviceCatalog/integration-suite) - Master data lookups and transformation logic
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime) - Enrichment service hosting
- [SAP S/4HANA](https://discovery-center.cloud.sap/serviceCatalog/sap-s4hana) - Master data source (vendor, material, customer master)
- [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud) - Caching master data for performance optimization

## Resources

- [SAP Document AI Documentation](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [Schema Configuration Guide](https://help.sap.com/docs/SAP_DOCUMENT_AI)
- [Cloud Application Programming Model Documentation](https://cap.cloud.sap/docs/)
- [SAP Cloud Integration Documentation](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)
- [SAP S/4HANA OData APIs](https://api.sap.com/products/SAPS4HANACloud/overview)
