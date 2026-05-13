---
id: id-ra0030
slug: /ref-arch/fluWmr8g
sidebar_position: 30
title: 'Generative AI on SAP BTP'
description: 'Generative AI on SAP BTP'
keywords: 
  - security
sidebar_label: 'Generative AI on SAP BTP'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags: 
  - security
contributors: 
  - abhissharma21
last_update:
  date: 2026-05-13
  author: abhissharma21
---

Harness the power of Generative AI (GenAI) in your applications on SAP BTP, providing a robust framework for optimizing AI-driven application development and data management.



For applications on SAP Business Technology Platform (SAP BTP) aiming to harness the power of Generative AI, this Reference Architecture provides a comprehensive framework. At its core, this reference architecture features a [CAP](https://architecture.learning.sap.com/docs/ref-arch/e5eb3b9b1d#sap-cloud-application-programming-model)-based backend to manage application logic, SAP HANA Cloud for storing data, including embeddings to facilitate similarity search with the power of its Vector Engine, and the Generative AI Hub as the central access point to Foundation Models and Large Language Models (LLMs). It demonstrates how to seamlessly integrate various LLMs using the Generative AI Hub in SAP AI Core, maximizing the potential of different Frameworks, Plugins, and SDKs in CAP. This enables the implementation of advanced patterns, such as Retrieval Augmented Generation (RAG) with embeddings, to further enhance the solution's effectiveness. This architecture accommodates both Cloud Foundry and Kyma runtimes, ensuring adaptability in leveraging GenAI within SAP BTP applications.



# Architecture

An important feature of the Generative AI Hub is Orchestration, which combines content generation via an Harmonized API with essential functions often required in business AI scenarios. These functions include:



- Gounding: Allows to integrate external, contextually relevant, domain-specific, or real-time data into AI processes. This data supplements the natural language processing capabilities of pre-trained models, which are trained on general material.

- Templating: Allows you to compose prompts with placeholders filled during inference.

- Translation: Allows you to translate LLM text prompts into a chosen target language.

- Data Masking: Provides anonymization or pseudonymization of data before it's processed by a generative AI model. In cases of pseudonymization, masked data appearing in the model's

Content Filtering: Enables restriction of the type of content passed to and from a generative AI model.response will be unmasked.





