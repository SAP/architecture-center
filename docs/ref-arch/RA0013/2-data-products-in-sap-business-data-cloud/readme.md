---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0013-2 
slug: /ref-arch/ad1b90dbd1/2
sidebar_position: 2
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Data Products in SAP Business Data Cloud
description: The purpose of Data Products in the context of SAP is the efficient and standardized sharing and consumption of data across applications and domains. It helps ensure high-quality metadata, is optimized for intensive reads, and describes the lineage and interfaces available for integration.
sidebar_label: Data Products in SAP Business Data Cloud
keywords: [sap, bdc, business, data, cloud, data product]
image: img/logo.svg
tags: [data, aws, azure, gcp]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
    - contributor1
    - contributor2
last_update:
    date: 2025-04-17
    author: user-23a1e65ff5
############################################################
#                   End of Front Matter                    #
############################################################
---

The purpose of a Data Product in **SAP Business Data Cloud** is to support various analytic scenarios by providing relevant data sets. For example, a data product might include Supplier Data and Classification of Suppliers Based on Risk to support procurement execution and visibility.

## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
<!-- Note: [PLACEHOLDER] Please update the drawio with your architecture's drawio  -->

![drawio](drawio/template.drawio)

 Purpose of a Data Product in the Context of SAP

A **Data Product** in SAP serves several key purposes, primarily revolving around the efficient and standardized sharing and consumption of data across various applications and domains. Here are the main purposes:

## 1. **Data Sharing Across Domains**
Data Products enable sharing data across domains and application boundaries, facilitating integration and consumption by different applications, including SAP, customer, and partner applications.

## 2. **Consumption via APIs**
Data Products are exposed for consumption outside the boundaries of the producing application via APIs or Events. This allows applications to offer data for consumption in a standardized manner.

## 3. **High-Quality Metadata**
Data Products are described through high-quality metadata, which is accessible through the Data Product Directory. This metadata includes business semantics, making it easier for business users to understand and utilize the data.

## 4. **Optimized for Intensive Reads**
The data set within a Data Product is optimized for intensive reads and is consumed in a read-only fashion, ensuring efficient data access and utilization.

## 5. **Data Lineage and Integration**
Data Products describe their data lineage via input ports, which are detailed as ORD Integration Dependencies. This helps in understanding the origin and transformation of data within the product.

## 6. **Facilitating Analytical and AI Applications**
Data Products are fundamental for building analytical models, designing dashboards, and training AI applications. They make business data accessible and usable to business analysts, data engineers, and data scientists.

## 7. **Decentralized Discoverability**
The discoverability of Data Products is decentralized, allowing them to be listed in the Data Product Directory and SAP Business Accelerator Hub, making it easier to find and consume relevant data.

## 8. **Product Mindset**
Data Products are managed with a product mindset, ensuring they meet the needs of consumers. Each Data Product has an owner responsible for its definition, delivery, and lifecycle.

## Key Points

- **Curated and Enriched Data:** Data products are curated and enriched to ensure high quality and relevance for specific business needs.

- **APIs and Metadata:** They are exposed for consumption via APIs and described by high-quality metadata.

- **Analytic Scenarios:** Data products support various analytic scenarios, such as procurement execution and visibility.

- **Data Packages:** Line-of-business leaders can create and deliver data products together with relevant business content (e.g., analytical models and dashboards) in the form of "data packages," which customers can then onboard and activate in their BDC instance.

In summary, Data Products in SAP are designed to facilitate efficient data sharing, consumption, and integration across various applications and domains, supported by high-quality metadata and optimized for intensive reads. They play a crucial role in enabling analytical and AI applications and are managed with a product mindset to meet consumer needs.