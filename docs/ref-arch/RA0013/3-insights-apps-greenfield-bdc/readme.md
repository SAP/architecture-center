---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0013-3
slug: /ref-arch/ad1b90dbd1/3
sidebar_position: 3
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Implement SAP-managed Insight Apps in SAP BDC
description: Insight Apps in SAP Business Data Cloud provide pre-configured, SAP-managed dashboards and analytics based on underlying Data Products and models. These apps leverage SAP Analytics Cloud as the key front-end solution for visualization, simplifying the process of creating interactive reports and dashboards. Insight Apps reduce complexity, requiring only installation and role assignment for consumption.
sidebar_label: Implement SAP-managed Insight Apps in SAP BDC
keywords: [sap, bdc, business, data, cloud, databricks]
image: img/logo.svg
tags: [data, aws, azure, gcp]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - s-krishnamoorthy
    - jmsrpp
    - anbazhagan-uma
last_update:
    date: 2025-04-26
    author: anbazhagan-uma
############################################################
#                   End of Front Matter                    #
############################################################
---

# Greenfield Implementation of SAP BDC and SAP S/4HANA with SAP-managed Data Products and Insight Apps

## Introduction

Customers with SAP S/4HANA 2021 can get provisioned with SAP BDC. UCL Services(Unified Customer Landscape) will be used to create the BDC formation to include SAP S/4HANA system with SAP Business Data Cloud. With this, the metadata of Data Products will be shared with BDC Cockpit, Datasphere Catalog and Business Accelerator Hub and bring data from SAP S/4HANA to BDC's Foundation Services Layer. SAP BDC Foundation Services in SAP Managed Service which has SAP-managed Object Store and other technical services to transform and publish data products from SAP systems. 

This architecture pattern is about installing and consuming SAP managed data products in SAP Analytics Cloud as an Insight Application which is pre-delivered by SAP.

## Architecture

With the current release of SAP BDC and Insight Applications, customer can choose to either leverage the pre-delivered content as-is with Insight Application or customize the analytical model of the pre-delivered content to develop custom insight applications.

Insight packages include data products, base and analytical models and pre-defined SAC visualizations and planning templates/search-driven insights/KPI watchlist. In SAP-managed insight app, data products will be in SAP Foundation Services Layer, Base Models and Analytic Models will be in Datasphere and Visualizations can be in SAC/BTP.

### High Level Setup Steps prior to installing and using the SAP Insight Apps.

1. Install relevant components in SAP S/4HANA Private Cloud.
2. Setup Inbound Communications for SAP S/4HANA.
3. Setup Outbound Communication for SAP S/4HANA.
4. Setup Cloud Connector.

### SAP Delivered Insight App

In this pattern, the SAP-managed data products are installed. The end user uses the standard insight application via SAP Analytics Cloud.

![drawio](drawio/sap-managed-insight-app.drawio)

### Customization of SAP Delivered Insight App

In this pattern, the underlying SAP Datasphere Analytical models and SAP Analytics Cloud stories can be copied and customized leveraging the SAP-managed data products.

![drawio](drawio/sap-managed-custom-insight-app.drawio)

## Services and Components

- **SAP BDC Cockpit**: Centralized management interface for SAP BDC.
- **SAP Datasphere**: Centralized data management platform supporting self-service, semantic onboarding, and integration with data marketplaces.
- **SAP Analytics Cloud:** Provides advanced analytics and visualization capabilities.
- **Data Products**: Standardized datasets for AI/ML and cross-domain analytics.A dataset exposed for consumption outside the boundaries of the producing application via APIs and are described by high quality metadata, semantically aligned that can be accessed through the Data Product Directory.
- **Data Packages**: Logical grouping of Data Products. These are to be considered if the data products provided shall be used as foundation for modelling in SAP Datasphere or for AI/ML scenarios in SAP Databricks.
- **Insight Apps**: Pre-built applications for actionable intelligence.Low-code apps that are composed from data products, data models and SAP SAC Content. SAC Content serves as a demonstrations for the user of the underlying data products to fulfill a specific analytics use case. Customers can leverage and extend the underlying data products to adjust the analytical layer as per specific requirements.


## Examples in an SAP Context

SAP will be publishing Insight Apps across all application pillars. For e.g Core Enterprise Analytics, People Analytics, Spend Analytics, Customer Analytics, Supply Chain Analytics and Partner Ecosystem Apps.

Few of the examples of Insight Apps with the offerings are mentioned below:

:::info Note
Not all the below mentioned ones are GA
:::

- Core Enterprise Analytics: Enabling companies to effectively make use of current assets and maintain sufficient cash flow to meet short-term goals and obligations. The Insight App provides details on how was the working capital trending over past few periods, average payment period for account payable etc. E.g Working Capital, Sales Analysis etc.
- People Analytics: Enabling customers to understand thier workforce composition and organization structure. E.g: Employee Central, Learning etc
- Spend Analytics: The Insight App will provider comprehensive overview of spend when it is spread across multiple applications. Provides hidden linkages between suppliers etc. E.g: Spend Control Tower, Procurement Analysis etc.

Similarly, there will be Insight Apps available across Customer and Supply Chain Analytics as well.

## Conclusion

Using SAP's pre-build data products and insight apps provide complete business view of the most critical business processes across all SAP applications. This ensures consistency and business context with SAP-managed data sets and semantics. Adopting SAP Data products offers comprehensive lifecycle management which removes the overhead of building a trusted data foundation.
