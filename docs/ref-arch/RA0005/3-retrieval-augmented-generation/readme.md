---
id: id-ra0005-3
slug: /ref-arch/e5eb3b9b1d/3
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Retrieval Augmented Generation (RAG)
description: >-
  Improve LLM accuracy with Retrieval Augmented Generation (RAG) by integrating
  external data for enhanced precision and reduced hallucinations.
keywords:
  - sap
  - ai
  - retrieval augmented generation
  - LLM control
  - generation accuracy
  - cross-domain integration
sidebar_label: Retrieval Augmented Generation (RAG)
image: img/ac-soc-med.png
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
  - madankumarpichamuthu
  - xammaxx
discussion: 
last_update:
  author: xammaxx
  date: 2025-07-21
---

To gain more control over the prompting results of a Large Language Model (LLM) in your application, you can leverage your own specific documents or data using Retrieval Augmented Generation (RAG). Key features of RAG include increased knowledge, as it allows LLMs to provide accurate answers by retrieving up-to-date information from external sources, even if the LLM wasn't trained on that data. RAG also offers flexibility by adapting to different domains, memory efficiency by avoiding model fine-tuning, and higher precision through combining factual data with LLM's language skills. Additionally, it enhances transparency by referencing specific sources for results.

## Architecture

![drawio](./drawio/reference-architecture-generative-ai-rag.drawio)

Retrieval Augmented Generation (RAG) is a neural architecture that extends the capabilities of Foundation Models (FMs) or Large Language Models (LLMs) by integrating retrieval mechanisms. These mechanisms allow the model to access external data or text beyond its internal knowledge base, making it adaptable to specific use cases, such as tapping into a customer’s proprietary product database or a curated document set.

The main objective of RAG is to enhance response quality by grounding answers in relevant, real-time data, thus minimizing the likelihood of hallucinations often found in LLM outputs.

RAG is applied to various tasks, including question answering (Q&A) and knowledge-intensive Natural Language Processing (NLP). It effectively combines retrieval and generation approaches, boosting NLP performance in complex scenarios.

A key feature of RAG is its use of embeddings, which can be stored and efficiently retrieved via SAP HANA Cloud's [Vector Engine](./#vector-engine). This platform provides comprehensive tools for creating vector-based tables, conducting similarity searches, and applying other vector functions essential for RAG workflows.

A high-level Flow of how Retrieval Augmented Generation (RAG) operates:

1. **Question Encoding**: The user submits a question or prompt, which is transformed into a dense vector (embedding) by an embedding model.

2. **Document Retrieval**: The embedding is used to query a large corpus of pre-embedded documents via SAP HANA Cloud's Vector Engine. Retrieval typically relies on similarity searches, such as cosine similarity, to identify the top-k most relevant documents or text chunks based on their proximity to the query vector.

3. **Response Generation**: The retrieved documents, along with the original question, are fed into a Large Language Model (LLM), which generates a response by synthesizing both the query and the retrieved information.

To leverage these underlying RAG principles, users can choose to either make use of SAP's standardized, use case-specific RAG services, or implement custom-built approaches on SAP BTP. Note that our recommended way to realize RAG solutions is to leverage SAP's standardized services wherever possible, as they offer a reliable, wide and growing set of functionalities, therefore minimizing the additional effort required to successfully implement your RAG.

### SAP AI Core's Grounding Service

[SAP’s Orchestration Workflow](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/orchestration-workflow) contains a [Grounding module](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/grounding) which provides specialized data retrieval through vector databases. This Grounding Module enables users to provide data for RAG purposes via several APIs by giving them two distinct options: 

1.	**Upload the documents to a supported data repository and run the Data Pipeline**: By calling the Grounding module's [Pipelines API](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/pipeline-api-a9badce6a4da4df68e98549d64aa2217), the documents are automatically fetched from [supported document repositories](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/grounding), chunked, embedded and then efficiently stored and managed via SAP HANA Cloud's [Vector Engine](./#vector-engine).

2.	**Provide the chunks of documents via Vector API directly**: Users can also upload documents they chunked themselves by calling the [Vector API](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/vector-api-0358c5ca839d4cf7b4982dbcbc1ba7ff) directly, thereby only making use of SAP HANA Cloud's Vector Engine. 

After storing the chunked and embedded documents, users can call the [Retrieval API](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/retrieval-api) to leverage a pipeline that takes incoming user queries and converts them into vector representations. The query vectors are used to search retrieval repositories and retrieve relevant chunks for the user query.

(To enrich [Joule](https://help.sap.com/docs/JOULE) with contextual information, its own [Document Grounding Service](https://help.sap.com/docs/joule/integrating-joule-with-sap/set-up-document-grounding) can be utilized. The service now supports PPTX files, including embedded images, expanding beyond the previous limitation to plain text only. The same capability is planned to become available in SAP AI Core’s Grounding module with the upcoming Document Grounding release.)

## Advanced RAG

Beyond the classical RAG approach, there are also advanced techniques that extend a RAG’s capabilities.

### Multi-modal RAG

When the requirements for a RAG exceed what is provided by SAP's standardized services, SAP BTP offers a great platform to realize more advanced use cases or purposefully extend existing solutions. This comes to play when aiming to retrieve information from documents that contain both plain text and images. In such cases, a multi-modal RAG approach provides a suitable solution. 

This image shows how the workflow of a multi-modal RAG can look like

![image](images/multi-modal-RAG.svg)

As depicted here, the documents go through a lot of preprocessing before they are stored in a database to be retrieved at runtime. 

**_Design phase_**

1.	First, all the images contained in the documents are extracted (e.g. using the [python fitz library](https://pypi.org/project/PyMuPDF/)). The images are then fed to an LLM via [Generative AI Hub SDK](https://github.com/SAP/ai-sdk-js), which is instructed to generate descriptions of said images. 

2.	In a subsequent step, the images in the documents are replaced with their generated description and a reference to the image itself. 

3.	Ultimately, the plain text - containing image descriptions and references - is chunked (e.g. using LangChain’s semantic chunker) and embedded using an embedding model (e.g. [HANA’s Embedding Model](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-vector-engine-guide/vector-embedding-function-vector)). Those embeddings are stored together with the original text and images in HANA Cloud’s Vector storage.

**_Runtime_**

4.	At runtime, every user query is embedded with the same embedding model which was used during preprocessing. The Vector Engine performs a [similarity search](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-vector-engine-guide/performing-similarity-searches) on the stored document embeddings, compares them to the embedded user query and picks the ten most similar chunks. 

5.	The stored original text for each chunk is then, together with all the base64-encoded image data and potential image descriptions, provided to the LLM for answer generation. 

6.	Since current LLMs have a limit on the number of images they can accept as input, this limitation must be overcome when the context to be provided to the LLM includes more images than supported. This is achieved by passing in image descriptions for the extra images - coming from chunks with less relevance - instead of their actual image data. In other words: the LLM doesn't usually rely on image descriptions as its main source of information. That only tends to happen when the number of images exceeds the model’s processing limits. Typically, the input includes both the stored text and base64-encoded images within each chunk. Note that this might not be required anymore in the future, since available models keep on improving rapidly. 
(Refer to the model providers’ documentation for image input limits. For instance, [Llama 4](https://www.llama.com/docs/model-cards-and-prompt-formats/llama4/) accepts up to 5 images per prompt, while [Anthropic Claude](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html) models supports up to 20.)

This approach ensures that the LLM includes relevant information contained in the images just as reliably as if only text were retrieved. 

For a deeper dive into advanced RAG techniques, explore [A Guide to Advanced RAG Techniques for Success in Business Landscape](https://community.sap.com/t5/technology-blogs-by-sap/a-guide-to-advanced-rag-techniques-for-success-in-business-landscape/ba-p/13571714).

## RAG Operations

The below image shows the high level components of a RAG Application
![image](images/rag-components.svg)

RAG itself can be analysed under the following subheadings:

1. Knowledge Ingestion
2. Knowledge Retrieval
3. Context Augmentation
4. Generation
5. Evaluation

![image](images/rag-development.svg)

When there is a need for unique features in a RAG application with complex requirements, certain components of a typical RAG application might have to evolve and the need for Advanced RAG features rises.

**Knowledge Ingestion**
This is the phase where the external documents and the true source documents are collected and processed to enhance the LLM’s knowledge base.
**_Source and Format_** When the source document is unstructured, there could be pre-processing steps needed or there might arise a need for the use of third party document ingestors like [NLM Ingestor](https://github.com/nlmatics/nlm-ingestor) for example.
**_Preparation_** In order to prepare the data for chunking and embedding, a pre-step called prepartion is done. Synthetic Data Generation could be an alternative for situations where data is scarse.
**_Chunking and Embedding_** Custom CAP based application can benefit from the CAP LLM Plugin for efficient and faster development. SAP own RAG solution (work in progress) has detailed guide on grounding and chunking and helper functions to build a complete RAG application.

**Knowledge Retrieval**
In this phase, the user query triggers the retrieval from the embedding storage based on the implemented search algorithm.
**_Storage_** Advanced requirements could demand the use of [Knowledge Graph](https://www.youtube.com/watch?v=PQrFjthwOWQ).
[LangChain](https://python.langchain.com/v0.2/docs/tutorials/rag/) also has guidance on best approaches to store the embeddings.

**_Pre-Retrieval_** When there are multiple source documents the intent determination in advanced RAG applications will demand pre-retreival steps like intent classification. Also when handling sensitive data, anonymization is mandatory. The CAP LLM Plugin also supports anonymization.

**_Search Algorithm_** Apart from the standard search algorithms (like Cosine) supported by HANA Vector Engine, custom logic to do Hybrid search for complex requirements is also possible.

**Context Augmentation**
The context of follow up questions, the length of the context window, and the summarization of the context are some of the steps in this phase.

**_Context Window_** Keeping a tab on the context window ensures that the overall cost of the advanced RAG application doesn't increase unecessarily. Context is also stored to retrieve the conversation history.

**_Context Tuning_** Maintaining the context for follow-up question to efficiently as well as accurately answer the subsequent questions is part of tuning.

**_Post Retrieval_** Techniques like [reranking](https://cohere.com/rerank) of the retreived results will improve the efficiency of the solution.

**Generation**
The main part of the RAG core logic is the generation of the response.
**_Model Parameters_** Tuning of the model parameters like temperature and top*p will significantly alter the quality of the response.
**\*Prompt Engineering** Covered in the basic prompting section above.
\*\*\_Optimization*\*\* Iterative approach to revisit and redefine each of the RAG application steps to tune the parameters and logic to optimize the solution for accuracy and performance.

**Evaluation**
The overall quality check of the RAG solution is carried out in this step. The quality in terms of performance, correctness, cost effectiveness are all included.
**_Preparation_** Prepare for this phase by zero-ing in on the desired metrics by reviewing the logs. [Cost Calculator](https://ai-core-calculator.cfapps.eu10.hana.ondemand.com/uimodule/index.html) is a handy tool to convert token size to CU and further to monthly cost in $.
**_Metrics_** The [major available metrics](https://docs.ragas.io/en/latest/concepts/metrics/index.html) to measure each segment of a RAG application are to be reviewed and identified specific to the current use case.
**_Action_** Following the recommended Reference Architecture patterns, reviewing and adhering to suggestions from ACDs and ADRs, reacting to the measured metrics - are some of the possible actions to mature the RAG application and to get it production ready

## Services & Components

For a comprehensive list of services, components and descriptions, please explore the Introduction on [Services & Components](./#services--components).

## Examples

Take a look at the following examples that build upon or implement elements of the Reference Architecture:

-   [GenAI Mail Insights - Develop a CAP-based application using GenAI and RAG on SAP BTP](https://github.com/SAP-samples/btp-cap-genai-rag)
-   [RAG Quickstart using CAP LLM Plugin](https://github.com/SAP-samples/cap-llm-plugin-samples/tree/main/samples/rag-quickstart-app)
