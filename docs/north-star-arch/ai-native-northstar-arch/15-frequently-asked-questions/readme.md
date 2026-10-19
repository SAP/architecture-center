---
id: id-nsa-faq
sidebar_position: 13
slug: /ai-native-north-star-architecture/frequently-asked-questions
title: Frequently Asked Questions on the AI-native North Star
description: Answers to customer and partner questions on SAP's AI-native North Star architecture, covering Joule Work, agents, SAP Knowledge Graph, and data products.
keywords:
    - frequently asked questions
    - joule work
    - ai agents
    - agent authorization
    - sap knowledge graph
    - agent gateway
    - sap business data cloud
    - data products
    - sovereign cloud
    - ai-native north star architecture
    - sap
    - business ai platform
sidebar_label: Frequently Asked Questions
image: img/ac-soc-med.png
tags:
    - ai-native-north-star
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
pagination_prev: north-star-arch/ai-native-northstar-arch/closing-note/id-nsa-12
pagination_next: north-star-arch/ai-native-northstar-arch/acknowledgement/id-nsa-13
contributors:
    - AdiPleyer
discussion:
last_update:
    author: AdiPleyer
    date: 2026-10-13
---

This document compiles questions and answers from a series of presentations and discussions with SAP customers and partners, including multiple rounds with DSAG members, about the SAP AI Native North Star architecture.
The questions range from clarifying concepts, planned capabilities, and the development roadmap to broader requirements and implications of the new approach.
Some answers provide clear guidance. Others remain deliberately high-level, as the AI Native North Star is a vision: it describes target concepts and architectural patterns for the future, and the fully defined end state is still evolving.
Many of these concepts are already in development. Others are still being discussed and open. This is intentional. Moving towards an AI-native technology foundation is a broad and significant evolution that requires multiple sequential and parallel iterations. New concepts are developed incrementally and validated with early adopters throughout the process.

## Artificial Intelligence in General

<!-- Question 127 August/September 2026 -->
**Question: Deterministic Execution Benefits**<br/>
The advantage of deterministic applications and workflows compared with agent-based execution: they do not burn any tokens.

**Answer:** This is correct. A key advantage of deterministic applications and workflows is that they do not require LLM inference for every execution step; therefore, they do not consume tokens. They provide predictable control flow, reliability, repeatability, and often lower cost for well-defined processes.<br/>
The target architecture is not “agents everywhere.” Instead, it calls for a conscious decision and deliberate combination. SAP’s AI Golden Path provides guidance for deciding which approach, agentic AI, generative AI, classical ML, or relational foundation models, best fits a particular business problem: https://architecture.learning.sap.com/docs/ai-golden-path and is applicable in general.<br/>
(A related presentation at the DSAG AI Topic Days 2026: https://dsagnet.de/datei/3ab87eac-0974-4b52-af00-2fb1904ac378, DSAG login required)

## User Experience Layer

<!-- Question 1 August/September 2026 -->
**Question: Joule Work Grounding**<br/>
Joule Work: When changes are made to underlying software or table structures, what information must be provided to Joule Work? How does Joule Work obtain the required business context in such cases?

**Answer:** Joule Work should be grounded in governed business context rather than relying only on the pure language model. The SAP Knowledge Graph is intended to be the single source of truth for semantic metadata, business entities, relationships, and process knowledge.

<!-- Question 3 August/September 2026 -->
**Question: Persistent Space Memory**<br/>
In Spaces, can a personalized contextual “DNA” be stored so that it is persistently available in the background for all interactions of the user?

**Answer:** A memory functionality for spaces as a persistent, personalized context is in work and should be available in all chats of the user. This user-specific memory must remain transparent, privacy-compliant, and under user control.

<!-- Question 4 August/September 2026 -->
**Question: External Chatbot Interoperability**<br/>
Will it be possible to communicate with Joule from other chatbot environments, such as Microsoft Copilot? If so, will this provide an equivalent user experience?

**Answer:** The target architecture supports agent interoperability through the A2A standard. External tools may access SAP capabilities through Joule agents, but they will not necessarily provide the complete Joule Work experience, including its workspace, context, governance, and orchestration.<br/>
See also the Reference Architecture:
https://architecture.learning.sap.com/docs/ref-arch/98efa0 

<!-- Question 5 August/September 2026 -->
**Question: Intent-Driven Process UI**<br/>
How would an existing business process, such as incoming invoice processing, work in this UI concept?

**Answer:** Initially, the Generative UI should not replace the business process with a single generic chat interaction. Instead, Joule Work is intended to let users express an intent, then assemble relevant information, agents, and tools around that goal. For an invoice-processing scenario, this could combine a “Space” for investigation and analysis, “Conversations” for questions and instructions, and “Jobs” for traceable, agent-supported routine work within defined guardrails. This might include finding documents, comparing invoices with purchase orders, identifying exceptions, analyzing discrepancies, recommending next actions, and routing cases for approval. The specific degree of automation remains a business-process and application-design decision.

<!-- Question 7 August/September 2026 -->
**Question: Deterministic UI Coexistence**<br/>
AI and Trust: From a business perspective, there is a need for a user interface alongside Joule Work that works entirely without AI. Business users must be able to verify what is stored in the underlying systems and ensure that information has not been distorted by AI. There are concerns that established SAP UI technologies, especially Fiori, may be deprioritized in favor of Joule Work.<br/>
Consumer AI has produced many implausible or incorrect results. Regardless of whether the concern is objectively justified, enterprises fear that SAP AI could similarly create unreliable or hallucinated information, or that users could receive incorrect results because prompts were not precise enough. To build trust, a stable, deterministic UI is required alongside AI-driven interaction. If SAP advocates the coexistence of Fiori and Joule, this should be reflected clearly in the product strategy.

**Answer:** This concern is valid. The AI-native Generative UI direction does not mean that deterministic, application-based user interfaces disappear. SAP business applications remain the systems of record, context and execution, while Joule Work provides an additional, intent-driven layer that can bring together data and insights. The architecture explicitly emphasizes reliability, compliance, transparency, user control, and privacy boundaries.<br/>
For repeatable, transactional, regulated, or training-intensive tasks, stable application flows and established UI patterns remain important. AI should guide users to trusted application functions, explain relevant context, and automate only within defined guardrails. It should not replace deterministic backend functionalities.

<!-- Question 26 August/September 2026 -->
**Question: Application UI Roadmap**<br/>
The coexistence of applications and Joule Work is perceived differently by DSAG members. Resources for application development, for example Fiori, appear to have been significantly reduced with reference to Joule Work. Organizations now have several incomplete UI technologies, such as SAP GUI, Web Dynpro, and multiple Fiori versions, and are now being told that everything will become “Joule Work.” This does not match how representatives of business applications currently (have to) position themselves toward customers.

**Answer:** See also Question 7. Joule Work should be understood as an experience and orchestration layer above applications, not as an automatic replacement for every existing application UI. The practical product roadmap and investment balance for each application area individually remain essential for customer confidence and adoption.

<!-- Question 8 August/September 2026 -->
**Question: LLM Cost Optimization**<br/>
This concept triggers many actions that could be performed without an LLM. This could create substantial LLM load. What costs should be expected, and can LLMs handle this load at scale?

**Answer:** LLMs will be involved where interpretation, reasoning, summarization, planning, or natural-language interaction creates value. This is not the case for deterministic operations that conventional application logic, rules, APIs, workflows, or queries can perform more efficiently and reliably. Cost, latency, scalability, quality, and risk must be assessed for each use case. Reuse and caching of intermediate results might become important optimization techniques.<br/>
Finally, our AI Golden Path offers guidance on which technologies to apply for which use cases or business process steps (https://architecture.learning.sap.com/docs/ai-golden-path) if necessary.


<!-- Question 10 August/September 2026 -->
**Question: Shared Spaces Collaboration**<br/>
Can generated Spaces be used by other users, or must every user create their own Spaces?

**Answer:** This is a known and frequently requested capability. Spaces should support sharing of relevant artifacts and context where collaboration requires it. Still, sharing must respect authorization, ownership, privacy, and the separation of personal and team context.

<!-- Question 21 August/September 2026 -->
**Question: Personalized Transparent Sharing**<br/>
If the UI is highly personalized, how can results be shared transparently with colleagues? This seems to conflict with the idea of a single source of truth.

**Answer:** Personalization and a single source of truth serve different purposes and can coexist. The single source of truth should remain the governed business data, metadata, calculations, process state of the underlying system of record. Personalization should affect how that trusted information is presented to an individual user.<br/>
To share work transparently, Joule Work should make shareable artifacts explicit, and retain source data, calculation logic to make the outcomes reviewable, even when each person’s workspace might look different.

<!-- Question 11 August/September 2026 -->
**Question: Agent Authorization Enforcement**<br/>
Will LLMs adequately respect the authorization concept, or does the AI operate in a separate context with unrestricted access?

**Answer:** The LLM (aka AI) itself cannot and will not be the authorization enforcement point. Access control will be enforced by the integration of agents and tools into the underlying system of record which handles the necessary authorization checks.<br/>
For agentic collaboration, the Agent Gateway is the central entry component which handles authentication, principal propagation, tenancy, and policy enforcement on agent level. The agents permission can be configured as subset of the user’s permissions.


<!-- Question 13 August/September 2026 -->
**Question: Agent Authorization Propagation**<br/>
The established Joule principle is that user authorizations are inherited through PFCG. Does this principle remain unchanged for autonomously acting agents in Joule Work? Under which identity and with which scope of roles does an agent act when it executes proactively without a synchronous user context?

**Answer:** For agents acting on behalf of a user, the user context and applicable authorizations are propagated and enforced. For autonomous agents that operate without a triggering user session, the agent can operate with an own identity, permissions, and audit trail.<br/>
In either case, autonomy does not mean unrestricted access. The agent’s effective permissions must be explicitly defined and governed. The exact implementation, including how existing PFCG roles map into a specific deployment, depends on the application and identity architecture, but the principle remains that agent actions must be executed under controlled identity and authorization rules.

<!-- Question 16 August/September 2026 -->
**Question: Cross-Application Spaces**<br/>
Can Spaces also be created in SAP SuccessFactors?

**Answer:** Joule Work is positioned as a cross-application workspace rather than an application-specific UI. In principle, it can surface authorized data, insights, and actions from SuccessFactors alongside capabilities from other SAP and non-SAP systems, provided that the required integrations, business capabilities, authorizations, and product support are available. It should not be assumed that every SuccessFactors scenario is automatically available in a Space; availability depends on the delivered and configured integrations.


<!-- Question 18 August/September 2026 -->
**Question: Dynamic and Static UI Consistency**<br/>
How consistent will dynamic UIs and Spaces be? How can new users be trained if everyone has an individual personalized UI?

**Answer:** Dynamic UIs must remain consistent at the level of design language, interaction patterns, terminology, guardrails, and business controls.<br/>
Spaces are more suitable for exploratory, goal-oriented, contextual work. For stable, high-frequency, standardized processes, especially those requiring formal training and stable UI, traditional application flows remain appropriate.<br/>
For example, a dynamic Space could help a manager assess team availability and prepare a leave request. The formal creation and approval of the leave request might still use the existing deterministic capabilities.

<!-- Question 19 August/September 2026 -->
**Question: Enterprise Spaces Differentiation**<br/>
Are Spaces essentially comparable to Anthropic artifacts with a DESIGN.md file behind them? What are the clear differences?

**Answer:** There may be a conceptual similarity, both can present generated or context-specific work environments. However, the distinguishing objective of SAP Spaces is enterprise integration: they are intended to operate within a governed business environment and connect authenticated users, authorized data, business semantics, enterprise applications, tools, agents, and process actions.
A Space is therefore not merely a generated interface or document. It is rather a persistent, goal-oriented workstream that can use business context and invoke governed capabilities across SAP and non-SAP systems.

<!-- Question 22 August/September 2026 -->
**Question: Deterministic Analytical Results**<br/>
An analytical reporting capability based on the randomness of an LLM will never be accepted. Data must be definite and reliable. If two colleagues use the same prompt but receive different figures, the solution does not work.

**Answer:** This is a core requirement. For figures, KPIs, balances, process status, and other facts that exist in enterprise systems or can be calculated deterministically, Joule Work should retrieve the authoritative values through governed data products and business services. The LLM may help interpret the question, explain the result, identify relevant dimensions, or formulate a narrative, but it should not invent or approximate system facts.


<!-- Question 23 August/September 2026 -->
**Question: Agent Auditability**<br/>
What about auditability, for example with respect to audit-proof processing and compliance requirements?

**Answer:** Agentic workflows need end-to-end traceability. The target architecture includes governance and observability capabilities, including lifecycle management, session health, tool-call tracing, behavioral tracing, process-conformance analysis, and business-impact measurement.<br/>
Backend transactions should continue to be handled and logged by the relevant system of record. AI orchestration logs complement the existing application, security, and audit logs. 


<!-- Question 32 August/September 2026 -->
**Question: Document Grounding and Processing**<br/>
Can I provide attachments in Joule Work—for example, to use an appropriate agent to extract data from a purchase-order PDF and automatically create a sales order?

**Answer:** Document upload for document grounding is possible and can support question answering based on uploaded documents. <br/>
A full end-to-end process, should not depend solely on free-form LLM generation. It should rather involve extraction, validation, matching against business data and an integrated and governed workflow. For this, the agent should use dedicated document-processing tools and APIs to apply business rules, authorization checks, master-data validation, and other controls before creating a business document in the system of record.

<!-- Question 35 August/September 2026 -->
**Question: Agent On-Premises Integration**<br/>
Can Joule Work also interact with on-premises systems? Technically, this should be possible as long as an API is available.

**Answer:** In principle, on-premises integration is feasible. The SAP Integration Suite and its MCP Gateway are the mechanisms for governed exposure of SAP and non-SAP APIs, while customer-managed Business AI Platform environments can host integrations and self-managed agents.


## Process Layer

<!-- Question 105 August/September 2026 -->
**Question: Agent Gateway Availability**<br/>
At present, agent-to-agent (A2A) communication is only supported in one direction (outbound)? When will SAP Agent Gateway become generally available? Source: https://architecture.learning.sap.com/docs/ref-arch/98efa0

**Answer:** SAP Agent Gateway is currently under development and is planned to become generally available around SAP TechEd 2026 time. Its purpose is to enable governed interoperability and collaboration between SAP and non-SAP agents through A2A communication.

<!-- Question 116 August/September 2026 -->
**Question: Agent Gateway and Cloud Connector**<br/>
Is SAP Agent Gateway equivalent to a combination of SAP Destination service and SAP Cloud Connector?

**Answer:** No. SAP Agent Gateway is a new component on the SAP Business AI Platform, designed for agent interoperability and governed A2A communication. It is not a replacement for SAP Destination service or SAP Cloud Connector, which address connectivity and secure access to systems and services including Cloud to on-prem systems.

<!-- Question 117 August/September 2026 -->
**Question: Role of A2A and MCP**<br/>
Does SAP Agent Gateway also provide access to MCP endpoints in individual backend systems, or is it limited to A2A communication between agents?

**Answer:** SAP Agent Gateway focuses on A2A communication and collaboration between SAP and non-SAP agents. Access to backend capabilities through Model Context Protocol (MCP) can be enabled through SAP Integration Suite, where MCP-based tools can expose SAP APIs in a governed manner.<br/>
For more information, see A2A and MCP for Interoperability: https://architecture.learning.sap.com/docs/ref-arch/76ec36

<!-- Question 120 August/September 2026 -->
**Question: Cloud Connector for on-Prem Access**<br/>
If an agent running in the managed Joule runtime needs to access an on-premises SAP S/4HANA system, can SAP Cloud Connector still be used?

**Answer:** Yes. SAP Cloud Connector continues to be available and is explicitly relevant for securely connecting services and workloads based on SAP Business AI Platform to on-premises systems. It remains an important connectivity option for agentic or AI-enabled solutions that need to invoke capabilities in an on-premises SAP S/4HANA landscape.<br/>
See Pro-Code AI Agents on SAP Business AI Platform: https://architecture.learning.sap.com/docs/ref-arch/7b6426

<!-- Question 132 August/September 2026 -->
**Question: User-Context and Authorization Propagation**<br/>
Will Joule Studio support user-context propagation and authorization-aware access when an agent invokes a custom SAP BTP backend API through an MCP server? In particular, can the MCP-based API execute in the logged-on user’s context and return results according to that user’s authorizations?

**Answer:** Yes. The user context is propagated so that the agent can access only the information and operations that the user would be allowed to access directly.<br/>
In addition, agent permissions can be more restrictive than the user’s permissions. For example, even if a user is authorized to delete business data, the agent can be prevented from performing delete operations. This implements the principle of least privilege and supports governed agent execution.

<!-- Question 134 August/September 2026 -->
**Question: Choice of LLM Models**<br/>
Will users be able to choose or configure which LLM generates artifacts such as intent definitions, product requirements, specifications, or solution implementations?

**Answer:** Users can select the LLM according to their preferences or needs with respect to cost, efficiency and also sovereignty, see the list of available models: https://me.sap.com/notes/3437766<br/>
More on the topic of Sovereignty: https://architecture.learning.sap.com/docs/ai-native-north-star-architecture/resilient-and-sovereign-cloud

<!-- Question 141 August/September 2026 -->
**Question: Agent Technology Stack**<br/>
What technology stack will be used to generate agentic solutions such as applications and workflows? Will established SAP technologies such as CAP, SAP Fiori, and SAP Build Process Automation continue to be used, or will workflows be replaced by n8n?

**Answer:** The target is not a complete replacement of established SAP development and workflow technologies. Agentic solutions are intended to combine applications, workflows, integrations, skills, and agents according to the needs of the business process.

At present, support or integration work is planned for technologies such as CAP, SAP Fiori, and React. n8n workflows are being considered for the relevant workflow scenarios. Architecturally, the important point is that applications and workflows remain part of the solution. 

<!-- Question 226 August/September 2026 -->
**Question: Agent Traceability**<br/>
How will the decisions, plans, reasoning steps, tool calls, and actions of AI agents be made transparent and auditable for end users, administrators, and auditors?

**Answer:** The target is to log agentic activities so that execution is traceable. Actions triggered in backend systems should continue to be handled and logged through the normal controls and audit mechanisms of those backend systems.<br/>
Agents will also persist context and reasoning artifacts across interactions as decision lineage: what information was known, what was considered, which option was chosen, and what outcome resulted. Human corrections are intended to become structured decision traces that contribute to a context graph combining semantics, decision history, and operational context.


## Foundation Layer

### Foundation Models and LLMs

<!-- Question 103 August/September 2026 -->
**Question: RPT Foundation Models**<br/>
How about RPT-1? Is it a third-party frontier model that SAP has further trained?

**Answer:** RPT-1, RPT-1.5 and higher are relational foundation models working on structured and tabular data. They are intended for the use cases regression, classification, and recommendation. SAP trains and provides these models as part of its AI capabilities for enterprise data scenarios.<br/>
For details, refer to the “SAP RPT-1 documentation”: https://help.sap.com/docs/sap-ai-core/generative-ai/sap-rpt-1<br/>
For a complete list of models, including LLMs and RPT, available through the Generative AI Hub, refer to the “Availability of Generative AI Models across Regions and their Limitations” (https://me.sap.com/notes/3437766).

<!-- Question 221 August/September 2026 -->
**Question: RPT Models Deployment and Productive Use**<br/>
What role do SAP foundation models, especially SAP-RPT-1, play in the AI-native North Star Architecture? Will they be consumable outside SAP AI Core or generative AI hub, and can customers self-host them?

**Answer:** SAP-RPT-1 has a specific role as a model for structured, relational business data. It is trained on enterprise data such as financial ledgers, transaction records, and supply-chain tables, enabling predictions without requiring customer-specific model training. It complements the large language models and other machine-learning approaches.<br/>
Self-hosting is not the intended productive deployment model. Although certain SAP-RPT models may be technically available through public channels such as Hugging Face (https://huggingface.co/SAP/sap-rpt-1-oss), this is for experimental purpose only and not approved for productive customer use. For productive enterprise scenarios, customers should use the SAP-hosted and governed models available through SAP AI Core and the generative AI hub.<br/>
See also the RPT Playground: https://rpt.cloud.sap/?c=aHVnZ2luZ2ZhY2U

<!-- Question 228 August/September 2026 -->
**Question: RPT In-Context Learning**<br/>
For in-context learning in RPT, does the context data need to include all relevant target values? Otherwise, how can the model know the correct value?

**Answer:** For a prediction or classification scenario, the context data defines the set of possible output values, the model cannot “invent” values. For regression, the target is a continuous numeric range, predicted values are calculated by regression and do not need to be exactly present as part of the context data.

### Knowledge Graph

<!-- Question 201 August/September 2026 -->
**Question: KG Governance**<br/>
Can customers inspect and, where appropriate, correct the content of the SAP Knowledge Graph? How are conflicting or contradictory facts resolved—for example, where SAP-delivered metadata and customer-specific extensions describe the same business concept differently?

**Answer:** The North Star Architecture describes SAP Knowledge Graph as the semantic backbone that connects API and service metadata, business semantics, data-product metadata, and customer-specific extensions such as custom fields, custom APIs, and tenant-specific configuration.<br/>
The long-term target is a customer-specific knowledge graph built on a shared enterprise ontology. Domain-specific knowledge graphs should retain autonomy while being connected through shared concepts, creating one logical view across the SAP landscape. This implies a need for governed maintenance, provenance, ownership, and conflict-resolution mechanisms for customer-specific content.<br/>
However, the Foundation Layer page does not yet specify the user interface, governance workflow, or conflict-resolution algorithm through which customers will inspect, amend, approve, or reconcile contradictory graph content.

<!-- Question 211 August/September 2026 -->
**Question: KG and Authorizations**<br/>
SAP Knowledge Graph includes authorization rules as data-product metadata. Are these rules descriptive only, or are they actively enforced during semantic traversal across entity and system boundaries? For example, if an agent moves from an S/4HANA supplier entity to an Ariba supplier entity, is authorization enforced at every source-system hop or according to the data product’s authorization model?

**Answer:** SAP Knowledge Graph provides semantic relationships and grounding; it does not enforce authorization decisions. Data-product access is governed through Authorization Management Service, and access checks apply when the consumer requests concrete objects or data.<br/>
In other words, the graph can help an agent discover that an S/4HANA supplier concept relates to an Ariba supplier concept, but it will not bypass the authorization checks of the relevant data product, API, or underlying access service. 

<!-- Question 215 August/September 2026 -->
**Question: KG and LeanIX Processes**<br/>
Will process knowledge from SAP LeanIX be incorporated into SAP Knowledge Graph?

**Answer:** Process knowledge from SAP LeanIX is expected to contribute to SAP Knowledge Graph, but this integration is still work in progress. Conceptually, LeanIX process and architecture knowledge will enrich the graph’s cross-domain business semantics and relationships among applications, processes, APIs, and enterprise entities.

<!-- Question 203 August/September 2026 -->
**Question: Custom Agent KG Access**<br/>
Will customer-developed agents be able to access SAP Knowledge Graph directly?

**Answer:** This is under discussion. The current working assumption is that agents running in the SAP context, especially Joule and Joule agents, will use SAP Knowledge Graph directly for grounding when accessing APIs and data products and other business entities.<br/>
For custom or external agents, the available integration model, direct graph-access APIs, authorization model, and contractual boundaries still need to be confirmed.

<!-- Question 232 August/September 2026 -->
**Question: KG Visibility**<br/>
How will SAP Knowledge Graph be made available to existing customer-managed LLM platforms, agentic platforms, and AI assistants, not only Joule? Where will the graph reside, and how can SAP-managed and customer-managed agents share or combine context to create a unified enterprise view?


**Answer:** The initial focus is on Joule and Joule agents using SAP Knowledge Graph within the SAP environment. The SAP Knowledge Graph will be the semantic backbone that grounds natural-language requests in SAP APIs, data models, business entities, and data products.<br/>
For external agents, the currently described direction is indirect use through agent-to-agent (A2A) interaction, rather than unrestricted direct access to the SAP Knowledge Graph. This can allow an external agent to delegate an SAP-specific task to a SAP-side agent that uses SAP Knowledge Graph and governed data products internally.<br/>
The long-term architectural vision is a customer-specific knowledge graph connected through a shared enterprise ontology, in which domain-specific graphs remain autonomous but interoperate through shared concepts. That direction shall support a more unified context across SAP and customer-managed domains.


### Business Data Cloud

Question 205/206: Custom Data Products 
How can a customer expose data from a custom SAP Business AI Platform application, for example, one built with CAP and SAP HANA Cloud, as a governed data product in SAP Business Data Cloud? What is the supported path for creating, publishing, and consuming it?


**Answer:** SAP’s BDC recognizes customer-defined data products alongside SAP-managed and partner-defined data products. In the target architecture, a data product is a curated, business-ready dataset with meaningful metadata, including ownership, schema, authorization rules, lineage, freshness, and lifecycle management. It is intended to be discoverable and consumable by analytics, data-science platforms, and AI agents. 
Reference Architecture: https://architecture.learning.sap.com/docs/ref-arch/519093<br/>
For custom data sources, the currently documented route is to integrate and model the data in SAP Datasphere, using its native connectivity and customer-managed storage and modeling capabilities. See also SAP’s BDC FAQ: https://community.sap.com/t5/technology-blog-posts-by-sap/sap-business-data-cloud-faqs/ba-p/14022781  <br/>
A Data Product Creation Agent is work in progress.

<!-- Question 208 August/September 2026 -->
**Question: BDC for Custom Development**<br/>
Can SAP Business Data Cloud—particularly SAP Datasphere and SAP Analytics Cloud—also be used as a development platform for custom applications and custom analytics where no standard SAP solution exists?

**Answer:** Yes, absolutely. SAP Datasphere and SAP Analytics Cloud can be used for customer-specific data integration, semantic modeling, analytics, planning, and custom analytical content. BDC is intended to combine governed SAP and non-SAP data with analytics, planning, data engineering, and AI/ML capabilities. SAP also positions the broader Business AI platform as the environment for building and operating AI-enabled solutions.

<!-- Question 209 August/September 2026 -->
**Question: Data Product Authorizations**<br/>
When sensitive S/4HANA cost-center, ledger, or other business data is published as a governed data product in SAP Business Data Cloud, does the original transactional authorization model travel with the data product?

**Answer:** Not necessarily. A data product has its own defined authorization rules and governed consumption model. Its access controls can be deliberately different from the authorization model of the originating transactional application, provided this is designed and governed appropriately.<br/>
A practical implication is that restricting direct access to source-system raw data does not automatically guarantee the same restriction in the data product. The data product’s own authorization design, including who can access which records, attributes, and derived metrics, must be defined, tested, and governed.<br/>
Illustration: A user might not be allowed to display individual S/4HANA journal entries in the transactional system, while the user may be allowed to consume an aggregated finance data product in SAC. That can be appropriate, but only if the data product’s authorization policy intentionally permits the aggregate while protecting disallowed record-level detail.

<!-- Question 220 August/September 2026 -->
**Question: Authorization and Result Completeness**<br/>
On Data Products: When users query a data product, how can they know whether the returned result set is complete? Are records excluded due to authorization reported separately—for example, as a count of suppressed records?

**Answer:** The expected behavior is analogous to conventional authorization-controlled reporting: users receive only the records they are authorized to access, while unauthorized records are not returned. The Foundation Layer emphasizes context engineering that filters unauthorized information before it reaches an agent or other consumer.

<!-- Question 233 August/September 2026 -->
**Question: Read-Write Interface Choice**<br/>
For an agent that must perform write operations, when should it use BDC data products and when is an MCP server or application API the better approach?

**Answer:** Use governed BDC data products primarily for read-oriented, analytical, and cross-domain scenarios, such as aggregations, statistics, planning, trend analysis, or questions that combine data across lines of business. Data products are the curated and governed interfaces for dashboards, data science, and Joule-supported AI agents.<br/>
For transactional or write scenarios, application APIs exposed through an MCP server are usually the better fit. Customer-specific MCP servers can be enabled on the basis of public APIs and made available to SAP-side agents. A write action should be processed by the owning application through its established write API, validation logic, business rules, and authorization checks.<br/>
See also SAP API Policy: https://help.sap.com/doc/sap-api-policy/latest/en-US/API_Policy_latest.pdf 

## Platform Layer

<!-- Question 136 August/September 2026 -->
**Question: Central Agent Management**<br/>
How can an enterprise manage custom agents centrally? Will there be a consolidated view of agents, their dependencies and access rights, as well as monitoring capabilities?

**Answer:** SAP LeanIX Agent Hub is the place for managing and governing custom agents centrally. The intended operating model also includes lifecycle management of agentic solutions and their dependencies. The Process Layer describes a solution as more than one isolated agent: it can include applications, workflows, one or more agents, APIs, and related dependencies, managed together as a deployable solution with a shared lifecycle.<br/>
For runtime observability, OpenTelemetry-based monitoring of agents and applications, including operational health, agent actions, reasoning context, and invoked services will be used.

<!-- Question 140 August/September 2026 -->
**Question: Agent Deployment**<br/>
How are agents deployed? Are they automatically deployed to SAP BTP or the SAP Business AI Platform?

**Answer:** Yes. The expected deployment model is deployment to an automatically provisioned SAP Business AI Platform environment and its unified agent runtime.<br/>
Both creation paths, pro-code development with an agent SDK as well as prompt-driven development through Joule Studio, produce the same canonical, code-based artifact and deploy to the same runtime. This supports portability, version control, auditability, and a consistent operational model.

<!-- Question 150 August/September 2026 -->
**Question: Agent Lifecycle Management**<br/>
How will lifecycle management work for agentic solutions? If a change is required, how will the solution be modified, tested, versioned, and redeployed?

**Answer:** The objective is to manage agents together with their dependencies, such as APIs, backend services, integrations, skills, applications, and workflows, and to control initial deployment and redeployment accordingly. Details are work in progress.

<!-- Question 301 August/September 2026 -->
**Question: Sovereign Cloud Deployment**<br/>
The infrastructure layer relies on hyperscale cloud providers. How does the architecture address customers’ sovereignty requirements, for example, where workloads must not run on non-sovereign public-cloud infrastructure or need to remain within a specific jurisdiction?

**Answer:** Yes. SAP’s multitier cloud deployment model includes public cloud, private cloud, SAP Sovereign Cloud offerings, and SAP Sovereign Cloud On-Site offerings for customer-selected or customer-owned data centers. These options are intended to support control over data, infrastructure, compliance, and the use of compliant large language models in line with local legal and regulatory requirements. Work on sovereign cloud capabilities involves SAP, hyperscalers, and other service providers and is in progress.<br/>
North Star section: https://architecture.learning.sap.com/docs/ai-native-north-star-architecture/resilient-and-sovereign-cloud

<!-- Question 306 August/September 2026 -->
**Question: Agent Extensibility Model**<br/>
How can customers extend or adapt SAP-delivered agents? In particular, will there be an approach comparable to traditional customer-specific enhancements, but without directly modifying SAP-delivered code?

**Answer:** An extensibility approach is being designed and developed. The direction includes extensions through tools, skills, and pre- and post-execution hooks, while retaining platform governance and lifecycle management. Further details will evolve in upcoming iterations and through early-adopter feedback.

<!-- Question 311 August/September 2026 -->
**Question: Services and Connectivity in Managed Runtime**<br/>
What connectivity model will enable CAP applications running in the managed runtime to access other CAP-based services in the managed runtime? More specifically, can declarative deployment and service configuration, for example through assets.yaml, be used to connect a CAP service to managed-runtime services, beyond simply exposing agent-to-agent connectivity?

**Answer:** This is a valid requirement and is technically feasible in principle. The exact connectivity model, supported configuration, and timeline for general availability are still being clarified.
