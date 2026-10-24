---
id: 09be8b
slug: /ref-arch/09be8b
sidebar_position: 1
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
  - guilherme-segantini
discussion: 
last_update:
  author: guilherme-segantini
  date: 2026-10-23
---

Data Products is the fundamental building block of SAP Business Data Cloud and it serves as a standardized and efficient way to share and consume data across applications and domains. They enable analytic scenarios, AI applications, and facilitate data integration while being optimized for intensive reads. Managed with a product mindset, they are supported by high-quality metadata and governed by decentralized ownership principles.

### Purpose of Data Products

Customers currently face challenges when accessing and using data for various tasks such as building new applications, integrating applications, creating analytical models, designing dashboards, and training AI applications. The process of finding relevant data is difficult due to the lack of consistency and clarity in the APIs that expose data and metadata. The metadata often only describes technical aspects, making it hard for business users to utilize, and some necessary data isn't available via APIs. To improve this, the consistent metadata exposed by Data Products will allow for a landscape-specific Data Product to be directly exposed in every customer landscape. This will be facilitated by the catalog, and will promote ODM compliant Data Products, making it easier to combine data from different applications, and automate scenarios like validation, discovery, and integration.

In SAP, a Data Product is a dataset exposed for consumption outside the boundaries of the producing application via APIs and described by high quality metadata that can be accessed through the Data Product Catalog.
- It is a **business dataset** and consists of one or more business object entities, related objects, analytical data etc
- It is **consumable** via APIs or events. Supported API types are SQL (incl. SQL interface views), Event, REST, (oData)
- It is **described** with metadata that is of high quality and provided via Open Resource Discovery (ORD), following ORD schema for Data Product
- It is **discoverable** via the Data Product Directory, a service of UCL that aggregates metadata of all Data Products to make them discoverable in a landscape. Within the SAP Lakehouse, Data Products are additionally governed and shared through the [SAP Enterprise Catalog powered by Apache Polaris](../6-enterprise-catalog/readme.md).


### Key Characteristic of Data Product

- **Efficient Data Sharing Across Domains**: Data Products facilitate replication-free integration and consumption by SAP, customer, and partner applications via APIs and Events.

- **Efficient Data Storage**: Data Products are processed and curated in a modern object-store based data lake architecture with highly scalable Spark processing.
      
- **High-Quality Metadata**: Metadata includes business semantics and is accessible through directories like the Data Product Directory and ORD Aggregators, enhancing discoverability.

- **Optimized for Analytics**: Data sets are curated for intensive reads and consumed in a read-only fashion, ensuring efficiency and reliability.

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

Within the [SAP Lakehouse](../readme.md), data products span four governed categories, where each tier builds on the ones beneath it.

-   **Primary Data Products (SAP):** Foundation Services produces these automatically from SAP Line of Business applications, written in UniForm and registered in Open Resource Discovery.
-   **Primary Data Products (Non-SAP):** Dremio federation publishes non-SAP data in place, without duplication, as custom Primary Data Products.
-   **Unified & 360 Data Products:** Reltio resolves source master data into Golden Master records and cross-system key maps, which the Lakehouse joins into unified views across sources.
-   **Derived Data Products:** Engines combine any of the preceding categories into use-case-specific outputs, such as a weighted sales pipeline across SAP S/4HANA and Salesforce.

![drawio](drawio/sap-dp.drawio "Types of Data Products")

Primary Data Products expose data directly from source applications and are not based on other data products, representing the original data from a source system. The SAP variant is generated by Foundation Services from Line of Business applications. The non-SAP variant is federated through Dremio, which publishes external data in place without duplication.

Unified & 360 Data Products resolve master data across systems. Reltio consolidates source records into Golden Master records and cross-system key maps, and the Lakehouse joins these into unified views that span multiple sources.

Derived Data Products are curated by SAP from one or more existing data sets. They combine any of the preceding categories into use-case-specific outputs, delivering value-add built on other data products or APIs.

[Released Data Products](https://api.sap.com/dataproducts)

[SAP Roadmaps - Business Capability -Data Product Management](
https://roadmaps.sap.com/board?PRODUCT=73555000100800004851&range=CURRENT-LAST&q=data%20product&BC=B9314318771A1EEFBFB783A4FC0A4458#Q2%202025)


### Technical Aspects of Data Products

Data Products move through four stages on a single governed surface: production, storage, sharing and consumption.

#### Production

-   **Foundation Services (SAP):** Produces Primary Data Products automatically from SAP Line of Business applications, written in UniForm and registered in Open Resource Discovery.
-   **Dremio (Non-SAP and Derived):** Publishes non-SAP data in place as custom Primary Data Products without duplication, and derives gold-tier Derived Data Products through reflections.
-   **Reltio (Unified):** Resolves source master data into Golden Master records and cross-system key maps, written back into the silver tier as Unified Data Products.

#### Storage

The storage layer writes a single physical copy of data once and serves it to many engines. Apache Iceberg is the primary format for cross-engine interoperability.

-   **Open Table Format:** Data lands as Parquet and is compatible with Apache Iceberg tables. UniForm projects that single physical copy as Apache Iceberg, so Iceberg-compatible consumers read it natively without conversion or duplication.
-   **Medallion Architecture:** The BDC Federated Object Store organizes data across Bronze, Silver and Gold tiers, with processing handled by the Spark framework.

#### Sharing and Governance

-   **Apache Iceberg with Apache Polaris:** The primary sharing path in the SAP Lakehouse. Data Products are read zero-copy in place by Iceberg-compatible engines through the Enterprise Catalog Iceberg REST interface, with Apache Polaris authorizing catalog, namespace and table access.
-   **Open Resource Discovery (ORD):** Enables decentralized discoverability of Data Products and their metadata across the landscape.

#### Consumption

Consumers reach Data Products through two entry points. Enterprise Discovery tells a consumer that a product exists and what it means. The Enterprise Catalog governs and serves the read.

-   **Enterprise Catalog (Apache Polaris):** The Iceberg REST catalog authorizes catalog, namespace and table access and issues path-scoped credentials, so Iceberg-compatible engines read the governed Data Products zero-copy in place.
-   **Iceberg REST Engines:** External engines such as Snowflake, BigQuery and Microsoft Fabric read Data Products zero-copy in place through the Enterprise Catalog Iceberg REST interface for AI, machine learning and analytics workloads.
-   **Dremio:** Serves federated SQL over Arrow Flight SQL and ADBC for queries and joins across sources, and is the query path for BI tools such as Power BI, Tableau and Looker. Dremio reads the same governed Data Products through the Enterprise Catalog rather than sitting in front of it.
-   **SAP HANA Cloud:** Consumes Data Products via SQL-on-Files and Federation over the Apache Iceberg representation, enabling workloads such as CDS views, calculation views and CAP applications to leverage governed BDC data without replication.
-   **SAP Analytics Cloud:** Consumes Data Products for visualization, reporting and planning scenarios.

#### Implementation

The customer onboarding sequence provisions and activates Data Products within the landscape.

1.  **Provisioning:** Provision the service through SAP for Me.
2.  **Source Connection:** Connect the source applications.
3.  **Activation:** Activate the required Data Products.
4.  **Content Installation:** Install Intelligent Content.

---

### Workflow - Data Product Discovery, Generation, Sharing and Consumption

   **Discovery and Generation**:
   Consumers query ORD Aggregators to find Data Products and associated metadata. This diagram shows how Data Product definitions are discovered and generated. Source Lines of Business (LoB) provide Data Product definitions, which are read and listed by the SAP Business Data Cloud catalog. These definitions generate Apache Iceberg tables registered in the Enterprise Catalog, making Data Products available for consumption.

   ```mermaid
   flowchart TD
    subgraph Source_LoB[Source LoB]
        DP_Def1[Data Product Definitions ORD]
    end

    subgraph SAP_BDC[SAP Business Data Cloud]
        Catalog[Enterprise Catalog - Apache Polaris]
        DP_Def2[Data Product Definitions]
        subgraph Lakehouse[BDC Federated Object Store]
            Iceberg_Tables["Apache Iceberg Tables (UniForm)"]
        end

        Catalog -->|reads| DP_Def1
        Catalog -->|lists| DP_Def2
        DP_Def2 -->|generates| Lakehouse
        Catalog -->|registers| Iceberg_Tables
    end
   ```

   **Data Sharing View**:
   This diagram illustrates how Data Products are shared through the primary path. The Data Provider manages Iceberg tables in the BDC Federated Object Store, which the Enterprise Catalog exposes through the Iceberg REST interface. Apache Polaris authorizes catalog, namespace and table access and issues path-scoped credentials for zero-copy reads.

   ```mermaid
   graph LR
    subgraph Data Provider
        DL["Iceberg Tables (UniForm)"] --> EC[Enterprise Catalog - Iceberg REST]
        AP[Apache Polaris Authorization] --> EC
    end

    EC -- Iceberg REST Interface --> AC[Iceberg-Compatible Engine]

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

![drawio](drawio/dp-extensibility.drawio "Data Product Extensibility")


1. SAP Data Products also support customer extensions within any SAP Sources & locally defined extension fields. 
2. Customer field extensions are supported on a “pass through basis” automatically added to the SAP Data Product and data processing pipeline
3. Govern SAP data product + customer fields access in the data catalog and execute data product installation in SAP Datasphere.
4. Create SAP Datasphere models & SAP Analytics Cloud stories for consumption.


### Conclusion

Data Products in SAP Business Data Cloud streamline data sharing, integration, and analytics across domains. Supported by high-quality metadata and decentralized ownership principles, they are optimized for intensive reads and managed with a product mindset. Foundation Services ensure seamless discoverability and consumption, empowering businesses to make data-driven decisions efficiently.
