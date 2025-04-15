---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0011-3
slug: /ref-arch/e55b3bb294/3
sidebar_position: 3
sidebar_custom_props:
    category_index: []
############################################################
#     You can modify the front matter properties below     #
############################################################
title: SAP BW Modernization in SAP BDC
description: For decades, SAP Business Warehouse (BW) has served as the backbone of enterprise data warehousing, delivering critical insights for strategic decision-making. However, the rapidly evolving business environment demands more from data infrastructure and real-time analytics capabilities, seamless integration across diverse sources, and scalable architecture that can adapt to changing requirements. The Business Data Cloud (BDC) represents the next evolution in enterprise data management, offering organizations a path beyond traditional BW environments toward a more agile, integrated, and future-ready data platform.
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


For the SAP BW Mo
The below reference architecture guidelines is for customers who are currently on SAP BW and are looking forward to migrate towards business data cloud for overall data harmonization across landscape. Customers can move from legacy data architecture to modern data architecture with lift and shift approach to SAP Business Warehouse Cloud, private edition. 

** Please Note : Some of the capabilities are planned for GA in 2025.

## Key Challenges

Let us look at some of the key challenges as well as drivers for moving towards BW Modernization with SAP BDC.
- Outdataed Landscape
- Innovation Deficit
- Lack of Openness

Below approach and reference architecture can help increase the value of BW Data at the same time provide an approach for moving towards business data cloud addressing the dynamics of data handling in future.

## High Level Approach 

For existing SAP BW System in the landscape, to make the migration to SAP BDC simpler and to evolve from business data fabric architecture to business data cloud, we look at 3-step approach as below:

- **Step 1:** Lift the existing SAP BW System to private cloud and secure BW Investments while exposing SAP BW Data as data products for consumption. 

- **Step 2:** Shift towards SAP BW data products and implement new use cases with direct access to SAP Datasphere object store.

- **Step 3:** Innovate with Data products and Insight apps. Look at replacing the SAP BW workflows with SAP managed data products and insight apps adopting a lakehouse architecture. 


## Technical Architecture 

Below architecture is specifically for customers who are currently running SAP BW in thier existing landscape and are looking for approach to leverage the capabilities of business data cloud and 

![drawio](drawio/bw-approach-1.drawio)

## Key Services and Components

- Data Products
- Insight Apps 
- SAP BDC Cockpit
- SAP Datasphere
- SAP Analytics Cloud
- SAP BW.BW/4HANA PCE
- SAP Databricks

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

## Resources 