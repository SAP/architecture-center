---
id: id-ra0005-2
slug: /ref-arch/5c9255f84a/2
sidebar_position: 1
sidebar_custom_props: {}
title: Embeddings & Semantic Search
description: Semantic search using embeddings converts data into dense numeric vectors to capture meanings. Stored in vector databases, these vectors enable efficient similarity searches with cosine similarity, improving search relevance and user experience by focusing on meaning over exact keywords.
keywords:
  - sap
  - ai
  - genai
  - aws
  - azure
  - gcp
sidebar_label: Embeddings & Semantic Search
image: img/logo.svg
tags:
  - aws
  - azure
  - gcp
  - genai
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - kay-schmitteckert
  - AdiPleyer
  - vedant-gupta-ai
  - madankumarpichamuthu
last_update:
  author: kay-schmitteckert
  date: 2025-01-31
---

Embeddings are powerful and dense numeric representations of data that capture the underlying meaning of words or concepts. In business applications, they enable more intelligent, context-aware search capabilities. By using Embedding Models, businesses can transform textual or other data into vector representations. These vectors are then stored in a vector database, which facilitates fast and efficient similarity searches using methods like cosine similarity. This allows for semantic search functionality, where results are based on meaning rather than exact keyword matches, improving search relevance, user experience, and overall operational efficiency.

## Architecture

![drawio](./drawio/reference-architecture-generative-ai-semantic-search.drawio)

In this architecture, the Cloud Application Programming (CAP) model serves as the central interface for managing application logic and executing searches. CAP natively supports embeddings as part of its data schema, allowing for seamless integration of vector representations. When user inputs are processed, they are converted into embeddings using Embedding Models via the [Generative AI Hub](./#generative-ai-hub). These vectors are then stored and indexed within SAP HANA Cloud's [Vector Engine](./#vector-engine), enabling fast similarity searches through methods like cosine similarity. Upon initiating a search, the CAP model communicates with the Vector Engine to retrieve results based on the semantic meaning of the inputs, leading to contextually relevant responses. Additionally, various SDKs and plugins, such as the [SAP Cloud SDK (for AI)](https://github.com/SAP/ai-sdk-js), [CAP LLM Plugin](https://github.com/SAP-samples/cap-llm-plugin-samples) and [LangChain](https://www.langchain.com/), enhance the embedding process and streamline integration with both, the Generative AI Hub and the Vector Engine.

## Services & Components

For a comprehensive list of services, components and descriptions, please explore the Introduction on [Services & Components](./#services--components).

## Examples

Take a look at the following examples that build upon or implement elements of the Reference Architecture:

- [SAP BTP genAI starter kit](https://github.com/SAP-samples/btp-genai-starter-kit) wants to give users of the SAP Business Technology Platform (BTP) a quick way to learn how to use generative AI with BTP services.
- [CAP with Generative AI Hub & SAP HANA Cloud Vector Engine](https://github.com/SAP-samples/btp-cap-genai-rag/tree/cap-genaihub-vectorengine-sample)
- [GenAI Mail Insights: Develop a CAP-based (multitenant) application using GenAI and Retrieval Augmented Generation (RAG)](https://discovery-center.cloud.sap/missiondetail/4371/)
- [GenAI Semantic Search: Develop a Semantic Search app leveraging Generative AI Hub & SAP HANA Cloud's Vector Engine](https://discovery-center.cloud.sap/missiondetail/4456/)
