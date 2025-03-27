---
############################################################
#                Beginning of Front Matter                 #
############################################################
id: id-ra0013
slug: /ref-arch/no_idea_what_to_put_here
sidebar_position: 10
sidebar_custom_props:
  category_index: 
    - aws
    - gcp
    - azure
    - appdev
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Medallion Reference Architecture for Big Data Processing in SAP HANA Cloud
description: This reference architecture demonstrates a common use case for integrating various types of data—structured, semi-structured, and unstructured—into SAP HANA Cloud, utilizing the powerful features of SAP HANA Cloud Data Lake. By implementing this architecture, businesses can meet the challenge of providing a modern data foundation for intelligent data applications and provide cost-effective data management and analytics across the enterprise.
sidebar_label: Medallion Reference Architecture for Big Data Processing in SAP HANA Cloud
keywords: [sap, btp, cloud, datalake, medallion, hana cloud]
image: img/logo.svg
tags: [data]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - aldapooh
last_update:
  date: 2025-03-27
  author: aldapooh
############################################################
#                   End of Front Matter                    #
############################################################
---

<!-- Add the 'why?' for this architecture. Why do we have it? What is its purpose -->

**Long Description:**  
This reference architecture demonstrates a common use case for integrating various types of data—structured, semi-structured, and unstructured—into SAP HANA Cloud, utilizing the powerful features of SAP HANA Cloud Data Lake. By implementing this architecture, businesses can meet the challenge of providing a modern data foundation for intelligent data applications and provide cost-effective data management and analytics across the enterprise.

The SAP HANA Cloud, medallion architecture for Big Data processing enables organizations to streamline their data integration processes, enhancing the ability to gain critical business insights. This approach offers the scalability and flexibility to handle diverse data types while enabling an enterprise to maintain and improve data quality, reliability and high-performance analysis. This architecture is fully complimented and can be enabled by SAP Datasphere and SAP Analytics Cloud in the processing, modeling and consumption of data. It supports analytics, advanced machine learning, and intelligent data applications, providing a unified platform for comprehensive data management.



## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
![drawio](drawio/ReferenceArchitectureDiagram.drawio)

## Flow

1. 1) **Data Ingestion:**

Data Sources: The architecture begins with data ingestion from various sources, including structured, semi-structured, and unstructured data.

**Structured Data**: Structured data can come from various sources, most often databases. However, different file-formatted data sources like csv, parquet, and orc can also serve structured data.  

**Semi-structured Data**: Data that has some structure, but that structure is not rigid (eg. schema on read data), such as JSON or XML.

**Unstructured Data**: Includes data that lacks a predefined schema, like documents, images, videos, etc.  

Ingestion Methods: - there are different methods for data ingestion, including data replication, batch-based ingestion, direct ingestion via streaming, etc... The chosen method for data ingestion will depend on factors like your data sources, the required freshness of the data and performance requirements

2) **Bronze Data Layer:** Initial storage layer where raw data is ingested and most often stored in SAP HANA Cloud , data lake Files. This raw data is cataloged, filtered, and enriched before being transferred to the silver layer. This cleaning and processing of data can be accomplished in a variety of ways. For example, various ETL operations could be executed by leveraging data processing jobs created using tools like Spark or data flows in SAP Datasphere. Note that previously refined data ingested into the bronze layer may still require **additional** validation, transformation, and cleansing even though it has already been refined at another source (eg. database records coming from a transactional system). For example, to apply a consistent format to data coming from different sources but representing the same or similar business entities.

3) **Silver Data Layer**: Data in the silver layer can be stored in SAP HANA Cloud, data lake Files or in the SAP HANA Cloud, HANA database. It has a common structure and defined common properties applied to it that make it ready for easy exploration and analysis. The results of this analysis are further refinements of the data, modelling and application of more complex business rules. The resulting datasets are ready to move into the gold layer for general consumption. The processed data can stored in SAP HANA Cloud, data lake files and/or SAP HANA Cloud, SAP HANA database.

4) **Gold Data Layer:** Gold layer data is highly curated, modeled, and read optimized for consumption. This data can be exposed from either the SAP HANA Cloud, SAP HANA database, or the SAP HANA Cloud, data lake (eg. as a Delta Share) or consumed as part of further data processing activities.

5) **Data Consumption:** Processed and curated data can be consumed (read-only) from the gold data layer by various applications and services such as:

SAP HANA Cloud: Provides high-performance in-memory data processing and analytics.

SAP Datasphere: Offers comprehensive data management, modeling and integration capabilities.

SAP Analytics Cloud: Provides advanced analytics and business intelligence tools.

Business Application Studio: A development environment for building and extending SAP applications.


## Characteristics
1\. Versatility in Data Handling: This architecture can handle diverse data types from various sources - structured, semi-structured, and unstructured data. This gives the architecture immense flexibility in dealing with multiple types of data with efficiency.

2\. Staged Data Processing: The architecture follows a stepwise, systematic approach to data processing. It ingests raw data, into the landing zone (bronze), cleanses and transforms it into the staging zone (silver), and provides models and access to the final data sets in the consumption zone (gold), ensuring data quality and readiness at every step.

3\. Advanced Analytics and Machine Learning Capabilities: The architecture supports advanced analytics and advanced machine learning, allowing businesses to derive important insights and make data-driven decisions faster and more accurately.

4\. Enhancement in Data Quality: The architecture is built around data transformation and cleansing processes, which improves the quality of data in the system and enables data governance to be easily attached to all data processing.

5\. Scalability and Flexibility: The architecture is designed to handle large volumes of data in a variety of formats from many different sources. ETL operations can be applied to all incoming data to transform it into a standard format and attach meta-data to enable easy consumption.


## Services and Components

SAP HANA Cloud

SAP HANA Cloud, SAP HANA database

SAP HANA Cloud, data lake

SAP HANA Cloud, data lake files  

## Resources

- [SAP HANA Cloud, data lake documentation](https://help.sap.com/docs/hana-cloud-data-lake)
- [SAP HANA Cloud, data lake tutorials](https://developers.sap.com/tutorial-navigator.html?tag=software-product%3Atechnology-platform%2Fsap-hana-cloud%2Fsap-hana-cloud&tag=software-product-function%3Asap-hana-cloud-data-lake)
- [SAP HANA Cloud documentation](https://help.sap.com/docs/hana-cloud)
- [SAP HANA Cloud Getting Started](https://www.sap.com/products/technology-platform/hana/get-started.html?sort=latest_desc&tab=product-demos)