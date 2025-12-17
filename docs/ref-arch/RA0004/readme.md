---
id: id-ra0004
slug: /ref-arch/a07a316077
sidebar_position: 4
sidebar_custom_props:
  category_index:
    - data
    - aws
    - azure
    - gcp
title: Explore your Hyperscaler data with SAP Business Data Cloud
description: >-
  Explore how SAP Business Data Cloud (BDC) acts as the business-centric integration layer for enterprises looking to harmonize SAP and non-SAP data across platforms like Snowflake, Azure, GCP, AWS, and Databricks.
keywords:
  - sap
  - datasphere
  - federated architecture
  - business-driven decisions
  - cloud hyperscaler data
  - bdc connect
  - zero copy
sidebar_label: Explore your Hyperscaler data with SAP Business Data Cloud
image: img/ac-soc-med.png
tags:
  - azure
  - aws
  - gcp
  - data
  - snowflake
  - databricks
  - bdc
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
  - jasoncwluo
discussion: 
last_update:
  author: s-krishnamoorthy
  date: 2025-10-23
---

In this era of AI and multi cloud landscapes, SAP Business Data Cloud helps digital transformation by harmonizing data across <b>all business processes</b> and across the <b>hybrid cloud landscapes</b>, breaking down silos and creating a real-time, holistic view of your business for more agile, informed decision-making. 

The core architectural principle of the business data fabric strategy is to enable seamless and scalable access to mission-critical business data with the semantics and business context preserved. SAP Business Data Cloud connects all data by leveraging business data fabric principles, making it easier to discover, share, govern, and model data.  Our business data fabric strategy began with the launch of SAP Datasphere and continues on with SAP Business Data Cloud.

In this zoomed-in architecture focused on the open data ecosystem integration that <b>forms the base for AI/ML, application and analytics innovations</b>, and we will see how SAP Business Data Cloud acts as the business-centric integration layer for enterprises looking to harmonize SAP (e.g., S/4HANA, SuccessFactors) and non-SAP data across platforms like Snowflake, Azure, GCP, AWS, and Databricks. SAP BDC is built to bridge fragmented landscapes, unify semantic context, and streamline access, governance, and AI adoption.  

As enterprise architects and data strategists seeking a detailed, zoomed-in view of the foundational data integration architectures that make large-scale, AI-centric solutions possible, you’ll see that the architecture below supports: 

- <b>Lakehouse and Hybrid architectures</b> : The lakehouse model combines the flexibility of data lakes with the reliability and performance of data warehouses, allowing both structured and unstructured data analytics under one roof. SAP Business Data Cloud helps support diverse workloads (BI, AI/ML, streaming) and simplify data access and movement across data lakes and warehouses.

- <b>AI/ML-Driven Data Architectures</b> : By acting as the unified data foundation that keeps business context intact, SAP Business Data Cloud makes it easier to help unlock unparalleled business insights and AI potential across AI/ML platforms.

- <b>Native integration with external platforms</b>: SAP BDC natively integrates and can connect directly to external systems such as Google BigQuery and other cloud lakes, supporting multi-cloud and cross-platform analytics as required by modern enterprise architectures.

- <b>Real-Time Data Management</b> : Enable real-time data federation, allowing for immediate access to business data without the need for physical data movement.



## Architecture

![drawio](drawio/explore-hyperscaler-data.drawio)

## Flows

The reference architecture diagram above shows how the data from different hyperscaler stores and data from SAP sources can be integrated using SAP Business Data Cloud.

1. <b>SAP source integration options</b>: 
   <ul>
     <li>Business Data from SAP applications such as SAP S/4HANA and SAP SuccessFactors are brought into the Object Store Layer of Business Data Cloud in the form of Data Products ,enabling secured governed access of SAP data [<i><b>recommended</b></i>] </li>
     <li>SAP Business Data Cloud also allows these systems to be connected natively using direct connections available in the SAP Datasphere layer for remote or replicated data access</li>
   </ul>

2. <b> Non-SAP (hyperscaler) data source integration options</b>:
     <ul>
       <li><b>BDC Connect / Delta Sharing integration[<i>NEW</i>]: </b> Using the Delta Share protocol via the BDC Connect component, data from the Object Store layer of SAP Business Data cloud can be shared instantly with external hyperscaler partner landscapes such as Databricks, Google BigQuery [<i>Currently</i>, while other partner integrations available soon].  The SAP BDC Connect component also enables sharing of data products from these external sources into SAP Business Data Cloud catalog. This makes is bi-directional dataproduct sharing on a zero copy federated principle, along with added advantage of secured and governed access[<i><b>recommended</b></i>]</li>
       <li><b>Data Federation - SAP Datasphere : </b>Data from external (non-SAP) sources such as Google BigQuery, Amazon Athena can be connected directly with SAP Datasphere layer of SAP Business Data Cloud as well, while sources such as Amazon Redshift, Microsoft Fabric, and Databricks Delta Lake leverages Smart Data Integration (SDI) and the Data Provisioning (DP) Agent for the connectivity, which hosts the necessary adapters and drivers, acting as the proxy layer, enabling secure and efficient connections to hyperscaler sources. These connections allow federated access in real-time using virtual or remote tables within SAP Datasphere, ensuring real-time access of non-SAP sources.</li>
      <li><b>Replication Flows - SAP Datasphere : </b>Data from SAP sources are replicated out to the external hyperscalaer stores such as Google BigQuery, Amazon S3, and Azure Data Lake Storage Gen2 via SAP Datasphere through its Replication Flow feature.</li>
      <li><b>Data Flows - SAP Datasphere : </b>Data from a cost-efficient hyperscaler object stores like Google Cloud Storage or Amazon S3 can be imported into SAP Datasphere via Data Flows . With this approach the data can be transformed during the transfer and persisted "physically" in SAP Datasphere.</li>
     </ul>


## When to use

### BDC Connect - Delta Sharing integration 

- When a AI/ML or Analytics use case in a hybrid landscape can take advantage of the Zero-Copy / federated access of data from single source of truth (in both direction) , and can benefit from the efficiency of secured, governed access via the Delta Sharing protocol that make the integration possible at the Object Store level. 

- This integration is centered around the concept of 'Data Product', which is an abstraction that represents a type of data or data set within a system, facilitating easier management and sharing across different platforms. Publishing a Data Product allows these systems to access and consume the data, ensuring seamless communication and resource sharing. 

- Each SAP application in a BDC landscape will automatically appear in the SAP Databricks account as a provider. Activating a data product in SAP Business Data Cloud automatically creates a Delta Share from BDC Catalog to SAP Databricks Unity Catalog . These data products can now be used in notebooks, the SQL editor, and AI/ML products. 

- Similarly, after creating assets in SAP Databricks (e.g, as a result of a M/L experiment), they can be published back to SAP Business Data Cloud Catalog as data products using Python SDK (sap-bdc-connect-sdk), so that it becomes discoverable by other consumer applications in SAP Business Data Cloud, for example by SAP Datasphere.

**Differentiation and Benefits**: 

1. **Open Protocol**: Industry standard for data sharing, allowing interoperability across platforms like Spark, Pandas, Power BI, and more. 

2. **Live Data Access**: Share live, ready-to-query data directly from your data lake (e.g., Delta Lake) without replication. 

3. **Data Product Sharing**: Access to curated, SAP-managed data products that provide a harmonized data model across all lines of business while preserving business context and semantics.

4. **Security & Governance**: Includes fine-grained access control, auditing, and centralized governance . Security protocols such as mutual Transport Layer Security (mTLS) and OpenID Connect (OIDC) are implemented for safe data exchanges



### Replication Flow

- When data from SAP sources such as SAP S/4HANA or SAP BW/4HANA needs to be transferred directly out for storage in external hyperscaler stores such as Amazon S3 or Google Cloud Storage, the *Replication Flow* feature of SAP Datasphere should be used.
- Data can also be moved into SAP Datasphere from SAP data sources using *Replication Flows* for persistence inside SAP Datasphere.
- Data persisted and enriched in SAP Datasphere can also be moved into external environments for use with downstream use cases in hyperscalers.
- Any data that is moved out into external targets via SAP Datasphere is done with the help of "premium outbound integration" powered by *Replication Flows*.

Replication Flows in SAP Datasphere offer robust capabilities to ensure seamless data movement and integration across various environments. Here are some key features : Bidirectional Data Movement, Real-Time Data Synchronization, Integration with Hyperscaler Storage Solutions, Automated and Scheduled Transfers



### Federation

- When data from external hyperscaler sources needs to be harmonized with SAP data sources in real-time at the SAP Datasphere layer (as opposed to leveraging the Object Store based secure, centrally-governed Delta Sharing integration mentioned earlier) , then the data federation integration at SAP Datasphere is used.
- Data from sources are virtually accessed via remote tables in SAP Datasphere.
- Data remains in its sources and queries are pushed to sources directly.
- Examples of such real-time virtualized data access include integrations with SAP S/4HANA, SAP BW/4HANA, Amazon Athena, Google BigQuery, and Databricks Delta Lake, to name a few.
- To benefit from real-time integration that efficiently queries and returns results to SAP Datasphere, the queries are designed with strategies such as filtering, aggregation, and partitioning at the source.

Data federation in SAP Datasphere allows organizations to access and analyze data from multiple sources without the need for physical data movement. This approach ensures that data remains in its original location while still being available for real-time analytics and decision-making. Here are some key aspects of data federation:  Virtual Data Access, Real-Time Insights, Seamless Integration


### Data Flow

- When data from external hyperscaler sources needs to be imported into and persisted in SAP Datasphere for use with downstream applications such as building unified semantic models for use with Analytics applications, then the *data flow* integration is used.
- Data Flow helps import data on a scheduled basis using automatic imports.
- Create a data flow to move and transform data in an intuitive graphical interface. You can drag and drop sources from the Source Browser, join them as appropriate, add other operators to remove or create columns, aggregate data, and do Python scripting, before writing the data to the target table.

## Integration categorized by Sources

- [Integration with AWS sources](1-aws-data-integration/readme.md)
- [Integration with Google Cloud Platform Sources](4-gcp-data-integration/readme.md)
- [Integration with Azure data sources](2-azure-data-integration/readme.md)
- [Integration with Databricks](3-databricks-data-integration/readme.md)
- [Integration with Snowflake](5-snowflake-data-integration/readme.md)
