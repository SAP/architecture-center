---
id: id-nsa-5
sidebar_position: 5
slug: /ai-native-north-star-architecture/foundation-layer
sidebar_custom_props:
    category_index: []
title: Foundation Layer
description: >-
    The AI-native Foundation Layer unites Data and AI as the intelligent core of enterprise processes. SAP Business Data Cloud and the SAP Knowledge Graph provide semantic grounding and governed data, while orchestration, model services, context engineering, and continuous improvement compound enterprise knowledge with every interaction.
keywords:
    - foundation layer
    - SAP Business Data Cloud
    - SAP Knowledge Graph
    - semantic grounding
    - context engineering
    - agentic orchestration
    - Gen AI hub
    - SAP RPT-1
    - data products
    - enterprise memory
    - context graph
    - SAP Datasphere
    - SAP Analytics Cloud
    - reusable intelligence
    - model services
    - continuous improvement
    - multi-objective optimization
    - system of context
    - North Star Architecture
    - NSA
sidebar_label: 5. Foundation Layer (AI & data)
image: img/ac-soc-med.png
tags:
    - ai-native-north-star
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
pagination_prev: north-star-arch/ai-native-northstar-arch/process-layer/id-nsa-4
pagination_next: north-star-arch/ai-native-northstar-arch/platform-layer/id-nsa-6
contributors:
discussion:
last_update:
    author: SAP
    date: 2026-10-26
---

The foundation layer is where data and AI come together as the intelligent core of enterprise processes, giving every SAP customer a compounding advantage built on SAP’s five decades of business data, process knowledge, and domain expertise. This reflects a fundamental shift: Enterprise systems are evolving from **systems of records** to **systems of context**.

With the AI-first approach, data and intelligence remain largely separate: models run without business context, and data sits in silos without reasoning over it. 

<div className="nsa-float-image" style={{ float: 'right', marginLeft: '20px', width: '30%', maxWidth: '320px' }}>

![foundation-layer](images/foundation-layer-ai-native.png)

</div>

<p style={{ textAlign: 'left' }}>

The shift from AI-first to AI-native redefines how enterprise intelligence is built, grounded, and improved. 
In the AI-native model, orchestration, reasoning, and model services power the AI side. Governed data and semantic grounding, supported by SAP Business Data Cloud and SAP Knowledge Graph, provide context. Together, they store and compound enterprise knowledge that grows with each interaction. This enables intelligent systems to operate natively inside enterprise processes, with built-in guardrails for ethics, security, compliance, governance, and efficiency.

</p>

<div style={{ clear: 'both' }}></div>

**The following capabilities define how this layer works:**

**Orchestration and Runtime**: 
Joule orchestrates agents and tools to solve user requests, driving the main agentic loop: planning, routing each request to the right agent, and continuously applying reflection to evaluate progress, resolve conflicts when multiple capabilities apply, and re-plan. This ensures users get trusted answers, not just fast ones.

For complex goals, Joule decomposes the task and delegates to domain-specific agents that execute in parallel and report results back for coordination. Individual agents run in their own agentic loops, invoking tools through the Agent Gateway for each discrete operation. App Foundation is the default runtime for SAP-hosted code-based agents, subject to approved exemptions.

![agentic-orchestration-foundation-layer](images/agentic-orchestration-foundation-layer.png)

Joule coordinates intent and agent collaboration, while shared platform services provide managed agent deployment, lifecycle support, and scheduled execution.  Agent execution is coordinated across conversational, API-based, and event-driven triggers. Agents are increasingly equipped with self-verification: internal feedback loops that check accuracy during execution, not just in post-hoc evaluation, reducing the error buildup that has been the primary obstacle to scaling multi-step workflows.

<div className="nsa-float-image" style={{ float: 'left', marginRight: '20px', width: '45%', maxWidth: '500px' }}>

![foundation-layer-arch](images/foundation-layer-arch.png)

</div>

<p style={{ textAlign: 'left' }}>

**Model services**: 
SAP's specialized codebase and domain knowledge represent a strategic advantage that general-purpose models cannot access. Frontier models have never seen SAP's internal code, architecture patterns, or business logic. All foundation models built within SAP are hosted and consumed through the Generative AI Hub in AI Core, including LLMs, tabular models, coding models, and domain-specific models. The hub provides a harmonized interface to multiple frontier models, both third-party and SAP-hosted, with no vendor lock-in and fallback-based model orchestration that automatically switches to the next preferred model when one is unavailable or unsupported in a deployed region, enabling applications to operate across LLMs without per-model code changes. One hub, many models, consistent governance.

</p>

<div style={{ clear: 'both' }}></div>
 
Sovereignty is a primary driver: geopolitical tensions have made LLMs national critical assets. SAP targets a small set of LLMs grouped across sovereignty clusters, with region-appropriate model selection without code changes. Grounding services and fine-tuning adapters enable agents to reason within enterprise guardrails, including prompt optimization, speculative decoding on self-hosted LLMs, test-time scaling to balance speed with reasoning depth, and neural-guided search to keep exploration aligned with enterprise policies.

This includes SAP RPT-1, a relational pretrained transformer built specifically for structured business data. Trained on relational enterprise data such as financial ledgers, transaction records, and supply chain tables, RPT-1 performs in-context learning on structured and relational data, delivering training-free predictions that enable real-time predictive capabilities within agentic workflows without requiring customer-specific model training.

**SAP's World Model (NOVA):** Frontier models have broad world understanding but lack SAP-specific domain knowledge. SAP's World Model converts 50 years of proprietary source code, documentation, architecture, and business logic into domain-specific foundation models through continuous pre-training and parameter-efficient fine-tuning, combined with RAG at inference time. This creates a code intelligence flywheel: developers generate code, code yields patterns, patterns are distilled into domain intelligence, and that intelligence feeds back into the models. The result is AI that understands ABAP idioms, S/4 patterns, and enterprise architecture relationships that no external model can access.

**Reuse Layer:**
Core cognitive capabilities such as document understanding, tabular analysis, and visual inspection are implemented once and exposed as composable skills, ensuring consistency and reducing duplication across applications and agents, while minimizing redundant compute and infrastructure usage.
 
#### Data and Semantic Grounding: 
AI Foundation provides the reasoning, but reasoning without data is guesswork. SAP Business Data Cloud provides enterprise data, and the SAP Knowledge Graph provides semantic grounding, together enabling agents with the trusted, context-rich, and efficient data and business context they need to reason, act, and learn. Together they create a self-reinforcing flywheel: applications generate data, BDC curates it, Knowledge Graphs add meaning, AI reasons over it, and the results flow back into smarter applications.

**SAP HANA Cloud** serves as the foundational data layer for Business AI , providing columnar storage, data lake files, the Vector Engine for similarity search and Retrieval-Augmented Generation (RAG) across enterprise data, and the Knowledge Graph Engine for storing and serving highly interconnected knowledge graph assets. For predictive workloads, the Tabular AI orchestration layer connects foundation models like RPT-1 to BDC data through a context registry and virtual tables, providing a unified entry point for predictions without manual data movement. The Predictive Analysis Library (PAL) and Automated Predictive Library (APL) enable large-scale in-database inference — segmented time-series forecasting in Integrated Business Planning and Cloud ALM runs hundreds of thousands of forecasts in parallel with in-memory performance. HANA Cloud is evolving toward a fully managed **serverless model**, so agents and applications consume database capabilities without provisioning or sizing infrastructure.

**Data Products**, curated and governed datasets described using ORD, are the sharing mechanism. SAP BDC enables SAP, partners, and customers to share and consume business data securely and consistently. Data Products follow a three-tier visibility model: **public** (discoverable by customers and partners with external contract), **SAP-internal**(cross-LoB reuse and AI scenarios without external contract), and **SAP-private** (restricted to a single application or agent). Authorization is handled through **SAP Cloud Identity Authorization Management Service (AMS)** with attribute-based access control and row-level security, with hierarchical and column-based authorizations planned. Data Products are served through the **Delta Sharing Protocol** and, in the future, SQL APIs on a serverless compute layer. Data products will use their own authorization model rather than automatically inheriting source-application roles. Customers will initially need to model permissions for these products, while tooling for partial reuse of source authorizations is a future direction.

**SAP Business Data Cloud**
SAP BDC connects data from across the enterprise into a single, governed landscape: SAP cloud and on-premise systems, customer-managed legacy systems, non-SAP sources, and partner ecosystems. At its core are Data Products: curated, governed datasets described using ORD, with clear ownership, schema, authorization rules, and lifecycle management. Data Products are the primary governed interface between SAP's data and everything that wants to use it — whether it is a dashboard, a data science platform, or an AI agent.

Data Products are accessible through multiple channels: SAP Analytics Cloud for business dashboards and planning, SAP Datasphere for semantic data modeling, partner platforms like Databricks and Snowflake for data science, and Joule-powered AI agents that access data through natural-language-to-SQL generation grounded in the Knowledge Graph. SAP Business Data Cloud integrates tightly with AI Core to train machine learning models and ground large language models, enabling the creation of new data products from the resulting insights.

BDC Foundation Services, BDC Runtime Services, and BDC Connect manage connectivity, ingestion, orchestration, and the lifecycle of Data Products. BDC Design Time Services provide modeling tools and content lifecycle management, while BDC Cockpit and Data Product Studio serve as the unified administration and authoring environments. A Data Product Marketplace provides a unified view of SAP and partner-built Data Products.

To make business data available to Joule with less setup, existing and new S/4HANA, Ariba and SuccessFactors tenants will receive an embedded BDC data foundation, with pre-generated primary data products and an initial golden dataset activated automatically. This embedded foundation is scoped to Joule scenarios; broader BDC analytics and data-sharing capabilities remain outside its scope. Auto-generated internal data products can support ad hoc agent queries, but do not provide stable contracts for external consumption.

**BDC Applications:** SAP Datasphere provides data warehousing and modeling capabilities, SAP Analytics Cloud delivers BI, planning, and reporting, and BW continues to serve existing analytical workloads. These applications sit on top of the BDC data layer and consume Data Products directly.

**Partner Integrations:** SAP Databricks is the blueprint partnership, offering an OEM'd data science environment with zero-copy bidirectional data sharing as part of the BDC contract. **SAP Snowflake, Google, and Microsoft Fabric** extend the same pattern, giving customers the freedom to use their preferred data platform while keeping SAP data governed through BDC. Partners access BDC through standardized BDC Connect APIs and a dedicated landing zone in the object store.

**Customer Data Hub** (CDH) provides a controlled environment for machine learning training, extracting data from customer tenants with access limited to verified parties. Through SAP BDC, CDH gains access to all data products across SAP applications. SAP BDC integrates with AI Core for batch inference as part of data products, with AI Core retrieving data from HANA data lake files and writing inference results back.

![SAP Knowledge Graph](images/sap-knowledge-graph.png)

**SAP Knowledge Graph** 
SAP Knowledge Graph is the semantic backbone of the AI-native architecture. It links natural-language inputs to SAP's structured metadata while reducing hallucinations, unlocking access to tens of thousands of APIs, data models, and business entities across SAP. When a user asks, "show me overdue orders," the Knowledge Graph automatically discovers the right API, identifies the correct filter parameters, and constructs an accurate query, achieving accuracy that surpasses model-only approaches.

The Knowledge Graph connects multiple layers of enterprise knowledge:

- API and service metadata: definitions, endpoints, parameters, and relationships across all SAP applications
- Business semantics: what "revenue" means, how "customer" relates to "order," how processes connect across domains
- Data Product metadata: schema, lineage, freshness, and authorization rules for datasets
- Customer-specific extensions: custom fields, custom APIs, and tenant-specific configurations layered on top of SAP's base knowledge

Each capability links to a specific asset: KG Reasoner connects to SAP Datasphere metadata enabling agentic exploration, while reference metadata (API definitions, data models, semantic information) is accessible via ORD and aggregated by UMS. This layer also powers Agentic RAG: agents decide what to retrieve, when it is relevant, and how to apply it, focusing reasoning on enterprise-consistent objects like ledgers, orders, and employee records while enforcing governed rules like approval limits, policies, and compliance checks.

The long-term goal is a federated SAP Knowledge Graph with a shared enterprise ontology (building on ODM, GTNC, and ORD/UMS), where domain-specific knowledge graphs maintain autonomy while connecting through shared upper-level concepts, presenting one logical view through a KG Gateway. Customer-specific, tenant-aware KG instances extend SAP-managed metadata with customer extension fields, extension tables, Datasphere model artifacts, HANA Cloud assets, and cross-application join metadata reflecting the customer's actual integrations.

**Query Mechanisms:** Joule and agents access data through three complementary routes: API-based access where the Knowledge Graph retrieves and maps the right APIs, Data Product-based access where AutoSQL generates SQL queries against delta tables in BDC, and table-based access where **AutoSQL** targets application schemas directly. **NL2Qrt** translates natural language into API calls against LoB systems, while **DPQuery** provides governed, multi-tenant SQL access to Data Products via a REST API, enforcing data access policies through integration with SAP Cloud Identity Services. All routes are grounded by SAP Knowledge Graph for accuracy, letting agents answer complex business questions across LoB boundaries without manual API mapping. In the target architecture, query preparation and execution will be separate steps: tools such as AutoSQL prepare a query, and agents execute it through Agent Gateway using the provider's official APIs. Data joins will run in the database, while Joule and domain agents remain responsible for planning and tool selection.

SAP's enriched Knowledge Graph will be available to SAP-built agents and applications, with controlled access for supported customer extensions. Public discovery of Data Products can expose consumer-facing overviews and output schemas, while internal semantic enrichments and mappings to source tables and CDS views remain protected from public access.

### SAP BDC Ontology Manager

The SAP BDC Ontology Manager transforms data products into a context-rich, actionable business ontology - bridging the full enterprise data landscape and the decisions agents need to make. Rather than treating ontology as static metadata, it unifies SAP and non-SAP data into a single live knowledge layer: concepts, relationships, and policies spanning the entire data estate of customer, from S/4 and LoB systems to other third-party sources integrated and unified and enriched through Dremio, Reltio, and Prior Labs. This complete view is what makes the difference: agents deliver accurate outcomes because they carry the deep business context that only SAP can provide, grounded in decades of process knowledge no frontier model or SaaS player can replicate. 
 
**Business Actions**
Business actions are directly bound to ontology concepts, enabling agents to trigger workflows, invoke APIs, and execute decisions across SAP S/4HANA, line-of-business applications, and Joule while staying within governed guardrails.

**Live Ontology**
Continuously enriched by customer feedback, new data products, and evolving business processes, the ontology adapts to each customer’s data landscape, becoming more precise and valuable over time while turning governed business context into executable intelligence.

**Context Engineering and Memory**

Every time an agent starts, it is incredibly smart but has zero context. It cannot do anything useful without identity, memory, and skills. [Context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) solves this by assembling the right slice of enterprise information for each interaction while filtering out redundant, outdated, or unauthorized data, so agents operate on context that is relevant and proportionate to the task while reducing unnecessary retrieval and energy-intensive inference calls.

Consider two customers with identical profiles: the same industry, tenure, and deal size. A system of record shows different discounts but not why. A system of context captures the exceptions, escalations, and precedents that shaped each decision, so the next agent facing a similar situation proposes the right action, not the average one. Over time, the system moves beyond responding to requests and begins anticipating the next business action.

The Agentic Memory Service, backed by HANA Cloud, externalizes agent state from the stateless runtime, evolving toward a fully managed serverless model. Agents persist context and reasoning artifacts across interactions, capturing decision lineage: what was known, what was considered, what was chosen, and what resulted. Every human correction becomes a structured decision trace. Together with the SAP Knowledge Graph, these traces form a [context graph](https://foundationcapital.com/ideas/context-graphs-ais-trillion-dollar-opportunity): a living representation of enterprise knowledge that connects semantics, decision history, and operational context.

For each user, Joule and agents will share two forms of memory through a common HANA-based memory service: semantic memory, which captures knowledge about the user, their preferences, and their working environment; and episodic memory, which retains summaries and goals from past conversations. Users can manage both centrally, while visibility controls determine which agents can access them. This lets relevant experience carry across interactions without retraining a model.

***Data was the moat of the last decade; context is the moat of the next.***

**Alignment, Observability, and Continuous Improvement**

Agent behaviour is bounded by approved business rules, with embedded compliance checks and fallback paths for uncertainty. A trace architecture captures the full decision path: what the agent knew, what it retrieved, what alternatives it considered, and why it chose one action over another. Observability follows the platform-wide OpenTelemetry standard.

Agent observability and evaluation will use MLflow for trace storage, evaluation datasets, runs, and result tracking, with AI Core as the target hosting platform and execution environment for evaluation runners. A shared conversation identifier will link traces and evaluation results across turns and agents. Evaluation will assess goal completion and tool use alongside process KPIs and business outcomes.

As Goodhart's Law warns: “when a measure becomes a target, it ceases to be a good measure”.  When an agent is given "resolve disputes faster" as its objective, speed becomes the target, the agent optimizes resolution time at the cost of customer retention. Evaluation is therefore a multi-objective optimization problem: rather than optimizing a single variable, the agent optimizes across multiple constraints such as resolution time, retention, and resolution quality. Business KPIs measure how each constraint shifts when the agent is involved, and those measurements become the feedback signal the agent uses to iteratively improve itself toward a stable optimum. Production traces may be used for evaluation and improvement only for permitted purposes and by authorized consumers, with personal data minimized, redacted or pseudonymized as required.

**Learning from execution**
The next step is to turn execution evidence into reusable improvements. Failures, human corrections, and business outcomes can reveal gaps in evaluation datasets and suggest new test cases. Approaches that succeed across similar tasks can become candidate skills or instructions, linked to the interactions and outcomes that support them.

Each candidate change is evaluated against representative cases and reviewed before release. Versioned skills, instructions, and evaluation assets make changes traceable and allow a previous version to be restored when results regress. This creates a continuous loop from execution to evidence, evaluation, and improved capability.

Over time, agents could help improve both how they work and how they are evaluated, a bounded form of recursive self-improvement explored as a research direction. Agents can propose changes to skills, instructions, and tests, while people retain authority over business goals, policies, and permissions. Proposed changes pass through the same evaluation and review process before entering production.

**Data Encryption, Data Protection, and Privacy (DPP)** ensure confidentiality, integrity, and compliance across hybrid landscapes. SAP establishes DPP standards for product integrations through cross-consumable features such as harmonized blocking and deletion via the Data Privacy Integration NextGen service (DPI) and automation based on Personal Data-annotations, envisioning a federated model for personal data across application boundaries.

The Foundation Layer turns data, reasoning, and experience into a self-reinforcing system of context. Governed data products and the business ontology ground execution. Memory carries relevant knowledge across interactions. Evaluation turns outcomes into evidence for improving skills, instructions, and models through their respective development and governance processes. Together, these mechanisms make enterprise intelligence a cumulative asset that becomes more useful with experience.