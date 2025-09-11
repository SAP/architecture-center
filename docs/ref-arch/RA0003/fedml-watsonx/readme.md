---
id: id-ra0003-6
slug: /ref-arch/8e1a5fbce3/6
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: FedML and IBM watsonx.ai / IBM Watson Studio integration
description: >-
  Accelerate ML workflows with IBM watsonx and FedML, integrating SAP's business
  data for seamless model training without data duplication.
keywords:
  - sap
  - ibm watsonx
  - machine learning
  - fedml
  - data integration
  - model training
  - critical business data
sidebar_label: FedML-IBM watsonx
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

:::note Joint Reference Architecture

**This content was developed in collaboration with IBM.**

:::

FedML (fedml-dsp) can be used in notebooks inside the IBM watsonx.ai and Waston Studio environments. 

FedML's Connectivity Core component supports reading data from semantic models of SAP Datasphere directly into the notebooks in IBM watsonx environments. FedML's IBM watsonx support helps data scientists accelerate machine learning workflows with IBM watsonx workflows, while providing instant access to SAP's critical business data without the need for ETL or additional overhead in processing ETL'd data.

## Architecture

![drawio](drawio/fedml-watson.drawio)

:::info Resources

- Pip installable library: https://pypi.org/project/fedml-dsp/ 

:::

## When to use 

1. When models need to be trained inside the IBM watsonx.ai or IBM Watson Studio environments using SAP business data from SAP applications.
2. When critical SAP data from various SAP applications (with semantics intact) is needed for such training jobs, FedML helps read the SAP data (via the SAP Datasphere semantic models) directly into the IBM Watson environment.
3. Models trained in IBM Watson environment can be deployed in SAP AI Core for quick inferencing based on SAP business data.

## Resources

- [SAP Samples | GitHub | fedml-dsp with IBM Watson studio](https://github.com/SAP-samples/datasphere-fedml/tree/main/Datasphere/IBM-Watson-Studio)

- [External Blog - Integration of SAP FedML Library with IBM watsonx ](https://medium.com/towards-generative-ai/simplify-your-end-to-end-ai-workflow-with-sap-fedml-d0f54f99d787)