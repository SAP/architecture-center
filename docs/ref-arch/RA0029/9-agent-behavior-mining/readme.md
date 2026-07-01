---
id: 3c8d50
slug: /ref-arch/3c8d50
sidebar_position: 9
title: Agent Behavior Mining
description: >-
  Learn how SAP Signavio enables organizations to observe, analyze, and optimize
  AI agent behavior through native agent mining capabilities—covering behavioral
  tracing, impact measurement, cost monitoring, data privacy, and multi-tenancy.
keywords:
  - sap
  - signavio
  - agent mining
  - agent behavior mining
  - process intelligence
  - ai agents
  - observability
  - joule
  - opentelemetry
sidebar_label: Agent Behavior Mining
image: img/ac-soc-med.png
tags:
  - agents
  - genai
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors: 
discussion: 
last_update:
  author: gabriel-kevorkian
  date: 2026-06-02
---

:::info Disclaimer
This page describes the planned agent mining model for the next generation of SAP AI agents built on Joule Studio 2.0 which is yet to be made generally available (GA). It does not apply to the current agent implementations described in the other pages of this section. Those architectures remain valid for their respective scenarios, but they do not yet participate in the mining flow described here.

The content here should thus be read as forward-looking architectural guidance. Product details, supported agent types, and operational specifics may evolve before general availability.
:::

As agents operate autonomously across enterprise processes, understanding *what* they do, *why* they make the decisions they make, and *what they cost* to run becomes as important as building them in the first place. Visibility is critical as agents that perform well in controlled settings may behave differently when deployed in production, potentially operating inefficiently, unpredictably or non-compliantly.

Agent behavior mining addresses this gap. It brings observability, accountability, and continuous improvement to AI agent deployments by leveraging agent telemetry data, surfacing behavioral patterns, and linking agent actions to measurable business outcomes. SAP Signavio supports this with the introduction of a dedicated agent mining connector to ingest agent execution data into Process Intelligence and of a specialized dashboard template delivering insights on agent operations.

## Agent Mining as Part of AI Agent Excellence

Agent mining is one of four complementary pillars that together form SAP's approach to responsible, high-performance AI agent adoption:

1.  **Agent Discovery** — Identify the right processes and opportunities where AI agents can deliver the greatest impact.
2.  **Agent Context** — Provide agents with the process knowledge and compliance parameters they need to act responsibly and effectively.
3.  **Agent Mining** — Observe and analyze how agents actually behave in operation: what decisions they take, how they perform, and what they cost.
4.  **Agent Value Impact** — Quantify the business value agents deliver, such as efficiency gains, cost reductions, or improvements to customer experience.

Together, these pillars ensure that organizations not only deploy agents, but continuously learn from and improve them—building AI automation that is governed, measurable, and trusted.

## What Agent Mining Enables

Agent mining in SAP Signavio provides the following core capabilities:

-   **Behavioral tracing:** Understand how an agent navigates process steps, reaches decisions, and adapts to context—across individual executions and over time.
-   **Process conformance:** Verify that agents operate within the boundaries defined by the organization — detecting deviations from approved process paths, policy constraints, or compliance rules before they become issues.
-   **Impact analysis:** Measure the effect agents have on process KPIs such as cycle time, exception rates, and throughput.
-   **Cost monitoring:** Track computational and LLM-related costs per agent execution to identify cost drivers and ensure cost-efficient operation.
-   **Performance benchmarking:** Compare agent behavior across versions or configurations to identify regressions and validate improvements.
<!-- not sure about this part in the initial release -   **Multi-agent analysis:** In systems where multiple agents collaborate, detect coordination gaps, unnecessary handoffs, and opportunities to optimize orchestration logic—going beyond what any individual agent's metrics can reveal. -->

## Architecture

![drawio](./drawio/architecture.drawio)

Agent behavior mining relies on OpenTelemetry traces emitted by AI agents built with Joule Studio 2.0. Once mining is enabled for an agent type and an Agent Mining connection is configured in Signavio Process Intelligence, trace data is routed to the AI Agent Mining connector and normalized into an event log structure that Process Intelligence can consume.

From there, Process Data Management pipelines can transform and load the data for analysis. A dedicated agent mining value accelerator provides standard behavioral analytics, dashboards, and insights for process analysts. Further analyses can be envisioned with the incorporation of agent data into standard business process mining pipelines (see [Unlocking new scenarios](#unlocking-new-scenarios) section).

## Supported Agents

The mining flow described in this section is intended for SAP AI agents built on Joule Studio 2.0.

The key pre-requisites for this support model are that these agents are exposed through LeanIX Agent Hub and emit the OpenTelemetry traces in the format expected by the AI Agent Mining connector. Support for agents outside this model, including agents built outside the SAP ecosystem, is a future direction.

Mining is configured at the **agent type level** per customer tenant, not at the level of individual running instances. Enabling or disabling mining for an agent type, which is done in LeanIX, applies uniformly to all instances of that agent type belonging to that tenant.

## Multi-Tenancy

Many enterprise agents are designed to serve multiple customer tenants — a single deployed agent type may process requests on behalf of different organizations or business units. Agent mining supports this model: telemetry is captured and isolated per customer tenant, and mining can be enabled or disabled independently for each combination of agent type and tenant.

Per-tenant granularity also aligns with data residency and governance requirements: each tenant's event log data is stored and delivered in isolation throughout the pipeline.

## Data Privacy

Agent traces may contain sensitive data depending on what agents process and log during execution. In spite of trace pre-processing to perform anonymization and/or pseudonymization, it may still be the case that some data reaching Process Intelligence includes personally identifiable information (PII) or other sensitive content. For this reason, architects should double-check the data before granting broader access.

## Unlocking new scenarios

Agent behavior mining focuses on what agents do in isolation: how they navigate process steps, where they deviate, and what they cost to run. Joining agent execution data with regular process execution data to understand the business-level impact of introducing agents is the next step.

By correlating agent traces with the broader event logs that capture how a business process runs end-to-end, organizations can compare how processes performed before and after the introduction of AI agents: did cycle times improve? Did exception rates drop? Did the introduction of an agent shift where bottlenecks occur? These questions cannot be answered by looking at agent telemetry alone but by combining with regular process execution data coming from other Business Solutions.

This closes the loop on the **Agent Value Impact** pillar of SAP's [AI Agent Excellence](https://www.sap.com/products/artificial-intelligence/ai-agent-hub.html) vision. The goal is not just to confirm that agents operate as designed, but to quantify whether their introduction actually delivers the business outcomes that justified deploying them — providing a rigorous, data-driven foundation for decisions about scaling, replacing, or decommissioning agents across the organization.

## Services and Components

-   [SAP Signavio Process Intelligence](https://help.sap.com/docs/signavio-process-intelligence?locale=en-US)
-   [SAP LeanIX Agent Hub](https://help.sap.com/docs/leanix/ea/ai-agent-hub?locale=en-US)
-   [Joule Studio - AI First development environment](https://www.sap.com/products/artificial-intelligence/joule-studio.html)
