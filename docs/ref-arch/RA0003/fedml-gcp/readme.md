---
id: id-ra0003-4
slug: /ref-arch/8e1a5fbce3/4
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: FedML-GCP for Google Vertex AI
description: >-
  Simplify ML training on Google Vertex AI with FedML-GCP, integrating live SAP
  data for efficient model deployment and analytics.
keywords:
  - sap
  - gcp vertex ai
  - fedml integration
  - google cloud platforms
  - machine learning
sidebar_label: FedML-GCP for Google Vertex AI
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

FedML-GCP provides end-to-end integraton for training models in Google Vertex AI using live business data from SAP systems and eliminates the need for duplicating the data. With only few lines of code, fedml-aws enables 
- Data discovery
- Model training
- Model deployment, both in Vertex AI and SAP BTP, all while enabling instant access to source business data from SAP systems.


## Architecture

![drawio](drawio/fedml-gcp.drawio)

:::info Resources

- Pip installable library: https://pypi.org/project/fedml-gcp/ 

:::

## Flow 

FedML, the Python Library is imported directly into Google Vertex AI workbench notebook instances. FedML connects to SAP Datasphere via secure Python/SQLDBC connectivity and helps federate the critical business data needed for training models in Google Vertex AI. 

Models trained in Google Vertex AI can also be optionally deployed in SAP BTP Kyma for inferencing via FedML-GCP's seamless deployment integration.

## When to use 

1. When a customer already has Google Cloud Platform as part of their cloud platform strategy, and have invested in using Google Vertex AI is their data science platform for machine learning projects. 
2. Majority of training (non-SAP) data resides in the Google Cloud Platform storages, with critical SAP data from various SAP applications (with semantics intact) is still needed for training.  
3. Trained models have potential to be deployed in SAP BTP Kyma for quick inferencing that involve SAP data. 

## Resources

- [SAP Samples | GitHub ](https://github.com/SAP-samples/datasphere-fedml/tree/main/GCP)
- [Federated Machine Learning using SAP Datasphere & Google Cloud Vertex AI 2.0](https://community.sap.com/t5/technology-blogs-by-sap/federated-machine-learning-using-sap-datasphere-google-cloud-vertex-ai-2-0/ba-p/13527660)

## Related Missions

- [Predict your Supply Chain with Google Vertex AI and FedML](https://discovery-center.cloud.sap/missiondetail/4200)
- [Enable External Forecasting on SAP IBP with Google Vertex AI](https://discovery-center.cloud.sap/missiondetail/4249)