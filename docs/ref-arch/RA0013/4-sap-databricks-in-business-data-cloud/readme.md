---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0013-4 
slug: /ref-arch/ad1b90dbd1/4
sidebar_position: 4
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: SAP Databricks in Business Data Cloud
description: SAP and Databricks have partnered to integrate SAP data with Databricks&#39; AI and analytics platform, allowing businesses to leverage SAP data for AI and machine learning applications. This partnership simplifies data access and eliminates the need for complex ETL processes, enabling real-time analytics and AI-driven decision-making. 
sidebar_label: SAP Databricks in Business Data Cloud
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
last_update:
    date: 2025-04-17
    author: s-krishnamoorthy
############################################################
#                   End of Front Matter                    #
############################################################
---

SAP’s partnership with Databricks, a leader in unified data and AI platforms, helps streamline the data access and enables businesses to harness SAP data for AI and machine learning use cases. This integration is delivered through SAP Databricks, a fully embedded OEM component of Databricks within the SAP Business Data Cloud.

## Architecture

![drawio](drawio/bdc-databricks.drawio)

## Characteristics

### Zero-copy data exchange:

- Data products from SAP applications which are made visible within SAP Business Data Cloud catalog, can now be shared with the embedded unity catalog of databricks using a single click.
- Leverage delta-sharing to connect and blend data without the need for complex ETL pipelines.
- Through this seamless integration,  multiple personas are brought together (data scientists, data analysts and data engineers) , enabling them to collaboratively work on top of readily available SAP data.

### Development with pro-code tooling:
 - Write Apache Spark pipelines to blend SAP and non-SAP data in SAP Databricks notebook.
 - Build custom AI/ML solutions with Mosaic AI using trusted AI-ready SAP data.
 - Use Databricks SQL to analyze data at scale for faster data-driven decision making. 

### Integration Patterns

#### Geenfield Integration - For customers without an existing Enterprise databricks platform

- This is the default scenario, where the SAP Business Data Cloud includes the SAP Databricks component.
- Tightly integrated first-class Databricks experience in SAP Business Data Cloud.
- Seamless bi-directional zero-copy data sharing using deltashare protocol.


#### Brownfield Integration - For customers with an already existing Enterprise databricks platform

- Zero-copy data sharing using deltashare protocol , with 3rd party databricks environment
- Keep existing databricks investment and leverage curated SAP data without ETL for AI & Analytics in databricks.

![drawio](drawio/bdc-databricks-brownfield.drawio)


## SAP Databricks Services and Components

- **Delta Lake** : Open Data Lakehouse Foundation
- **Unity Catalog** : Unified security, governance and cataloging
- **Databricks Notebook** : Data science & AI, Realtime Analytics
- **Apache Spark** : Data processing and analytics with parallel processing capabilities
- **MLFlow** : Machine learning lifecycle management

## Use Cases for SAP Databricks

- **AI/ML**: Build robust models with curated SAP data in databricks notebooks, create derived data products and share back with SAP eco system for AI-driven decision making
- **Data Engineering**: Process semi-structured and unstructed data at scale & blend curated SAP data, simplifying data pipelines for improved collaboration.
- **Analytics**: Explore & analyze large amounts of data shared in lakehouse, for eg, from BW for real-time analytics and visualization


<!-- Add your resources here -->


