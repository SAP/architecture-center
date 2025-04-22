---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0013
slug: /ref-arch/ea5f5b9bf1
sidebar_position: 13
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Building Enterprise GenAI Applications Powered by IBM Granite Models
description: The reference architecture illustrates a collaborative solution developed with IBM, designed specifically for the SAP Business Technology Platform. It leverages IBM Granite 13B Chat V2 model via SAP AI Core’s Generative AI Hub and SAP HANA Cloud’s Vector Engine. This architecture enables enterprise users to seamlessly access and interact with organizational knowledge using natural language. By employing a Retrieval-Augmented Generation (RAG) framework, the solution performs semantic searches across embedded document content, delivering accurate and contextually relevant responses tailored to user queries.
sidebar_label: Building Enterprise GenAI Applications Powered by IBM Granite Models
keywords: [IBM, Generative AI, SAP HANA Cloud, SAP AI Core, RAG]
image: img/logo.svg
tags: [IBM, RAG, Generative AI, SAP HANA Cloud,  SAP AI Core]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
    - chaturvedakash
    - kevinxhuang
last_update:
    date: 2025-04-17
    author: chaturvedakash
############################################################
#                   End of Front Matter                    #
############################################################
---
The reference architecture illustrates a collaborative solution developed with IBM, designed specifically for the SAP Business Technology Platform. It leverages IBM's Granite 13B Chat V2 model via SAP AI Core’s Generative AI Hub and SAP HANA Cloud’s Vector Engine to address a common enterprise challenge: the difficulty of efficiently accessing valuable information buried within large volumes of documents. Traditional methods—manual document review or basic keyword searches—are time-consuming, error-prone, and often lack context, leading to reduced productivity and delayed decision-making.

This architecture was designed to solve that problem by enabling a Retrieval-Augmented Generation (RAG) pipeline that allows users to query document content using natural language. Uploaded documents are processed and embedded as vectors in SAP HANA Cloud’s Vector Engine, allowing for semantic search that retrieves the most relevant context. This is then passed to the IBM Granite model, which generates accurate, context-rich responses through the SAP AI Core’s Generative AI Hub and the CAP LLM plugin. Optimized for enterprise GenAI and RAG, the IBM Granite 13 Billion Chat V2 model offers differentiating values in transparency, performance, and efficiency, which enhances the functionality of chatbots, virtual assistants, and Q&A systems

The result is a low-code, scalable, and flexible solution that dramatically improves access to enterprise knowledge. It reduces manual effort, accelerates decision-making, and enhances operational efficiency. Its industry-agnostic design allows for broad applicability—ranging from HR onboarding and legal document analysis to customer support—empowering teams to make smarter, faster decisions using intelligent, AI-driven insights.


## Architecture

<!-- The drawio "image" should appear right after the Solution Diagram SVG image -->
<!-- Note: [PLACEHOLDER] Please update the drawio with your architecture's drawio  -->

![drawio](drawio/ibm-granite-rag-ard.drawio)

## Flow

The solution embeds a Retrieval-Augmented Generation (RAG) pipeline, enabling users to access and interact with enterprise document-based knowledge using natural language queries. The end-to-end workflow is structured into two key phases — Content Ingestion and Retrieval —leveraging SAP HANA Cloud’s Vector Engine for semantic search and the IBM Granite 13B Chat V2 model via SAP AI Core’s Generative AI Hub for intelligent, context-aware response generation. This architecture streamlines content discovery and automates accurate answer delivery, enhancing enterprise knowledge access at scale.

### Content Ingention Flow:     

#### Document Partitioning:       

Knowledge sources such as documents are segmented into smaller, meaningful chunks — such as paragraphs or logical sections—to enhance the precision and contextual relevance of search results.

#### Document Embedding and Persistence: 

Using the CAP LLM Plugin, each document chunk is transformed into a vector embedding by invoking embedding models through SAP AI Core’s Generative AI Hub. Both the chunked content and the embeddings are stored in SAP HANA Cloud’s Vector Engine for efficient semantic retrieval.  

### Retrieval Flow:     

This phase processes user queries and generates intelligent answers by retrieving semantically relevant content and passing it to a chat based large language model.  

#### Query Embedding:  

A user-submitted question is converted into a vector representation using the same embedding model used in the content ingestion phase, ensuring compatibility in the vector space.  

#### Semantic Search and Context Retrieval:  

The encoded query is matched against stored document embeddings in SAP HANA Cloud’s Vector Engine using similarity search (with measures such as cosine similarity or L2 distance). The most relevant document chunks are retrieved based on semantic closeness to the query.  

#### Answer Generation via LLM:  

The retrieved context and original user question are passed to the IBM Granite model hosted on SAP AI Core’s Generative AI Hub. The model then generates an accurate, context-rich response based on both the query and the retrieved information.  

## Characteristics

#### Enterprise-Ready AI with IBM Granite 13B Chat V2 Model:

Harnesses the IBM Granite 13B Chat V2 model, specifically optimized for enterprise-grade Generative AI and Retrieval-Augmented Generation (RAG) use cases, offering outstanding performance, transparency, and efficiency. This enhances the reliability of chatbots, virtual assistants, and Q&A systems, ensuring scalable, intelligent, and trustworthy AI-driven interactions across diverse business scenarios.

#### Secure and Scalable LLM Access via SAP AI Core:

Taps into SAP AI Core's secure, enterprise-grade environment for accessing and operationalizing large language models, including IBM Granite 13B Chat V2. It ensures scalable, high-performance inferencing while maintaining data governance and compliance.

#### Efficient Semantic Search with SAP HANA Cloud Vector Engine:

Leveraging vector similarity search, SAP HANA Cloud Vector Engine enables fast, accurate semantic matching between document embeddings and user queries. This ensures highly relevant context is retrieved for each user query.

#### Seamless Integration Across SAP BTP Landscape:

Built using the SAP Cloud Application Programming (CAP) model, the solution integrates effortlessly with SAP AI Core’s Generative AI Hub and SAP HANA Cloud’s Vector Engine, forming a robust foundation for scalable AI-driven enterprise applications.

#### Context-Rich, Domain-Adaptable Retrieval to Reduce Hallucinations:

By dynamically retrieving real-time, context-rich content from a curated and adaptable document corpus, the RAG architecture ensures accurate responses, even if the LLM lacks domain-specific training. This minimizes hallucinations and allows seamless reuse across diverse domains such as HR, legal, finance, and technical support by simply updating the knowledge base.

#### Natural Language Interface for Enterprise Users:

The solution provides a natural language interface, enabling users to interact with complex internal knowledge via simple queries. This eliminates the need for manual document searches or technical interfaces, making it more user-friendly for enterprise users.

## Examples in an SAP context

With enterprises increasingly seeking AI-driven insights from their internal knowledge, this reference architecture enables seamless integration of AI services into business workflows. For example, a knowledge retrieval solution built on SAP BTP leverages SAP HANA Cloud’s Vector Engine to store semantically embedded content from policy documents, product manuals, or internal FAQs. Using SAP AI Core’s integration with IBM Granite 13B Chat V2 through the Generative AI Hub, business users—such as HR specialists or support agents— can query this content in natural language via SAP Fiori UI5, chatbots embedded within SAP Build Work Zone, or via Joule — the generative AI copilot from SAP. This eliminates the need for manual search, accelerating processes such as onboarding, compliance validation, or issue resolution—while staying within the governed SAP landscape. Moreover, the architecture is modular and extensible, allowing seamless integration with other SAP cloud and on-premise systems such as SAP S/4HANA, SAP SuccessFactors, or SAP Document Management Service to further enhance enterprise-wide knowledge accessibility.

## Services and Components

- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/1f756a52-8968-4ec4-92d0-f9bddf552ea3) - Generative AI Hub: A managed service that operationalizes and scales AI workloads, enabling seamless execution of machine learning and generative AI pipelines.
- [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/c4e4c32e-4eda-4286-96b0-5299d6a79014) : A cloud-native in-memory database offering advanced capabilities such as multi-model processing, real-time analytics, and vector-based search for AI integration, including the ability to perform semantic search with its Vector Engine for enhanced data retrieval.
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/257fac1c-88aa-415b-8ea8-c96282c9a19b): A flexible application runtime environment on SAP BTP that allows developers to build, deploy, and scale cloud-native applications using open standards.
- [SAP Authorization and Trust Management Service](https://discovery-center.cloud.sap/serviceCatalog/74843d98-8be5-43fa-957b-0d387f579a92): Provides centralized identity and access management across SAP BTP, enabling secure authentication and authorization for applications and services.
- [Destination](https://discovery-center.cloud.sap/serviceCatalog/6686cc96-fdd7-4d8a-90e2-0c833883eec4) : A configuration in SAP BTP that defines external system connections, enabling applications to securely communicate with remote services, APIs, and data sources.
- [SAP HTML5 Application Repository Service for SAP BTP](https://discovery-center.cloud.sap/serviceCatalog/28d57c03-d1f7-4d60-ad94-36d7ba6a88dc) : Develop and run HTML5 applications in a cloud environment.

## Resources

- [End-to-End implementation on Github](https://github.com/ibm-self-serve-assets/SAP-watsonx-integration/tree/main/5.%20SAP%20Generative%20AI%20Hub%20and%20HANA%20Cloud%20Vector%20Engine/5.2%20SAP%20Discovery%20Center%20Mission): Step-by-step implementation of a sample application built using the reference architecture. 
- [IBM Granite 13 Billion Chat V2](https://www.ibm.com/docs/en/watsonx/w-and-w/2.0.x?topic=models-granite-13b-chat-v2-model-card): An enterprise-grade large language model optimized for Generative AI and RAG scenarios, offering high transparency, performance, and efficiency for intelligent applications.
- [SAP AI Core's Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core): The generative AI hub incorporates generative AI into your AI activities in SAP AI Core and SAP AI Launchpad.
- [SAP HANA Cloud Vector Engine](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-vector-engine-guide/introduction): Enables high-performance semantic search using vector embeddings for AI-driven scenarios like RAG and NLP.
- [CAP LLM Plugin](https://github.com/SAP-samples/cap-llm-plugin-samples):  The CDS plugin that enables developers to build tailored Generative AI-based CAP applications with ease.

