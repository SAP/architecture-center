---
id: id-ra0004
slug: /ref-arch/28ac36db13
sidebar_position: 4
sidebar_custom_props:
  category_index:
    - data
    - aws
    - azure
    - gcp
title: Explore your Hyperscaler data with SAP Datasphere
description: SAP Datasphere's data integration architectures that harmonizes SAP and non-SAP data using data fabric architecture helps business experts to make data-driven decisions with unprecedented impact.
keywords:
  - sap
  - datasphere
  - federation
  - replication
  - hyperscaler
sidebar_label: Explore your Hyperscaler data with SAP Datasphere
image: img/logo.svg
tags:
  - azure
  - aws
  - gcp
  - data
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sivakumar
  - anirban-sap
  - s-krishnamoorthy
  - jackseeburger
  - chaturvedakash
  - karishma-kapur
  - ranbian
last_update:
  author: s-krishnamoorthy
  date: 2025-01-23
---

SAP Datasphere empowers organizations with a comprehensive business data fabric architecture, seamlessly integrating mission-critical data from across the enterprise. This powerful platform enables business experts to make data-driven decisions with unprecedented impact. By providing federated data access and remote table replication from SAP line of business solutions, SAP Datasphere ensures that data is always accessible and up-to-date.

In this architecture, SAP Datasphere goes beyond merely connecting SAP data; it also integrates non-SAP data from leading hyperscaler services such as AWS, Microsoft Azure, and Google Cloud Platform. This integration allows businesses to combine diverse data sources into unified data models within SAP Datasphere, facilitating faster and more insightful business analytics.

With SAP Datasphere, organizations can:

- Harmonize data from various SAP and non-SAP sources, ensuring a single source of truth.
- Enable real-time data federation, allowing for immediate access and analysis of data without the need for physical data movement.
- Utilize remote table replication to ensure data consistency and reliability across different systems.
- Leverage advanced data modeling capabilities to create comprehensive and insightful data models.
- Enhance decision-making processes by providing business experts with timely and accurate data insights.

By integrating data from multiple sources and providing robust data management capabilities, SAP Datasphere helps organizations unlock the full potential of their data, driving innovation and achieving strategic business objectives.

## Architecture

![drawio](drawio/explore-hyperscaler-data.drawio)

## Flow

The reference architecture diagram shows how the data from different hyperscaler stores can be unified with data from SAP sources via SAP Datasphere. Numbers below correspond to the flow numbers in the architecture diagram above.

1. Data from SAP sources such as SAP S/4HANA and BW/4HANA are connected to SAP Datasphere using native connections available in SAP Datasphere.
The data from these sources are then accessed in SAP Datasphere virtually using these connections.

2. SAP source data can also be replicated for persistence in SAP Datasphere using these connections.  

3. Data from external (non-SAP) sources such as Amazon Redshift, Microsoft Fabric, and Databricks Delta Lake can be seamlessly integrated into SAP Datasphere. This integration leverages Smart Data Integration (SDI) and the Data Provisioning (DP) Agent, which host the necessary adapters and drivers. These components act as a proxy layer, enabling secure and efficient connections to the hyperscaler sources. Once connected, data from these sources can be federated in real-time using virtual or remote tables within SAP Datasphere, ensuring immediate access and up-to-date information for analytics and decision-making.

4. Data from SAP sources are replicated out to the external hyperscalaer stores such as Google BigQuery, Amazon S3, and Azure Data Lake Storage Gen2 via SAP Datasphere through its Replication Flow feature.

5. Data from a cost-efficient hyperscaler object stores like Google Cloud Storage or Amazon S3 can be imported into SAP Datasphere via Data Flows . With this approach the data can be transformed during the transfer and persisted "physically" in SAP Datasphere.

## When to use

### Replication Flow

- When data from SAP sources such as SAP S/4HANA or SAP BW/4HANA needs to be transferred directly out for storage in external hyperscaler stores such as Amazon S3 or Google Cloud Storage, the *Replication Flow* feature of SAP Datasphere should be used.
- Data can also be moved into SAP Datasphere from SAP data sources using *Replication Flows* for persistence inside SAP Datasphere.
- Data persisted and enriched in SAP Datasphere can also be moved into external environments for use with downstream use cases in hyperscalers.
- Any data that is moved out into external targets via SAP Datasphere is done with the help of "premium outbound integration" powered by *Replication Flows*.

## Capabilities of Replication Flows in SAP Datasphere

Replication Flows in SAP Datasphere offer robust capabilities to ensure seamless data movement and integration across various environments. Here are some key features:

1. **Bidirectional Data Movement**:
	- Replication Flows support the transfer of data both into and out of SAP Datasphere. This bidirectional capability ensures that data can be ingested from SAP sources for processing and analysis, and subsequently exported to external hyperscaler environments for further use.

2. **Real-Time Data Synchronization**:
	- With Replication Flows, data synchronization occurs in real-time, ensuring that the most current data is always available. This is crucial for maintaining data consistency and reliability across different systems.

3. **Support for Multiple Data Sources**:
	- Replication Flows can handle data from a variety of SAP sources, including SAP S/4HANA and SAP BW/4HANA. This versatility allows organizations to consolidate data from multiple SAP systems into a single, unified platform.

4. **Integration with Hyperscaler Storage Solutions**:
	- Data can be seamlessly transferred to external hyperscaler storage solutions such as Amazon S3, Google Cloud Storage, and Azure Data Lake Storage Gen2. This integration enables organizations to leverage the scalability and cost-efficiency of cloud storage.

5. **Premium Outbound Integration**:
	- The "premium outbound integration" feature ensures that data exported from SAP Datasphere to external targets is done efficiently and securely. This premium service guarantees high performance and reliability for outbound data transfers.

6. **Data Enrichment and Transformation**:
	- Before data is moved out of SAP Datasphere, it can be enriched and transformed within the platform. This ensures that the data is in the optimal format and structure for downstream use cases in hyperscaler environments.

7. **Automated and Scheduled Transfers**:
	- Replication Flows can be configured to run automatically on a scheduled basis. This automation reduces the need for manual intervention and ensures that data transfers occur consistently and reliably.

### Federation

- When data from external hyperscaler sources needs to be harmonized with SAP data sources in real-time to help derive richer insights for Analytics applications, then the data federation architecture is used.
- Data from sources are virtually accessed via remote tables in SAP Datasphere.
- Data remains in its sources and queries are pushed to sources directly.
- Examples of such real-time virtualized data access include integrations with SAP S/4HANA, SAP BW/4HANA, Amazon Athena, Google BigQuery, and Databricks Delta Lake, to name a few.
- To benefit from real-time integration that efficiently queries and returns results to SAP Datasphere, the queries are designed with strategies such as filtering, aggregation, and partitioning at the source.

Data federation in SAP Datasphere allows organizations to access and analyze data from multiple sources without the need for physical data movement. This approach ensures that data remains in its original location while still being available for real-time analytics and decision-making. Here are some key aspects of data federation:

1. **Virtual Data Access**:
	- Data federation enables virtual access to data stored in various sources. This means that data can be queried and analyzed in real-time without the need to replicate or move it physically into SAP Datasphere.

2. **Real-Time Insights**:
	- By leveraging data federation, organizations can gain real-time insights from their data. This is particularly useful for scenarios where timely information is critical for decision-making.

3. **Seamless Integration**:
	- Data federation supports seamless integration with a wide range of data sources, including SAP systems (such as SAP S/4HANA and SAP BW/4HANA) and non-SAP systems (such as Amazon Athena, Google BigQuery, and Databricks Delta Lake). This flexibility allows organizations to create a unified view of their data landscape.

4. **Optimized Query Performance**:
	- To ensure efficient query performance, data federation leverages strategies such as filtering, aggregation, and partitioning at the source. This means that only the necessary data is retrieved and processed, reducing the load on both the source systems and SAP Datasphere.

5. **Cost Efficiency**:
	- Since data federation avoids the need for data replication, it can lead to cost savings in terms of storage and data transfer. Organizations can access and analyze their data without incurring additional costs associated with data movement.

6. **Scalability**:
	- Data federation is highly scalable, allowing organizations to integrate and analyze data from an increasing number of sources as their data landscape grows. This scalability ensures that the data architecture can evolve with the organization's needs.

### Data Flow

- When data from external hyperscaler sources needs to be imported into and persisted in SAP Datasphere for use with downstream applications such as building unified semantic models for use with Analytics applications, then the *data flow* integration is used.
- Data Flow helps import data on a scheduled basis using automatic imports.
- Create a data flow to move and transform data in an intuitive graphical interface. You can drag and drop sources from the Source Browser, join them as appropriate, add other operators to remove or create columns, aggregate data, and do Python scripting, before writing the data to the target table.

## Integration categorized by Sources

- [Integration with AWS sources](aws-data-integration/readme.md)
- [Integration with Google Cloud Platform Sources](gcp-data-integration/readme.md)
- [Integration with Azure data sources](azure-data-integration/readme.md)
- [Integration with Databricks](databricks-data-integration/readme.md)
