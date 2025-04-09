---
id: id-ra0003-2
slug: /ref-arch/8e1a5fbce3/2
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: FedML-Azure for Azure Machine Learning
description: >-
  FedML-Azure provides end-to-end integraton for training models in Azure
  Machine Learning service, using live business data from SAP systems and
  eliminates the need for duplicating the data.
keywords:
  - sap
  - azure
  - datasphere
  - machine learning
sidebar_label: FedML-Azure
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

FedML-Azure provides end-to-end integraton for training models in Azure Machine Learning service, using live business data from SAP systems and eliminates the need for duplicating the data. With only few lines of code, fedml-azure enables 

- Data discovery
- Model training
- Model deployment, both in Azure ML and SAP BTP, all while enabling instant access to source business data from SAP systems.


## Architecture

![drawio](drawio/fedml-azure.drawio)

:::info Resources

- Pip installable library: https://pypi.org/project/fedml-azure/ 

:::

## Flow 

FedML, the Python Library is imported directly into Azure Machine Learning studio notebook instances. FedML connects to SAP Datasphere via secure Python/SQLDBC connectivity and helps federate the critical business data needed for training models in Azure ML. 

Models trained in Azure ML can also be optionally deployed in SAP BTP Kyma for inferencing via FedML-Azure's seamless deployment integration.

## When to use 

1. When a customer already has Microsoft Azure service as part of their cloud platform strategy, and have invested in using Azure ML is their data science platform for machine learning projects. 
2. Majority of training (non-SAP) data resides in the Azure platform storages, with critical SAP data from various SAP applications (with semantics intact) is still needed for training.  
3. Trained models have potential to be deployed in SAP BTP Kyma for quick inferencing that involve SAP data. 

## Resources

- [SAP Samples | GitHub ](https://github.com/SAP-samples/datasphere-fedml/tree/main/Azure)
- [Federated Machine Learning using SAP Datasphere and Azure Machine Learning 2.0](https://community.sap.com/t5/technology-blogs-by-sap/federated-machine-learning-using-sap-datasphere-and-azure-machine-learning/ba-p/13527824)

## Related Missions

- [Predict and Analyze Retail Inventory Allocation using FedML](https://discovery-center.cloud.sap/missiondetail/3944)