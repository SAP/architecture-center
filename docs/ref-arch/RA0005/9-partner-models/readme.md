---
############################################################
#                Beginning of Front Matter                 #
############################################################
#                     [DO NOT MODIFY]                      #
############################################################
id: id-ra0005-9
slug: /ref-arch/e5eb3b9b1d/9
sidebar_position: 9
sidebar_custom_props:
    category_index:
############################################################
#     You can modify the front matter properties below     #
############################################################
title: Partner Models
description: The reference architecture illustrates how to benefit from partner models like IBM Granite foundation model for the increasing demand of generative AI features in business scenarios with emphasis on data security, IP Protection and enterprise-grade governance and compliance.
keywords: [IBM, Granite, Generative AI, SAP HANA Cloud, SAP AI Core, RAG]
sidebar_label: Partner Models
image: img/logo.svg
tags: [genai]
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
    - chaturvedakash
    - feng-lia
    - kevinxhuang
last_update:
    date: 2025-06-17
    author: feng-lia
############################################################
#                   End of Front Matter                    #
############################################################
---

IBM's Granite foundation models are purpose-built generative AI solutions, designed to seamlessly integrate GenAI within business applications and workflows. By combining high performance, efficient deployment, and rigorous safeguards—including domain-specific training data, advanced risk detection tools, and enterprise-grade IP protection—IBM Granite provides a compelling solution for enterprises looking to adopt AI responsibly and confidently.

With the support of enterprise-grade tools such as SAP AI Core and IBM’s Granite model together, business users—such as HR specialists and support agents—can interact with content using natural language through SAP Fiori UI5, chatbots embedded in SAP Build Work Zone, or Joule, SAP’s generative AI copilot. This eliminates the need for manual searches, streamlining processes like onboarding, compliance validation, and issue resolution—all within SAP’s governed environment.

Furthermore, the architecture is modular and extensible, allowing seamless integration with other SAP cloud and on-premise systems, such as SAP S/4HANA, SAP SuccessFactors, and SAP Document Management Service, to enhance enterprise-wide knowledge accessibility.

## Architecture

![drawio](drawio/ibm-granite-rag-ard.drawio)

## Why SAP Managed Granite?

#### 1. Purpose-Built for Enterprise Use Cases
Unlike generic foundation models, IBM Granite is specifically designed for enterprise-grade applications, offering data privacy and standard IP Protection needed for business-critical tasks like summarization, classification, RAG, and conversational agents—all aligned with real business needs. Details at [IBM Granite and Client Protection](https://newsroom.ibm.com/2023-09-28-IBM-Announces-Availability-of-watsonx-Granite-Model-Series,-Client-Protections-for-IBM-watsonx-Models).

#### 2. Domain-Specific Intelligence
Granite is trained on high-quality, domain-specific datasets, including legal, financial, and enterprise content. This focused approach ensures a deeper understanding of industry-specific language, enabling better performance in specialized use cases—often outperforming much larger models in enterprise benchmarks. You can find more information in the [research paper of IBM Granite foundation models](https://www.ibm.com/downloads/documents/us-en/10a99803c92fdb35).

#### 3. Trusted, Transparent and Responsible AI
IBM ensures rigorous data governance and ethical standards throughout Granite’s lifecycle. All training data is filtered to remove duplicates, copyrighted material, profane content, and GDPR-protected data. Model and its training data are also open-sourced. Check more at [IBM Ganite on huggingface](https://huggingface.co/ibm-granite) and [IBM Granite on github](https://github.com/ibm-granite).

#### 4. Efficient and Cost-Effective
Granite strikes a balance between performance and resource efficiency. The 13B parameter models can run on a single GPU, significantly reducing infrastructure complexity and operational cost, while still matching or exceeding larger models in enterprise benchmarks—especially in financial services.

#### 5. Streamlined Integration with SAP Ecosystem
SAP-managed Granite models are optimized to work natively within SAP’s suite of applications (e.g., SAP S/4HANA, SuccessFactors, SAP Build Work Zone). This tight integration accelerates deployment and eliminates the need for extensive customization, making it easier to embed generative AI into core business processes.

#### 6. Enterprise-Grade Governance and Compliance
By running Granite under SAP's management, businesses benefit from SAP’s built-in data governance, compliance, and security frameworks—ensuring that AI deployments meet industry-specific regulatory requirements.

#### 7. Enhanced Data Security and Trust
Since the models operate within SAP’s trusted environment, sensitive business data doesn’t leave the company’s ecosystem. This reduces exposure risk and aligns with strict data residency and sovereignty requirements often demanded by enterprise customers.

## Resources

<!-- Add your resources here -->
- [End-to-End implementation on Github](https://github.com/ibm-self-serve-assets/SAP-watsonx-integration/tree/main/5.%20SAP%20Generative%20AI%20Hub%20and%20HANA%20Cloud%20Vector%20Engine/5.2%20SAP%20Discovery%20Center%20Mission): Step-by-step implementation of a sample application built using the reference architecture. 
- [IBM Granite 13 Billion Chat V2](https://www.ibm.com/docs/en/watsonx/w-and-w/2.0.x?topic=models-granite-13b-chat-v2-model-card): An enterprise-grade large language model optimized for Generative AI and RAG scenarios, offering high transparency, performance, and efficiency for intelligent applications.
- [IBM Granite Introduction](https://www.ibm.com/granite): The portal page of IBM Granite.
- [IBM Granite foundation models paper](https://www.ibm.com/downloads/documents/us-en/10a99803c92fdb35): The research paper for IBM Granite foundation models.
- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/1f756a52-8968-4ec4-92d0-f9bddf552ea3) - Generative AI Hub: A managed service that operationalizes and scales AI workloads, enabling seamless execution of machine learning and generative AI pipelines.
- [SAP AI Core's Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core): The generative AI hub incorporates generative AI into your AI activities in SAP AI Core and SAP AI Launchpad.
- [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/c4e4c32e-4eda-4286-96b0-5299d6a79014) : A cloud-native in-memory database offering advanced capabilities such as multi-model processing, real-time analytics, and vector-based search for AI integration, including the ability to perform semantic search with its Vector Engine for enhanced data retrieval.
- [SAP HANA Cloud Vector Engine](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-vector-engine-guide/introduction): Enables high-performance semantic search using vector embeddings for AI-driven scenarios like RAG and NLP.
- [SAP BTP, Cloud Foundry Runtime](https://discovery-center.cloud.sap/serviceCatalog/257fac1c-88aa-415b-8ea8-c96282c9a19b): A flexible application runtime environment on SAP BTP that allows developers to build, deploy, and scale cloud-native applications using open standards.
- [CAP LLM Plugin](https://github.com/SAP-samples/cap-llm-plugin-samples):  The CDS plugin that enables developers to build tailored Generative AI-based CAP applications with ease.
