---
id: id-ra0004-2
slug: /ref-arch/a07a316077/2
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Integration with Azure data sources
description: >-
  Data from Azure platform data services can be seamlessly integrated and
  harmonized with both SAP and non-SAP data using SAP Datasphere's robust data
  fabric architecture. This architecture facilitates the unification of
  disparate data sources, enabling comprehensive data modeling and analytics.
keywords:
  - sap
  - azure
  - data explorer
  - Azure Data Lake Storage Gen2
  - data federation
sidebar_label: Integration with Azure data sources
image: img/logo.svg
tags:
  - azure
  - data
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sivakumar
  - s-krishnamoorthy
  - karishma-kapur
discussion: 
last_update:
  author: s-krishnamoorthy
  date: 2025-01-23
---

Data from Azure platform data services can be seamlessly integrated and harmonized with both SAP and non-SAP data using SAP Datasphere's robust data fabric architecture. This architecture facilitates the unification of disparate data sources, enabling comprehensive data modeling and analytics.

SAP Datasphere's data fabric architecture supports various modes of data integration, including data federation and data replication. Data federation allows real-time access to data without the need for physical data movement, ensuring up-to-date insights and reducing data latency. On the other hand, data replication involves copying data from source systems to SAP Datasphere, enabling high-performance data processing and analytics.

By leveraging SAP Datasphere, organizations can create a unified semantic layer that combines data from Azure services such as Azure Data Explorer and Azure Data Lake Storage with SAP business data. This unified view empowers users to perform advanced analytics and generate actionable insights using tools like SAP Analytics Cloud.

Furthermore, SAP Datasphere provides robust data governance and security features, ensuring that integrated data complies with organizational policies and regulatory requirements. This comprehensive approach to data integration and harmonization helps organizations maximize the value of their data assets and drive informed decision-making.


## Architecture

![drawio](drawio/azure-data-integration.drawio)


## 1. Integration with Azure Data Explorer

**Mode(s) of Integration:** Federating data live into SAP Datasphere.

Azure Data Explorer is a fully managed data analytics service on the Azure platform designed for real-time analysis of large volumes of data streaming from applications, websites, IoT devices, and more. It provides a powerful query engine and a highly optimized data storage architecture, making it ideal for interactive analytics and complex data exploration.

### Federating Data from Azure Data Explorer into SAP Datasphere

Data from Azure Data Explorer can be **federated** live into SAP Datasphere remote models using SAP Datasphere's data federation architecture. This approach allows for real-time access to data without the need for physical data movement, ensuring that the most current data is available for analysis. 

#### Technical Details and Examples

1. **Setting Up the Connection:**
    - **Prerequisites:** Ensure that you have the necessary permissions and credentials to access both Azure Data Explorer and SAP Datasphere.
    - **Connection Configuration:** Use the SAP Datasphere connection management interface to configure a new connection to Azure Data Explorer. Provide the required connection details such as the cluster URL, database name, and authentication credentials.

2. **Creating Remote Tables:**
    - **Remote Table Definition:** Define remote tables in SAP Datasphere that map to the tables or queries in Azure Data Explorer. This can be done using the remote table creation wizard in SAP Datasphere.
    - **Example Query:** 
      ```sql
      .create table MyTable (Timestamp: datetime, DeviceId: string, Temperature: real)
      ```
    - **Federation Query:** Use SAP Datasphere to create a remote table that references the above table in Azure Data Explorer.

3. **Data Augmentation:**
    - **Combining Data:** Augment the federated data from Azure Data Explorer with SAP business data. For example, you can join sales data from SAP S/4HANA with IoT sensor data from Azure Data Explorer to analyze the impact of environmental conditions on product sales.
    - **Example Join Query:**
      ```sql
      SELECT 
         SalesData.ProductID, 
         SalesData.SalesAmount, 
         SensorData.Temperature 
      FROM 
         SalesData 
      JOIN 
         SensorData 
      ON 
         SalesData.DeviceId = SensorData.DeviceId
      ```

4. **Real-Time Analytics:**
    - **Dashboards and Reports:** Use SAP Analytics Cloud to create dashboards and reports that visualize the federated data. This enables real-time monitoring and analysis of key metrics.
    - **Example Dashboard:** Create a dashboard that shows real-time temperature readings from IoT devices alongside sales performance metrics.

For detailed step-by-step information on federating data live from Azure Data Explorer and to try out the integration, visit the Discovery Center mission: [Integrate Azure Data Explorer and SAP Datasphere](https://discovery-center.cloud.sap/missiondetail/3433/3473/).

## 2. Integration with Azure Data Lake Storage Gen2

**Mode(s) of Integration:** Replicating data out with *Replication Flows*, Importing data into SAP Datasphere using *Data Flows*.

Azure Data Lake Storage is a scalable and secure data lake solution designed to handle large volumes of data in various formats. It supports big data analytics and is optimized for high-performance workloads.

### Importing Data into SAP Datasphere

Non-SAP data from Azure Data Lake Storage can be **imported** into SAP Datasphere using the *Data Flow* feature. This allows organizations to leverage data stored in Azure Data Lake for applications such as financial planning and business analytics in SAP Analytics Cloud.

#### Steps to Import Data:

1. **Set Up Data Flow:**
    - **Prerequisites:** Ensure you have the necessary permissions and credentials to access both Azure Data Lake Storage and SAP Datasphere.
    - **Configuration:** Use the SAP Datasphere interface to create a new data flow. Provide the required connection details such as the storage account name, container name, and authentication credentials.

2. **Define Data Transformation:**
    - **Data Mapping:** Map the data fields from Azure Data Lake Storage to the corresponding fields in SAP Datasphere.
    - **Transformation Rules:** Apply any necessary data transformation rules to ensure the data is in the correct format for analysis.

3. **Load Data:**
    - **Execution:** Execute the data flow to import the data into SAP Datasphere.
    - **Validation:** Validate the imported data to ensure accuracy and completeness.

### Replicating Data to Azure Data Lake Storage

Data from SAP source systems such as S/4HANA and BW/4HANA can be **replicated** to Azure Data Lake Storage Gen2 using SAP Datasphere's *Replication Flows*. This enables organizations to store and analyze SAP data alongside other enterprise data in a unified data lake.

#### Steps to Replicate Data:

1. **Set Up Replication Flow:**
    - **Prerequisites:** Ensure you have the necessary permissions and credentials to access both SAP source systems and Azure Data Lake Storage.
    - **Configuration:** Use the SAP Datasphere interface to create a new replication flow. Provide the required connection details such as the SAP system credentials and Azure Data Lake Storage account information.

2. **Select Data for Replication:**
    - **Data Selection:** Choose the specific tables or datasets from the SAP source systems that need to be replicated.
    - **Scheduling:** Schedule the replication flow to run at desired intervals to ensure data is kept up-to-date.

3. **Monitor Replication:**
    - **Execution:** Execute the replication flow to start the data replication process.
    - **Monitoring:** Monitor the replication process to ensure it completes successfully and troubleshoot any issues that arise.

For detailed step-by-step information on replicating data to Azure Data Lake Storage using Replication Flows, visit the blog [SAP Datasphere Replication Flow from S/4HANA to Azure Data Lake](https://community.sap.com/t5/technology-blogs-by-sap/sap-datasphere-replication-flow-from-s-4hana-to-azure-data-lake/ba-p/13585656).