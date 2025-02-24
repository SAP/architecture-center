---
id: id-ra0003
slug: /ref-arch/785c72ab48
sidebar_position: 3
sidebar_custom_props:
  category_index:
    - data
    - aws
    - azure
    - gcp
title: Federated Machine Learning with SAP Datasphere
description: The SAP Federated Machine Learning Python library (FedML) applies the data federation architecture of SAP Datasphere for intelligently sourcing SAP and non-SAP data for Machine Learning experiments, run on any Machine Learning platform, thereby removing the need for replication or data movement. By abstracting data connection, data discovery, data loading (for all ML platforms), model training, model deployment, and inferencing (for hyperscaler machine learning platforms), the FedML library offers end-to-end integration with just a few lines of code.
keywords:
  - sap
  - datasphere
  - machine learning
  - aws
  - azure
  - gcp
  - sagemaker
  - vertexai
  - databricks
  - watsonx
  - nvidia
  - fedml
sidebar_label: Federated Machine Learning with SAP Datasphere
image: img/logo.svg
tags:
  - azure
  - aws
  - gcp
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
last_update:
  author: s-krishnamoorthy
  date: 2025-01-23
---

The SAP Federated Machine Learning Python library (FedML) applies the Data Federation architecture of SAP Datasphere for intelligently sourcing SAP and non-SAP data for Machine Learning experiments, run on any Machine Learning platform, thereby removing the need for replication or data movement. By abstracting data connection, data discovery, data loading (for all ML platforms), model training, model deployment, and inferencing (for hyperscaler machine learning platforms), the FedML library offers end-to-end integration with just a few lines of code.

## Architecture

![drawio](drawio/fedml-final.drawio)

:::info Resources

- Pip Installable library at PyPi Repo **[[fedml-dsp]](https://pypi.org/project/fedml-dsp/)**

:::

## Flow 

The reference architecture diagram shows how FedML uses the data federation architecture of SAP Datasphere for making the machine learning on external platforms possible with  real-time access to SAP business data. Numbers below correspond to the flow numbers in the architecture diagram above.

1.  Data from SAP sources such as S/4HANA and BW/4HANA are virtually accessed from SAP Datasphere via its analytical models.  These data sources are connected to SAP Datasphere using native connections with flexbility to also persist the data in SAP Datasphere.

2.  Data from external (non-SAP) sources such as hyperscaler data stores, cloud storages (e.g., Amazon Redshift, Google BigQuery, Microsoft One Lake) are also accessed from SAP Datasphere through its virtual/remote tables. The SAP and non-SAP data are unified in SAP Datasphere analytical models and exposed for consumption outside of SAP Datasphere.

3.  The FedML Python Library is imported directly into the external machine learning platform. FedML connects to SAP Datasphere via secure Python/SQLDBC connectivity and helps federate the critical business data needed for training models in these external ML platforms. On GPU noteboks, FedML connectivity core also helps with data discovery and data read directly into the cuDF dataframes through its support for RAPIDS™ framework.

4.  Models trained in external Machine learning platforms are optionally deployed in SAP AI Core for inferencing via FedML's seamless deployment integration.

## Customer value

FedML helps: 

1. Eliminate extensive ETL (Extract, Transform and Load) processes needed to duplicate SAP business data for training models on external machine learning platform. 
2. Maximize customer's external cloud platform investment and SAP BTP/Datasphere investment by creating the possibility to use real-time SAP business data directly inside the external machine learning environment. 
3. Lower the TCO of the machine learning project drastically, due to saved costs from maintaining duplicated SAP data or for maintaining the error-prone ETL process. 
4. Data scientists perform efficient model training in GPU environments due to its support for NVIDIA RAPIDS.


## When to use 

Traditionally, data required for model training in any machine-learning platform or AI service like Google Vertex AI, Microsoft Azure ML, Amazon Sagemaker or IBM watsonx.ai are ETL'd from its source systems and persisted on the respective ML platform, e.g. in Google Cloud Storage or Databricks delta lake, thereby causing data duplicaiton.  Using the open-sourced SAP FedML library, data accessible in SAP Datasphere (virtually or physically) via its semantic models can be directly used in a Jupyter Notebook to train a ML model or for inference in the ML platform environment, avoiding data duplication. 

**Use this architecure when** :

1. The cloud data strategy involves using hyperscaler and other data science platforms for machine learning projects. 
2. Majority of training data resides in external platforms, with critical data from various SAP applications (with semantics intact) is needed for training.  
3. Critical SAP business data is currently ETL'd out for machine learning, making the TCO of data science projects rise substantially and causing data inconsistencies due to application of this anti-pattern. 
4. Models need to be trained with GPUs in external platforms, that need critical live SAP data, without the ETL process involved.
5. Trained models have potential to be deployed in SAP BTP AI Core for quick inferencing in machine learning projects that involve SAP data. 



## Characteristics

Characteristics of this reference architecture include:

1. **Federated data access** : FedML helps data scientists that are training models in any external machine learning platform to get instance access to semantically rich,  real-time SAP business data from SAP applications through SAP Datasphere's data-federation architecture, without the need for any ETL,  data processing or reconciliation work.

2. **Secure connectivity** : FedML helps external machine learning platforms connect to SAP Datasphere through secure encrypted TLS Python connectivity. Ref [PEP 249 specification](https://peps.python.org/pep-0249/) . 

3. **Seamless SAP BTP integration from external machine learning environments** :  FedML serves as the integration point for SAP BTP services from external machine learning platforms, including connectivity to SAP Datasphere and SAP AI Core for seamless model deployment with very few lines of code. 

4. **Machine learning platform-independent access**: FedML (fedml-dsp) is platform-independent and can be used in any machine learning platform as long the connectivity to SAP Datasphere can be established using FedML from the platform's network. 

5. **GPU support for data read** :  FedML has support for RAPIDS™ framework and CUDA (cuDF, cuPy, cuML), thus helping data scientists build and train complex models that requiring GPUs by accessing SAP business data directly from inside the GPU environment. 

## Examples in an SAP context

With more companies adopting a multi-cloud strategy, SAP Datasphere and SAP BTP help integrate the SAP applications and data with  external cloud platform data and services for efficient analytics and machine learning applications. As an example, FedML helps boost the capability of existing supply chain planning algorithms in SAP Integrated Demand Planning (IBP) system via the custom-built forecasting algorithms trained on Google Cloud Vertex AI and using the federation capability of SAP Datasphere. 

## Examples of machine learning platforms for this integration

Google Cloud Platform VertexAI, Amazon Sagemaker, AzureML, Databricks, IBM watsonx platform, Data Robot, Data iku, Palantir, etc. 

## SAP BTP Services and Components

- **[SAP Datasphere](https://discovery-center.cloud.sap/serviceCatalog/a62771ea-b7bf-4746-9d4b-fec20ade5281)**: SAP Datasphere enables a business data fabric architecture that uniquely harmonizes mission-critical data across the organization, unleashing business experts to make the most impactful decisions. It combines previously discrete capabilities into a unified service for data integration, cataloging, semantic modeling, data warehousing, and virtualizing workloads across SAP and non-SAP data.

- **[SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/1f756a52-8968-4ec4-92d0-f9bddf552ea3)**: SAP AI Core is a service in the SAP Business Technology Platform that is designed to handle the execution and operations of your AI assets in a standardized, scalable, and hyperscaler-agnostic way. It provides seamless integration with your SAP solutions. Any AI function can be easily realized using open-source frameworks. SAP AI Core supports full lifecycle management of AI scenarios. Access generative AI capabilities and prompt lifecycle management via the generative AI hub.

- **Other components**: External Machine learning Platform specific services and components.

## Resources

- [SAP Samples | GitHub ](https://github.com/SAP-samples/datasphere-fedml)
- [FedML - The Federated Machine Learning Libraries for Hyperscalers 2.0](https://community.sap.com/t5/technology-blogs-by-sap/fedml-the-federated-machine-learning-libraries-for-hyperscalers-2-0/ba-p/13528073)
- [Federated Machine Learning using SAP Datasphere and Amazon SageMaker 2.0](https://community.sap.com/t5/technology-blogs-by-sap/federated-machine-learning-using-sap-datasphere-and-amazon-sagemaker-2-0/ba-p/13527862)
- [Federated Machine Learning using SAP Datasphere and Azure Machine Learning 2.0](https://community.sap.com/t5/technology-blogs-by-sap/federated-machine-learning-using-sap-datasphere-and-azure-machine-learning/ba-p/13527824)
- [Federated Machine Learning using SAP Datasphere & Google Cloud Vertex AI 2.0](https://community.sap.com/t5/technology-blogs-by-sap/federated-machine-learning-using-sap-datasphere-google-cloud-vertex-ai-2-0/ba-p/13527660)
- [Using FedML library with SAP Datasphere and Databricks](https://community.sap.com/t5/technology-blogs-by-sap/using-fedml-library-with-sap-datasphere-and-databricks/ba-p/13568923)

## Related Missions

- [Predict your Supply Chain with Google Vertex AI and FedML](https://discovery-center.cloud.sap/missiondetail/4200)
- [Enable External Forecasting on SAP IBP with Google Vertex AI](https://discovery-center.cloud.sap/missiondetail/4249)
- [Integrating SAP Datasphere & SAP AI Core with IBM watsonx using FedML](https://discovery-center.cloud.sap/missiondetail/4449)
- [Predict Inventory Allocation with Amazon Sagemaker and FedML](https://discovery-center.cloud.sap/missiondetail/4106)
- [Predict and Analyze Retail Inventory Allocation using FedML](https://discovery-center.cloud.sap/missiondetail/3944)

