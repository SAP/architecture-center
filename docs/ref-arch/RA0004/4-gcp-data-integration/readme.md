---
id: id-ra0004-4
slug: /ref-arch/a07a316077/4
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Integration with Google Cloud Platform sources
description: >-
  Data from Google Cloud Platform (GCP) data services can be seamlessly
  integrated and harmonized with both SAP and non-SAP data using SAP
  Datasphere's advanced data fabric architecture.
keywords:
  - sap
  - cloud performance
  - google bigquery
  - data harmonization
  - advanced analytics
sidebar_label: Integration with Google Cloud Platform sources
image: img/ac-soc-med.png
tags:
  - data
  - gcp
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sivakumar
  - s-krishnamoorthy
  - jackseeburger
  - karishma-kapur
discussion: 
last_update:
  author: s-krishnamoorthy
  date: 2025-01-23
---

Data from Google Cloud Platform (GCP) data services can be seamlessly integrated and harmonized with both SAP and non-SAP data using SAP Datasphere's advanced data fabric architecture. This architecture enables efficient data management and analytics by providing a unified and scalable platform for data integration, transformation, and governance.

SAP Datasphere's data fabric architecture supports various modes of integration, including data federation, replication, and import/export capabilities. This allows organizations to leverage GCP's robust data services such as Google BigQuery and Google Cloud Storage, and combine them with SAP's enterprise data to create comprehensive and actionable insights.

## Architecture

![drawio](drawio/gcp-data-integration.drawio)

### Key Features:

- **Data Federation**: Live data federation from GCP services into SAP Datasphere, enabling real-time analytics and reporting without the need for data duplication.
- **Data Replication**: Seamless replication of data between SAP systems and GCP services, ensuring data consistency and availability across platforms.
- **Data Import/Export**: Efficient data import and export mechanisms to move data between GCP and SAP Datasphere, facilitating data enrichment and advanced analytics.

### Benefits:

- **Unified Data View**: Achieve a holistic view of enterprise data by integrating disparate data sources from GCP and SAP.
- **Scalability**: Leverage the scalable infrastructure of GCP and SAP Datasphere to handle large volumes of data and complex analytics workloads.
- **Enhanced Analytics**: Perform advanced analytics and machine learning on integrated datasets to drive business insights and decision-making.

By utilizing SAP Datasphere's data fabric architecture, organizations can unlock the full potential of their data assets, driving innovation and competitive advantage in the digital economy.


## 1. Integration with Google BigQuery

**Mode(s) of Integration:** Federating data live from Google BigQuery into SAP Datasphere, Replicating data out to BigQuery.

Google BigQuery is a managed, serverless cloud data warehouse product by Google, offering scalable analysis over large quantities of data. It supports SQL queries and provides high-speed data processing capabilities, making it ideal for large-scale data analytics.

### Federating Data Live from Google BigQuery

Data from Google BigQuery can be **federated** live into SAP Datasphere remote models using SAP Datasphere's data federation architecture. This approach allows for real-time data access without the need for data duplication. By federating data, organizations can create unified semantic models that combine Google BigQuery data with SAP business data. These models enable efficient and real-time analytics using SAP Analytics Cloud dashboards, providing comprehensive insights and facilitating data-driven decision-making.

For detailed step-by-step information on federating data live from Google BigQuery and to try out the integration, visit the blog: [Integrate Google BigQuery and SAP Datasphere](https://community.sap.com/t5/technology-blogs-by-sap/data-federation-between-sap-data-warehouse-cloud-dwc-and-google-bigquery/ba-p/13465470).

### Replicating Data to Google BigQuery

Data from SAP source systems such as S/4HANA and BW/4HANA can be directly **replicated** out to Google BigQuery using SAP Datasphere's *Replication Flows*. This replication ensures that data is consistently and accurately transferred between SAP systems and Google BigQuery, maintaining data integrity and availability across platforms. Replication Flows support various data transfer scenarios, including full and incremental loads, to accommodate different business needs and data volumes.

For detailed step-by-step information on replicating data out to Google BigQuery using Replication Flows, visit the blog: [Replication Flows - SAP Datasphere and Google BigQuery](https://community.sap.com/t5/technology-blogs-by-sap/replication-flows-sap-datasphere-and-google-big-query/ba-p/13581256).

By leveraging these integration modes, organizations can harness the power of both SAP Datasphere and Google BigQuery, enabling advanced analytics and comprehensive data management strategies.


## 2. Integration with Google Cloud Storage

**Mode(s) of Integration:** Replicating data out with _Replication Flows_, Importing data into SAP Datasphere using _Data Flows_.

Google Cloud Storage is a managed cloud storage service by Google designed for storing unstructured data. It provides global storage and retrieval capabilities, allowing organizations to store and access any amount of data at any time, from anywhere in the world.

### Importing Data into SAP Datasphere

Non-SAP data from Google Cloud Storage can be **imported** into SAP Datasphere using the _Data Flow_ feature. This feature enables the seamless transfer of data from Google Cloud Storage into SAP Datasphere, where it can be utilized for various applications such as Financial Planning or business analytics in SAP Analytics Cloud. The _Data Flow_ feature supports complex data transformation and enrichment processes, ensuring that the imported data is ready for immediate use in analytical and planning scenarios.

For detailed step-by-step information on integrating Google Cloud Storage data with SAP Datasphere for use with Financial Planning, visit the Discovery Center mission: [Perform Financial Planning with SAP and Google data](https://discovery-center.cloud.sap/missiondetail/4224/).

### Replicating Data to Google Cloud Storage

Data from SAP source systems such as S/4HANA and BW/4HANA can be directly **replicated** out to Google Cloud Storage using SAP Datasphere's _Replication Flows_. This replication process ensures that data is consistently and accurately transferred from SAP systems to Google Cloud Storage, maintaining data integrity and availability across platforms. _Replication Flows_ support various data transfer scenarios, including full and incremental loads, to accommodate different business needs and data volumes. This capability is crucial for organizations looking to leverage the scalability and flexibility of Google Cloud Storage for their data storage and management needs.