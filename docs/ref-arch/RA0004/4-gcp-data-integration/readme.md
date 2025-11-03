---
id: id-ra0004-4
slug: /ref-arch/a07a316077/4
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Integration with Google Cloud Platform sources
description: >-
  Integrate non-SAP data in Google Cloud Platform with business data from SAP using SAP Business Data Cloud's seamless data integration architectures to enable holistic AI/ML & Analytics use cases.
keywords:
  - sap
  - cloud performance
  - google bigquery
  - data harmonization
  - advanced analytics
  - bdc connect 
  - delta share
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
  date: 2025-10-23
---

Non-SAP and third-party data(such as Trends, Google Analytics, Ads) from Google Cloud Platform services can be effortlessly integrated and harmonized with SAP business data through SAP Business Data Cloud. Leveraging open data protocols and advanced data fabric architectures, this approach enables secure, bi-directional data sharing and unified access to information across systems. The result is a centrally governed, holistic data environment that supports efficient analytics and AI/ML-driven use cases—all built on industry-standard open protocols.

<ul>
  <li>With the introduction of BDC Connect for Google BigQuery(<i>GA: to be added to [roadmap](https://roadmaps.sap.com/board?PRODUCT=73555000100800004851&range=CURRENT-LAST&q=Google%20BigQuery#Q4%202025)</i>), SAP data products from SAP line of business applications can be shared directly with Google Big Query over governed data access, and discoverable via Google DataPlex catalog.</li>
  <li>Data from Google BigQuery can be shared back as data products to SAP Business Data Cloud catalog via Google DataPlex.</li>
</ul>

## Architecture

![drawio](drawio/gcp-data-integration.drawio)


## 1. Integration with Google BigQuery

Google BigQuery is a managed, serverless cloud data warehouse product by Google, offering scalable analysis over large quantities of data. Its highly scalable infrastructure provides high-speed data processing capabilities, making it ideal for large-scale data analytics.
### Modes of Integration: ### 
<ul> 
<li><b>Delta Sharing via BDC Connect</b>(<i>NEW</i>)</li>
Curated and managed data products can be shared bi-directionally in a governed manner between Google BigQuery and SAP Business Data Cloud enabling Zero-Copy federated direct access of data using Industry standard open protocols (Delta Sharing). <b><i>[recommended, due to the following differentiation this integration brings]</i></b>
    <ul>
      <li>**Delta Share access:** Leverages delta sharing open data protocol, enabling interoperability across different computing platforms, cloud environments, and applications without data duplication.</li>
      <li>**Unified Data View:**  Achieve a holistic view of harmonized enterprise data and third-party data by integrating disparate data sources between Google BigQuery and SAP Business Data Cloud.</li>
      <li>**Opens up flexible infrastructure choices:** Leverage the highly scalable infrastructure of Google BigQuery , and powerful enterprise analytics capabilties of SAP Business Data Cloud to handle large volumes of data and complex analytics workloads.</li>
      <li>**Access to AI-ready data**: AI-ready curated SAP data products shared directly from SAP Business Data Cloud's Object Store layer with Google BigQuery in a secured, governed manner helps enterprise AI/ML workloads at Google Vertex AI</li>
    </ul>
<p></p>
<li>****Federating Data with SAP Datasphere****</li>

Data from Google BigQuery can be **federated** live into SAP Business Data Cloud's SAP Datasphere layer remote models using SAP Datasphere's data federation architecture. This approach allows for real-time data access without the need for data duplication. By federating data, organizations can create unified semantic models that combine Google BigQuery data with SAP business data. These models enable efficient and real-time analytics using SAP Analytics Cloud dashboards, providing comprehensive insights and facilitating data-driven decision-making.

For detailed step-by-step information on federating data live from Google BigQuery and to try out the integration, visit the github: [Integrate Google BigQuery and SAP Datasphere](https://github.com/SAP-samples/sap-bdc-explore-hyperscaler-data/blob/main/GCP/bigquery-data-federation.md).

 <li>****Replicating Data to Google BigQuery****</li>

Data from SAP source systems such as S/4HANA and BW/4HANA can be directly **replicated** out to Google BigQuery using SAP Datasphere's *Replication Flows*. This replication ensures that data is consistently and accurately transferred between SAP systems and Google BigQuery, maintaining data integrity and availability across platforms. Replication Flows support various data transfer scenarios, including full and incremental loads, to accommodate different business needs and data volumes.

For detailed step-by-step information on replicating data out to Google BigQuery using Replication Flows, visit the github: [Replication Flows - SAP Datasphere and Google BigQuery](https://github.com/SAP-samples/sap-bdc-explore-hyperscaler-data/blob/main/GCP/bigquery-data-replication.md).


 
</ul>

## 2. Integration with Google Cloud Storage

Google Cloud Storage is a managed cloud storage service by Google designed for storing unstructured data. It provides global storage and retrieval capabilities, allowing organizations to store and access any amount of data at any time, from anywhere in the world.
### Modes of Integration: ### 

<ul> 
<li><b>Importing Data into SAP Datasphere</b></li>

Non-SAP data from Google Cloud Storage can be **imported** into SAP Datasphere using the _Data Flow_ feature. This feature enables the seamless transfer of data from Google Cloud Storage into SAP Datasphere, where it can be utilized for various applications such as Financial Planning or business analytics in SAP Analytics Cloud. The _Data Flow_ feature supports complex data transformation and enrichment processes, ensuring that the imported data is ready for immediate use in analytical and planning scenarios.

For detailed step-by-step information on integrating Google Cloud Storage data with SAP Datasphere for use with Financial Planning, visit the Discovery Center mission: [Perform Financial Planning with SAP and Google data](https://discovery-center.cloud.sap/missiondetail/4224/).

<li>****Replicating Data to Google Cloud Storage****</li>

Data from SAP source systems such as S/4HANA and BW/4HANA can be directly **replicated** out to Google Cloud Storage using SAP Datasphere's _Replication Flows_. This replication process ensures that data is consistently and accurately transferred from SAP systems to Google Cloud Storage, maintaining data integrity and availability across platforms. _Replication Flows_ support various data transfer scenarios, including full and incremental loads, to accommodate different business needs and data volumes. This capability is crucial for organizations looking to leverage the scalability and flexibility of Google Cloud Storage for their data storage and management needs.
</ul>