---
id: id-ra0004-1
slug: /ref-arch/28ac36db13/1
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Integration with AWS data sources
description: >-
  Data from AWS data sources can be harmonized with SAP and non-sap data via SAP
  Datasphere's data fabric architecture.
keywords:
  - sap
  - aws
  - data federation
  - s3
  - redshift
  - athena
  - datasphere
sidebar_label: Integration with AWS data sources
image: img/logo.svg
tags:
  - data
  - aws
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
  date: 2025-01-23
---

Data from AWS data sources can be harmonized with SAP and non-sap data via SAP Datasphere's data fabric architecture. 

## Architecture

![drawio](drawio/aws-data-integration.drawio)

## 1. Integration with Amazon Athena  

<b>Mode(s) of Integration:</b> Federating data live into SAP Datasphere .

Amazon Athena is Amazon's interactive query service that helps query and analyze data in S3.

Non-SAP data from Amazon Athena can be federated live into remote tables in SAP Datasphere and augmented with SAP buisness data for real-time analtyics in SAP Analytics cloud.


For detailed step by step information and to try out the integration, visit the Discovery Center mission : [Integrate Amazon Athena with SAP Datasphere](https://discovery-center.cloud.sap/missiondetail/3401/)



## 2. Integration with Amazon S3  

<b>Mode(s) of Integration:</b> Replicating data out with <i>Replication Flows</i>, Importing data into SAP Datasphere using <i>Data Flows</i> .

S3 is an Object storage service built to store and retrieve any amount of data from anywhere

Non-SAP data from Amazon S3 can be imported into SAP Datasphere though the Data Flow feature of SAP Datasphere for use with applications such as Financial Planning or business analytics in SAP Analytics Cloud . 


For detailed step by step information and to try out the integration, visit the Discovery Center mission : [Accessing data in Amazon S3 from SAP Datasphere](https://discovery-center.cloud.sap/missiondetail/3403/)




## 3. Integration with Amazon Redshift 

<b>Mode(s) of Integration:</b> Federating data live into SAP Datasphere .


Amazon Redshift is a fast, fully managed, petabyte-scale data warehouse service that is optimized for datasets ranging from a few hundred gigabytes to a petabyte or more .

 Integrating Amazon Redshift with SAP Datasphere though its data federation architecture, you can augment the non-SAP data in Amazon Redshift with SAP data in SAP Datasphere and build unified data models. These models can be used to build stories and analytical applications in SAP Analytics Cloud. Smart Data Integration (SDI) is a key component that helps you to achieve this goal.


<b>How You Get There - What is the solution? </b>

Smart Data Integration (SDI) is a key component that helps you to achieve this integration. SDI  uses CamelJDBCAdapter adapter to connect to the Amazon Redshift. Once SDI is configured to connect to SAP Datasphere and remote connection to Amazon Redshift is established, virtual tables can be created in SAP Datasphere for the source tables in Amazon Redshift. The virtual tables can be used just like regular tables in views and procedures. Data can be virtually access or can be snapshot replicated onto SAP Datasphere.


For detailed step by step information and to try out the integration, visit the Discovery Center mission : [Data Federation from Amazon Redshift through SAP Datasphere](https://discovery-center.cloud.sap/missiondetail/3406/?tab=overview)