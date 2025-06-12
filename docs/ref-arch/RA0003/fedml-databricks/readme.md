---
id: id-ra0003-3
slug: /ref-arch/8e1a5fbce3/3
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: FedML-Databricks for Databricks platform
description: >-
  Train models on Databricks using live SAP data with FedML-Databricks, enabling
  secure integration and eliminating data duplication.
keywords:
  - sap
  - databricks platform
  - fedml integration
  - machine learning
  - live business data
sidebar_label: FedML-Databricks
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
  - jackseeburger
  - chaturvedakash
  - karishma-kapur
  - ranbian
  - ThatDodoBird
discussion: 
last_update:
  author: s-krishnamoorthy
  date: 2025-01-23
---

FedML-Databricks provides end-to-end integraton for training models in Databricks machine learning platform, using live business data from SAP systems and eliminates the need for duplicating the data. With only few lines of code, fedml-databricks enables Data discovery, Pyspark support and deployment support to SAP BTP Kyma all while enabling instant access to source business data from SAP systems.  

## Architecture

![drawio](drawio/fedml-databricks.drawio)

:::info Resources

- Pip installable library: https://pypi.org/project/fedml-databricks/ 

:::

## Flow 

FedML, the Python Library is imported directly into Databricks workspace's notebook instances. FedML connects to SAP Datasphere via secure Python/SQLDBC connectivity and helps federate the critical business data needed for training models in Databricks platform.

Models trained in Databricks ML platform can also be optionally deployed in SAP BTP Kyma for inferencing via FedML-databrick's seamless deployment integration.

## When to use 

1. When a customer already has Databricks as part of their cloud platform strategy, and have invested in using Databricks ML as their data science platform for machine learning projects. 
2. Majority of training (non-SAP) data resides in the Databricks delta lake tables , with critical SAP data from various SAP applications (with semantics intact) is still needed for training.  
3. Trained models have potential to be deployed in SAP BTP Kyma for quick inferencing that involve SAP data. 

## Resources

- [SAP Samples | GitHub ](https://github.com/SAP-samples/datasphere-fedml/tree/main/Azure)
- [Using FedML library with SAP Datasphere and Databricks](https://community.sap.com/t5/technology-blogs-by-sap/using-fedml-library-with-sap-datasphere-and-databricks/ba-p/13568923)
- [Predict & Analyze marketing campaign effectiveness with SAP Datasphere and Databricks Data Intelligence Platform](https://www.databricks.com/blog/predict-analyze-marketing-campaign-effectiveness-sap-datasphere-and-databricks-data)