---
id: id-ra0013-4
slug: /ref-arch/f5b6b597a6/4
sidebar_position: 4
sidebar_custom_props:
  category_index: []
title: Modernizing SAP BW with SAP Business Data Cloud
description: >-
  Modernize SAP BW with SAP BDC for real-time analytics, AI insights, and
  scalable cloud-native architecture.
keywords:
  - sap
  - business warehouse modernization
  - data cloud integration
  - ai-driven analytics
  - real-time architecture
sidebar_label: Modernizing SAP BW with SAP BDC
image: img/ac-soc-med.png
tags:
  - data
  - aws
  - azure
  - gcp
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
  author: anbazhagan-uma
  date: 2025-09-16
---

## Introduction

SAP Business Warehouse (BW) has been a cornerstone of enterprise data management for decades, providing essential insights for decision-making. However, the growing complexity of modern data landscapes, the need for real-time analytics, and the shift toward AI-driven processes demand a more scalable and integrated approach. SAP Business Data Cloud (SAP BDC) offers a path to modernize BW environments, enabling organizations to leverage existing investments while transitioning to a future-ready architecture.

With the introduction of SAP Business Warehouse, private cloud edition, SAP offers customers options to lift from:
-  SAP BW NetWeaver to SAP Business Warehouse, private cloud edition for SAP NetWeaver to benefit from maintenance support until the end of 2030
-  SAP BW/4HANA to SAP BW/4HANA, private cloud edition with maintenance support until 2040

As a result, customers can gradually shift BW use cases to SAP Business Data Cloud and replace respective data flows with proven capabilities within SAP Datasphere as well as data products and Intelligent Applications within SAP Business Data Cloud, instead of spending time and budget on a migration.

## Architectural Overview

![drawio](drawio/bw-bdc-detailed.drawio)

SAP Business Warehouse, private cloud edition is the data producer. 

A tool called the Data Product Generator for SAP Business Data Cloud is introduced to enable BW data products in SAP BDC. Respective BW data is stored in a dedicated BW inbound space in the object store of SAP Datasphere in SAP BDC. BW data can then be exposed as customer-managed data products for ML/AI use cases in SAP Databricks and SAP Datasphere within SAP BDC and SAP Analytics Cloud for analytics scenarios.


## Key Services and Components

The modernization process leverages the following components to transition BW environments to SAP BDC:

- **SAP Business Warehouse, private cloud edition**: Private cloud edition of BW for transitioning to SAP BDC.
- **Data Product Generator:** Enables creation of SAP BW data products for integration in SAP Datasphere and ML/AI scenarios in SAP Databricks.
- **SAP Datasphere**: Centralized business data fabric supporting self-service, semantic onboarding, and integration with data marketplaces.
- **SAP Analytics Cloud:** Provides Analytics & BI and Enterprise Planning.
- **SAP Databricks:** Supports AI/ML scenarios on unified SAP BW and SAP BDC data.
- **Data Products**: Data sets exposed for consumption outside the boundaries of the producing application via APIs and described by high-quality metadata that can be accessed through the Data Product Directory.
- **Intelligent Applications**: Pre-built applications for actionable intelligence.
- **SAP BDC Cockpit**: Centralized management interface for SAP BDC.

## High-Level SAP BW Modernization Approach

SAP provides a structured three-step approach for migrating SAP BW systems to the Business Data Cloud. This methodology focuses on leveraging existing BW data, transitioning to modern data products, and adopting a scalable, cloud-native architecture.

**Key benefits of SAP Business Warehouse, private cloud edition as part of SAP BDC:**

-   SAP BW data products can be leveraged in SAP Databricks for ML/AI use cases and in SAP Datasphere for analytics scenarios, allowing the native implementation of BW use cases while following a zero-copy approach.
-   HANA Data Lake Files (object store) is used to store large business data, reducing associated storage costs.
    Additionally, customers will benefit from data products and the delta share mechanism, allowing direct consumption in SAP Databricks for AI/ML use cases.
-   The Spark Engine enables custom coding options to replace existing ABAP code.
    In addition, Spark offers scalable compute capabilities supporting high-volume transformations. Spark compute is isolated from analytics compute, avoiding mutual performance impact.

### Three-Step Migration Process

**1. Lift to SAP Business Warehouse, private cloud edition**: Transition existing SAP BW NetWeaver or SAP BW/4HANA on-premises deployments into the private cloud edition of SAP BDC. This step secures SAP BW investments while exposing SAP BW data as data products for consumption.

**Migration Pathways: Structured Transition Options**

The migration pathway depends on the current SAP BW system landscape. Below is a visual representation of the available paths, and the recommended approaches based on the environment:

![drawio](drawio/migration-pathways.drawio)

**For SAP BW > 7.5 deployments:** 
- Upgrade to BW 7.5 on HANA database (in case of any DB) and check if SPS24 is fulfilled or upgrade to the latest SPS.

**For SAP BW 7.5 deployments:** 
- Upgrade to HANA database (in case of any DB) and check if SPS24 is fulfilled or upgrade to the latest SPS.

**For Existing SAP BW/4HANA deployments:** 

- SAP BW/4HANA 1.0 and 2.0: Upgrade to SAP BW/4HANA 2023 latest support package.
- SAP BW/4HANA 2021: Check if SPS04 is fulfilled or upgrade to the latest SPS.

**2. Shift to SAP BW data products:** 

The Data Product Generator for SAP Business Data Cloud allows users to automate the publication of valuable BW data from SAP BW 7.5 and SAP BW/4HANA systems to the object store of SAP Datasphere in SAP BDC. This data can be leveraged as data products and incorporated into SAP Datasphere projects or shared with third-party tools.

Note: The object store is not a cold store alternative but enables SAP BW data product consumption and exposure.

![drawio](drawio/bw-approach-2.drawio)

**SAP BW data product**

-   **Primary data product** contains the flattened transactional data of the selected InfoProvider, including master data, which can be directly leveraged by SAP Databricks for ML/AI use cases via Delta Share.
-   **Derived data product** consists of local tables that contain the transactional data and pre-defined associated dimensions, i.e., master data out-of-the-box for analytics use cases, and can also be exposed via SQL Share. (To be available)
-   **Analytical data product** uses the refined data product to define analytical measures, or it includes the respective defined key figures, filters, etc., ready to use to gain further business insights and can also be consumed via oData. (To be available)

With the Data Product Generator, a data subscription is created in SAP BW/4HANA Cockpit or via SAPGUI 7.5 for InfoProviders. Once the subscription is activated, a Local Table (File) is created in a specific BW Inbound space in SAP Datasphere. Multiple subscriptions can be created similarly.

Once the subscription is run, the data from the InfoProvider is loaded into the Local Table (File) in the BW inbound space. Objects in this space are read-only, but data management tasks (e.g., deleting data) are possible. A merge task takes care of data consistency between the BW source and the Local Table Files in SAP Datasphere. Data updates can be scheduled in delta mode as well.

To create a data product, a data provider profile is required, which can be created in the Data Sharing Cockpit in SAP Datasphere. Existing data provider profiles can be reused by generating activation keys and distributing them accordingly. In order to make data products consumable across SAP BDC components, the data products need to be exposed to the formation.

Data products can be created by specifying the artifact space (BW Inbound Space) and other required details. Single or multiple tables can be added to the data product. To make this discoverable in the Catalog, change the Switch Status to 'List'. This triggers the creation of a delta share endpoint and an ORD document that will be shared with the Unified Customer Landscape. Data products will be listed in the Catalog, from where they can be shared with other spaces.

We can select one or multiple tables that should be exposed through the data product.

With this, BW data products will be available for modeling and transformation purposes in SAP BDC. Leveraging delta share with SAP Databricks, proven BW data can be used for implementing AI/ML use cases.

[For additional details: SAP Help | Integrating Data from the Data Product Generator for SAP Business Data Cloud](https://help.sap.com/docs/SAP_DATASPHERE/be5967d099974c69b77f4549425ca4c0/cca4744c85b14788babe7cb6b77c9973.html)

**3. Innovate with SAP-managed data product and Intelligent Applications:** 

With the data products in SAP BDC, holistic integration between data platforms and business applications is possible. This helps leverage intelligent applications from SAP for insights and business decisions. These intelligent applications can be customized at the analytical model and views layer.

![drawio](drawio/bw-approach-3.drawio)

Along with SAP BW data products and all other LoB data products, one approach for building AI/ML applications can be achieved using SAP Databricks and native Databricks together. SAP Databricks is optimized to work with SAP data products with zero-copy bidirectional data product sharing.

From SAP Datasphere's Catalog, the BW data product can be shared with SAP Databricks. Once the AI/ML analysis has been performed in SAP Databricks, the data from the table in SAP Databricks will be shared back via the Catalog and in SAP Datasphere, where we can harmonize it with data from other sources.

Refer to [SAP Business Data Cloud SDK](https://pypi.org/project/sap-bdc-connect-sdk/) to create and publish data products for downstream consumption within SAP BDC. This SDK helps create/update shares, create/update the CSN for a share, and publish/unpublish data products.

For customers who are already using the Databricks Data Intelligence Platform, BDC Connect (Partner Connector) from SAP helps with integration for brownfield scenarios. This will enable zero-copy sharing of data products bidirectionally based on Delta Sharing.


**Replacing SAP BW Use Cases with SAP Business Data Cloud**

With SAP BDC, SAP BW use cases can be gradually transitioned to SAP BDC with SAP-managed data products and intelligent applications.

![drawio](drawio/bw-transformations.drawio)

SAP-managed data products and intelligent applications allow customers to consume and create analytics scenarios, following a clean core principle. Below are high-level approaches to plan for replacing SAP BW use cases:

Reporting:
-   Query and Composite Provider to be replaced with an Analytic Models and Views.

Data Foundation:
-   SAP BW data is pushed via the Data Product Generator into the object store of SAP Datasphere.
-   Re-routing of data provisioning to SAP S/4HANA RISE/PCE and Foundation Service.
-   Replace Standard Data Sources with SAP-managed data products.
-   Translate transformations from SAP BW into Transformation Flows in SAP Datasphere.
-   Replace and repoint existing Local Tables (Files) based on SAP BW data to Local Tables with data from SAP S/4HANA.
-   Access custom data sources via replication flows in SAP Datasphere and push the data into Local Tables (File).
-   Access non-SAP data sources via replication flows in SAP Datasphere and push the data into Local Tables (File).


## Key Benefits of SAP BW Modernization

-   **Scalable Architecture**: Transition to a cloud-native platform that adapts to evolving workloads.
-   **Unified Data Management**: Harmonize data across SAP and non-SAP systems for consistent analytics.
-   **Enhanced Analytics**: Enable real-time insights and advanced AI/ML capabilities.
-   **Reduced Maintenance**: Minimize administrative overhead with streamlined processes.
-   **Future-Ready**: Position your data infrastructure for ongoing innovation and scalability.

## Use Cases for BW Modernization

The modernization process unlocks new possibilities for leveraging SAP BW data:

-   **Consumption of Intelligent Applications**: Develop data-driven applications integrating SAP BW and SAP-managed data products.
-   **AI/ML Scenarios**: Use SAP Databricks to apply advanced AI/ML models to BW data.
-   **Unified Data Platform**: Consolidate data from SAP and non-SAP sources for comprehensive analytics and insights.

## Expected TCO Benefits with SAP BDC and SAP BW PCE

-   **Transformation Effort:** No migration cost for upgrade to SAP BW/4HANA. Leverage SAP-managed data products with business semantics helping to reduce data integration and maintenance costs.
-   **Analytics and Tech Support Cost:** Reduction in annual monitoring, technical patching, and upgrade costs and reducing losses from unforeseen data risk.
-   **SAP Software & Maintenance:** Minimize or eliminate SAP Datasphere Premium Outbound cost by leveraging a zero-copy approach. Eliminate SAP BW, private cloud edition cost after decommissioning.
-   **Infrastructure and Stack Cost:** Optimize hardware investment and reduce hardware size by offloading SAP BW data volume to the object store.

## SAP Learning Journey

[Modernizing your Data Warehouse Landscape - From SAP BW to SAP Datasphere](https://learning.sap.com/learning-journeys/modernizing-your-data-warehouse-landscape-from-sap-bw-to-sap-datasphere)

## Conclusion

Modernizing SAP BW with SAP Business Data Cloud provides a clear pathway to unlock agility, innovation, and scalability in enterprise data management. SAP BDC represents the future for on-premises SAP BW systems. By migrating to the private cloud version of SAP BW within SAP BDC, you safeguard your existing data and investments while gaining access to enhanced capabilities.

By leveraging existing investments, transitioning to data products, and adopting advanced architectures, organizations can build a unified platform for real-time analytics and AI-driven insights. SAP’s structured approach ensures a seamless migration process, enabling businesses to address evolving demands and capitalize on their data assets effectively.
