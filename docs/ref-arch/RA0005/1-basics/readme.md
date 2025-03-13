---
id: id-ra0005-1
slug: /ref-arch/5c9255f84a/1
sidebar_position: 1
sidebar_custom_props: {}
title: Basic Prompting
description: Enhance SAP BTP applications using Generative AI by integrating custom prompts for Foundation Models or LLMs. This allows natural language processing to craft AI responses tailored to specific tasks, enabling intelligent user interactions and achieving application objectives.
keywords:
  - sap
  - ai
  - genai
  - aws
  - azure
  - gcp
sidebar_label: Basic Prompting
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
  - vedant-aero-ml
  - madankumarpichamuthu
last_update:
  author: kay-schmitteckert
  date: 2025-01-31
---

Leveraging prompting with Foundation Models or Large Language Models (LLMs) is a powerful way to enhance your applications by enabling natural language processing for both input and output. Using Generative AI on SAP Business Technology Platform (SAP BTP), you can build applications that interact intelligently with your users through custom prompts. By calling Foundation Models with custom prompts, you can control the AI's responses to align with specific tasks and objectives. Here's what to use for basic prompting on SAP BTP to unlock this capability in your applications.

## Architecture

![drawio](./drawio/reference-architecture-generative-ai-basic.drawio)

In this architecture, the Cloud Application Programming (CAP) model serves as the central point for managing application logic and sending prompts, either through well-designed, integrated prompt templates within the application itself or via a user interface like SAPUI5 for end-user interaction. CAP is connected to the Generative AI Hub via SAP AI Core and its [AI API](https://api.sap.com/api/AI_CORE_API/overview), enabling seamless communication with Foundation Models and Large Language Models (LLMs). Furthermore, various SDKs, frameworks, and plugins, such as [SAP Cloud SDK (for AI)](https://github.com/SAP/ai-sdk-js), [LangChain](https://www.langchain.com/), and [CAP LLM Plugin](https://github.com/SAP-samples/cap-llm-plugin-samples), can be leveraged within CAP to not only streamline interactions with the Generative AI Hub but also simplify implementation and enhance robustness by using features like [Output Parsing](https://js.langchain.com/docs/concepts/#output-parsers). The [Orchestration Service](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/orchestration) provides a harmonized API for content generation (e.g., LLM completions) and includes key functionalities such as prompt templating and content filtering, making it even easier and more efficient to work with these models.

## Services & Components

For a comprehensive list of services, components and descriptions, please explore the Introduction on [Services & Components](./#services--components).

## Examples

Take a look at the following examples that build upon or implement elements of the Reference Architecture:

- [Sample CAP application using ai-sdk-js](https://github.com/SAP/ai-sdk-js/tree/main/sample-cap) shows how to use Generative AI Hub for connecting to Foundation Models, Orchestration Service or LangChain.
- [SAP BTP genAI starter kit](https://github.com/SAP-samples/btp-genai-starter-kit) wants to give users of the SAP Business Technology Platform (BTP) a quick way to learn how to use generative AI with BTP services.

- [Reduce your CO2 footprint using a smart Generative AI application on SAP BTP](https://discovery-center.cloud.sap/missiondetail/4264/)

- [GenAI Mail Insights: Develop a CAP-based (multitenant) application using GenAI and Retrieval Augmented Generation (RAG)](https://discovery-center.cloud.sap/missiondetail/4371/)
