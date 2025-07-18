---
id: id-ra0003-1
slug: /ref-arch/8e1a5fbce3/1
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: FedML-AWS for Amazon Sagemaker
description: >-
  Train models on Amazon SageMaker with FedML-AWS, integrating live SAP data for
  seamless machine learning and analytics.
keywords:
  - sap
  - aws
  - amazon sagemaker
  - machine learning
  - fedml integration
  - business data training
sidebar_label: FedML-AWS
image: img/ac-soc-med.png
tags:
  - aws
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

FedML-AWS provides end-to-end integraton for training models in Amazon Sagemaker using live business data from SAP systems and eliminates the need for duplicating the data. With only few lines of code, fedml-aws enables 

- Data discovery
- Model training
- Model deployment, both in Sagemaker and SAP BTP, all while enabling instant access to source business data from SAP systems.

## Architecture

![drawio](drawio/fedml-aws.drawio)

:::info Resources

- Pip installable library: https://pypi.org/project/fedml-aws/ 

:::

## Flow 

FedML, the Python Library is imported directly into Amazon Sagemaker notebook instances. FedML connects to SAP Datasphere via secure Python/SQLDBC connectivity and helps federate the critical business data needed for training models in Amazon Sagemaker. 

Models trained in Amazon Sagemaker can also be optionally deployed in SAP AI Core for inferencing via FedML-AWS's seamless deployment integration.

## When to use 

1. When a customer already has AWS as part of their cloud platform strategy, where Amazon Sagemaker is their data science platform for machine learning projects. 
2. Majority of training data resides in AWS storages, with critical SAP data from various SAP applications (with semantics intact) is still needed for training.  
3. Trained models have potential to be deployed in SAP BTP Kyma for quick inferencing that involve SAP data. 

## Resources

- [SAP Samples | GitHub | Fedml-AWS ](https://github.com/SAP-samples/datasphere-fedml/tree/main/AWS)

## Related Missions

- [Predict Inventory Allocation with Amazon Sagemaker and FedML](https://discovery-center.cloud.sap/missiondetail/4106)