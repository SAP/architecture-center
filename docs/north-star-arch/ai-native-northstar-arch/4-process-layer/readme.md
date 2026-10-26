---
id: id-nsa-4
sidebar_position: 4
slug: /ai-native-north-star-architecture/process-layer
sidebar_custom_props:
    category_index: []
title: Process Layer
description: >-
    The AI-native Process Layer shifts business logic from rigid application-bound workflows to agent-driven orchestration. Applications become capability providers, agents reason across domains using a reason-act-observe loop, and Joule Studio unifies the design-time for building agentic solutions from intent to production.
keywords:
    - process layer
    - agentic orchestration
    - capability providers
    - Joule Studio
    - agent runtime
    - reason-act-observe loop
    - deterministic execution
    - agent SDK
    - AI Golden Path
    - business process automation
    - domain agents
    - procurement agent
    - SAP Signavio
    - SAP LeanIX
    - SAP Knowledge Graph
    - agentic solution
    - pro-code agents
    - low-code agents
    - North Star Architecture
    - NSA
sidebar_label: 4. Process Layer
image: img/ac-soc-med.png
tags:
    - ai-native-north-star
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
pagination_prev: north-star-arch/ai-native-northstar-arch/user-experience-layer/id-nsa-3
pagination_next: north-star-arch/ai-native-northstar-arch/foundation-layer/id-nsa-5
contributors:
discussion:
last_update:
    author: SAP
    date: 2026-10-26
---

<div className="nsa-float-image" style={{ float: 'right', marginLeft: '20px', width: '30%', maxWidth: '320px' }}>

![executive-summary](images/process-layer-ai-native.png)

</div>

<p style={{ textAlign: 'left' }}>

The process layer is where business logic is defined, and where the shift from rigid, predefined paths to agent-enabled orchestration takes shape. A simple request, such as hiring third-party developers can involve procurement, legal, finance, IT, and supplier management, each with its own systems and approval chains. End-user workflows are constantly evolving and increasingly complex, spanning multiple stakeholders across heterogeneous landscapes. The AI-native architecture transforms how business processes are executed, from logic embedded in applications into a model in which applications, workflows, integration, and agents collaborate to deliver outcomes.

The shift from AI-first to AI-native redefines how process logic is structured and executed.

</p>

<div style={{ clear: 'both' }}></div>

In the AI-first model, AI assists process execution within application boundaries: automating steps and suggesting actions but scoped to individual products. In the AI-native model, applications become **capability providers**, exposing stable APIs, events, and data that agents can discover and invoke. This enables business process innovation through a deliberate mix: AI handles tasks requiring complex reasoning while deterministic execution helps ensure reliability for specific processes. Both paths extend the reach of the system of context across the enterprise. Critically, agent development is decoupled from application release cycles, agents sit on top of applications, not inside them, so innovation is no longer gated by upgrade timelines. This is not a replacement of deterministic development as CAP, ABAP Cloud, and workflow automation remain foundational. The shift is that these systems no longer just serve as applications users operate but they become software that acts, with agents executing across the landscape rather than within the boundaries of applications.

The process layer today rests on the Golden Path, a standardized development model using CAP, ABAP Cloud (RAP), Fiori UIs, and SAP BTP services that delivers established cloud qualities, built-in standards, and high developer experience. The SAP Build family (Build Code, Build Work Zone) provides low-code and pro-code development environments. Structured process orchestration runs on SAP Build Process Automation (SBPA). For existing applications not on the Golden Path (for example Signavio, LeanIX, WalkMe), the evolving AppFND SDKs and abstractions provide a convergence path toward SAP's enterprise qualities and standards. This deterministic foundation remains the backbone of the AI-native architecture.

## How the Application and Agent Development Layer is Architected
The Process Layer supports both structured workflow execution and agent-driven execution. It is structured into three sub-layers bridging deterministic logic with adaptive intelligence.

<div className="nsa-float-image" style={{ float: 'left', marginRight: '20px', width: '45%', maxWidth: '500px' }}>

![process-layer-arch](images/process-layer-arch.png)

</div>

<p style={{ textAlign: 'left' }}>

The **App Dev and Workflow Layer** represents the deterministic backbone. Applications continue to be built following the Golden Path and process orchestration runs on SBPA for deterministic workflows and automations, extended by n8n for customer-facing agentic workflow scenarios. All APIs, events, and data exposed by these applications are described using Open Resource Discovery (ORD) serving as contract surface and published into the Unified Metadata Service (UMS). Joule and agents use this metadata to discover available capabilities, while declared dependencies, managed provisioning, and access policies establish the integrations needed to invoke them.

</p>

<div style={{ clear: 'both' }}></div>

The Bridge Layer connects deterministic applications to agentic systems. The Agent Gateway serves as the mandatory hub for all agent-to-tool and agent-to-agent connections, exposing business logic through [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) for tool invocation and [Agent2Agent (A2A)](https://sap.sharepoint.com/sites/209131/Shared Documents/Forms/AllItems.aspx?id=%2Fsites%2F209131%2FShared%20Documents%2FWG%20AI%2FWG%5FAI%5FWhitepaper%5FAgent%5FInteroperability%2Epdf&parent=%2Fsites%2F209131%2FShared%20Documents%2FWG%20AI) for multi-agent coordination. It provides a unified tool catalog and is embedded with MCP Builder runtime to translate existing APIs into MCP-compliant tools. Current [directives from the Office of the CTO (OCTO)](https://github.tools.sap/OCTO/CTOCircle/blob/main/cto-memo.md) ensure that MCP servers exposing semantically rich business data remain internal to SAP preserving SAP’s data access and egress strategy. This gateway enforces landscape boundaries through formations, fine-grained tool access policies via AMS, and human-in-the-loop routing through Task Center or an active Joule session. Agent Gateway enforces platform access policies, while applications continue to enforce their own business authorizations. Joule and domain agents plan the work and select tools; the gateway provides controlled access to those tools.

The **Agentic layer** is where the magic happens that extends deterministic systems with adaptive intelligence while preserving enterprise control. Joule acts as the top-level orchestrator, performing Planning & Task Decomposition, invoking skills, and delegating tasks to domain-specific assistants or 3rd party agents via the Agent Gateway, while continuously using Reflection to evaluate progress. These domain-specific assistants in turn coordinate Joule Agents, Skills, and Subagents to solve complex, multi-step business problems, forming a multi-level orchestration model that can fan out work in parallel. Beyond real-time execution, the layer also supports long-running tasks such as deep research, where durability, state persistence, and resumability are essential. Underpinning all of this, the Foundation Layer provides the memory, extensibility, and continuous evaluation capabilities that agents need to operate reliably and improve over time.  App Foundation is the default runtime for SAP-hosted code-based agents, subject to approved exemptions (see Chapter 6); agents operate across multiple systems through the Bridge Layer.

When an agent needs human input, Agent Gateway will route the request to the calling interface if it can handle human interaction, or to Task Center for asynchronous handling. Work can then pause and resume after the user responds, even if the original conversation has closed.

### How agents are built

SAP supports building solutions across the determinism-autonomy spectrum: deterministic apps and workflows for predictable control flow, bounded agents with defined toolsets and guardrails, and open-ended agents for complex reasoning with broader autonomy. Where a task belongs on this spectrum is a design decision, and most solutions combine several points.

![img](images/spectrum.png)

For code-based agents, SAP converges on code as the canonical representation, with two creation paths producing the same portable, version-controlled artifact: a pro-code path using standardized agent SDKs in any IDE, and a prompt-driven path where natural language is translated into inspectable code. App Foundation is the default runtime for SAP-hosted code-based agents from either path, subject to approved exemptions. Agents are registered in UMS for discovery and made available to Joule for orchestration. Existing content-based agents on BAF will be converted to code-based agents during a coexistence period.

Agent Skills complement code-based agents. A skill packages instructions and supporting resources that Joule or another agent loads into its own context when needed. Domain experts can contribute natural-language instructions without implementing a complete agent. Code-based agents expose their own interfaces, run with a separate context, and control their execution and state. Skills suit work with many conversational or process variations and knowledge reused across agents. Code-based agents suit high-volume tasks and flows requiring precise control over execution and state. They are also appropriate when proprietary expertise must remain undisclosed, since skill instructions can be exposed to consumers. The two approaches can be combined, with code-based agents loading reusable skills where useful. Agents built in Joule Studio are moving toward a skill-based model: a generic, managed agent harness runs the reasoning loop and loads the agent’s skills and tools, started for each request and scaled down when idle. Even then, as much logic as possible belongs in tools, because code is cheaper and deterministic, while skills carry only the judgment that needs a language model.

![img](images/agent-architecture.png)

Business solutions combine these capabilities. A procurement solution, for example, can bring together an application for purchase requisitions, a workflow for spend approval, and agents for supplier selection and contract compliance. The target is to manage their dependencies, provisioning, and promotion as a coordinated solution, so customers can adopt the business capability without assembling its technical components individually.

SAP's development flow is intent-driven: starting from business intent and moving through a Product Requirements Document, Specification, and Code generation all the way to Deployment, turning enterprise goals into agentic solutions. This pipeline is not tied to a single tool. Developers can work in Joule Studio with its browser-based coding agent, use AI-powered coding agents in any IDE or terminal (Claude Code, Cursor, and others). What makes this work across all of them is that SAP's differentiating context (process knowledge from Signavio, landscape data from LeanIX, existing product functionality from [Enterprise Knowledge Exploration](https://community.ekx.cloud.sap/), and domain models from the Knowledge Graph) is delivered as portable skills and MCP configurations. 

![Agentic Solution](images/agentic-solution.png)

The same approach extends to transformation and migration. In the AI-first model, moving from legacy to cloud is human-led and labor-intensive. In the AI-native model, agents accelerate code migration, data transformation, and test automation, reducing modernization time, risk, and downtime.

Every agent in the SAP landscape has a governed identity, registered in SAP Cloud Identity Services with clearly defined authorizations. Agent Gateway enforces access to agents and tools, while applications retain their business authorization checks. Agents can act with scoped permissions delegated by a user or with permissions assigned to their own identity. Third-party agents operate under the same identity and access controls. SAP AI Agent Hub surfaces ownership and governance information from the relevant provisioning and discovery services, as described in Chapter 7. SAP-built agents are unexposed to third parties by default; external exposure requires an explicit opt-in through ORD visibility, at which point the publishing team accepts the same stability and versioning obligations as any external API. The Agent Gateway enforces this at runtime, filtering incoming A2A requests against declared visibility. 

The AI Golden Path provides the end-to-end guide for building agents through either authoring path. App Foundation supplies managed execution, metering, observability, and declared extension mechanisms; approved runtime exemptions must provide equivalent enterprise qualities. Agent observability and evaluation will use MLflow (Aeval), as described in the Foundation Layer, to assess technical performance alongside process KPIs and business outcomes. 

The Process Layer will continue converging deterministic and adaptive execution, with agents gaining deeper reasoning through neuro-symbolic and policy-based extensions, and increasingly autonomous operation across enterprise landscapes while governance scales in lockstep. The foundation layer powers these applications and agents with the data, reasoning, and memory they need.