---
id: id-nsa-5
sidebar_position: 5
slug: /ai-native-north-star-architecture/foundation-layer
sidebar_custom_props:
    category_index: []
title: "Foundation Layer: AI, Data & Knowledge Graph"
description: "The AI-native foundation layer makes data and AI the intelligent core, grounded by SAP Business Data Cloud and SAP Knowledge Graph for governed context."
keywords:
    - sap
    - foundation layer
    - sap business data cloud
    - sap knowledge graph
    - sap datasphere
    - generative ai hub
    - sap-rpt-1
    - joule
    - semantic grounding
    - context engineering
    - data products
    - system of context
    - north star architecture
    - business ai platform
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
    date: 2026-10-23
---

<div className="nsa-float-image" style={{ float: 'right', marginLeft: '20px', width: '30%', maxWidth: '320px' }}>

![foundation-layer](images/foundation-layer-ai-native.png)

</div>

<p style={{ textAlign: 'left' }}>

The foundation layer is where data and AI come together as the intelligent core of enterprise processes, giving every SAP customer a compounding advantage built on SAP’s five decades of business data, process knowledge, and domain expertise, structured in a knowledge graph and ontology. With the AI-first approach, data and intelligence remain largely separate: models run without business context, and data sits in silos without reasoning over it.

The shift from AI-first to AI-native redefines how enterprise intelligence is built, grounded, and improved.
</p>

<div style={{ clear: 'both' }}></div>

<div className="nsa-float-image" style={{ float: 'left', marginRight: '20px', width: '45%', maxWidth: '500px' }}>

![foundation-layer-arch](images/foundation-layer-arch.png)

</div>

<p style={{ textAlign: 'left' }}>

In the AI-native model, orchestration, reasoning, and model services power the AI side. Governed data and semantic grounding, supported by SAP Business Data Cloud and SAP Knowledge Graph, provide context. Together, they store and compound enterprise knowledge that grows with each interaction. This enables intelligent systems to operate natively inside enterprise processes, with built-in guardrails for ethics, security, compliance, governance, and efficiency.

</p>

<div style={{ clear: 'both' }}></div>

**The following capabilities define how this layer works:**

**Orchestration**: Joule orchestrates agents and tools to solve user requests, managing the lifecycle of agents however they are built, scheduling their actions, and aligning execution with workflow goals. Agent execution is coordinated across conversational, API-based, and event-driven triggers. This includes routing each request to the right agent, evaluating response quality, and resolving conflicts when multiple capabilities apply, helping ensure users get trusted answers and not just fast ones. For complex goals, Joule will decompose the task and delegate to domain-specific agents that execute in parallel and report results back for coordination. Agents are increasingly equipped with self-verification: internal feedback loops that check accuracy during execution, not just in post-hoc evaluation, reducing the error buildup that has been the primary obstacle to scaling multistep workflows.

For work that spans sessions, agents will need to retain relevant context, recover from interruptions, and check progress against the original goal. Dividing work among several agents is useful when their contributions can be combined reliably and the benefit justifies the extra coordination.

![agentic-orchestration-foundation-layer](images/agentic-orchestration-foundation-layer.png)

**Model services**: The specialized code base and domain knowledge of SAP represent a strategic advantage that general-purpose models cannot access. Frontier models lack native knowledge of SAP’s proprietary codebase, architecture patterns, and business logic. SAP-trained models combine continuous pretraining on internal code bases with fine-tuning and in-context learning, providing deep understanding of how procurement workflows connect to finance, how supply chain exceptions trigger approvals, and how your specific business rules work in production.
 
The models are hosted through a generative AI hub. The hub provides grounding services, to keep AI aligned with enterprise semantics, and optimization services (prompt optimization, test-time scaling, fit-for-purpose model selection), to improve efficiency and reduce inference overhead.

Alongside SAP’s own models, the generative AI hub provides access to leading third-party models, including frontier large language models and open-source alternatives, giving customers the flexibility to choose the right model for each task without code changes. It is one hub with many models and consistent governance.

This includes the SAP-RPT-1 AI model, built specifically for structured business data and trained on relational enterprise data, such as financial ledgers, transaction records, and supply chain tables, to deliver predictions without requiring customer-specific model training.

Rather than having each team host models independently, this consolidation helps ensure consistent model lifecycle management, usage tracking, reduced environmental impacts, and capacity planning across SAP. Customers can use supported SAP-managed third-party models through the generative AI hub in SAP AI Core without procuring and licensing each model separately: SAP manages the commercial agreements, and customers pay for model consumption through SAP AI Core.

**Reusable intelligence**: Core cognitive capabilities such as document understanding, tabular analysis, and visual inspection are implemented once and exposed as composable skills, helping ensure consistency and reduce duplication across applications and agents while minimizing redundant compute and infrastructure usage.
 
**Data and semantic grounding**: SAP Business Data Cloud provides enterprise data, the SAP Knowledge Graph provides semantic grounding, and the Ontology layer helps augment the Knowledge Graph, unifying SAP and non-SAP data, thereby enabling agents with the trusted, context-rich, and efficient data and business context they need to reason, act, and learn.

**SAP Business Data Cloud** helps connect data from across the enterprise into a single, governed landscape: cloud and on-premises solution systems from SAP, customer-managed legacy systems, third-party sources, and partner ecosystems. At its core are data products: curated, governed datasets with clear ownership, schema, authorization rules, and lifecycle management. Data products are the primary governed access layer for SAP data, enabling consistent and reusable consumption across analytics, data science platforms, and AI agents.

Data products follow an authorization model and are accessible through multiple channels: SAP Analytics Cloud to create business dashboards and enhance planning, the SAP Datasphere solution for use in semantic data modeling, partner platforms such as those from Databricks Inc. and Snowflake Inc. for data science, and AI agents supported by Joule that access data through natural-language-to-SQL generation grounded in SAP Knowledge Graph. SAP Business Data Cloud will integrate tightly with the SAP AI Core foundation to train machine learning models and ground large language models, enabling the creation of new data products from the resulting insights.

To help ensure agents have data access from day one, each customer's SAP application tenants come provisioned with an embedded data foundation that provides auto-generated data products. These data products are based on application metadata, removing the barrier of limited data product availability, so Joule and agents can query across application boundaries from day one.

![SAP Knowledge Graph](images/sap-knowledge-graph.png)

**SAP Knowledge Graph** is the semantic backbone of the AI-native architecture. It links natural language inputs to SAP’s structured metadata while reducing hallucinations, opening access to tens of thousands of APIs, data models, and business entities across SAP. When a user asks to “show me overdue orders,” SAP Knowledge Graph automatically discovers the right API, identifies the correct filter parameters, and constructs an accurate query, achieving accuracy that surpasses model-only approaches.

SAP Knowledge Graph connects multiple layers of enterprise knowledge:
- **API and service metadata**: Definitions, endpoints, parameters, and relationships across SAP applications
- **Business semantics**: What “revenue” means, how “customer” relates to “order,” how processes connect across domains
- **Data product metadata**: Schema, lineage, freshness, and authorization rules for datasets
- **Customer-specific extensions**: Custom fields, custom APIs, and tenant-specific configurations layered on top of SAP’s base knowledge

The long-term vision is a **customer-specific knowledge graph** with a shared enterprise ontology, where domain-specific knowledge graphs maintain autonomy while connecting via shared concepts, presenting a single logical view across the SAP solution landscape.

### SAP BDC Ontology Manager

SAP BDC Ontology Manager is a step toward that vision. It transforms data products into a context-rich, actionable business ontology - bridging the full enterprise data landscape and the decisions agents need to make. Rather than treating ontology as static metadata, it unifies SAP and non-SAP data into a single live knowledge layer: concepts, relationships, and policies spanning the entire data estate of a customer, from S/4 and LoB systems to other third-party sources integrated, unified, and enriched through Dremio and Reltio. This complete view is what makes the difference: agents deliver accurate outcomes because they carry the deep business context that only SAP can provide, grounded in decades of process knowledge no frontier model or SaaS player can replicate.

**Business Actions**: Business actions, such as releasing a blocked invoice, are defined on ontology concepts together with their inputs, preconditions, and permitted roles. When an agent identifies a business object through the ontology, it also knows which governed actions it may take on it.

**Live Ontology**: Continuously enriched by customer feedback, new data products, and evolving business processes, the ontology adapts to each customer's data landscape, becoming more precise and valuable over time while turning governed business context into executable intelligence.

#### Context engineering and memory
Every time an agent starts, it may have powerful reasoning capabilities, but it has no inherent awareness of the current task, prior interactions, or relevant business context. That context must be explicitly provided or retrieved. Context engineering solves this by assembling the right slice of enterprise information for each interaction while filtering out redundant, outdated, or unauthorized data, so agents can operate on context that is relevant and proportionate to the task while reducing unnecessary retrieval and energy-intensive inference calls.

Joule and agents will share two forms of memory: semantic memory, which captures knowledge about the user, their preferences, and their working environment; and episodic memory, which retains summaries and goals from past conversations. Because the memory is shared, users can manage both forms in one place, and access can be limited to specific agents.

Consider two customers with identical profiles: the same industry, tenure, and deal size. A system of record shows different discounts but not why. A system of context captures the exceptions, escalations, and precedents that shaped each decision, so the next agent facing a similar situation proposes the right action, not the average one. Over time, the system moves beyond responding to requests and begins anticipating the next business action.

Agents persist context and reasoning artifacts across interactions, capturing decision lineage: what was known, what was considered, what was chosen, and what resulted. Each human correction becomes a structured decision trace. Together with SAP Knowledge Graph, these traces form a context graph: a living representation of enterprise knowledge that connects semantics, decision history, and operational context.

***Data was the moat of the last decade. Context is the moat of the next.***

#### Continuous Improvement
Agent quality is maintained through structured evaluation cycles that span technical assessment of individual agents (goal completion, tool call efficiency), process and business evaluation KPIs, and financial and operational outcomes. This helps ensure agents are measured not just on technical performance but on business impact. As Goodhart’s Law warns: “When a measure becomes a target, it ceases to be a good measure.” As an example, when an agent is given “resolve disputes faster” as its objective, speed becomes the target. The agent optimizes resolution time at the cost of customer retention. Evaluation is, therefore, a multiobjective optimization problem: rather than optimizing a single variable, the agent optimizes across multiple constraints such as resolution time, retention, and resolution quality. Business evaluation KPIs measure how each constraint shifts when the agent is involved, and those measurements become the feedback signal the agent uses to iteratively improve itself toward a stable optimum.

As agents take on more complex work, the way they are evaluated will need to improve, too. Failures and human feedback can reveal gaps in the tests and help show whether a higher score also means a better business outcome.

When the same approach works well across similar tasks, it could be captured as a reusable skill. The skill would be tested and reviewed before use, with references to the past interactions it was based on. Changes would be tracked so they could be reversed if needed.

Over time, agents could propose improvements to their own instructions and skills, based on what evaluations and feedback show. This is a bounded, human-governed form of what research calls recursive self-improvement: people set the goals, permissions, and tests, and decide which proposed changes are adopted after the same testing and review as any other release. Workflows become cumulative assets that grow stronger with each cycle.

The foundation layer builds the enterprise intelligence. Running it reliably, securely, responsibly, and at enterprise scale requires a platform purpose built for agents.