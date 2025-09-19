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
  author: jmsrpp
  date: 2025-05-19
---

## Introduction

SAP Business Warehouse (BW) has been a cornerstone of enterprise data management for decades, providing essential insights for decision-making. However, the growing complexity of modern data landscapes, the need for real-time analytics, and the shift toward AI-driven processes demand a more scalable and integrated approach. SAP Business Data Cloud (SAP BDC) offers a path to modernize BW environments, enabling organizations to leverage existing investments while transitioning to a future-ready architecture.


With the introduction of SAP BW, private cloud edition in SAP BDC, SAP offers customers options to lift from 
-  SAP BW NetWeaver to SAP BW 7.5 on HANA Private Cloud Edition to benefit from maintenance support until end of 2030
-  SAP BW/4HANA to SAP BW/4HANA Private Cloud Edition with maintenance support until 2040.

As a result, customers can gradually shift SAP BW use cases to SAP Datasphere and replace respective data flows with proven capabilities within SAP Datasphere as well as data products and Intelligent Applications within SAP Business Data Cloud, instead of spending time and budget on a migration.

## Architectural Overview

![drawio](drawio/bw-bdc-detailed.drawio)

SAP BW 7.5 on HANA Private Cloud Edition or SAP BW/4HANA Private Cloud Edition, is the Data Producer. This system is added in the SAP BDC Formation. With this addition, a dedicated provisioning space is created for SAP BW PCE. Data Product Generator is a tool which is available in SAP BW PCE to create data products in Object Store in SAP BDC out of BW PCE. These data products gets generated as custom data products in the object store which is in the SAP BDC Tenant. From the provisioning space in SAP Datasphere, this can be shared with another space for modeling and consumption into SAP Analytics Cloud.

## Key Services and Components

The modernization process leverages the following components to transition BW environments to SAP BDC:

- **SAP BW 7.5 on HANA Private Cloud Edition, SAP BW/4HANA Private Cloud Edition,**: Private cloud edition of BW for transitioning to BDC.
- **Data Product Generator:** Enables creation of SAP BW data products for integration into SAP Datasphere.
- **SAP Datasphere**: Centralized data management platform supporting self-service, semantic onboarding, and integration with data marketplaces.
- **SAP Analytics Cloud:** Provides advanced analytics and visualization capabilities.
- **SAP Databricks:** Supports AI/ML scenarios on unified SAP BW and SAP BDC data.
- **Data Products**: Standardized datasets for AI/ML and cross-domain analytics.
- **Intelligent Applications**: Pre-built applications for actionable intelligence.
- **SAP BDC Cockpit**: Centralized management interface for SAP BDC.

## High-Level SAP BW Modernization Approach

Migration projects require careful planning to ensure continuity and minimize disruption. SAP’s approach addresses key enterprise concerns:

-   **Data Continuity**: Comprehensive validation ensures consistency and integrity during migration, with a focus on preserving historical data and business rules.
-   **Operational Stability**: Parallel operations during transition phases reduce business disruption, supported by robust fallback mechanisms.
-   **Capability Development**: Tailored training programs ensure teams can effectively manage and utilize the new SAP BDC environment.
-   **Security and Compliance**: Enterprise-grade security controls and compliance frameworks protect data and support audit requirements.

SAP provides a structured three-step approach for migrating SAP BW systems to the Business Data Cloud. This methodology focuses on leveraging existing BW data, transitioning to modern data products, and adopting a scalable, cloud-native architecture.

**The key benefits of SAP BW 7.5 on HANA Private Cloud Edition, SAP BW/4HANA Private Cloud Edition as part of SAP BDC are:**

-   SAP BW data products can be leveraged in SAP Databricks for ML/AI use cases and in SAP Datasphere for analytics scenarios, allowing the native implementation of BW use cases while following a zero copy approach.
-   The HANA Data Lake Files (object store) will be the large system option, reducing associated storage costs.
    Additionally, customers will benefit from data products and delta share mechanism, allowing a direct consumption in SAP Databricks for AI/ML use cases.
-   The Spark Engine enables custom coding options to replace existing ABAP code.
    In addition, Spark offers scalable compute capabilities supporting high-volume transformations. Spark compute is isolated from the analytics compute, avoiding mutual performance impact.

### Three-Step Migration Process

**1. Lift to SAP BW 7.5 on HANA Private Cloud Edition, SAP BW/4HANA Private Cloud Edition**: Transition existing SAP BW NetWeaver or SAP BW/4HANA on-premises deployments into the private cloud edition of SAP BDC. This step secures SAP BW investments while exposing SAP BW data as data products for consumption.

**Migration Pathways: Structured Transition Options**

The migration pathway depends on the current SAP BW system landscape. Below is a visual representation of the available paths, and the recommended approaches based on the environment:

```mermaid
flowchart LR
  classDef focusSize stroke-width:2px,font-size:24px,font-weight:bold

  %% Brownfield Entry Points
  A1[SAP BW NetWeaver < 7.5*]:::focusSize
  A2[SAP BW NetWeaver 7.5*]:::focusSize
  A3[SAP BW/4HANA]:::focusSize

  %% Shared final node
  K[SAP BW private cloud edition in SAP Business Data Cloud]:::focusSize

  %% --- 1. SAP BW NetWeaver < 7.5* ---
  subgraph S1 [ ]
    direction LR
    B1_1[Any DB]:::focusSize
    B1_2[HANA DB]:::focusSize
    C1["Upgrade to BW 7.5 on HANA (SPS 31+)"]:::focusSize
    B1_1 & B1_2 --> C1
  end
  A1 --> B1_1
  A1 --> B1_2
  C1 --> K

  %% --- 2. SAP BW NetWeaver 7.5* ---
  subgraph S2 [ ]
    direction LR
    D2_1[Any DB]:::focusSize
    D2_2[DB Upgrade to HANA]:::focusSize
    D2_3[HANA DB]:::focusSize
    E2["BW 7.5 SPS 24+"]:::focusSize
    F2["Update to latest version (SPS 31+)"]:::focusSize

    D2_1 --> D2_2 --> D2_3
    D2_3 --> E2
    E2 -- No --> F2
    F2 --> K
    E2 -- Yes --> K
  end
  A2 --> D2_1
  A2 --> D2_3

  %% --- 3. SAP BW/4HANA ---
  subgraph S3 [ ]
    direction LR
    G1[SAP BW/4HANA 1.0]:::focusSize
    G2[SAP BW/4HANA 2.0]:::focusSize
    G3[SAP BW/4HANA 2021]:::focusSize
    G4[SAP BW/4HANA 2023]:::focusSize
    H1[Upgrade to BW/4HANA 2023]:::focusSize
    J1["BW/4HANA 2021 (SPS 04+)"]:::focusSize
    J2["Update to latest version (SPS 11+)"]:::focusSize

    G1 --> H1
    G2 --> H1
    H1 --> K

    G3 --> J1
    J1 -- No --> J2
    J2 --> K
    J1 -- Yes --> K

    G4 --> K
  end
  A3 --> G1
  A3 --> G2
  A3 --> G3
  A3 --> G4
```

:::note
Greenfield implementations go directly to SAP BW/4HANA Private Cloud Edition in SAP Business Data Cloud

\*  Optional: convert to SAP BW/4HANA directly
    :::

**For SAP BW Systems on Non-HANA Databases** - **Initial Requirement**: Migrate to SAP HANA to enable real-time analytics and in-memory processing. - **Post-HANA Options**: - **SAP BW 7.5 on HANA**: Upgrade to enable SAP HANA-specific capabilities while retaining existing functionality. - **SAP BW/4HANA 2023**: Comprehensive modernization for seamless integration with SAP BDC.

**For SAP BW Systems already on SAP HANA** - **SAP NetWeaver < 7.5**: Upgrade to NetWeaver 7.5 (SP24+) or migrate directly to SAP BW/4HANA 2023. - **SAP NetWeaver 7.5**: Ensure Service Pack level meets minimum requirements (SP24+). - **Direct Path**: Migrate to SAP BW/4HANA 2023 for advanced capabilities.

**For Existing SAP BW/4HANA Environments** - **SAP BW/4HANA 1.0 or 2.0**: Upgrade to SAP BW/4HANA 2023 for latest features. - **SAP BW/4HANA 2021**: Apply the latest Service Pack or upgrade to SAP BW/4HANA 2023. - **SAP BW/4HANA 2023**: Implement the most recent Service Pack for optimal performance.

**2. Shift to SAP BW Data Product:** 

The data product generator for SAP Business Data Cloud allows users to automate the publication of valuable BW data from SAP BW and SAP BW/4HANA systems to the object store of SAP Datasphere in SAP BDC. These data can be leveraged as data product and incorporated in SAP Datasphere projects or shared to third-party-tools.

Note: the object store is not a cold store alternative, but enables SAP BW data product consumption and exposure.

![drawio](drawio/bw-approach-2.drawio)

**SAP BW Data Product**

-   **Base Data Product:** contains the flattened transactional data of the selected InfoProvider including master data which can be e.g. directly leveraged by SAP Databricks for ML/AI use cases via Delta Share.
-   **Refined Data Product:** consists of local tables that contain the transactional data and pre-defined associated dimensions, i.e. master data out-of-the-box for analytics use cases and can also be exposed via SQL Share. (To be available)
-   **Derived Data Product:** uses the refined data product to define analytical measures or it includes the respective defined key figures, filters etc. - ready to use to gain further business insights and can also be consumed via OData.(To be available)

With Data Product Generator, Data subscription is created in SAP BW Cockpit for Info Provider. Once the subscription is activated, local table is created in specific BW Inbound space in SAP Datasphere. Multiple subscriptions can be created similarly.

Once the Run Subscription is executed, the data from Info Provider gets loaded into Local Table(file)into the SAP BW inbound space. Objects in this space are read-only, but data management tasks (e.g. deleting data) are possible. With Merge Task in SAP Datasphere, data will be synced from Inbound Table to Target Table. 

To create a Data Product, a context should be provided that represents the SAP BDC formation to which the Datasphere tenant is added.
To include artifacts into the Data Product, the source space of the artifact has to be selected. For Delta Sharing, the respective tables have to be already available within the dedicated BW space.

We can select one or multiple tables which should be exposed through the Data Product.

With this, SAP BW Data product will be available for modelling and transformation purposes in SAP BDC. With delta share with SAP Databricks, proven SAP BW Data can be used for implementing AI/ML use cases. Update of data can be scheduled in a delta mode.

[For Additional Details : Integrating Data from the Data Product Generator for SAP Business Data Cloud](https://help.sap.com/docs/SAP_DATASPHERE/be5967d099974c69b77f4549425ca4c0/cca4744c85b14788babe7cb6b77c9973.html)

**3. Innovate with SAP Managed Data Products and Intelligent Applications:** 

With the Data Products in SAP BDC, holistic integration between data platforms and business applications is possible. This helps to develop Intelligent applications for insights and business decisions.

![drawio](drawio/bw-approach-3.drawio)

Along with SAP BW Data Products and all other LoB Data Product, one of the approaches for building AI/ML applications can be achieved using (SAP) Databricks - SAP Databricks and Native Databricks. This is optimized to work with SAP Data Products with zero-copy bi-directional data product sharing.

From SAP Datasphere's Catalog, the BW Data Product can be shared with (SAP) Databricks. Once the AI/ML analysis has been performed in SAP Databricks, the output from the table in SAP Databricks needs to be enriched and then can be shared back to the SAP-managed Datasphere's space.

Refer to [SAP Business Data Cloud SDK](https://pypi.org/project/sap-bdc-connect-sdk/) to be able to create and publish Data Products for downstream consumption within SAP BDC. SDK helps to create/update share, create/update the CSN for a share and publish/unpublish a data product.

For customers who are already using Databricks Data Intelligence Platform, BDC Connect(Partner Connector) from SAP help integration for brownfield scenarios.This will enable zero-copy sharing of data products bidirectionally based on Delta Sharing. 


**Replacing SAP BW Use Cases with SAP Business Data Cloud**

With SAP BDC, SAP BW use cases can be gradually transitioned with SAP BDC with SAP-managed data products and Intelligent Applications, adopting a lakehouse architecture.

![drawio](drawio/bw-transformations.drawio)

SAP managed data products and Intelligent Applications allow customers to consume and create analytics scenarios, following a clean core principle. Below are approaches at high-level to plan for replacing SAP BW use cases:

Reporting:
-   Query and Composite Provider to be replaced with an Analytic Model and View using the onboarding in the catalog.

Data Foundation:
-   SAP BW Data is pushed via the Data Product Generator into the object store of SAP Datasphere.
-   Re-routing of data provisioning to SAP S/4HANA RISE/PCE and Foundation Service.
-   Replace Standard Data Sources with SAP managed Data Products.
-   Translate transformations from SAP BW into Transformation Flows in SAP Datasphere.
-   Replace and repoint existing Location Tables(files) based on SAP BW Data to Local Tables with data from SAP S/4HANA.
-   Access custom data sources via replication flows in SAP Datasphere and push the data into Local Tables(File).
-   Access Non-SAP Data sources via replication flows in SAP Datasphere and push the data into Local Tables(File).


## Key Benefits of SAP BW Modernization

-   **Scalable Architecture**: Transition to a cloud-native platform that adapts to evolving workloads.
-   **Unified Data Management**: Harmonize data across SAP and non-SAP systems for consistent analytics.
-   **Enhanced Analytics**: Enable real-time insights and advanced AI/ML capabilities.
-   **Reduced Maintenance**: Minimize administrative overhead with streamlined processes.
-   **Future-Ready**: Position your data infrastructure for ongoing innovation and scalability.

## Use Cases for BW Modernization

The modernization process unlocks new possibilities for leveraging SAP BW data:

-   **Building Intelligent Applications**: Develop data-driven applications integrating SAP BW and SAP BDC data products.
-   **AI/ML Scenarios**: Use SAP Databricks to apply advanced AI/ML models to BW data.
-   **Unified Data Platform**: Consolidate data from SAP and non-SAP sources for comprehensive analytics and insights.

## Expected TCO Benefits with SAP BDC and SAP BW PCE

-   **Transformation Effort:** No migration cost for upgrade to SAP BW/4HANA. Leverage SAP Standard data products with business semantics intact.
-   **Analytics and Tech Support Cost:** With adoption of Intelligent Applications and Data product, 50-80% reduction in cost as annual cost to build and maintain integrations. Reduction in annual monitoring, technical upgrade effort and reduce losses from unforeseen data risk,
-   **SAP Software & Maintenance:** No SAP BW/4HANA licence and annual maintenance. Eliminate SAP Datapshere Premium Outbound costs by leveraging zero copy approach.
-   **Infrastructure and Stack Cost:** Optimize hardware investment and reduce hardware size by offloading SAP BW Data volume to object store.

## SAP Learning Journey

[Modernizing your Data Warehouse Landscape - From SAP BW to SAP Datasphere](https://learning.sap.com/learning-journeys/modernizing-your-data-warehouse-landscape-from-sap-bw-to-sap-datasphere)

## Conclusion

Modernizing SAP BW with SAP Business Data Cloud provides a clear pathway to unlock agility, innovation, and scalability in enterprise data management. SAP BDC represents the future for on-premises SAP BW systems. By migrating to the private cloud version of SAP BW within SAP BDC, you safeguard your existing data and investments while gaining access to enhance capabilities.

By leveraging existing investments, transitioning to data products, and adopting advanced architectures, organizations can build a unified platform for real-time analytics and AI-driven insights. SAP’s structured approach ensures a seamless migration process, enabling businesses to address evolving demands and capitalize on their data assets effectively.