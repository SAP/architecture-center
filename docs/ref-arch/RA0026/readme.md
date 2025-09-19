---
id: id-ra0026
slug: /ref-arch/NK4zDu05
sidebar_position: 26
title: 'Generative AI on SAP BTP [RA0026]'
description: '  Integrate Generative AI with SAP BTP using SAP HANA Cloud''s Vector Engine for
  similarity search and advanced AI patterns.'
keywords:
  - aws
  - azure
  - gcp
sidebar_label: 'Generative AI on SAP BTP'
tags:
  - aws
  - azure
  - gcp
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - abhissharma21
discussion: ''
last_update:
  date: 2025-09-19
  author: abhissharma21
---

# Generative AI on SAP BTP

Harness the power of Generative AI (GenAI) in your applications on SAP BTP, providing a robust framework for optimizing AI-driven application development and data management.

For applications on SAP Business Technology Platform (SAP BTP) aiming to harness the power of Generative AI, this Reference Architecture provides a comprehensive framework. At its core, this reference architecture features a [CAP](https://architecture.learning.sap.com/docs/ref-arch/e5eb3b9b1d#sap-cloud-application-programming-model)-based backend to manage application logic, SAP HANA Cloud for storing data, including embeddings to facilitate similarity search with the power of its [Vector Engine](https://architecture.learning.sap.com/docs/ref-arch/e5eb3b9b1d#vector-engine), and the [Generative AI Hub](https://architecture.learning.sap.com/docs/ref-arch/e5eb3b9b1d#generative-ai-hub) as the central access point to Foundation Models and Large Language Models (LLMs). It demonstrates how to seamlessly integrate various LLMs using the Generative AI Hub in SAP AI Core, maximizing the potential of different Frameworks, Plugins, and SDKs in CAP. This enables the implementation of advanced patterns, such as Retrieval Augmented Generation (RAG) with embeddings, to further enhance the solution's effectiveness. This architecture accommodates both Cloud Foundry and Kyma runtimes, ensuring adaptability in leveraging GenAI within SAP BTP applications.

# Architecture

![drawio](drawio/diagram-jIXts2rwSD.drawio)

Learn about the roles and interactions of the key services and components in the Reference Architecture to understand how they support the efficient use of Generative AI:

# 

