---
id: id-ra0030
slug: /ref-arch/LcR6Senh
sidebar_position: 30
title: 'SAP Document AI'
description: 'Reference Architecture for SAP Document AI.'
keywords: 
  - aws
  - azure
  - gcp
  - genai
  - cap
sidebar_label: 'SAP Document AI'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - aws
  - azure
  - gcp
  - genai
  - cap
contributors:
  - ChrisLenschow
last_update:
  date: 2026-06-03
  author: ChrisLenschow
---

SAP Document AI helps applications turn unstructured business documents — invoices, purchase orders, remittance advices, delivery notes, contracts, and custom forms — into structured, validated data that downstream SAP and non-SAP processes can consume. It combines OCR, pretrained and customer-trained extraction models, and LLM-based reasoning into a managed service on SAP Business Technology Platform (SAP BTP).

This Reference Architecture shows how SAP Document AI is composed on SAP BTP: a multi-tenant application exposing REST/OData APIs, a document processing and ML extraction pipeline, integration with [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core?region=all) and the [Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core) for LLM-backed extraction, and managed persistence in [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud), PostgreSQL, and an object store. It also illustrates how Document AI integrates into a customer landscape via SAP Cloud Identity Services, the Connectivity and Destination services, and SAP cloud, on-premise, and third-party systems.

## Architecture

![drawio](drawio/diagram-GIBKZD5oRo.drawio)



## Flow

1. **End users** interact with SAP Document AI through the **SAP Fiori UI** on desktop or mobile, or programmatically through the service's **REST / OData APIs**. Authentication is delegated to **SAP Cloud Identity Services** (Identity Authentication, Identity Directory, Identity Provisioning) using SAML 2.0 / OIDC, with optional federation to a customer or third-party Identity Provider.

2. **Authorization Management** inside the Document AI application enforces tenant- and role-scoped access to documents, schemas, models, and processing jobs.

3. **Document Processing & Ingestion** accepts uploads from the UI or APIs, orchestrates OCR, applies the configured extraction schema, and routes documents through the configured channels.

4. The **ML Extraction pipeline** runs OCR, prediction, key–value extraction, and matching. Pretrained models cover common document types; customer-specific schemas can be created and versioned. For extraction steps that benefit from generative AI, the pipeline calls into **SAP AI Core** and the **Generative AI Hub**, using LLMs together with the **Prompt Registry** and pretrained models.

5. **Workflow & Orchestration** coordinates processing pipelines, scheduling, and job execution across documents and tenants.

6. **Persistence** is split by data shape:
   - **SAP HANA Cloud** — tenant-isolated metadata and structured extraction results (HANA-native tenancy).
   - **PostgreSQL** — application/operational data with per-schema tenant isolation.
   - **Object Store** — original document files and intermediate artifacts (KMS-encrypted).

7. **Configuration & Model Management** handles client configuration, Custom Scripts and transport of content between instances (for example, dev → test → prod).

8. **Operations & Metering** covers usage metering, audit logging, and autoscaling of the service components.

9. Outbound integration to customer systems uses the **SAP Connectivity service** and **SAP Destination service**. SAP Document AI can push extracted data into **SAP Cloud Solutions** (e.g., SAP S/4HANA Cloud), **SAP On-Premise Solutions** (SAP ECC, SAP S/4HANA via SAP Cloud Connector), and **third-party APIs and applications**.

10. An **API Gateway** in front of the application exposes the public service endpoints and applies cross-cutting concerns such as rate limiting and request routing.

## Characteristics

- **Multi-tenant by design**: tenant isolation is enforced at the persistence layer — HANA-native tenants for structured extraction results and metadata, per-schema isolation in PostgreSQL for application/operational data, and KMS-encrypted object storage for original document files. Each tenant's data stays logically separated across the full processing pipeline.
  
- **Composable with Generative AI Hub**: pretrained extraction models can be combined with LLM-based reasoning via SAP AI Core, allowing the same pipeline to handle structured forms (invoices, purchase orders, remittance advices) and free-form documents (contracts, correspondence). The Prompt Registry in Generative AI Hub manages prompt lifecycles for LLM-augmented extraction steps, so prompt updates can be rolled out without changing application code.
  
- **Schema-driven extraction**: customers define document schemas — header fields, line items, classification labels. Schemas and model versions are first-class artifacts: they are versioned, can be activated or rolled back independently, and are transportable across instances (for example, dev → test → prod) through Configuration & Model Management.
  
- **Pretrained models for common document types**: out-of-the-box models cover frequently occurring business documents, letting customers start extracting value before investing in custom training.

- **Instant Learning through document confirmation**: the service improves continuously as users confirm or correct extraction results in the UI. Each confirmed document feeds back into the service and refines extraction quality for subsequent documents — without requiring an explicit model training cycle. This shortens the path from first upload to reliable extraction and lets the service adapt to new document layouts and vendor variants in day-to-day operation.
  
- **Open APIs**: REST / OData endpoints make Document AI callable from CAP-based services, side-by-side extensions, RPA flows, and third-party applications. The same APIs back the Fiori UI and programmatic clients, so anything visible in the UI is also automatable.

- **Enterprise integration**: integrates into SAP and non-SAP landscapes through the Destination service and Connectivity service, with SAP Cloud Connector providing secure reach into on-premise systems such as SAP ECC and SAP S/4HANA. Outbound results can be pushed into SAP cloud solutions, on-premise systems, or third-party APIs through the same channels.

- **Identity federation through SAP Cloud Identity Services**: authentication is delegated to Identity Authentication (IAS), with optional federation to a customer or third-party Identity Provider via SAML 2.0 / OIDC. Identity Provisioning (IPS) keeps user and role assignments in sync with the customer's identity source, so access decisions made in Document AI's Authorization Management reflect the customer's central identity governance.

- **Operational transparency**: usage metering, audit logging, and autoscaling are built into the service. Metering supports cost attribution per tenant or document type; audit logs support compliance review of who accessed which document and which model produced which extraction result.

- **Hyperscaler-agnostic deployment**: the service runs on SAP BTP across the supported hyperscaler regions (AWS, Azure, GCP), inheriting the platform's data-residency and certification footprint so customers can align Document AI with their existing BTP region strategy.

## Examples in an SAP context

- **Invoice automation**: extract header and line-item data from supplier invoices and post them into SAP S/4HANA Cloud.
- **Sales order intake**: classify inbound order documents, extract structured order data, and hand off to order management.
- **Logistics documents**: process delivery notes and customs paperwork to feed transportation management.
- **Contract and form processing**: combine pretrained extraction with LLM reasoning for clause-level review on long-form documents.

## Scenarios

Continue exploring the subsections to learn how to design a solution that will automatically ingest, extract and post documents with SAP Document AI.

## Services and Components

- [SAP Document AI](https://discovery-center.cloud.sap/serviceCatalog/sap-document-ai/?region=all)
- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core?region=all)
- [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud?region=all)
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime?region=all)
- [SAP BTP, Kyma runtime](https://discovery-center.cloud.sap/serviceCatalog/kyma-runtime/?region=all)
- [SAP Authorization and Trust Management Service](https://discovery-center.cloud.sap/serviceCatalog/authorization-and-trust-management-service?region=all)
- [SAP Cloud Identity Services - Identity Provisioning](https://discovery-center.cloud.sap/serviceCatalog/identity-provisioning?region=all)
- [SAP Connectivity service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all)
- [SAP Destination service](https://discovery-center.cloud.sap/serviceCatalog/destination-service?region=all)

## Resources

- SAP Help Portal
    - [SAP Document AI (SAP Help Portal)](https://help.sap.com/docs/document-ai)
    - [Generative AI Hub in SAP AI Core (SAP Help Portal)](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core)



