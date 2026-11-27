---
id: af1cc6
slug: /ref-arch/af1cc6
sidebar_position: 1
title: Data Integration with AWS
description: "Integrate AWS data with SAP Business Data Cloud through SAP BDC Connect for Amazon Athena. "
keywords:
  - sap
  - aws data integration
  - sap datasphere
  - amazon redshift
  - amazon athena
  - amazon s3
  - smart data integration
  - data federation
  - replication flows
  - sap analytics cloud
  - data fabric architecture
  - business ai platform
sidebar_label: Integration with AWS
image: img/ac-soc-med.png
tags:
  - aws
  - data
  - bdc
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sivakumar
  - s-krishnamoorthy
  - feng
  - karishma-kapur
discussion: 
last_update:
  author: s-krishnamoorthy
  date: 2026-11-25
---

:::note Joint Reference Architecture

**This content was developed in collaboration with Amazon.**

:::

SAP Business Data Cloud (BDC) provides an AI-ready data foundation that unifies SAP and AWS data landscapes through **SAP BDC Connect for Amazon Athena**. This bi-directional, zero-copy data integration enables direct access to curated, semantically rich data products across both data ecosystems, without duplicating data . 

As enterprises increasingly operate across hybrid data landscapes, **SAP BDC Connect for Amazon Athena** is a bidirectional, zero-copy data sharing integration bridges the gap between SAP's governed business data and the AWS cloud ecosystem — enabling seamless, near real-time data sharing without the complexity of traditional ETL pipelines.  

With **SAP BDC Connect for Amazon Athena**,  can discover and consume governed SAP data products directly within Amazon Athena in near real time. Rather than building and maintaining ETL pipelines, they can query mission-critical SAP business data through Amazon Athena.  

SAP BDC Connect is built on the Delta Sharing protocol (now called OpenSharing), enabling secure, standards-based data sharing while preserving the business semantics, lineage, and governance controls that SAP manages within SAP Business Data Cloud. Data access is always shared — never copied — so the data stays in place, governed, within SAP BDC but accessible by AWS consumers. 

SAP BDC Connect provides access to SAP data products through Amazon Athena. Other AWS services can consume this data by using Athena as their query layer. 

Please follow our [roadmap](https://roadmaps.sap.com/board?PRODUCT=73555000100800004851&q=AWS&range=CURRENT-LAST#;INNO=5F3149DE0C444A9AB9ECBBD072CB85F3) for forward and bi-directional integration roll-out timelines.  

## Architecture

![drawio](drawio/aws-data-integration.drawio)

## Architecture detail:

SAP BDC Connect for Amazon Athena lets you query SAP BDC Data Products directly from Amazon Athena with zero data copy. SAP BDC Data Products are shared using the Delta Sharing protocol(OpenSharing). AWS mounts the share into the AWS Glue Data Catalog as a federated catalog, with AWS Lake Formation governing access for business users, and Athena reads metadata and data live from SAP Business Data Cloud at query time. 


## Key characteristics of the integration: 

- **Zero-copy sharing** : data products are accessed in place, eliminating replication overhead and reducing latency 

- **Bi-directional exchange** : SAP data products can be shared to AWS, and data products from AWS can be received back into SAP BDC 

- **Governed by design** : business context, data lineage, and access controls travel with the data product 

- **Region-aligned deployment** : SAP BDC Connect and the connected AWS environment must reside in the same region and hyperscaler to ensure data residency and performance 



## Key benefits :  

This capability marks a significant step in enabling analytics, AI applications, and agentic workflows that are grounded in trusted, semantically rich SAP business data — accelerating time-to-insight for enterprise teams operating across both SAP and AWS environments. 

## Other integrations between AWS and SAP Business Data Cloud :   

While SAP BDC Connect for Amazon Athena is the preferred way to share data out from SAP applications in the form of SAP products with AWS ecosystem for the AI Agentic era, our earlier data integration modes that integration at the SAP Datasphere layer with various AWS services still work: 

[Accessing data in Amazon S3 from SAP Datasphere](https://github.com/SAP-samples/sap-bdc-explore-hyperscaler-data/blob/main/AWS/s3-integration.md)

[Integrate Amazon Athena with SAP Datasphere](https://github.com/SAP-samples/sap-bdc-explore-hyperscaler-data/blob/main/AWS/athena-integration.md)

[Data Federation from Amazon Redshift through SAP Datasphere](https://github.com/SAP-samples/sap-bdc-explore-hyperscaler-data/blob/main/AWS/redshift-integration.md)


## Resources :  

- [SAP Help: Administering SAP Business Data Cloud (Provisioning SAP BDC Connect)](https://help.sap.com/docs/SAP_BUSINESS_DATA_CLOUD/f7acf8c9dad54e99b5ce5ebc633ed8e1)
- [AWS Lake Formation: Prerequisites for connecting the Data Catalog to external data sources](https://docs.aws.amazon.com/lake-formation/latest/dg/connect-data-source-prerequisites.html)
- [AWS Lake Formation: Creating a federated catalog using an AWS Glue connection](https://docs.aws.amazon.com/lake-formation/latest/dg/create-fed-catalog-data-source.html)
- [AWS Lake Formation: Permissions reference](https://docs.aws.amazon.com/lake-formation/latest/dg/lf-permissions-reference.html) 
- [Data Center Availability of SAP BDC](https://help.sap.com/docs/business-data-cloud/product-availability-information/data-center-availability-in-sap-business-data-cloud) 
- [SAP Help: Requesting Access to Data Products](https://help.sap.com/docs/SAP_DATASPHERE/c8a54ee704e94e15926551293243fd1d/ea7cb802cbea47b39a441888873c3a49.html) 
- [SAP Help: Approving or Rejecting Data Product Access Requests](https://help.sap.com/docs/business-data-cloud/governing-and-publishing-data-in-catalog/processing-data-access-requests)
- [SAP Help: Installing Data Products](https://help.sap.com/docs/SAP_DATASPHERE/c8a54ee704e94e15926551293243fd1d/605b734f433f4c3895ec827fa71bea41.html)


