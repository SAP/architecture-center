---
id: id-ra0004-3
slug: /ref-arch/a07a316077/3
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Integration with Databricks
description: >-
  Data from Databricks Lakehouse can be harmonized with SAP and non-sap data via
  SAP Datasphere's unified data models for use with richer analytics and other
  use cases.
keywords:
  - sap
  - databricks
  - data federation
  - analytics harmonization
  - integration models
sidebar_label: Integration with Databricks
image: img/ac-soc-med.png
tags:
  - data
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - s-krishnamoorthy
  - chaturvedakash
discussion: 
last_update:
  author: s-krishnamoorthy
  date: 2025-10-23
---

SAP Business Data Cloud facilitates seamless harmonization of business data from SAP and non-SAP data from Enterprise Dabricks for richer Analytics and AI use cases. 
<b>BDC Connect</b> for Databricks enables the bi-directional data sharing of curated data products with enterprise databricks leveraging the industry standard open delta share protocol, enabling efficient AI/ML workloads.  SAP Business Data Cloud also allows direct JDBC connectivity with enterprise databricks delta lake at the SAP Datasphere layer, enabling a open data ecosystem integration. 

In enterprise hybrid landscapes that span diverse computing platforms and cloud sources, Delta Share–based access to AI-ready data products delivers enhanced flexibility, optimized performance, and seamless interoperability.


## Architecture 

![drawio](drawio/databricks-data-integration.drawio)

### 1. BDC Connect : Bi-directional delta share integration with enterprise databricks(<i>NEW</i>)

<ul>
  <li>With the release of BDC Connect for Enterprise Dabricks recently, SAP data products from SAP line of business applications can be shared directly with Enterprise Databricks over governed data access, and discoverable via Unity catalog.</li>
  <li>Similarly, data from Enterprise Databricks can be shared as data products back to SAP Business Data Cloud catalog via BDC Python SDK.</li>

[Ref: brownfield integration](../../RA0013/5-sap-databricks-in-business-data-cloud/readme.md#2-brownfield-integration-integrating-an-existing-enterprise-databricks-platform-with-sap-bdc)

</ul>

### 2. Integration with Databricks Delta Lake at SAP Datasphere Layer

Delta Lake is an optimized storage layer that provides the foundation for tables in a lakehouse architecture on Databricks. It brings reliability to data lakes, ensuring ACID (Atomicity, Consistency, Isolation, Durability) transactions, scalable metadata handling, and unifying streaming and batch data processing.

Data from Databricks Delta Lake tables can be **federated** live into SAP Datasphere virtual remote models using SAP Datasphere's data federation architecture. This integration allows for the seamless augmentation of Databricks data with SAP business data in real-time. The federated data can be incorporated into unified semantic models, enabling efficient and real-time analytics through SAP Analytics Cloud dashboards.

The integration process involves:

1. **Connection Setup**: Establishing a secure connection between SAP Datasphere and Databricks Delta Lake using supported connectors (JDBC connectivity using CamelJDBC Adapters) and authentication mechanisms.
2. **Data Federation**: Configuring virtual tables in SAP Datasphere that reference the live data in Databricks Delta Lake without physically moving the data.
3. **Model Augmentation**: Enhancing the federated data with SAP business data to create comprehensive and unified semantic models.
4. **Real-time Analytics**: Utilizing SAP Analytics Cloud to build dashboards and reports that leverage the real-time, federated data for actionable insights.

This approach ensures that data remains consistent and up-to-date, providing a robust foundation for advanced analytics and decision-making processes.


## Resources

- [Federating queries to Databricks from SAP Datasphere for real-time analytics in SAP Analytics Cloud](https://github.com/SAP-samples/sap-bdc-explore-hyperscaler-data/blob/main/Databricks/databricks-integration.md)