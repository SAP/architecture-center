---
id: id-ra0004-5
slug: /ref-arch/a07a316077/5
sidebar_position: 5
sidebar_custom_props:
  category_index: []
title: Integration with Snowflake
description: >-
  Integrate SAP data with Snowflake seamlessly using SAP BDC Connect and SAP Snowflake
keywords:
  - sap
  - cloud performance
  - snowflake
  - data harmonization
  - advanced analytics
  - bdc connect 
  - delta share
sidebar_label: Integration with Snowflake 
image: img/ac-soc-med.png
tags:
  - snowflake
  - data
  - bdc
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sivakumar
  - s-krishnamoorthy
discussion: 
last_update:
  author: s-krishnamoorthy
  date: 2025-11-04
---

Snowflake’s AI Data Cloud - offered as "SAP Snowflake" - an SAP Solution Extension for SAP Business Data Cloud (GA in Q1 2026), integrates Snowflake into SAP Business Data Cloud(BDC)’s open data ecosystem and business data fabric. 

The integration architecture leverages zero copy, bidirectional data access, enabling data and AI teams to work with semantically rich trusted SAP data products in real time without the added cost and complexity of ETL pipelines. 

SAP BDC Connect for Snowflake, is a cloud service that enables seamless integration between the SAP Snowflake and SAP BDC. It also helps connect the Enterprise Snowflake with SAP BDC for customers that already have Enterprise Snowflake in their ecosystem. 


## Architecture

![drawio](drawio/snowflake-data-integration.drawio)



## Key integration - SAP BDC Connect Service for Snowflake

SAP BDC Connect service for Snowflake , built on top of the delta sharing architecture, helps trusted data to be exchanged between SAP and Snowflake with near real-time metadata changes, ensuring users always have access to the most current information.  

Whether a customer adopts SAP Snowflake through SAP Business Data Cloud or operates on an existing Snowflake platform,  the SAP BDC Connect service for Snowflake enables seamless integration in both scenarios.


Here are the key differentiation this architecture brings:  

### 1.Delta Share based data exchange: ### 

    The bi-directional data exchange, that the BDC Connect enables, is based on delta sharing protocol,  which is an industry standard open data  protocol, enabling interoperability across different computing platforms, cloud environments, and applications. The delta sharig exchange enables  secure, accelerated, and federated real time access eliminating data duplication and complex ETLs.


### 2. Discoverability with SAP BDC and Snowflake Horizon Catalog: ### 
The bi-directional delta share based integration allows trusted data products to be shared and discoverable via the SAP Business Data Cloud Catalog and the Snowflake Horizon , which is Snowflake's integrated governance solution that governs and protects all data and AI assets across any cloud and any region from a single control plane, ensuring the data is always secure, compliant, and discoverable.

### 3. SAP Snowflake for SAP-centric use cases ### 
For customers that already use enterprise Snowflake for their enterprise use cases, they should still consider utilizing SAP Snowflake for SAP-centric use cases and workloads. They can then run their AI models closer to where their data resides for better performance and governance. Minimizing the volume of SAP data leaving allows their SAP teams to maintain the security, governance, andcompliance of your most sensitive SAP data (even if the data is only being federated out of SAP environment).


### 4. Agent Development at scale with Snowflake's Cortex AI ### 
Cortex AI is Snowflake's fully managed service that provides access to large language models (LLMs) and GenAI capabilities through common interfaces like SQL and REST APIs. It democratizes AI by enabling any user to get insights from unstructured data, build custom chatbots, and create intelligent applications without complex AI expertise and with no-code development features. It enables accelerated AI decision making with semantically rich SAP business data.


### 5. Flexible infrastructure choices: ### 
  Helps customers leverage the power of seamless AI app and data agent development at scale with  Snowflake, while utilizing SAP's mission critical business processes and semantically rich data. With SAP Joule and Snowflake Cortex AI, this integration helps choose the right AI agent for any task—from automating next best actions to building intelligent applications.
 

