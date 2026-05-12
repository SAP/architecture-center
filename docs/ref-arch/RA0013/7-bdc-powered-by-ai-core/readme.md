---
id: id-ra0013-7
slug: /ref-arch/f5b6b597a6/7
sidebar_position: 7
title: SAP Business Data Cloud powered by SAP AI Core
description: >-
  Architectural patterns for integrating SAP Business Data Cloud with SAP AI Core and Generative AI Hub. Covers AI-Enhanced Data Products, model training in Databricks and serving in AI Core, batch and real-time consumption patterns, and predictive insights.
keywords:
  - sap business data cloud
  - sap ai core
  - generative ai hub
  - sap databricks
  - data products
  - model lifecycle
  - enterprise ai
  - reference architecture
sidebar_label: SAP Business Data Cloud powered by SAP AI Core
tags:
  - data
  - genai
  - databricks
  - bdc
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - seeobjectively
  - guilherme-segantini 
  - jmsrpp
  - anbazhagan-uma
last_update:
  author: guilherme-segantini
  date: 2026-01-28
---

Enterprises possess a wealth of invaluable business data within their SAP systems. However, activating this data for modern Artificial Intelligence is often a complex, disconnected, and risky challenge. To stay competitive, organizations need a strategy to transform this data into reliable, governed, and actionable AI-driven insights that are deeply integrated with core business processes.

This reference architecture presents a cohesive vision for combining **SAP Business Data Cloud** with **SAP AI Foundation** (including SAP AI Core and the Generative AI Hub). The core architectural concept is the creation of **AI-Enhanced Data Products**—intelligent, context-aware, and dynamic assets that deliver trusted predictive insights and drive business automation at scale.

![drawio](drawio/bdc-ai-core-integration.drawio)

## The Architectural Blueprint

The architectural vision is centered on a powerful synergy: SAP Business Data Cloud provides the governed, business-ready data foundation, while SAP AI Foundation offers a comprehensive portfolio of enterprise-grade AI capabilities. The value lies in the comprehensive AI capabilities that allow data scientists and developers to move from data preparation to model deployment and inference.

- **SAP Business Data Cloud (with SAP Databricks):** A comprehensive **enterprise data platform** serving as the unified foundation for AI-driven business intelligence. It provides end-to-end capabilities for **discovering, connecting, preparing, exploring, curating, and governing** both SAP and non-SAP data sources through a semantically rich, business-context-aware layer. 

- **SAP AI Foundation (SAP AI Core & Generative AI Hub):** A comprehensive **enterprise AI platform** for managing the full lifecycle of machine learning and generative AI models. It supports scalable training, deployment, monitoring, workflow orchestration, model versioning, and secure integration with SAP applications.

### Design Principles of SAP AI Core

- **Rich GenAI Portfolio:** Generative AI Hub provides a broad selection of foundation models governed as reusable services
- **SAP-First Governance:** Training, deployment, monitoring, and auditability aligned with SAP identity, policy, and compliance
- **Operational Alignment:** Deployment targets, access controls, observability, and cost management integrate with SAP applications
- **Complementary by Design:** Works alongside existing data platforms, operationalizing AI services inside the SAP landscape

## Key Architectural Patterns

The following patterns provide a clear, governed path for activating SAP data for modern AI.

### Pattern 1: Model Development in Databricks with AI Core Serving

**What:** A data scientist performs exploratory data science and model training in SAP Databricks, directly against governed, business-ready data products shared from SAP BDC Cockpit. The BDC Cockpit serves as the central hub for sharing data products to multiple consumers, including SAP Databricks for AI/ML workloads. During development, they engineer features within their notebooks—simple transformations stay with the model as preprocessing steps, while reusable features can be promoted back as an enriched BDC data product for broader consumption. The goal is to produce a high-quality, production-ready model for deployment to SAP AI Core.

The data scientist registers trained models to the **Unity Catalog** in Databricks using **MLflow**. A client-managed MLOps pipeline then pulls these MLflow model artifacts, packages them into AI Core-compatible serving templates, and handles validation and deployment using the SAP AI Core SDK. AI Core provides enterprise-grade model serving with built-in governance, scaling, monitoring, and seamless integration with SAP applications—plus the same model serves both batch (Pattern 2) and real-time (Pattern 3) consumption. Use **MLflow** for model versioning and artifact management, as it provides standardized packaging and Unity Catalog integration.

**Why:** This pattern leverages the best of both platforms: Databricks for pro-code model development with governed data access, and SAP AI Core for enterprise-grade serving. While inference in Databricks remains an option for specific use cases (e.g., tight data pipeline integration), deploying to AI Core is the recommended approach because it provides consistent governance, scaling, and the ability to serve the same model across both batch and real-time consumption patterns.

### Pattern 2: The Batch Consumption Pattern

**What:** Once the model is deployed on SAP AI Core, you can enrich your data products through high-throughput batch processing (e.g., hourly ticket categorization, weekly sales forecasts). A customer-managed batch workflow reads from a source data product, calls the deployed model for inference, and writes predictions back—either as new columns in the existing dataset or as a separate enriched data product in BDC.

**Trigger Options:**
* **Recurring:** Periodic batch jobs scheduled via SAP AI Launchpad cron or external orchestrators (e.g., Databricks Workflows, Apache Airflow), with efficient incremental processing using Delta Lake's Change Data Feed (CDF)
* **One-Time:** Bulk processing for historical data or initial data product creation
* **Event-Driven:** Automatic re-scoring triggered by events such as new model deployment or data refresh

**Workflow Implementation:** Use **SAP AI Core workflow executions** for batch processing—distinct from real-time endpoints and optimized for high-throughput operations. Schedule jobs with **cron in SAP AI Launchpad** for simple recurring tasks, or use the **SAP AI Core SDK** for programmatic control.

**Why:** This pattern provides a robust, governable way to handle data batch processing. It uses the *same governed model* from AI Core for all batch scenarios, separating high-throughput batch workloads from low-latency online serving.

### Pattern 3: The Real-Time Consumption Pattern

**What:** Building on Pattern 1's deployed model, this pattern embeds AI into live business processes for immediate predictions. A **Data Agent**—built as an SAP BTP extension application—orchestrates three responsibilities: (1) querying business data from Datasphere, (2) running inference against the AI Core **deployment endpoint** (distinct from Pattern 2's batch *executions*), and (3) optionally using GenAI Hub to generate human-readable explanations for the predictions. This enables instant insights to drive decisions—like checking risk scores before posting a sales order or providing recommendations as a page loads.

**Triggers:** Real-time, synchronous calls triggered by user actions (e.g., "Submit," "Approve") or system processes (e.g., S/4HANA BAdI) requiring immediate responses.

**Flow:** The Data Agent receives a request (e.g., line items from a sales order), queries BDC data products via Datasphere for additional context, calls the AI Core deployment endpoint for predictions, and returns the result in milliseconds—blocking transactions, flagging items for review, or displaying recommendations.

**Why:** This pattern creates a **reusable AI asset**—the single model from Pattern 1 serves both massive batch jobs (Pattern 2) and critical real-time processes, embedding intelligence directly into enterprise operations without duplication.

**Implementation with SAP BTP Extension Applications:**

The Data Agent is an SAP BTP extension application that serves as the integration layer between business processes and AI capabilities. It can be built with CAP, Node.js, Java, Python, or other supported runtimes. The agent handles:

- **Data retrieval:** Queries BDC data products via SAP Datasphere using the BTP destination service
- **Inference:** Calls the AI Core deployment endpoint to generate predictions
- **Explanation (optional):** Uses GenAI Hub to translate technical outputs (e.g., SHAP values) into business-friendly explanations

SAP BTP extension applications provide built-in support for authorization, authentication, and audit logging aligned with BTP security standards. Deployment benefits from BTP's observability and auto-scaling capabilities, making them well suited for production workloads. For more on building agents that work with structured data, see [Agents for Structured Data](../../RA0029/6-ai-agents-for-structured-data/readme.md).

### Pattern 4: Extending AI Insights to SAP HANA Cloud

**What:** SAP HANA Cloud can directly consume BDC data products—including the AI-enriched data products created by Pattern 2. Data products are shared via SAP BDC Cockpit to HANA Cloud, enabling CDS views, calculation views, and CAP applications to leverage governed BDC data without replication.

This means AI-generated predictions (such as payment delay forecasts or risk scores from Pattern 2) become available alongside traditional business data in HANA Cloud. Downstream applications can join AI predictions with transactional data for analytics, reporting, and real-time business logic.

**Why:** This pattern extends the value of AI investments by making predictions consumable across the broader SAP landscape. Applications that already use HANA Cloud can incorporate AI insights without architectural changes—enabling gradual AI adoption while maintaining existing data flows.

For details on data product consumption options, see [Data Products in SAP Business Data Cloud](../1-data-products-in-sap-business-data-cloud/readme.md).

## Business Problem: AI-Enhanced Predictive Insights

To make these patterns concrete, let's walk through a tangible example: **Improving Cash Flow with AI-Enhanced Payment Delay Predictions.**

A large enterprise's finance department struggles with reactive cash flow management. They can see which payments are overdue, but they lack the foresight to act proactively. They need to not only *predict* which payments are likely to be delayed but also *understand why* so the collections team can prioritize their efforts.

### Solution: Building an AI-Enhanced Data Product

**1. Model Development (Persona: Data Scientist in SAP BDC)**

* The data scientist explores data in the SAP BDC catalog, identifying the `Entry View Journal Entry` data product.
* Working in an SAP Databricks notebook, they prototype an **end-to-end prediction and explanation pipeline**:
    1.  Trains an **XGBoost** model to get the prediction
    2.  Uses the **SHAP** library to calculate feature importance
    3.  Calls the **Generative AI Hub** (via the SAP AI SDK) to translate the SHAP values into a human-readable explanation
* This pipeline is saved as a single deployable asset, completing the development part of **Pattern 1**.

**2. Enterprise Deployment (Personas: ML Engineer & Data Scientist)**

* The **ML Engineer** builds a reusable serving template in **SAP AI Core** capable of running this complex (XGBoost + SHAP + GenAI) pipeline.
* The **Data Scientist** uses the **SAP AI Core SDK** to trigger the deployment, passing their saved pipeline asset to the ML Engineer's template.
* **SAP AI Core** automatically builds, containerizes, and deploys this pipeline, exposing a single, scalable, governed API endpoint that returns both prediction and explanation.

**3. Operationalizing the Insights**

The deployed API is operationalized using *both* consumption patterns:

* **Pattern 2 (Batch):** A recurring workflow scheduled in SAP AI Launchpad creates the **"Enriched Payment Forecasts" data product** in BDC, which business users view in their SAP Analytics Cloud dashboard.

* **Pattern 3 (Real-Time):** A Fiori app for the collections team makes live calls to the same AI Core API when a user opens a customer account, providing instant predictions.

* **Pattern 4 (HANA Cloud):** The "Enriched Payment Forecasts" data product is also shared with SAP HANA Cloud via the BDC Cockpit, where existing finance applications can join AI predictions with live transactional data for consolidated reporting and downstream business logic.

### Value Delivered

- **For the Business:** The finance team moves from reactive to proactive, improving cash flow with trusted, explainable AI
- **For the Data Scientist:** Rapid innovation in Databricks while leveraging enterprise-grade AI capabilities from SAP AI Core
- **For IT & Governance:** Controlled data access, monitored models, and managed data products with enterprise auditability

### SAP Services

- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core) | [SAP AI Launchpad](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-launchpad) | [Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core)
- [SAP Business Data Cloud](https://www.sap.com/products/technology-platform/business-data-cloud.html) | [SAP Datasphere](https://help.sap.com/docs/SAP_DATASPHERE) | [SAP Databricks](https://help.sap.com/docs/sap-datasphere/sap-datasphere-administration-guide-for-sap-datasphere/sap-databricks)
- [SAP AI Core SDK (Python)](https://pypi.org/project/ai-core-sdk/) | [SAP AI SDK (JS/TS)](https://github.com/SAP/ai-sdk-js) | [SAP BDC Connect SDK](https://pypi.org/project/sap-bdc-connect-sdk/)
- [SAP CAP](https://cap.cloud.sap/docs/) | [SAP Analytics Cloud](https://www.sap.com/products/technology-platform/cloud-analytics.html)

### Learning Resources

- [Introducing SAP Business Data Cloud](https://learning.sap.com/learning-journeys/introducing-sap-business-data-cloud) - Learning journey
- [SAP AI Core Tutorial](https://developers.sap.com/tutorials/ai-core-genaihub-provisioning.html) - Set up Generative AI Hub
