---
id: id-ra0004-5
slug: /ref-arch/a07a316077/5
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Latency and Performance considerations
description: >-
  In data federation scenarios, particularly where non-SAP and SAP data are
  virtually queried to avoid duplication, performance and latency are critical
  factors that influence the effectiveness of the data federation architecture
  for analytics solutions
keywords:
  - sap
  - latency
  - performance
  - data federation
  - data replication
sidebar_label: Latency and Performance considerations
image: img/logo.svg
tags:
  - data
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sivakumar
  - s-krishnamoorthy
  - karishma-kapur
discussion: 
last_update:
  author: s-krishnamoorthy
  date: 2025-01-23
---

At a technical conceptual level, opting for data federation instead of data export or replication can significantly reduce network traffic and enhance network performance. This approach minimizes data duplication and eliminates redundant data engineering tasks typically associated with ETL processes.

In data federation scenarios, particularly where non-SAP and SAP data are virtually queried to avoid duplication, performance and latency are critical factors that influence the effectiveness of the **data federation architecture** for analytics solutions.

Several factors impact data federation performance:

## 1. Geographic Location

The geographic location of the SAP Datasphere and the cloud data source being federated plays a crucial role in performance. If these components reside in different hyperscalers or regions, the performance can be adversely affected due to increased latency. Optimal performance is achieved when the hyperscaler regions are the same or in close proximity.

## 2. Restricting Columns

Data federation architecture enables querying data on-the-fly from the original source into a virtual table for analytics. It is essential to push down queries that select only the necessary columns for analytics rather than federating entire tables. This selective querying reduces the amount of data transferred and processed, thereby improving performance.

## 3. Aggregation and Filtering at Source

Efficiency is maximized when queries that perform aggregation and filtering (using WHERE clauses) are executed at the source before the data is returned to SAP Datasphere. This approach minimizes the volume of data transferred and leverages the source system's processing capabilities, leading to better performance.

## 4. Source-Specific Performance Tuning - Partitions

Many data sources support indexing or partitioning, which can significantly enhance the performance of filtered searches. Utilizing these source-specific tuning mechanisms is vital for the success of the data federation architecture. Proper indexing and partitioning can reduce query response times and improve overall system efficiency.

## Additional Resources for Performance Tuning

- [Assessing Data Federation Performance in the Context of SQL Query Design](https://community.sap.com/t5/technology-blogs-by-sap/assessing-data-federation-performance-in-the-context-of-sql-query-design/ba-p/13482458)
- [8 Ways to Increase Your Query Performance in SAP Datasphere When Federating from Redshift](https://community.sap.com/t5/technology-blogs-by-sap/8-ways-to-increase-your-query-performance-in-sap-datasphere-when-federating/ba-p/13561637)
- [8 Ways to Increase Your Query Performance in SAP Datasphere When Federating from Big Query](https://community.sap.com/t5/technology-blogs-by-sap/8-ways-to-increase-your-query-performance-in-sap-datasphere-when-federating/ba-p/13521723)