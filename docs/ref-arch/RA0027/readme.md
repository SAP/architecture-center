---
id: id-ra0027
slug: /ref-arch/Wkx_MW3H
sidebar_position: 27
title: 'test nk- teched'
description: 'This is a default description.'
keywords: 
  - agents
sidebar_label: 'test nk- teched'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - agents
contributors:
  - navyakhurana
last_update:
  date: 2025-11-18
  author: navyakhurana
---

**Agent Development Framework: Content-Based and Code-Based Agents**

**1.1 Overview**

**Content-Based Agents** are intelligent, business-context-driven agents built and executed within the SAP ecosystem using low-code/no-code tooling such as SAP **Joule Studio**, SAP Business Agent Foundation (BAF), and **Generative AI Hub**.They are designed for **rapid development through configuration rather than coding**, enabling organizations to automate domain-specific tasks securely within SAP’s compliance framework.

These agents leverage **structured business content**, **semantic context**, and **SAP-integrated orchestration** to deliver AI-powered automation across SAP and third-party landscapes — all within the customer’s managed BTP environment.

**Typical use cases include:**

- [Screening candidates or ranking profiles against job criteria.](https://ai-agent-beta-joule-eu12-internals-only.eu12.sapdas.cloud.sap/webclient/standalone/da_niteshagentpoc)
- Retrieving KPIs and generating conversational business insights.
- Automating approval flows or generating summaries based on structured SAP data.

**Key characteristics:**

- Built and operated within the customer’s SAP BTP tenant.
- Managed runtime and scalability via SAP BTP and Generative AI Hub.
- Low-code configuration of skills, intents, and orchestration logic.
- Secure data handling within SAP’s trust boundary and compliance standards.
- Governed by SAP’s Data Protection, Security, and Trusted AI principles.

**1.2 How to Build**

**Tools:** SAP Joule Studio, SAP Business Agent Foundation (BAF), Generative AI Hub

**Process:**

1. **Identify the use case:**Define the business objective and validate feasibility within the SAP AI stack.*Refer: *[*SAP Reference Architecture – AI Agents & Agent Builder*](https://architecture.learning.sap.com/docs/ref-arch/e5eb3b9b1d/5)
2. **Design the agent or skill:**
3. - Define intents, entities, and actions.
- Model orchestration logic in Joule Studio or Agent Builder.
- Integrate with SAP data or APIs (OData/REST).

*For more details on leveraging AI Agents within Joule Studio’s Agent Builder, see *[*Extend Joule with Joule Studio*](https://architecture.learning.sap.com/docs/ref-arch/06ff6062dc)*.*

1. **Add business context & reasoning:**
2. - Leverage structured SAP data models or business content.
- Configure reasoning and rules using Joule skill recipes or natural-language queries.
3. **Validate and deploy:**
4. - Deploy to the target BTP tenant.
- Conduct functional and compliance testing.
- Register the agent in the internal catalog for reuse and discoverability.

*Note: This is a work in progress, refer *[*PRD- Agent Registry*](https://sap.sharepoint.com/:w:/r/teams/BusinessAI-Agents/Shared%20Documents/Business%20AI%20-%20Agents/9%20-%20Documents/PRD-Agent%20Registry.docx?d=w8bac04ba72e846099d2ce924da13b8d6&csf=1&web=1&e=wTvmUj)* for more details*

**1.3 Data Handling and Legal Requirements**

- Use [synthetic or sample data](https://github.tools.sap/CIS-Solution-Acceleration/adani-rag-usecase-v2/tree/main/frontend/test_excels) during early prototyping.
- When handling customer data:
- - Ensure a valid Data Processing Agreement (DPA) with SAP.
- Define and document data scope, masking, and retention policies.
- Prevent personal data transfers outside the SAP ecosystem.
- Follow SAP Data Protection and Privacy (DPP) and GDPR compliance guidelines.
- Access AI models via AI Core or Generative AI Hub in a compliant and auditable way.

*Note: Always ensure that no SAP business data is exposed to external world via APIs or other protocols like MCP. Refer *[*OCTO guidelines*](https://github.tools.sap/OCTO/api-mcp-gov-intake)* for more details.*

**1.4 Security, Compliance, and Monitoring**

- Data and execution remain within SAP BTP’s secure infrastructure.
- Access controlled through SAP Identity and Access Management (IAM).
- Encryption of data in transit and at rest using SAP-approved ciphers.
- Continuous logging, tracing, and monitoring via the BTP observability stack.
- Adhere to SAP Trusted AI Principles — fairness, transparency, privacy, and accountability.
- Conduct regular reviews for bias, prompt integrity, and data safety.

**1.5 Limitations and Best Practices**

Area

Current Limitation

Recommended Practice

Agent Lifecycle Management

Limited built-in lifecycle control

Supplement with orchestration-level dashboards and logs

Agent Explainability

No native full reasoning trace

Capture trace logs and metadata manually

Feedback & Continuous Learning

Centralized feedback loop not yet supported

Perform manual evaluation during pilot or POC phase

Multi-Agent Orchestration

Limited direct agent-to-agent communication

Use a central orchestrator with delegation logic

**2.1 Overview**

Offering maximum flexibility, Code-Based Agents enable developers to implement bespoke logic and fine-tuned workflows directly on SAP BTP, making them ideal for complex business requirements that go beyond low-code configurations.

They leverage popular frameworks such as LangGraph, AutoGen, CrewAI, or smolagents to deliver:

- Custom Workflows: Full control over reasoning steps, tool orchestration, and memory.
- Tailored Integrations: Bespoke connectors and adapters for complex landscapes.
- Advanced Use Cases: Ideal for scenarios that require deep customization or code-level intervention.

**Typical Examples**

- Intelligent workflow coordinators integrating SAP and third-party systems.
- [Multi-agent orchestration for procurement or supply chain optimization with complex agent interactions involving protocols like A2A and MCP.](https://github.tools.sap/CIS-Solution-Acceleration/trade-guardian)
- [Domain-specific automation requiring bespoke logic beyond low-code configurations.](https://github.tools.sap/CIS-Solution-Acceleration/Smart-Retail-Shelf-Copilot)

**Key Characteristics**

- Fully developed, deployed, and operated by customer or partner development teams.
- Executed on **SAP BTP** (preferred) or approved cloud infrastructure.
- Full control over orchestration logic, integrations, and monitoring.
- Must comply with SAP’s **API, security, and data protection** standards when connecting to SAP systems.

**2.2 How to Build**

**Recommended Frameworks**LangGraph, CrewAI, Semantic Kernel, AutoGen, or custom orchestration frameworks.

**Development Process**

1. **Define Use Case and Agent Roles** – Establish goals, tasks, and decision boundaries.
2. **Design Agent Graph** – Define nodes, state transitions, and communication flow.
3. **Integrate with SAP Systems** – Connect via OData, Graph API, or SAP-provided adapters.
4. **Implement Multi-Agent Orchestration** – Define collaboration, delegation, and control flow.
5. **Validate and Test** – Use synthetic data and run controlled evaluations before production.
6. **Deploy** – Host on **SAP BTP (Kyma or Cloud Foundry)**

The diagram below illustrates the agent’s actions cycle at runtime, which could repeat multiple times till the goal is declared achieved by the LLM. The numbered steps correspond to:



1. **Input & Orchestration**: The user’s request and Recipe logic are ingested by the LLM.
2. **Guidance**: The Recipe supplies a plan based on orchestration rules and schema/metadata to steer the LLM’s planning.
3. **Tool Invocation**: The LLM selects and invokes the appropriate Tools, using the Knowledge.
4. **Observation**: Tool outputs are captured and fed back into the LLM for further reasoning.
5. **Final Output**: Once the goal is achieved, the agent emits the final response.

**2.3 Key Protocols: A2A and MCP**

[**Agent-to-Agent (A2A)**](https://architecture.learning.sap.com/docs/ref-arch/e5eb3b9b1d/8)

- Enables direct, secure communication between agents or skills within SAP or hybrid landscapes.
- Supports message passing, task delegation, and lifecycle metadata exchange.
- Custom A2A adapters can be developed and registered in internal registries.
- Must use **secured SAP channels**; public API exposure is prohibited.

**Model Context Protocol (MCP)**

- Defines a standardized interface for context exchange between agents, models, and tools.
- Facilitates secure, interoperable model invocation across distributed systems.
- Host any custom MCP servers on **SAP BTP** to maintain compliance and observability.
- Never transmit SAP-internal or customer data to public MCP endpoints.

**2.4 Hosting and Security Considerations**

- Prefer deployment on **SAP BTP** for integration with IAM, audit, and observability services.
- If hosted externally, maintain equivalent levels of **encryption, access control, and auditability**.
- Use **Generative AI Hub** or **AI Core** for secure, compliant model access — avoid raw LLM API calls.
- Apply **network zoning** and **token-based access control** for agent-to-agent and tool communication.
- Maintain strict segregation between **development**, **staging**, and **production** environments.

**2.5 Governance, Observability, and Lifecycle**

- **Agent Registry:** Maintain an inventory of all agents, including ownership, purpose, and access policies.
- **Monitoring:** Use observability dashboards to track latency, usage, cost, and error rates.
- **Evaluation:** Conduct periodic testing for accuracy, reliability, and compliance.
- **Feedback Loops:** Integrate human-in-the-loop or reinforcement feedback mechanisms.
- **Versioning:** Manage code through Git and enforce approval gates for deployment.
- **Sunset Policy:** Decommission outdated agents following dependency and risk assessment.

**2.6 Agent Memory and Context Management**

**Overview**Agent memory defines how contextual data is retained and reused across interactions. Proper design improves reasoning and efficiency, while weak controls increase compliance risks.Memory mechanisms in SAP-integrated agents must be **deterministic, auditable, and privacy-safe**.

**Types of Memory**

- **Ephemeral Memory:** Session-level; cleared after completion. Best for transactional tasks.
- **Persistent Memory:** Retained across sessions for analytics or evaluations. Must store only **encrypted, non-sensitive metadata**.
- **Contextual Memory:** External knowledge (e.g., vector stores, knowledge graphs) hosted within **SAP BTP** or tenant-approved secure zones.

**Best Practices**

- Keep memory **minimal, purpose-specific**, and bounded.
- Host all stores within **SAP BTP** or private network boundaries.
- Store only **embeddings or anonymized metadata**—never raw SAP or customer data.
- Apply **access controls, encryption, TTL expiry**, and **redaction** for sensitive context.
- Log all memory **read/write operations** for auditability and explainability.
- Use **context windows** efficiently to inject only the minimal relevant context.

**Architecture Guidance**

- Implement a **Memory Controller** for managing read/write logic, encryption, and retention.
- Use **LangGraph** or **CrewAI** memory modules for dynamic context handling.
- Combine **short-term cache** with **long-term vector memory**, aligned with **SAP DPP** standards.
- Audit, retrain, and purge memory stores periodically to maintain compliance and accuracy.

**2.7 Agent Feedback and Continuous Learning**

**Overview**Feedback loops enable continuous improvement of agents while ensuring governance, safety, and compliance. All feedback processes must remain **controlled, auditable**, and **privacy-respecting** — no direct retraining on live or sensitive data.

**Types of Feedback**

1. **Automated (System-Driven):**
2. - Derived from logs, performance metrics, and evaluations.
- Supports incremental tuning within defined thresholds.
- Operates as a **closed loop** — no direct self-learning.
- *Example:* Lowering confidence thresholds after frequent user escalations.
3. **Explicit (User-Driven):**
4. - Gathered via user ratings or feedback prompts (“Was this helpful?”).
- Aggregated for manual or semi-automated review to mitigate bias.
- *Example:* Negative feedback triggers human review before adjustments.

**Best Practices**

Aspect

Recommendation

Purpose

Feedback Capture

Instrument APIs or endpoints to collect structured feedback

Ensures data completeness

Data Handling

Store feedback separately, anonymize, and manage consent

Maintains privacy compliance

Analysis Pipeline

Use SAP BTP analytics and observability tools

Enables measurable performance insights

Feedback Incorporation

Automate only low-risk updates; route strategic insights for manual review

Balances learning with control

Human-in-the-Loop (HITL)

Validate all reasoning or prompt changes before rollout

Ensures accountability

Explainability

Log rationale behind feedback-driven modifications

Improves transparency and traceability

**Architecture Guidance**

- Implement a **Feedback Manager** to collect, score, and route feedback.
- Integrate with **LangGraph evaluators** or **SAP AI Core** for scoring pipelines.
- Use **SAP Event Mesh** for asynchronous feedback ingestion.
- Provide **versioned feedback APIs** with consent logging and audit trails.
- Publish periodic **performance dashboards** for continuous visibility and governance.

**Summary**

Aspect

Content-Based Agents

Code-Based Agents

Development Model

Low-code configuration via Joule Studio & Agent Builder

Code-first, developer-managed implementation

Control Level

SAP-managed orchestration and runtime

Full control of orchestration, deployment, and logic

Security Boundary

Within SAP-managed BTP environment

Developer-defined, aligned with SAP compliance standards

Best For

Business-content automation and rapid rollout

Complex, multi-agent, or cross-system workflows

Compliance

Inherent in SAP-managed runtime

Developer responsibility under SAP AI governance

Examples

Joule skill for candidate screening, KPI insights

Multi-agent procurement optimizer, workflow coordinator

**Choosing the Right Approach**

In most cases, **Content-Based Agents** should be the default, as they minimize maintenance and accelerate deployment. The choice depends on the balance between speed, maintenance effort and level of customization your project requires:

- Use **Content-Based Agents** when speed, ease of integration and SAP alignment are priorities.
- Choose **Code-Based Agents** when fine-grained control, advanced customization, or non-standard integrations are required.



