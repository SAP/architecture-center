---
id: id-ra0030
slug: /ref-arch/uBnQWtS4
sidebar_position: 30
title: 'TEST with Julian #2'
description: 'This is a default description.'
keywords: 
  - bdc
  - eda
sidebar_label: 'TEST with Julian #2'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - bdc
  - eda
contributors:
  - cernus76
last_update:
  date: 2026-05-07
  author: cernus76
---

## H



Some text here to 

# New test with H1



Hello!



Some note here



# Second test with H1/







H

### h3 level /





**Generative AI on SAP BTP**

Harness the power of Generative AI (GenAI) in your applications on SAP BTP, providing a robust framework for optimizing AI-driven application development and data management.

For applications on SAP Business Technology Platform (SAP BTP) aiming to harness the power of Generative AI, this Reference Architecture provides a comprehensive framework. At its core, this reference architecture features a CAP-based backend to manage application logic, SAP HANA Cloud for storing data, including embeddings to facilitate similarity search with the power of its Vector Engine, and the Generative AI Hub as the central access point to Foundation Models and Large Language Models (LLMs). It demonstrates how to seamlessly integrate various LLMs using the Generative AI Hub in SAP AI Core, maximizing the potential of different Frameworks, Plugins, and SDKs in CAP. This enables the implementation of advanced patterns, such as Retrieval Augmented Generation (RAG) with embeddings, to further enhance the solution's effectiveness. This architecture accommodates both Cloud Foundry and Kyma runtimes, ensuring adaptability in leveraging GenAI within SAP BTP applications.

**Architecture**



Learn about the roles and interactions of the key services and components in the Reference Architecture to understand how they support the efficient use of Generative AI:

**SAP Cloud Application Programming Model**

The SAP Cloud Application Programming Model (CAP) is a framework of languages, libraries, and tools for building enterprise-grade services and applications. It supports Java (with Spring Boot), JavaScript, and TypeScript (with Node.js), which are some of the most widely adopted languages. CAP is recommended by the SAP BTP Developer's Guide, and supports developers with a path of proven best practices and a wealth of out-of-the-box solutions to recurring tasks.

In the provided Reference Architecture, CAP serves as the central hub for application and domain logic, interacting with SAP solutions (Cloud or On-Premise), 3rd party applications, and managing data sources such as SAP HANA Cloud. Within the application logic, various plugins (e.g., CAP LLM Plugin) and SDKs like SAP Cloud SDK for AI (JavaScript/TypeScript or Java) can be utilized to support the development of Generative AI solutions - also together with LangChain.

**Generative AI Hub**

The Generative AI Hub incorporates Generative AI into your AI activities in SAP AI Core and SAP AI Launchpad.

To achieve this, the Generative AI Hub offers secure and reliable access to Foundation Models, primarily Large Language Models (LLMs), hosted on SAP BTP or by external partners such as Microsoft Azure, Google, and AWS, but also simplifies their integration into business processes. These models can be used for different domain-specific applications, utilizing patterns like Retrieval Augmented Generation (RAG), AI Agents, or Conversational AI, all accessed via standardized APIs to streamline the implementation of Generative AI. Also, see Additional Concepts like a Prompt Registry to manage prompt lifecycles or Prompt Optimization to refine prompts against target datasets, improving end-to-end model performance.

An important feature of the Generative AI Hub is Orchestration, which combines content generation via an Harmonized API with essential functions often required in business AI scenarios. These functions include:

1. **Content Filtering**: Enables restriction of the type of content passed to and from a generative AI model.response will be unmasked.

- **Gounding**: Allows to integrate external, contextually relevant, domain-specific, or real-time data into AI processes. This data supplements the natural language processing capabilities of pre-trained models, which are trained on general material.
- **Templating**: Allows you to compose prompts with placeholders filled during inference.
- **Translation**: Allows you to translate LLM text prompts into a chosen target language.
- **Data Masking**: Provides anonymization or pseudonymization of data before it's processed by a generative AI model. In cases of pseudonymization, masked data appearing in the model's

In a basic orchestration scenario, different modules from orchestration can be combined into a pipeline and executed with a single API call. Within this pipeline, the response from one module is used as the input for the next module. The order of execution within the pipeline is centrally defined in orchestration. However, details for each module can be configured, and optional modules can be omitted by including an orchestration configuration in JSON format with the request body or even easier leveraging the SAP Cloud SDK for AI.

You can explore the models and scenarios available in the Generative AI Hub, as well as check the availability of Generative AI models across regions and their specific limitations.

SAP AI Core and the Generative AI Hub help you to integrate Foundation Models, LLMs and AI into new business processes in a cost-efficient and secure manner.

**SAP HANA Cloud's Vector Engine & Knowledge Graph Engine**

With the following engines, SAP HANA Cloud offers a comprehensive platform combining advanced data management with AI-enhanced applications, each serving distinct but complementary roles in fostering sophisticated and intelligent business solutions.

**Vector Engine**

The Vector Engine in SAP HANA Cloud manages unstructured data, such as text and images, in high-dimensional embeddings, enhancing AI models with long-term memory and better context. These features enable Retrieval Augmented Generation (RAG), combining LLMs with private business data to create intelligent applications that support automated decision-making and boost developer productivity.

Some key benefits and features of the Vector Engine include:

- Multi-model: Users can unify all types of data into a single database to build innovative applications using an efficient data architecture and in-memory performance. By adding vector storage and processing to the same database already storing relational, graph, spatial, and even JSON data, application developers can create next-generation solutions that interact more naturally with the user.
- Enhanced search and analysis: Businesses can now apply semantic and similarity search to business processes using documents like contracts, design specifications, and even service call notes.
- Personalized recommendations: Users can benefit from an improved overall experience with more accurate and personalized suggestions.
- Optimized large language models: The output of LLMs is augmented with more effective and contextual data.

**Knowledge Graph Engine**

The Knowledge Graph Engine in SAP HANA Cloud provides advanced capabilities for managing and querying semantically connected relationships, supporting sophisticated data management and AI integration.

Some features of the Knowledge Graph Engine:

- Native Triplestore and RDF Support: This engine supports the Resource Description Framework (RDF) and triplestore SPARQL execution engine, allowing the exposure of relational data within a knowledge graph framework using subjects, objects, and predicates. It also supports transactions in a triplestore database.
- SQL and SPARQL Interoperability: Facilitates seamless integration between SQL and SPARQL, supporting complex queries that leverage both relational and graph data for advanced reasoning and inference tasks. Some key benefits of using the Knowledge Graph Engine include:
- Improved Decision-Making and Logical Inference: Enhances logical formality and performance in handling RDF with relational data aspects, improving decision-making.
- Interconnected Corporate Knowledge: Connects corporate knowledge, providing a valuable resource for powering large language models and generative AI capabilities in applications.
- Enhanced Data Understanding: Structures and connects data, enabling deeper insights and reasoning for complex business queries.

**Scenarios**

Given the various aspects and patterns of generative AI, there isn't a single, unified flow but rather multiple overlapping ones. The following sections explore the most common of these flows and explain how they align with the Reference Architecture outlined above.

- Basic Prompting introduces the fundamentals of prompting foundation models by interacting with the Generative AI Hub, providing essential techniques for effective AI engagement within your SAP BTP application.
- Semantic Search & Embeddings demonstrates how to leverage vector representations in SAP HANA Cloud's Vector Engine for context-aware, meaning-based search.
- Retrieval Augmented Generation extends on how to support and ground generative AI with actual documents and data.
- AI Agents enable autonomous, adaptive execution of complex enterprise processes.
- A2A Agent-to-Agent Interoperability illustrates how multiple agents collaborate with the A2A protocol.
- Agents for Structured Data enable natural language queries into enterprise data for descriptive and prescriptive analytics.
- Multi-Tenancy explains the multi-tenant aspect for generative AI on SAP BTP.
- Vibe Coding with Cline and SAP AI Core explains how to setup and use Cline with SAP AI Core.

**Services & Components**

- SAP HANA Cloud a database-as-a-service that powers mission-critical applications and real-time analytics with one solution at petabyte scale. Converge relational, graph, spatial, and document store and develop smart applications with embedded machine learning. Process mission-critical data at proven in-memory speed and manage it more efficiently with integrated multi-tier storage.
- SAP AI Core a service in the SAP Business Technology Platform that is designed to handle the execution and operations of your AI assets in a standardized, scalable, and hyperscaler-agnostic way. It provides seamless integration with your SAP solutions. Any AI function can be easily realized using open-source frameworks. SAP AI Core supports full lifecycle management of AI scenarios.
- SAP AI Launchpad a multitenant software as a service (SaaS) application in SAP Business Technology Platform. Customers and partners can use SAP AI Launchpad to manage AI use cases (scenarios) across multiple instances of AI runtimes (such as SAP AI Core).
- SAP BTP, Cloud Foundry Runtime lets you develop polyglot cloud-native applications and run them on the SAP BTP Cloud Foundry environment.
- SAP BTP, Kyma runtime is a fully managed Kubernetes runtime based on the open-source project "Kyma". This cloud-native solution allows the developers to extend SAP solutions with serverless functions and combine them with containerized microservices. The offered functionality ensures smooth consumption of SAP and non-SAP applications, running workloads in a highly scalable environment, and building event and API-based extensions.
- SAP HTML5 Application Repository Service for SAP BTP enables central storage of HTML5 applications on SAP BTP. The service allows application developers to manage the lifecycle of their HTML5 applications. In runtime, the service enables the consuming application, typically the application router, to access HTML5 application static content in a secure and efficient manner.
- SAP Destination service lets you retrieve the backend destination details you need to configure applications in the Cloud Foundry environment.
- SAP Authorization and Trust Management Service lets you manage user authorizations and trust to identity providers. Identity providers are the user base for applications. We recommend that you use the SAP Identity Authentication Service (IAS), an SAP on-premise system, or a custom corporate identity provider.
- SAP Business Application Studio (the next generation of SAP Web IDE) is a powerful and modern development environment, tailored for efficient development of business applications for the Intelligent Enterprise. Available as a cloud service, it provides developers a desktop-like experience similar to market leading IDEs, while accelerating time-to-market with high-productivity development tools such as wizards and templates, graphical editors, quick deployment, and more.
- SAP Continuous Integration and Delivery service lets you configure and run predefined continuous integration and delivery (CI/CD) pipelines that automatically build, test, and deploy your code changes to speed up your development and delivery cycles.

**Examples**

Take a look at the following examples that build upon or implement elements of the Reference Architecture:

- Sample CAP application using ai-sdk-js
- GenAI Mail Insights - Develop a CAP-based application using GenAI and RAG on SAP BTP
- CAP Application: Semantic Search Integrated with Generative AI Hub and SAP HANA Cloud's Vector Engine

**Resources**

For more information related to this Reference Architecture in general you may check out the following resources:

1. SAP Cloud SDK for AI

- Generative AI Hub in SAP AI Core Overview (SAP Help Portal)
- Models and scenarios in the Generative AI Hub (SAP Help Portal)
- Availability of Generative AI Models across Regions and their Limitations
- SAP BTP Use Cases: Kick-Start Transformation with Pre-Built Business Content (SAP Community blog post)
- SAP Learning: Generative AI at SAP
- SAP Learning: AI Ethics at SAP
- SAP AI Ethics Handbook

/Filter.../Filter...///

ssss



ssss

some text here and here and here





# H1 headings /



## H2 headings/



### H3 /H3



col1col2col3col4l1l2l3l4/Filter...///

some text





/Filter...testooo











# Hello test wwwweeee/







