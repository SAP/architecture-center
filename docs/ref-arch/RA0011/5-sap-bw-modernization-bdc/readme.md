---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0011-5
slug: /ref-arch/e55b3bb294/5
sidebar_position: 5
sidebar_custom_props:
    category_index: []
############################################################
#     You can modify the front matter properties below     #
############################################################
title: SAP BW Modernization in SAP BDC
description: For the SAP BW Modernization, SAP offers an approach to increase the value of BW Data by taking your SAP BW / SAP BW/4HANA investment along and enable custom data products on your SAP BW Data. 
sidebar_label: BW Modernization with SAP BDC
keywords: [sap, bdc, data, analytics]
image: img/logo.svg
tags: [aws]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
    - anbazhagan-uma
last_update:
    date: 2025-04-15
    author: anbazhagan-uma
############################################################
#                   End of Front Matter                    #
############################################################
---

# Reference Architecture for SAP BW Modernization with SAP BDC
**This is Work in Progress. To be completed by April 25th, 2025.**


## Introduction and Need for SAP BW Modernization

Customers are faced with fragmented SAP BW System landscape which is resulting in data silos. This historically grown SAP BW systems needs to be managed which demand high maintenance efforts from administration perspective. At the same time, customers want to keep thier investments made in SAP BW as there is already a very huge volume of data and multiple systems integrations existing. 
Moving towards business data fabric architecture needs rethinking of existing concepts and reshaping the data landscape towards Data Products offerings. This leads to innovation deficit as the need for AI on data is required. 

With these challenges, for SAP BW Modernization, SAP offers an approach to increase the value of BW Data by taking your SAP BW or 
SAP BW/4HANA investment along and enable custom data products on your SAP BW Data. 

The below reference architecture provides approach and guidelines for customers who are currently on SAP BW and are looking forward to migrate towards business data cloud for overall data harmonization across landscape. Customers can move from legacy data architecture to modern data architecture with lift and shift approach to SAP Business Warehouse Cloud, private edition. They key benefits that one can realize with this can be to leverage BW Data Value and transition towards lakehouse architecture.

** Please Note : Some of the capabilities are planned for GA in 2025.

## High Level Approach 

For existing SAP BW System in the landscape, to make the migration to SAP BDC simpler and to evolve from business data fabric architecture to business data cloud, we look at 3-step approach as below:

![drawio](drawio/bwpce-sapbdc.drawio)

- **Step 1:** Lift the existing SAP BW NetWeaver or SAP BW/4HANA on-premises deployment as-is into System to private cloud component of SAP Business Data Cloud. This ensures to secure BW Investments while exposing SAP BW Data as data products for consumption. 

- **Step 2:** Shift towards SAP BW data products and implement new use cases with direct access to SAP Datasphere object store. SAP Business Data Product Generator tool can be used by every BW PCE customer.

- **Step 3:** Innovate with Data products and Insight apps. Look at replacing the SAP BW workflows with SAP managed data products and insight apps adopting a lakehouse architecture. At this stage, customer managed BW managed data products are gradually replaced with SAP managed data products.

This approach does not need any conversion to SAP BW/4HANA in the context of SAP BW NetWeaver. Data Product generator for SAP Business Data Cloud is used to generate data products. This will enable to build business applications integrating SAP and Non-SAP data. This approach is the recommended approach for gradually moving from SAP BW to SAP Business Data Cloud.

### Migration Pathways: A Structured Approach

Transitioning from SAP BW to the Business Data Cloud follows distinct paths based on your current environment. Each approach is designed to minimize disruption while maximizing the benefits of modernization. This image illustrates the various paths from SAP BW to Business Data Cloud.
BW PCE simplifies the management of BW and to make the BW Data available to DSP as data products.

![drawio](drawio/bw-modernization.drawio)

#### For BW Systems on Non-HANA Databases

    **Initial Requirement: Migration to HANA**
    The foundation of your BDC journey begins with moving to the SAP HANA database platform, which provides the in-memory architecture necessary for real-time analytics.

    **Post-HANA Options:**

    -   **BW 7.5 on HANA**: A targeted upgrade that preserves existing functionality while enabling HANA-specific capabilities
    -   **BW/4HANA 2023**: A comprehensive modernization that delivers the latest BW capabilities and prepares your environment for seamless BDC integration

#### For BW Systems Already on HANA

**NetWeaver Version Assessment:**

-   **NetWeaver < 7.5**: Options include upgrading to NetWeaver 7.5 (SP24+) as a minimum requirement or migrating directly to BW/4HANA 2023
-   **NetWeaver 7.5**: Ensure Service Pack level meets minimum requirements (SP24+)
-   **Direct Path**: Regardless of current NetWeaver version, migration to BW/4HANA 2023 remains available as a comprehensive modernization option

#### For Existing BW/4HANA Environments

**Version-Specific Approaches:**

-   **BW/4HANA 1.0 or 2.0**: Upgrade to BW/4HANA 2023 for latest capabilities
-   **BW/4HANA 2021**: Apply latest Service Pack or upgrade to BW/4HANA 2023
-   **BW/4HANA 2023**: Implement most recent Service Pack to ensure optimal performance and feature availability


## Technical Architecture 

Below architecture is specifically for customers who are currently running SAP BW in thier existing landscape and are looking for approach to leverage the capabilities of business data cloud. The key benefits of this architecture is immediate exposure of valuable SAP BW data to enable new cases without complete modernization as this is fully supported by SAP. 

Apart from Data warehouse features, other capabilities of SAP Datasphere like self-service, concept of spaces, KG to enable GenAI use cases, Semantic onboarding, consumption of data marketplace and data products can also be leveraged. 

![drawio](drawio/bw-approach-1.drawio)

Data product generator which is shipped with SAP BW PCE. It allows the creation of SAP BW Data products based on selected InfoProviders within the object sore and analytical layer of SAP Datasphere and pushing into SAP Datasphere Object Store.



## Innovation with SAP managed Data Products and Insights Apps 


** Note: On-premise Embedded BW cannot be moved to a stand-alone SAP BW Cloud, private edition.The data product generator for SAP BDC is not available in the context of Embedded BW.

## Key Services and Components

- Data Products
- Insight Apps 
- SAP BDC Cockpit
- SAP Datasphere
- SAP Analytics Cloud
- SAP BW/4HANA PCE
- SAP Databricks
- SAP Data Product Generator for BW Data Product

## Use Cases for BW On-premise modernization into BW PCE within SAP BDC

- Building intelligent data applications with integrated data of SAP BW and SAP BDC Data products( SAP Data products and Custom Data products)
- Leveraging SAP Databricks for AI/ML scenario on the existing BW Data 
- Unified platform of all data consolidated from different SAP sources and non-SAP sources.

## Key Benefits

- Code enhancement and code modifications allowed.
- Simple commercial transition with common capacity units.
- Scalable Platform to integrate with existing SAP BW Systems in the landscape
- End-to-end integration of SAP BW with SAP Data Products and Custom Data Products
- Catalog Integration of SAP BW Cloud, private edition.

