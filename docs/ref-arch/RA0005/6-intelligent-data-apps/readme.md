---
id: id-ra0005-6
slug: /ref-arch/e5eb3b9b1d/6
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Intelligent Data Apps
description: Please add a description (max 300 characters)
keywords:
  - sap
sidebar_label: Intelligent Data Apps
image: img/logo.svg
tags:
  - ref-arch
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors: 
discussion: 
last_update:
  author: kay-schmitteckert
  date: 2025-01-14
---

Intelligent Data Apps (IDA) empower users to interact with extensive datasets through natural language queries. These applications seamlessly integrate vast amounts of data stored across heterogeneous enterprise systems, leveraging SAP Datasphere for federated data access, eliminating the need for data replication. By leveraging Agents, natural language inputs are first interpreted and then transformed into technical queries to retrieve pertinent data, with results delivered in an actionable format. The architecture also supports the streamlined integration RAG pipelines for query pre-processing and overall response optimization.

An IDA can cater two core use case ideas: _Descriptive_ and _Prescriptive_ analytics. Descriptive analytics involves deriving insights and trends from data, while prescriptive analytics takes this a step further by offering proactive recommendations and actionable strategies based on the analyzed data, helping organizations optimize decision-making and operational efficiency.

## Architecture

![drawio](./drawio/reference-architecture-generative-ai-intelligent-data-apps.drawio)

The architecture illustrates how an IDA operates within the SAP Business Technology Platform (BTP) ecosystem, enabling seamless integration of AI agent component and data sources. At the core, the [SAP Cloud Application Programming Model](./#sap-cloud-application-programming-model) (CAP)
serves as the orchestration layer, leveraging AI frameworks like LangChain and LangGraph to manage use case logic and data workflows in _Code Based Agent_ approach. The agent can be designed in Project Agent Builder ([PAB](../5-ai-agents/readme.md#project-agent-builder)) and integrated with data in the _Content Based Agent_ approach. More information about Code and Content based agents can be found here: [Agent Streams](../5-ai-agents/readme.md#agent-streams). 

[SAP Datasphere](./#services--components) plays a pivotal role by integrating with diverse data sources, federating data from SAP Cloud Solutions, third-party applications, or on-premise solutions. This allows agents to efficiently query and process large, distributed datasets without centralized storage. Meanwhile the [Vector Engine](./#vector-engine) of SAP HANA Cloud supports a parallel RAG flow, enhancing search capabilities for real-time, contextually aware data retrieval, making the system well-suited for data-enriched enterprise applications. _Data Federation_ ensures agility by enabling access to heterogeneous datasets without duplication, increasing efficiency.

These elements work together in unison to create an application that unifies data and AI, enabling real-time analytics and proactive decision-making. When combined with platforms like SAP Datasphere, agents can drive value across industries such as supply chain, logistics, financial services, and operations.

## Services & Components

For a comprehensive list of services, components and descriptions, please explore the Introduction on [Services & Components](./#services--components).

- [SAP Datasphere](https://discovery-center.cloud.sap/serviceCatalog/a62771ea-b7bf-4746-9d4b-fec20ade5281) enables a business data fabric architecture that uniquely harmonizes mission-critical data across the organization, unleashing business experts to make the most impactful decisions. It combines previously discrete capabilities into a unified service for data integration, cataloging, semantic modeling, data warehousing, and virtualizing workloads across SAP and non-SAP data.


## Example Use Cases

- **Finance KPI Exploration - _Descriptive_**  
  Intelligent Data Apps for Finance empower sales & finance teams to “ask” for key performance indicators across massive, structured datasets without manual SQL or BI modeling.

- **Procurement Spend Classification - _Descriptive_**  
  Leveraging detailed purchase order and supplier master data, agents classify spend by category, vendor, and region—highlighting consolidation opportunities and non‑contracted purchases directly in a single NL query.

- **Replenishment Recommendation Engine - _Prescriptive_**  
  Agents combine inventory levels, sales forecasts, and lead‑time tables to calculate optimal reorder points and suggest purchase orders—automating replenishment planning to prevent stock‑outs.




<!-- ## Business Agent Foundation (BAF)

The aim of the Business Agent Foundation (prototype) is to enable the efficient realization of business AI scenarios by providing reusable AI business agents as a service.
Through various integration and development tools provided via the Business Agent Foundation (prototype),
AI agents can be seamlessly integrated into existing and new business applications.
The innovation offers various features that empower agents with the skills required to complete enterprise processes and tasks,
while understanding business context and semantics. For more information, read the blog post [AI Business Agents and the Evolution of Business Automation: Join the Innovation Journey](https://community.sap.com/t5/technology-blogs-by-sap/ai-business-agents-and-the-evolution-of-business-automation-join-the/ba-p/13614232). -->