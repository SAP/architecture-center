---
id: id-ra0013-1
slug: /ref-arch/f5b6b597a6/1
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Data Products in SAP Business Data Cloud
description: >-
  Standardize data sharing with SAP Data Products for efficient, high-quality
  metadata and seamless integration.
keywords:
  - sap
  - data products
  - business data cloud solutions
  - metadata quality
  - integration optimization
sidebar_label: Data Products in SAP BDC
image: img/ac-soc-med.png
tags:
  - data
  - aws
  - azure
  - gcp
  - bdc
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - jasoncwluo
  - jmsrpp
  - anbazhagan-uma
  - peterfendt
discussion: 
last_update:
  author: jmsrpp, anbazhagan-uma
  date: 2026-05-30
---

Data Products is the fundamental building block of SAP Business Data Cloud and it serves as a standardized and efficient way to share and consume data across applications and domains. They enable analytic scenarios, AI applications, and facilitate data integration while being optimized for intensive reads. Managed with a product mindset, they are supported by high-quality metadata and governed by decentralized ownership principles.

### Purpose of Data Products

Customers currently face challenges when accessing and using data for various tasks such as building new applications, integrating applications, creating analytical models, designing dashboards, and training AI applications. The process of finding relevant data is difficult due to the lack of consistency and clarity in the APIs that expose data and metadata. The metadata often only describes technical aspects, making it hard for business users to utilize, and some necessary data isn't available via APIs. To improve this, the consistent metadata exposed by Data Products will allow for a landscape-specific Data Product to be directly exposed in every customer landscape. This will be facilitated by the catalog, and will promote ODM compliant Data Products, making it easier to combine data from different applications, and automate scenarios like validation, discovery, and integration.

In SAP, a Data Product is a dataset exposed for consumption outside the boundaries of the producing application via APIs and described by high quality metadata that can be accessed through the Data Product Catalog.
- It is a **business dataset** and consists of one or more business object entities, related objects, analytical data etc
- It is **consumable** via APIs or events.Supported API types are SQL (incl. SQL interface views), Delta Sharing, Event, REST, (oData)
- It is **described** with that is of high quality and provided via Open Resource Discovery (ORD), following ORD schema for Data Product
- Is is **discoverable** via the Data Product Directory that is a service of UCL that aggregates metadata of all Data Products to make them discoverable in a landscape.


### Key Characteristic of Data Product

- **Efficient Data Sharing Across Domains**: Data Products facilitate replication-free integration and consumption by SAP, customer, and partner applications via APIs and Events.

- **Efficient Data Storage**: Data Products are processed and curated in a modern object-store based data lake architecture with highly scalable Spark processing.
      
- **High-Quality Metadata**: Metadata includes business semantics and is accessible through directories like the Data Product Directory and ORD Aggregators, enhancing discoverability.

- **Optimized for Analytics**:Data sets are curated for intensive reads and consumed in a read-only fashion, ensuring efficiency and reliability.

- **Supporting Analytical and AI Applications**: Data Products provide foundational data for dashboards, analytical models, and AI applications.

- **Decentralized Ownership**: Inspired by Data Mesh principles, Data Products are owned and managed by domain experts or teams responsible for operational data.

- **Lifecycle Management**: Data Products undergo needs analysis, design, and delivery phases, ensuring their accuracy and relevance.

### Key Attributes of Data Products

| **Attribute**                | **Description**                                                       |
| ---------------------------- | --------------------------------------------------------------------- |
| **Type**                     | Defines the type (primary, derived).                                  |
| **Category**                 | Categorizes the data set (e.g., business-object, analytical).         |
| **Visibility**               | Specifies exposure (public, internal, private).                       |
| **Input Ports**              | Integration dependencies describing data inputs for lineage purposes. |
| **Output Ports**             | APIs or Events through which the data can be accessed.                |
| **Integration Dependencies** | Relationships with external resources.                                |
| **Responsible**              | Organization/team responsible for lifecycle management.               |


## Types of Data Products

There are two main approaches to implementing data products in SAP:

  - **Primary Data Products:** Expose data directly from source applications (e.g., S/4HANA, SuccessFactors)
  - **Derived Data Products:** Transform and combine data from one or more existing data products

![drawio](drawio/sap-dp.drawio)

A primary data product is directly provided from applications and is not based on other data products representing the original data from a source application.

A derived data product is curated by SAP and derived from other data set(s). They deliver value-add and are based on other data products or APIs. 

[Released Data Products](https://api.sap.com/dataproducts)

[SAP Roadmaps - Business Capability -Data Product Management](
https://roadmaps.sap.com/board?PRODUCT=73555000100800004851&range=CURRENT-LAST&q=data%20product&BC=B9314318771A1EEFBFB783A4FC0A4458#Q2%202025)


### Technical Aspects of Data Products

- Foundation Services facilitate the discovery, extraction, and consumption of SAP-managed Data Products. These services will onboard the different Lines of Business (LoB) applications in SAP.

   - Data pipeline management 
   - Discovery via ORD Protocol - Enables decentralized discoverability of Data Products.
   - Replication to Object Store
   - SAP HANA Cloud Data Lake - Stores data as Data Lake tables, following Delta Sharing principles.Follows Medallion architecture with Bronze, Silver and Gold (optionally) and processing of data via Spark processing framework.
   - File-based Storage

- Core Protocols
   - Open Resource Discovery(ORD)
   - Delta Sharing is an open protocol for sharing data stored in cloud-based Data Lake tables. It enables:
      - Zero-Copy Data Access: No need to move or copy data, ensuring efficient data usage.
      - Central Governance: Controlled access and scalable sharing.
      - Multi-Tool Support: Compatible with tools like Apache Spark and Python.

- Implementation Workflow
   - Provisioning via SAP for Me
   - Connecting source applications
   - Activating Data Products
   - Installing Intelligent Content

- Consumption Tools

   - SAP HANA Cloud: Consumes data products via Delta Sharing protocol, enabling HANA Cloud workloads such as CDS views, calculation views, and CAP applications to leverage governed BDC data without replication.
   - SAP Databricks: Accesses data products directly through Unity Catalog integration for AI/ML and advanced analytics workloads.
   - SAP Analytics Cloud: Consumes data products for visualization, reporting, and planning scenarios.
   - Databricks: Uses Delta Sharing protocol for zero-copy data access in external Databricks environments.
   - Any Delta Sharing Client: Any application supporting the Delta Sharing protocol can consume BDC data products.



### Workflow - Data Product Discovery, Generation, Delta-Sharing and Consumption

   **Discovery and Generation**:
   Consumers query ORD Aggregators to find Data Products and associated metadata.This diagram shows how data product definitions are discovered and generated. Source Lines of Business (LoB) provide data product definitions, which are read and listed by the SAP Business Data Cloud catalog. These definitions are then used to generate data lake tables, making data products available for consumption.

   ```mermaid
   flowchart TD
    subgraph Source_LoB[Source LoB]
        DP_Def1[Data Product Definitions ORD]
    end

    subgraph SAP_BDC[SAP Business Data Cloud]
        Catalog[Catalog]
        DP_Def2[Data Product Definitions]
        subgraph Data_Lake[Data Lake]
            Data_Lake_Tables["Data Lake Tables"]
        end

        Catalog -->|reads| DP_Def1
        Catalog -->|lists| DP_Def2
        DP_Def2 -->|generates| Data_Lake
    end
   ```

   **Data Sharing View**:
   This diagram illustrates how data is shared between providers and recipients using the Delta Sharing protocol. The Data Provider manages data lake tables and access permissions, which are exposed through a Delta Sharing Server.

   ```mermaid
   graph LR
    subgraph Data Provider
        DL[Data Lake Table] --> DS[Delta Sharing Server]
        AP[Access Permissions] --> DS
    end

    DS -- Delta Sharing Protocol --> AC[Any Sharing Client]

    subgraph Data Recipient
        AC
    end
   ```
   **Consumption Workflow**:
   This diagram illustrates how consumers discover, integrate, and access data products.

   ```mermaid
   sequenceDiagram
      participant Consumer
      participant ORD Aggregator
      participant Data Product
      Consumer->>ORD Aggregator: 1. Query for Customer Data Product
      ORD Aggregator-->>Consumer: Return Metadata (Input/Output Ports)
      Consumer->>Data Product: 2. Identify Integration Dependencies
      Data Product-->>Consumer: API/Events for Access
      Consumer->>Data Product: 3. Authenticate & Access Resources
   ```

### Data Product Extensibility

SAP Data Products also support customer extensions within any SAP Sources & locally defined extension fields to build Data Product Customer Extensions. This requires activation of data package directly to enable custom modeling directly. This is one of the simple extensibility option for adapting data products to enable custom modeling.

![drawio](drawio/dp-extensibility.drawio)


1. SAP Data Products also support customer extensions within any SAP Sources & locally defined extension fields. 
2. Customer field extensions are supported on a “pass through basis” automatically added to the SAP Data Product and data processing pipeline
3. Govern SAP data product + customer fields access in the data catalog and execute data product installation in SAP Datasphere.
4. Create SAP Datasphere models & SAP Analytics Cloud stories for consumption.


### Conclusion

Data Products in SAP Business Data Cloud streamline data sharing, integration, and analytics across domains. Supported by high-quality metadata, Delta Sharing protocols, and decentralized ownership principles, they are optimized for intensive reads and managed with a product mindset. Foundation Services ensure seamless discoverability and consumption, empowering businesses to make data-driven decisions efficiently.