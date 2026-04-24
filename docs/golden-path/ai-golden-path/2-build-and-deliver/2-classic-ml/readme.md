---
sidebar_position: 2
title: Classic ML Scenarios
description: >-
  Build, deploy and run machine learning use cases on SAP BTP using RPT-1, HANA Cloud
  PAL/APL and SAP AI Core.
keywords:
    - sap
    - machine learning
    - rpt-1
    - hana cloud
    - pal
    - apl
    - ai core
sidebar_label: Classic ML Scenarios
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
  date: '2026-04-23'
---

# How to build, deploy and run ML cases

## What you will build

Machine Learning (ML) on SAP platforms enables organizations to build predictive and prescriptive analytics capabilities directly within their business applications. This guide covers three primary approaches:

- **Tabular AI with RPT-1** *(start here for classification and regression)*: Foundation model for predictive use cases on tabular data. No model training required — leverages in-context learning based on a globally pre-trained model. Available via AI Core and directly in HANA Cloud via SQL stored procedure.
- **Embedded ML with SAP HANA Cloud (PAL/APL)**: Train and deploy models directly in-database using built-in libraries. Preferred for time series, anomaly detection, clustering, and as a fallback for classification/regression when RPT-1 cannot meet specific operational requirements.
- **Custom ML with SAP AI Core**: Build, deploy, and serve custom ML models on Kubernetes infrastructure. Use when custom or customer-specific model training is required.

Whether you need in-database ML for real-time predictions or custom deep learning models with MLOps capabilities, SAP provides comprehensive infrastructure for the complete ML lifecycle — from data preparation and model training to deployment and monitoring in production environments.

## Prerequisites & setup

Before building ML solutions on SAP platforms, ensure your environment meets these requirements:

**For RPT-1:**

- **AI Core Access**: RPT-1 is available via AI Core's generative AI hub. See the AI Golden Path: How to build, deploy and run with RPT-1.
- **HANA Cloud (optional)**: RPT-1 is also callable directly via SQL stored procedure from HANA Cloud.

**For SAP HANA Cloud ML (PAL/APL):**

- **SAP HANA Cloud Instance**: Database instance with ML libraries enabled
- **Python Development Environment**: Python 3.8+ with hana-ml client library installed
- **Database Access**: HDI container or schema with appropriate ML permissions (AFL__SYS_AFL_AFLPAL_EXECUTE, AFL__SYS_AFL_APL_AREA_EXECUTE)
- **Data Access**: Connection to source systems or Business Data Cloud for training data

**For SAP AI Core ML:**

- **SAP BTP Account**: With SAP AI Core entitlement and resource plan
- **Docker Registry Access**: For containerizing training and serving applications
- **AI Core Credentials**: Service keys for authentication and API access
- **Development Tools**: Python/R for model development, Docker for containerization, Git for version control

**Resources:**

- **AI Golden Path: RPT-1** – How to build, deploy, and run with RPT-1
- **[Using Machine Learning Libraries (APL and PAL) in SAP HANA Cloud](https://help.sap.com/docs/hana-cloud/sap-hana-cloud-getting-started-guide/using-machine-learning-libraries-apl-and-pal-in-sap-hana-database)** – Official setup guide for enabling and using ML libraries
- **[SAP AI Core Service Guide](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core)** – Complete documentation for AI Core setup and configuration

## Architecture at a glance

For a comprehensive view of the AI technology stack and how ML capabilities integrate with SAP HANA's AI architecture, see the **[SAP AI Core documentation](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core)**.

SAP HANA provides three architectural patterns for ML deployment:

**Pattern 1: Tabular AI with RPT-1 (classification & regression)**
```
Feature Data → RPT-1 (AI Core / HANA Cloud SQL) → Predictions → Applications
               (no training; in-context learning)
```

**Pattern 2: Embedded ML with SAP HANA Cloud**
```
Data Sources → SAP HANA Cloud (PAL/APL) → Real-time Predictions → Applications
                      ↓
              In-Database Training
              (No data movement)
```

**Pattern 3: Custom ML with SAP AI Core**
```
Data Sources → Feature Engineering → AI Core Training → Model Registry
                                            ↓
                                    AI Core Serving → REST API → Applications
```

**Hybrid Pattern:**
```
SAP HANA Cloud (Feature Engineering) → AI Core (Training/Serving) → HANA (Prediction Storage)
                                                ↓
                                         Vector Engine (Semantic Search)
```

## Build

SAP provides three approaches for building ML solutions. For classification and regression, always evaluate RPT-1 first.

### **Approach 1: Tabular AI with RPT-1** *(classification & regression — start here)*

RPT-1 is SAP's tabular foundation model for predictive AI. It requires no model training — it uses in-context learning to generate predictions from a globally pre-trained model, reading your labeled historical data rows at inference time as context.

**When to use RPT-1:**

- Classification or regression on tabular data
- Cold-start situations with limited historical training data
- Use cases where column names or cells contain textual/semantic content (RPT-1 understands these natively)
- Rapid prototyping without the overhead of a training pipeline

**Current limitations to be aware of:**

- Supports classification and regression only (not time series, clustering, anomaly detection)
- Context window limits: 2048 rows for RPT-1-small, 65,536 rows for RPT-1-large
- Latency: GPU-based inference; not suitable for &lt;200ms latency requirements
- Batch inferencing: current API is optimized for online (few-at-a-time) inference; batch object-store workflows are on the roadmap
- Explainability: native explainability is on the roadmap for Q2/2026
- GPU availability: verify GPU resource availability in your target data center in advance

**Resources:**

- **AI Golden Path: How to build, deploy and run with RPT-1** – Complete guide for RPT-1
- **RPT-1 Feedback** – Collected implementation experiences and known workarounds

### **Approach 2: Embedded ML with SAP HANA Cloud (PAL/APL)**

Use for time series forecasting, anomaly detection, clustering, and other use cases not covered by RPT-1. For classification and regression, use this approach only when RPT-1 cannot meet your operational requirements (latency, data gravity, or specialized algorithm needs).

**Development Workflow:**

1. **Data Preparation**: Connect to SAP HANA Cloud and prepare training datasets using SQL or Python
2. **Model Selection**: Choose appropriate algorithms from PAL (classical ML) or APL (AutoML) libraries
3. **Model Training**: Train models directly in-database using hana-ml Python client or SQL procedures
4. **Model Validation**: Evaluate model performance with built-in metrics and validation techniques
5. **Model Persistence**: Store trained models as HANA objects for reuse and versioning

**Capabilities:**

- **In-Database Processing**: Train models where data resides, eliminating data movement and latency
- **Rich Algorithm Library**: Out of the box algorithms in PAL covering classification, regression, clustering, time series, and more
- **AutoML with APL**: Automated feature engineering, algorithm selection, and hyperparameter tuning
- **Python Integration**: Leverage hana-ml library for seamless Python-to-HANA workflows
- **Performance Optimization**: Leverage HANA's columnar storage and parallel processing for large-scale datasets

**Code Example - Classification with PAL:**

```python
# Example: PAL Random Forest via hana-ml Python client
from hana_ml import dataframe as hd
from hana_ml.algorithms.pal.trees import RDTClassifier

# Connect to HANA Cloud
conn = hd.ConnectionContext(address='<hana-host>', port=443, 
                             user='<user>', password='<password>')

# Load training data from HANA table
hdf_train = conn.table('CUSTOMER_CHURN_TRAIN')

# Train Random Forest in-database
rfc = RDTClassifier(n_estimators=100, max_depth=10, random_state=42)
rfc.fit(data=hdf_train, key='CUSTOMER_ID', label='CHURN')

# Predict on new data (also in-database)
hdf_test = conn.table('CUSTOMER_CHURN_TEST')
predictions = rfc.predict(data=hdf_test, key='CUSTOMER_ID')

# Results stay in HANA - no data movement
predictions.collect()  # Only retrieve if needed
```

**Code Example - AutoML with APL:**

```sql
-- Example: APL AutoML for classification
CALL _SYS_AFL.APL_CREATE_MODEL_AND_TRAIN(
    CONFIG_TABLE,           -- Configuration (auto-detect settings)
    VAR_DESC_TABLE,         -- Variable descriptions
    'TRAINING_DATA',        -- Input training table
    'APL_MODEL'             -- Output model table
) WITH OVERVIEW;

-- Predict using trained model
CALL _SYS_AFL.APL_APPLY_MODEL(
    'APL_MODEL',            -- Trained model
    'TEST_DATA',            -- Input test data
    'PREDICTIONS'           -- Output predictions table
);
```

**Resources:**

- **[All-in-One Machine Learning in SAP HANA Cloud](https://community.sap.com/t5/technology-blog-posts-by-sap/new-machine-learning-features-in-sap-hana-cloud/ba-p/13671778)** – Comprehensive overview of ML capabilities and recent enhancements
- **[AutoML with SAP HANA Automated Predictive Library (APL)](https://learning.sap.com/courses/hana_apl)** – Complete course on AutoML features
- **[Developing AI Models with Python Machine Learning Client](https://learning.sap.com/courses/developing-ai-models-with-the-python-machine-learning-client-for-sap-hana-1)** – Hands-on training for hana-ml
- **[Machine Learning with SAP S/4HANA](https://blog.sap-press.com/machine-learning-with-sap-s4hana)** – Guide to embedded ML architecture in S/4HANA
- **[hana-ml-samples GitHub Repository](https://github.com/SAP-samples/hana-ml-samples)** – Official sample code and reference implementations

**Specialized Learning Paths:**

- **[Developing Classification Models](https://learning.sap.com/courses/developing-classification-models-with-the-python-machine-learning-client-for-sap-hana)** – Binary and multi-class classification techniques
- **[Developing Regression Models](https://learning.sap.com/courses/developing-regression-models-with-the-python-machine-learning-client-for-sap-hana)** – Linear, polynomial, and non-linear regression
- **[Developing Time Series Models](https://learning.sap.com/courses/developing-time-series-models-with-the-python-machine-learning-client-for-sap-hana)** – Forecasting and trend analysis
- **[Basic AutoML Tutorial](https://developers.sap.com/tutorials/hana-cloud-trial-basic-automl..html)** – Quick start guide for automated ML

### **Approach 3: Custom ML with SAP AI Core**

Use when custom or customer-specific model training is required and foundation models cannot meet the use case needs.

**Development Workflow:**

1. **Model Development**: Build custom ML models using TensorFlow, PyTorch, scikit-learn, or other frameworks
2. **Containerization**: Package training and serving code as Docker images
3. **Workflow Definition**: Create YAML templates defining training executables and serving templates
4. **Model Training**: Execute training pipelines on AI Core's Kubernetes infrastructure
5. **Model Registration**: Store trained models in AI Core's artifact store
6. **Model Deployment**: Deploy models as REST API endpoints for inference
7. **Integration**: Consume model predictions from SAP and non-SAP applications

**Capabilities:**

- **Framework Flexibility**: Use any ML framework
- **Scalable Infrastructure**: Leverage Kubernetes for distributed training and elastic serving
- **MLOps Automation**: Version control for models, automated retraining pipelines, A/B testing
- **Multi-Model Serving**: Deploy multiple model versions simultaneously for comparison
- **API-Based Consumption**: RESTful endpoints for real-time and batch inference
- **Monitoring & Logging**: Track model performance, resource utilization, and inference latency

**Resources:**

- **[SAP Help - What is SAP AI Core](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core)**
- **[SAP Help - What is SAP AI Launchpad](https://help.sap.com/docs/ai-launchpad/sap-ai-launchpad/what-is-sap-ai-launchpad)**
- **[Learning How to Use SAP AI Core](https://learning.sap.com/learning-journeys/learning-how-to-use-the-sap-ai-core-service-on-sap-business-technology-platform)** – Complete learning journey covering training and serving
- **[Training and Deploying Custom AI Models in SAP](https://developers.sap.com/tutorials/ai-core-custom-llm.html)** – Guide for custom model deployment
- **[SAP AI Core Samples](https://github.com/SAP-samples/ai-core-samples)** – Sample notebooks and workflow templates for quick hands-on
- **[Predictive AI with SAP AI Core](https://developers.sap.com/group.ai-core-get-started-basics.html)** – Get started tutorial covering fundamentals and first workflows

## Deploy

**Deployment for RPT-1:**

RPT-1 requires no training pipeline. Deployment means providing your historical feature data as context rows at inference time. See the RPT-1 Golden Path for API integration details.

**Deployment for HANA PAL/APL:**

Models trained in HANA Cloud are automatically persisted as database objects and can be invoked directly via SQL or Python:

```python
# Model is already deployed in-database
# Simply call predict on new data
predictions = trained_model.predict(data=new_data, key='ID')
```

**Deployment for SAP AI Core:**

1. **Create Serving Template**: Define REST API endpoint configuration
2. **Deploy Model**: Use AI Core API or AI Launchpad to deploy model
3. **Monitor Endpoint**: Track inference latency, throughput, and errors
4. **Scale Resources**: Adjust replica count based on load

**Resources:**

- **[hana-ml BTP App Examples](https://github.com/SAP-samples/hana-ml-samples/tree/main/BTP-App)** – Reference implementations for deploying ML models in BTP applications
- **[SAP AI Core Deployment Guide](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/deployment)** – Official documentation for model deployment workflows
- **[SAP AI Core Monitoring](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/metrics)** – Official documentation for AI Core metrics and monitoring capabilities

## Run

**Integration with RPT-1:**

- **REST API via AI Core**: Consume predictions via HTTP from any application
- **HANA Cloud SQL**: Call RPT-1 via stored procedure directly from HANA applications
- **Online inference**: Current API is optimized for few-at-a-time predictions; batch object-store support is on the roadmap

**Integration with HANA PAL/APL Models:**

- **SQL Integration**: Call models directly from SQL queries in applications
- **Python Integration**: Use hana-ml client in BTP applications or custom services
- **Real-time Predictions**: Sub-10ms latency for in-database predictions
- **Batch Scoring**: Process millions of records in parallel

**Integration with AI Core Models:**

- **REST API**: Consume predictions via HTTP endpoints from any application
- **SAP AI Launchpad**: UI-based monitoring and inference testing
- **Batch Inference**: Submit large datasets for asynchronous processing
- **A/B Testing**: Route traffic between multiple model versions

**Hybrid Integration - Semantic Search Example:**

```sql
-- Create table with vector column for AI Core embeddings
CREATE TABLE PRODUCT_EMBEDDINGS (
    PRODUCT_ID NVARCHAR(50),
    EMBEDDING REAL_VECTOR(768),  -- 768-dimensional embedding from AI Core
    PRODUCT_NAME NVARCHAR(255)
);

-- Semantic search: Find similar products using HANA Vector Engine
SELECT TOP 10
    PRODUCT_ID,
    PRODUCT_NAME,
    COSINE_SIMILARITY(EMBEDDING, :query_embedding) AS SIMILARITY
FROM PRODUCT_EMBEDDINGS
WHERE COSINE_SIMILARITY(EMBEDDING, :query_embedding) > 0.7
ORDER BY SIMILARITY DESC;
```

**Resources:**

- **[HANA Vector Engine Guide](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-vector-engine-guide/creating-text-embeddings-with-sap-ai-core?locale=en-US)** – Creating embeddings with AI Core for HANA semantic search

## Best Practices

| **Dos** | **Don'ts** |
|-------------|---------------|
| **Start with RPT-1** for classification and regression — it requires no training, handles textual columns natively, and avoids the cold-start problem | **Don't start with PAL/APL for classification/regression** without first evaluating RPT-1 |
| **Use HANA PAL/APL** for time series, anomaly detection, clustering, or when RPT-1 cannot meet specific requirements (latency, data gravity, very high batch throughput) | **Don't move data out of HANA** unnecessarily — train models where data lives to avoid latency and governance issues |
| **Use AI Core** when custom frameworks (TensorFlow, PyTorch) or customer-specific model training is needed | **Don't use AI Core narrow AI** for classification/regression when RPT-1 or PAL/APL can meet the requirements |
| **Leverage APL** for rapid prototyping and automated feature engineering on time series and other non-classification/regression tabular data | **Don't skip model validation** — always evaluate on holdout data and monitor production performance |
| **Implement hybrid approach** when feature engineering in HANA + RPT-1 or AI Core provides the best of both worlds | **Don't over-engineer** — start with RPT-1 before moving to custom AI Core workflows |
| **Use HANA Vector Engine** for semantic search by combining AI Core embeddings with HANA's low-latency serving | **Don't ignore data governance** — ensure ML workflows comply with data residency and privacy requirements |
| **Monitor model performance** continuously using AI Core metrics or HANA query logs to detect drift | **Don't deploy models without testing** — validate predictions in staging environment with real-world scenarios |

### Decision Framework

**Choose RPT-1 when** *(default for classification and regression)*:

- Use case is classification or regression on tabular data
- Limited historical training data (avoids cold-start problem)
- Columns contain textual or semantic content (e.g., free-text reason codes)
- Fast time-to-value is a priority — no training pipeline needed
- Medium-throughput online inference is sufficient

**Choose HANA PAL/APL when:**

- Use case is time series forecasting, anomaly detection, clustering, or other non-classification/regression narrow AI
- Massive data-parallel machine learning is needed (e.g., segmented time series forecasting of 100–400k parallel time series)
- Latency requirement is very low (&lt;200ms) — PAL in-database scoring achieves sub-10ms
- Data governance requires data to stay within HANA Cloud boundaries
- Explainability is required today (RPT-1 explainability is on roadmap for Q2/2026)
- Very high batch throughput is needed and RPT-1's batch API limitations apply
- SQL-native integration is strongly preferred for application development
- Classification or regression is needed but RPT-1's GPU availability or context window limits cannot be satisfied

**Choose AI Core (custom narrow AI) when:**

- Custom models with TensorFlow, PyTorch, or specialized frameworks are needed
- Customer-specific model training and isolation is required
- Deep learning or large-scale neural networks are required
- MLOps capabilities (versioning, A/B testing, CI/CD) are critical
- Models need to be trained on data from multiple sources (not just HANA)
- Generative AI or foundation model capabilities are needed
- Scalable, elastic infrastructure for training is required

**Use Hybrid Approach when:**

- **HANA PAL** handles feature engineering and data preparation
- **RPT-1 or AI Core** performs inference using HANA-extracted features
- **HANA** stores predictions for low-latency serving
- **HANA Vector Engine** provides semantic search with AI Core embeddings

:::info References
**Architecture & Decision Records:**

- AI Layer – Comprehensive view of SAP's AI technology stack

**Getting Started Tutorials:**

- AI Golden Path: How to build, deploy and run with RPT-1 – Complete guide for RPT-1 use cases
- [Basic AutoML Tutorial](https://developers.sap.com/tutorials/hana-cloud-trial-basic-automl..html) – Quick start guide for automated ML with APL
- [Predictive AI with SAP AI Core](https://developers.sap.com/group.ai-core-get-started-basics.html) – Fundamentals and first workflows for AI Core
- [Training and Deploying Custom AI Models](https://developers.sap.com/tutorials/ai-core-custom-llm.html) – Guide for custom model deployment on AI Core

**Learning Journeys:**

- [Learning How to Use SAP AI Core](https://learning.sap.com/learning-journeys/learning-how-to-use-the-sap-ai-core-service-on-sap-business-technology-platform) – Complete learning journey covering training and serving
- [Developing AI Models with Python Machine Learning Client](https://learning.sap.com/courses/developing-ai-models-with-the-python-machine-learning-client-for-sap-hana-1) – Hands-on training for hana-ml
- [AutoML with SAP HANA Automated Predictive Library (APL)](https://learning.sap.com/courses/hana_apl) – Complete course on AutoML features

**Sample Code & References:**

- [hana-ml-samples GitHub Repository](https://github.com/SAP-samples/hana-ml-samples) – Official sample code and reference implementations
- [SAP AI Core Samples](https://github.com/SAP-samples/ai-core-samples) – Sample notebooks and workflow templates
- [hana-ml BTP App Examples](https://github.com/SAP-samples/hana-ml-samples/tree/main/BTP-App) – Reference implementations for deploying ML models in BTP applications
:::

