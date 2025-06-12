---
id: id-ra0003-5
slug: /ref-arch/8e1a5fbce3/5
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: FedML's support for NVIDIA GPUs
description: >-
  FedML now supports reading of federated SAP business data via SAP Datasphere
  directly into NVIDIA GPU environment computes for model training.
keywords:
  - sap
  - nvidia gpu integration
  - datasphere federation
  - machine learning acceleration
  - fedml gpu processing
sidebar_label: FedML-NVIDIA
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

FedML (fedml-dsp) can be used in notebooks with GPU compute. FedML now has support for NVIDIA RAPIDS™ and CUDA cuDF and cuML and detection of GPU for adding support for RAPIDS™ CUDA. 

FedML's Connectivity Core component supports reading data from semantic models of SAP Datasphere directly into CUDA cuDF dataframes. FedML's GPU support helps data scientists accelerate the machine learning workflows with NVIDIA GPUs, while providing instant access to SAP's critical business data without the need for ETL or additional overhead in processing ETL'd data.

## Architecture

![drawio](drawio/fedml-nvidia.drawio)

:::info Resources

- Pip installable library: https://pypi.org/project/fedml-dsp/ 

:::

## When and Where to use 

1. When models need to be trained (and feature calculations performed) using complex and intensive algorithms (using SAP business data), they require the processing power of NVIDIA GPUs for efficient model training. Some performance acceleration numbers compared between CPU and GPU training noted below.
2. When critical SAP data from various SAP applications (with semantics intact) is needed for such GPU model training jobs, FedML helps read the SAP data (via SAP Datasphere semantic models) directly into RAPIDS™ supported cuDF format, in real-time, without the need to copy the data to the machine learning platform via ETL first.
3. Models trained with NVIDIA GPUs can also be deployed in SAP AI Core (GPU deployments) for quick inferencing with SAP business data. 

## CPU-GPU Performance Acceleration metrics

Comparing several cuML algorithms on GPUs vs their CPU equivalents, the following acceleration numbers were recorded for GPU environments with varying data loads and features:  
 
**RandomForest:**

<table>
  <thead>
    <tr>
      <th>Samples / Features</th>
      <td>1000</td>
      <td>10,000</td>
      <td>1000,000</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>20</td>
      <td>2x</td>
      <td>10x</td>
      <td>76x</td>
    </tr>
    <tr>
      <td>S0</td>
      <td>2x</td>
      <td>23x</td>
      <td>116x</td>
    </tr>
    <tr>
      <td>100</td>
      <td>2x</td>
      <td>35x</td>
      <td>151x</td>
    </tr>
    <tr>
      <td>200</td>
      <td>3x</td>
      <td>49x</td>
      <td>190x</td>
    </tr>
  </tbody>
</table>


## Resources

- [SAP Samples | GitHub ](https://github.com/SAP-samples/datasphere-fedml/tree/main/Datasphere/NVIDIA-RAPIDS)