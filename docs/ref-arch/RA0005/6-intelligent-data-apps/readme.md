---
id: id-ra0005-6
slug: /ref-arch/5c9255f84a/6
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

Intelligent Data Apps empower users to interact with extensive datasets through natural language queries. These applications seamlessly integrate vast amounts of data stored across heterogeneous enterprise systems, leveraging SAP Datasphere for federated data access, eliminating the need for data replication. By leveraging Agents, natural language inputs are first interpreted and then transformed into technical queries to retrieve pertinent data, with results delivered in an actionable format. The architecture also supports the streamlined integration RAG pipelines for enhanced response optimization.

## Architecture

![drawio](./drawio/reference-architecture-generative-ai-intelligent-data-apps.drawio)

The architecture illustrates how intellient data apps operate within the SAP Business Technology Platform (BTP) ecosystem, enabling
seamless integration of AI agent component and data sources. At the core, the [SAP Cloud Application Programming Model](./#sap-cloud-application-programming-model) (CAP)
serves as the orchestration layer, leveraging AI frameworks like LangChain and LangGraph to manage use case logic and data workflows.
[SAP Datasphere](./#services--components) plays a pivotal role by integrating with diverse data sources, federating data from SAP Cloud Solutions, third-party
applications, or on-premise solutions. This allows agents to efficiently query and process large, distributed datasets without
centralized storage. Meanwhile, the [Vector Engine](./#vector-engine) of SAP HANA Cloud supports a parallel RAG flow, enhancing search capabilities for real-time, contextually aware data retrieval, making the system well-suited for data-enriched enterprise applications. _Data Federation_ ensures agility by enabling access to heterogeneous datasets without duplication, increasing efficiency.

A high-level overview of how LLM Agents operate by combining key elements that enable intelligent decision-making and task execution:

- **LLM** serves as the reasoning engine, processing inputs and generating outputs
- **Knowledge** provides the data context needed for informed actions.
- **Memory** retains previous steps, ensuring continuity in complex workflows.
- **Tools**, like e.g., an SQL execution platform, perform specific tasks such as data retrieval or calculations.
- **Recipe** orchestrates these components, managing their interactions to deliver accurate results (e.g., in a data analysis task, the agent recipe might guide the LLM to query a database, store results in memory, and then apply a calculation tool to generate insights).

These elements work together in unison to create intelligent applications that unify data and AI, enabling real-time analytics and proactive decision-making. When combined with platforms like SAP Datasphere, agents unlock transformative potential, driving
significant advancements across industries such as supply chain, logistics, financial services, and operations.

Agents broadly address two core use cases: _Descriptive_ and _Prescriptive_ analytics. Descriptive analytics involves
deriving insights and trends from data, while prescriptive analytics takes this a step further by offering proactive recommendations and actionable strategies based on the analyzed data, helping organizations optimize decision-making and operational efficiency.

## Services & Components

For a comprehensive list of services, components and descriptions, please explore the Introduction on [Services & Components](./#services--components).

- [SAP Datasphere](https://discovery-center.cloud.sap/serviceCatalog/a62771ea-b7bf-4746-9d4b-fec20ade5281) enables a business data fabric architecture that uniquely harmonizes mission-critical data across the organization, unleashing business experts to make the most impactful decisions. It combines previously discrete capabilities into a unified service for data integration, cataloging, semantic modeling, data warehousing, and virtualizing workloads across SAP and non-SAP data.

## Business Agent Foundation (BAF)

The aim of the Business Agent Foundation (prototype) is to enable the efficient realization of business AI scenarios by providing reusable AI business agents as a service.
Through various integration and development tools provided via the Business Agent Foundation (prototype),
AI agents can be seamlessly integrated into existing and new business applications.
The innovation offers various features that empower agents with the skills required to complete enterprise processes and tasks,
while understanding business context and semantics. For more information, read the blog post [AI Business Agents and the Evolution of Business Automation: Join the Innovation Journey](https://community.sap.com/t5/technology-blogs-by-sap/ai-business-agents-and-the-evolution-of-business-automation-join-the/ba-p/13614232).