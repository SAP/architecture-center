---
id: id-ra0013-7
slug: /ref-arch/f5b6b597a6/7
sidebar_position: 7
title: SAP Business Data Cloud powered by SAP AI Core
description: >-
  Strategic value and architectural patterns for integrating SAP Business Data Cloud with SAP AI Core and Generative AI Hub. Covers AI-Enhanced Data Products, model training in Databricks and serving in AI Core, batch and real-time consumption patterns, predictive insights, and autonomous process optimization with AI agents.
keywords:
  - sap business data cloud
  - sap ai core
  - generative ai hub
  - tabular ai
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
  - agents
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
  author: seeobjectively
  date: 2025-12-10
---

Enterprises possess a wealth of invaluable business data within their SAP systems. However, activating this data for modern Artificial Intelligence is often a complex, disconnected, and risky endeavor. To stay competitive, organizations need a strategy to transform this data into reliable, governed, and actionable AI-driven insights that are deeply integrated with core business processes.

This reference architecture presents a cohesive vision for combining **SAP Business Data Cloud** with **SAP AI Foundation** (including SAP AI Core and the Generative AI Hub). The core architectural concept is the creation of **AI-Enhanced Data Products**—intelligent, context-aware, and dynamic assets that deliver trusted predictive insights and drive business automation at scale. This integrated approach enables the development of AI solutions that are **reliable, relevant, and responsible**, accelerating time-to-value and embedding intelligence directly into the enterprise.

**Future State: Real-Time Data Access via MCP**

To further enhance real-time consumption patterns, SAP is developing a managed Model Context Protocol (MCP) component that will provide a standardized way to query derived data products directly from SAP Business Data Cloud. This future capability will simplify real-time data access for AI applications, enabling seamless integration of governed BDC data products into live business processes.

![drawio](drawio/bdc-ai-core-integration.drawio)

## The Architectural Blueprint

The architectural vision is centered on a powerful synergy: SAP Business Data Cloud provides the governed, business-ready data foundation, while SAP AI Foundation offers a comprehensive portfolio of enterprise-grade AI capabilities. This avoids a "one-size-fits-all" approach, recognizing that different business problems require different tools. The value lies in the comphreensive AI capabilities that allows data scientists and developers to move from data preparation to model deployment and inference.

This blueprint is built on the principle of using each component for its primary strength:

- **SAP Business Data Cloud (with SAP Databricks):** A comprehensive **enterprise data platform** that serves as the unified foundation for AI-driven business intelligence. It provides end-to-end capabilities for **discovering, connecting, preparing, exploring, curating, and governing** both SAP and non-SAP data sources through a semantically rich, business-context-aware layer.

- **SAP AI Foundation (SAP AI Core & Generative AI Hub):** An **enterprise AI platform** for managing the full lifecycle of ML and GenAI models—training, deployment, monitoring, and governance. Customers can use SAP-provided models or bring their own, with the Generative AI Hub providing a rich portfolio of foundation models as reusable, governed services. SAP AI Core is designed to complement (not replace) existing data platforms, integrating seamlessly with SAP identity, policy, and compliance frameworks while providing enterprise-grade access controls, observability, and cost management.

## Key Architectural Patterns

The strategy outlined in this reference architecture provides a clear, governed path to activate your most valuable asset—core business data in SAP—for modern AI. It's built on the powerful synergy between SAP Business Data Cloud for our data foundation and SAP AI Foundation for our AI capabilities.

### Pattern 1: Train in Databricks, Serve in AI Core (The "Foundational Pattern")

**What:** A data scientist performs exploratory data science and model training in SAP Databricks, directly against governed, business-ready data products shared from SAP BDC Cockpit. During development, they engineer features within their notebooks—simple transformations stay with the model as preprocessing steps, while reusable features can be promoted back to BDC data products for broader consumption. The goal is to produce a high-quality, production-ready model. The key is a clean separation of roles: the data scientist creates the model or utilizes an existing model and releases the model artifacts to the unity catalog in Databricks, while a client-managed MLOps pipeline pulls these artifacts and handles validation and deployment to AI Core using SAP AI Core SDK.

**Why:** This pattern provides separation of concerns—data scientists use a pro-code development environment to run experiments in Databricks while AI Core handles the production model serving.

### Pattern 2: The "Batch Consumption" Pattern (for Data Enrichment)

**What:** Building on Pattern 1's deployed model, this pattern enriches data products through high-throughput batch processing using scheduled or event-driven triggers (e.g., hourly ticket categorization, weekly sales forecasts). The model reads from a source dataset and writes predictions back—either as new columns in the existing dataset or as a separate data product in BDC.

**Trigger Options:** The automated pipeline can decide when batch processes run, providing full control and flexibility for integration:
* **Recurring:** Schedule periodic batch jobs to continuously process new or updated records as they arrive. BDC's Delta Lake foundation enables efficient incremental processing through Change Data Feed (CDF), ensuring only new data is processed rather than rescanning entire datasets.
* **One-Time:** Trigger bulk processing for historical data or initial data product creation across entire datasets.
* **Event-Driven:** Build logic to automatically trigger re-scoring in response to events, such as the deployment of a new model (via Pattern 1), ensuring insights reflect the latest AI logic.

**Workflow Implementation:** Use **SAP AI Core workflow executions** for batch processing—distinct from real-time endpoints and optimized for high-throughput operations. Your **containerized workflow** reads from configured object stores (S3, Azure Blob), processes data, and writes predictions back. Schedule jobs with **cron in SAP AI Launchpad** for simple recurring tasks, or use the **SAP AI Core SDK** for client-managed programmatic control and integration with existing pipelines.

**Why:** This architecture provides a robust, governable, and efficient way to handle all non-real-time AI processing. It uses the *same, single, governed model* from AI Core for all batch scenarios, ensuring that whether you are processing a small batch of new records or re-scoring an entire table, you are using the same "reliable" and "responsible" AI logic. It separates high-throughput batch workloads from low-latency online serving, ensuring the right resources are used for the right job, promoting both performance and cost-efficiency.

### Pattern 3: The "Real-Time Consumption" Pattern (for Embedded Intelligence)

**What:** Building on Pattern 1's deployed model, this pattern embeds AI into live business processes for immediate predictions. Applications make low-latency API calls to the **deployment endpoint** (distinct from Pattern 2's batch *executions*), receiving instant insights to drive decisions—like checking risk scores before posting a sales order or providing recommendations as a page loads.

**Triggers:** Real-time, synchronous calls triggered by user actions (e.g., "Submit," "Approve") or system processes (e.g., S/4HANA BAdI) requiring immediate responses.

**Flow:** The application calls the AI Core deployment endpoint with event-specific records (e.g., line items from a sales order), receives predictions in milliseconds, and acts immediately—blocking transactions, flagging items for review, or displaying recommendations.

**Why:** This pattern creates a **reusable AI asset**—the single model from Pattern 1 serves both massive batch jobs (Pattern 2) and critical real-time processes, embedding intelligence directly into enterprise operations without duplication.

**Implementation with SAP Cloud Application Programming Model (CAP):**

CAP provides a natural fit for implementing Pattern 3, offering significant advantages for deployments:

* **Integrated Data Access:** CAP applications can seamlessly query SAP Datasphere (which federates BDC data products) and combine this with real-time AI predictions in a single request-response cycle, eliminating the need for separate data and inference layers. In the future, the SAP-managed MCP component will further streamline data retrieval by providing a standardized query interface for BDC data products. Applications can then combine this contextual business data with AI Core predictions (via separate API calls) to create a complete real-time intelligence flow.
* **Built-in Governance:** Authorization, authentication, and audit logging align automatically with SAP standards—the same security model protects both your data retrieval and AI inference calls.
* **Simplified Development:** Developers work within familiar SAP frameworks (CDS models, OData services) rather than managing low-level HTTP clients, reducing integration complexity and accelerating time-to-market.
* **Enterprise-Ready:** CAP applications deploy naturally into SAP BTP with built-in observability, scaling, and operational tooling—no additional infrastructure setup required.

## Business Problem: AI-Enhanced Predictive Insights

To make these patterns concrete, let's walk through a tangible, high-value example: **Improving Cash Flow with AI-Enhanced Payment Delay Predictions.**

A large enterprise's finance department struggles with reactive cash flow management. They can see which payments are overdue, but they lack the foresight to act proactively. They need to not only *predict* which payments are likely to be delayed but also *understand why* so the collections team can prioritize their efforts and engage with customers in a more informed and targeted manner.

### The Solution: Building an AI-Enhanced Data Product

An AI-Enhanced Data Product is created by following the defined architectural patterns, with clear roles for each persona.

**1. Model Development (Persona: Data Scientist in SAP BDC)**

* The data scientist explores data in the SAP BDC catalog, identifying the `Entry View Journal Entry` data product.
* Working in an SAP Databricks notebook, they realize a simple prediction (the "what") is insufficient. They must also productionalize the explanation (the "why").
* They prototype an **end-to-end prediction and explanation pipeline**. This pipeline:
    1.  Trains an **XGBoost** model to get the prediction.
    2.  Uses the **SHAP** library to calculate feature importance.
    3.  Calls the **Generative AI Hub** (via the SAP AI SDK) to translate the SHAP values into a human-readable explanation (e.g., *"This payment is predicted to be 15 days late, primarily due to past payment behavior..."*).
* This entire, self-contained pipeline is saved as a single deployable asset. This completes the "Data Science on BDC" (development) part of **Pattern 1**.

**2. Enterprise Deployment (Personas: ML Engineer & Data Scientist)**

* This step follows the "MLOps on AI Core" (deployment) part of **Pattern 1: Train in Databricks, Serve in AI Core**.
* The **ML Engineer** *enables* this by first building a reusable serving template in **SAP AI Core** capable of running this complex (XGBoost + SHAP + GenAI) pipeline.
* The **Data Scientist**, still in their BDC notebook, uses the **SAP AI Core SDK** to trigger the deployment. They pass their saved pipeline asset to the ML Engineer's template.
* **SAP AI Core** automatically builds, containerizes, and deploys this entire pipeline, exposing a single, scalable, and governed API endpoint. This endpoint, when called, now returns the *full* payload: both the prediction and the explanation.

**3. Operationalizing the "Why" (Personas: App Developer, Business User)**

The deployed API is now operationalized using *both* consumption patterns to solve the business problem:

* **Pattern 2: The Batch Consumption Pattern:**
    * A **recurring workflow** is scheduled in **SAP AI Launchpad**. It follows this pattern to execute the native batch pipeline, reading all new invoices.
    * It creates the **"Enriched Payment Forecasts" data product** in BDC, which now includes both the risk score *and* the human-readable explanation.
    * The **Business User** opens their **SAP Analytics Cloud** dashboard, which reads this data product to see a fully-explained, prioritized worklist.

* **Pattern 3: The Real-Time Consumption Pattern:**
    * An **Application Developer** builds a Fiori app for the collections team.
    * When a user opens a customer account, the app makes a *live call* to the *same* AI Core API for that customer's outstanding invoices.
    * This pattern provides the team with instant, on-demand predictions and explanations to guide their conversation.

### The Value Proposition (The "Why")

This end-to-end scenario delivers value at multiple levels:

- **For the Business:** The finance team moves from reactive to proactive, improving cash flow and enabling more meaningful customer interactions. The business gains a trusted, explainable AI solution, not a "black box."

- **For the Data Scientist:** They can innovate rapidly in the agile Databricks environment while leveraging powerful, enterprise-grade AI capabilities from SAP AI Core without needing to be an expert in Kubernetes or API management.

- **For IT & Governance:** The entire process is governed. Data access is controlled, the model is monitored, and the resulting data product is a managed asset. The architecture provides the robustness and auditability required for a mission-critical financial process.

## Key Differentiators

| Aspect | AI Core | Databricks |
|--------|---------|------------|
| **Use Case** | Production deployment | Experimentation & prototyping |
| **Infrastructure** | Enterprise-grade serving | Integrated development environment |
| **Model Access** | Broad LLM ecosystem + RPT-1 | Selected LLMs |
| **Speed to Value** | Production-ready deployment | Rapid prototyping |
| **Integration** | Planned BDC integrations | Native data science workflows |

## Components and Further Reading


This reference architecture is realized through the following key SAP services and components:

### Related Reference Architectures

**SAP Business Data Cloud Series:**
- [Data Products in SAP Business Data Cloud](../1-data-products-in-sap-business-data-cloud/readme.md) - Understanding data products, their architecture, and consumption patterns
- [SAP Databricks in SAP BDC](../5-sap-databricks-in-business-data-cloud/readme.md) - Deep dive into SAP Databricks integration and use cases

**Generative AI and Machine Learning:**
- [Generative AI with SAP AI Core](../../RA0005/readme.md) - Comprehensive guide to GenAI patterns, RAG, and AI agents

### SAP Services and Documentation

**SAP AI Foundation:**
- [SAP AI Core](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core) - Enterprise AI platform for model lifecycle management
- [SAP AI Launchpad](https://help.sap.com/docs/ai-launchpad/sap-ai-launchpad/sap-ai-launchpad-overview?q=SAP+AI+Launchpad) - Multi-tenant SaaS for managing AI scenarios
- [Generative AI Hub in SAP AI Core](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core) - Access to foundation models and LLMs
- [SAP AI Core SDK](https://help.sap.com/doc/generative-ai-hub-sdk/CLOUD/en-US/_reference/README_sphynx.html) - Python SDK for programmatic AI Core integration

**SAP Business Data Cloud:**
- [SAP Business Data Cloud Overview](https://www.sap.com/products/data-cloud.html) - Product overview and capabilities
- [SAP Datasphere](https://help.sap.com/docs/SAP_DATASPHERE) - Data management, modeling, and integration
- [SAP Analytics Cloud](https://www.sap.com/products/technology-platform/cloud-analytics.html) - Business intelligence and analytics
- [SAP Databricks Documentation](http://help.sap.com/docs/business-data-cloud/sap-databricks/introducing-sap-databricks) - Integration guide for SAP Databricks

**Development and Integration:**
- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/) - Framework for building enterprise applications
- [SAP AI SDK for JavaScript/TypeScript](https://github.com/SAP/ai-sdk-js) - SDK for integrating AI capabilities
