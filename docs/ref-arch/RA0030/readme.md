---
id: id-ra0030
slug: /ref-arch/688s6gFe
sidebar_position: 30
title: 'Generative AI on SAP BTP'
description: 'Generative AI on SAP BTP'
keywords: 
  - nvidia
sidebar_label: 'Generative AI on SAP BTP'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags: 
  - nvidia
contributors: 
  - abhissharma21
last_update:
  date: 2026-05-13
  author: abhissharma21
---

Harness the power of Generative AI (GenAI) in your applications on SAP BTP, providing a robust framework for optimizing AI-driven application development and data management.



For applications on SAP Business Technology Platform (SAP BTP) aiming to harness the power of Generative AI, this Reference Architecture provides a comprehensive framework. At its core, this reference architecture features a CAP-based backend to manage application logic, SAP HANA Cloud for storing data, including embeddings to facilitate similarity search with the power of its Vector Engine, and the Generative AI Hub as the central access point to Foundation Models and Large Language Models (LLMs). It demonstrates how to seamlessly integrate various LLMs using the Generative AI Hub in SAP AI Core, maximizing the potential of different Frameworks, Plugins, and SDKs in CAP. This enables the [implementation](https://architecture.learning.sap.com/docs/ref-arch/e5eb3b9b1d#vector-engine) of advanced patterns, such as Retrieval Augmented Generation (RAG) with embeddings, to further enhance the solution's effectiveness. This architecture accommodates both Cloud Foundry and Kyma runtimes, ensuring adaptability in leveraging GenAI within SAP BTP applications.

# Architecture

## Image



