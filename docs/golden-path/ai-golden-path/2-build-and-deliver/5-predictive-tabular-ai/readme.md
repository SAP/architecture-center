---
sidebar_position: 5
title: Predictive & Tabular AI with SAP-RPT-1 on SAP AI Core
description: >-
  Build, deploy and run tabular prediction use cases with SAP-RPT-1, SAP's relational
  foundation model for in-context learning on business data.
keywords:
- sap
- sap-rpt-1
- predictive ai
- tabular ai
- in-context learning
- relational foundation model
- sap generative ai hub
- sap ai core
- sap s/4hana
- relational business data
- business ai platform
sidebar_label: Predictive & Tabular AI
image: img/ac-soc-med.png
tags:
- ai-golden-path
- genai
- data
- appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
last_update:
  author: SAP
---

## What you will build

You will build a tabular prediction use case with SAP-RPT, SAP’s foundation model for relational business data. The model uses in-context learning to make predictions on structured data without requiring task-specific training.

This guide covers two phases:

- **Evaluation**: uses SAP-RPT directly for predictions so that you can validate your use case
- **Production Deployment**: operationalizes SAP-RPT via the Tabular AI orchestration workflow for production

This guide uses the prediction of Transportation Lead Times (TLT) as an example, where the goal is to predict the duration of a product shipment based on features like material, origin, destination, and goods issue date.

## Prerequisites & setup

Before you begin, you will need the following:

- **Business Data**: Access to structured business data representing your prediction use case (e.g., historical transactional data from SAP S/4HANA).
- **SAP Business AI Platform Account**: An account with the required entitlements for SAP AI Core.

- **SAP-RPT Deployment**: An active deployment of SAP-RPT on SAP AI Core. See [blog post](https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-a-step-by-step-guide-on-getting-started/ba-p/14290171) on how to deploy SAP-RPT.
- **Tabular AI Orchestration**: An active deployment of the Tabular AI orchestration on SAP AI Core.


## Architecture at a glance

A productive solution involves several key components working together. SAP-RPT can be consumed via two paths:
- **Tabular AI orchestration**: recommended integration approach for production
- **Direct model API**: useful for evaluation and custom integrations

- **Your Data Source**: Structured business data (e.g., from SAP S/4HANA or another data system) used for context and predictions.
- **SAP AI Core**: The platform where SAP-RPT is deployed and available directly via API. Tabular AI orchestration is the workflow supporting the use of SAP-RPT and exposes a managed API with built-in context handling.

## Build and deploy

In a nutshell, the recommended process consists of the following steps:

**1. Prepare the dataset**

- **Define the Use Case**: Identify the business problem and formulate it as a structured prediction problem, including required data sources (e.g., SAP S/4HANA tables) and prediction target.

- **Prepare Your Data**: Extract and prepare the relevant data from your SAP or non-SAP systems. Ensure it is structured in a tabular format matching your prediction target.

**2. Deploy the model**

- **Set up SAP-RPT on AI Core**: Follow the official guidance to deploy SAP-RPT on SAP AI Core. You will receive a deployment URL that you can call to get predictions from the model.
- **Test Connection**: Send a test prediction to the API to ensure everything is set up correctly.

**3. Evaluate your use case**

- **Run model evaluations**: Split your data into a context dataset and a holdout dataset, evaluate the model on the holdout dataset and compare performance against the original values. Prepare payloads consisting of context rows (from your context set) and query rows (from the holdout set). Provided that your holdout data is representative for the actual customer problem, this will inform you on feasibility and value of the use case.
- **Iterate**: If you are not yet satisfied with the model performance, consider iterating on the use case formulation. Add additional features (columns) that could help guide the model to the desired predictions, consider reformulations of your use case's target, or add more context rows.
- **Mind the context window**: SAP-RPT can only take a limited number of context rows per prediction request (the exact limit depends on the model version — refer to the [SAP Help Portal](https://help.sap.com/docs/sap-ai-core/generative-ai/sap-rpt-1-6)). If your context dataset is larger, start with random subsampling to establish a baseline quickly; for best performance, rely on Tabular AI orchestration's automated context selection (see [Recommended: Operationalise SAP-RPT with Tabular AI Orchestration](#recommended-operationalise-sap-rpt-with-tabular-ai-orchestration)).

## Explainability

SAP-RPT can return explanations alongside its predictions, giving insights into what influenced the model in producing a certain prediction outcome.

Two signals are available per prediction:

- **Column scores**: which feature columns the model weighted most for the prediction (feature-level signal).
- **Relevant context rows**: which context rows most influenced the prediction (row-level signal).

> Treat these as useful signals, not ground truth: they indicate what the model focused on, not a proven cause of the prediction.

**Availability**: `sap-rpt-1.5` and later.

For more details on explainability refer to [SAP Help Portal](https://help.sap.com/docs/sap-ai-core/generative-ai/explainability-92a0ffe903ef4554adb44849e979fad4).

## Recommended: Operationalise SAP-RPT with Tabular AI Orchestration

Once you have validated your use case through evaluation, your next step could be to move the use case to production. Here, we recommend Tabular AI orchestration as the default path to production.

Tabular AI orchestration is a workflow supporting the use of SAP-RPT. It provides data source integrations as well as automatically handles context management and selection.

The value proposition is simple: _choose a model, and the workflow handles the rest_.

Tabular AI Orchestration provides the following key features:

- **Out-of-the-box integration with supported data sources**: Connects directly to data sources such as HANA Data Lake Files and S3 object storage, eliminating the need to build and maintain custom data pipelines
- **Context management and selection**: Automatically retrieves the data from the configured data source and intelligently selects the most relevant context rows for each prediction request to SAP-RPT, improving prediction quality without the need to manually assemble and maintain context payloads

The architecture separates design-time configuration from runtime execution.

### 1. Design-Time Setup
This defines how data is accessed, interpreted, and used for prediction. Specifically, you will define the data source, tabular artifact, and scenario configuration. These are the 3 components required per use case and they generally remain unchanged during runtime prediction requests.

> If you are setting up Tabular AI orchestration for the very first time, you will need to first deploy the workflow. This creates a virtual deployment for the workflow which you can then reuse for subsequent use cases.

### 2. Runtime Execution
At runtime, your application can now invoke the Tabular AI orchestration workflow to request predictions. You can send your query rows when making the API call to the workflow. Once triggered, the workflow will automatically retrieve and select relevant context rows, assemble the inference request, and route it to your specified model.

### Getting Started
By using Tabular AI orchestration, you benefit from having a simplified integration pattern that remains consistent even when you switch or upgrade the underlying model. You also do not need to manage the raw API payloads, context selection logic and data pipelines within your application.

See the [Help Portal page](https://help.sap.com/docs/sap-ai-core/generative-ai/tabular-ai) for detailed instructions on getting started with Tabular AI orchestration.

## Alternative: Integrate SAP-RPT directly

For teams that require full control over the prediction process, for example, custom integrations or specialized data pipelines, SAP-RPT can also be consumed directly through its `/predict` endpoint on SAP AI Core.

SAP-RPT is available on SAP AI Core as a productive model that can be used as-is once deployed. Only your development deployment and SAP Business AI Platform subaccount need to be replaced with the customer's details.

> **When to choose direct integration with SAP-RPT instead of via Tabular AI orchestration**: Use direct API access to SAP-RPT when you have specific requirements that the Tabular AI orchestration does not yet / is unable to cover. For most production use cases, using the Tabular AI orchestration should be the default integration approach.

## Best practices

-   **Test with Productive Data Early**: Using real customer data from the start is crucial. It helps you quickly validate your problem formulation, understand which features drive outcomes, and ensure your model performs reliably across different business situations.
-   **Perform Exploratory Data Analysis (EDA)**: Before diving into modeling, use tools like Databricks Genie to analyze your data. This can reveal valuable insights and help you select the most suitable tenants and datasets for your prediction task.
-   **Iterate quickly**: Since SAP-RPT does not require any model training step or hyperparameter tuning, testing out many different use case formulations can be done rather quickly. Make use of this speed to iterate your way to the most suitable use case formulation.

:::info References
**Most Important Links:**

- [SAP-RPT-1.6 Help Portal](https://help.sap.com/docs/sap-ai-core/generative-ai/sap-rpt-1-6)
- [Tabular AI Help Portal](https://help.sap.com/docs/sap-ai-core/generative-ai/tabular-ai)

- [Blog: A New Paradigm for Enterprise AI: In-Context Learning for Relational Data](https://community.sap.com/t5/technology-blog-posts-by-sap/a-new-paradigm-for-enterprise-ai-in-context-learning-for-relational-data/ba-p/14260221)
- [Blog: SAP-RPT-1: Enterprise AI for Relational Data Now Generally Available!](https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-enterprise-ai-for-relational-data-now-generally-available/ba-p/14287926)
- [Blog: SAP-RPT-1: A Step-by-Step Guide on Getting Started - SAP Community](https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-a-step-by-step-guide-on-getting-started/ba-p/14290171)
- [Blog: SAP-RPT-1.5 now live on generative AI hub](https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-5-now-live-on-generative-ai-hub/ba-p/14447819)
- [Blog: SAP-RPT-1.6, Tabular Orchestration, and SAP-RPT Playground API: Now Available](https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-6-tabular-orchestration-and-rpt-playground-api-now-available/ba-p/14476066)
:::
