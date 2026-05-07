---
id: id-ra0030-v5
slug: /ref-arch/a3f7c2d1e8-v5
sidebar_position: 30
sidebar_custom_props:
  category_index:
    - genai
    - appdev
title: Agentic Engineering for SAP Extensions
description: >-
  Agentic engineering for BTP Extensions: context engineering, grounding through MCP
  servers and SDKs, multi-agent orchestration and architecture patterns for
  AI-native development on SAP BTP.
sidebar_label: Agentic Engineering for SAP Extensions
keywords:
  - sap
  - agentic engineering
  - context engineering
  - grounding
  - mcp servers
  - ai coding agents
  - sap ai core
  - SAP Fiori CAP UI5
  - sap btp
image: img/ac-soc-med.png
tags:
  - genai
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
contributors:
  - guilherme-segantini, mponce
discussion:
last_update:
  author: guilherme-segantini
  date: 2026-04-29
---

AI coding agents generate code rapidly, but ungrounded generation compounds costs across quality, security, rework and time to value. Without authoritative sources these agents produce code based on incorrect APIs, deprecated patterns and insecure dependencies. Agentic engineering with context engineering addresses this by connecting coding agents to an infrastructure of SAP knowledge sources, automated quality pipelines and governed model access. Generated code is produced rapidly with quality appropriate for enterprise deployment.

This reference architecture defines the system that enables agentic engineering to accelerate BTP extensions while preserving the clean S/4HANA core. Context engineering is central: developers and agents co-create specifications before code generation begins, agents follow authoritative SAP knowledge sources, code is produced in parallel across isolated worktrees, and LiteLLM with SAP Generative AI Hub provides the enterprise foundation for model access.

## Architecture

![drawio](./drawio/agentic-for-sap-extensions.drawio)

The architecture comprises several components with the agent harness as the central actor.

### Key Components

-   **Agent Harness:** Orchestrates specialized agents across isolated worktrees, coordinating code generation with project specifications and skills pre-configured from the skill registry.
-   **SAP MCP Servers:** Expose authoritative knowledge for the agent on SAP CAP, Fiori and UI5 patterns that improves code quality by enhancing the context for agent at code generation and validation time.
-   **Skill Registry:** Governs reusable agent behaviors with version pinning, approval workflows and cross-team distribution.
-   **Model Proxy:** Routes LLM requests (e.g. LiteLLM) through SAP AI Core and SAP Generative AI Hub for strength-based routing, compliance filtering and model normalization.
-   **SAP BTP Services:** Quality enforcement through SAP Continuous Integration and Delivery, persistence through SAP HANA Cloud, connectivity through SAP Destination Service, and runtime for CAP-based extensions.

## Development Flow

:::note[Introducing Alex]
Alex is a senior CAP developer building S/4HANA side-by-side extensions on SAP BTP. His team has adopted agentic engineering to accelerate delivery while maintaining quality. Alex expects high quality code for SAP that uses current CAP and Fiori APIs, parallel execution across backend and frontend concerns, deterministic quality gates that catch regressions before review, and governed model access through SAP Generative AI Hub. He focuses on the specifications, architecture decisions and acceptance criteria rather than on fixing hallucinated annotations or tracking deprecated APIs.
:::

1. **Grounding:** The developer loads skills from the governed registry, installs  SAP MCP servers locally, and co-creates with the agent a markdown specification capturing requirements, test cases, acceptance criteria and non-functional constraints.
2. **Planning:** The agent harness decomposes the specification into a dependency-mapped plan and assigns tasks to specialized agents operating in isolated worktrees. The developer approves the plan before execution begins.
3. **Generation:** Specialized agents execute tasks concurrently, querying MCP servers for authoritative patterns, coordinating interface contracts through the harness, and updating the specification when encountering implementation gaps.
4. **Enforcement:** The deterministic quality pipeline executes linters, tests, security scans and browser-based verification at commit, push and CI hooks without agent involvement. Non-conforming code returns to agents for correction.
5. **Integration:** A reviewer agent pre-screens the generated application, flagging code that does not trace to specification requirements. The developer validates against specifications and the agent pushes a PR with testing evidence and requirement traceability.

## Characteristics

-   **Specification-Driven Grounding:** Agent harness interviews developer to co-create specifications before code generation begins. Test-driven development tools (e.g superpowers) enrich specifications by identifying gaps and increasing details, providing the agent harness with comphreensive instructions that reduces  ambiguity.
-   **SAP MCP-context Generation:** SAP MCP servers, persistent rules and context-activated skills deliver authoritative SAP sources at generation and validation time, eliminating hallucinated APIs, deprecated syntax and incorrect annotation patterns.
-   **Unified Model Access:** The customer-managed model proxy (e.g. LiteLLM) normalizes provider differences behind a single endpoint, enabling cross-model review and strength-based routing while enforcing enterprise compliance through SAP Generative AI Hub.
-   **Zero Trust Enforcement:** Agents operate under least-privilege with permission scopes widening only after passing quality thresholds. The quality pipeline executes deterministically at git hooks and CI gates, enforcing correctness mechanically independent of agent judgment.
-   **Federated Governance:** The customer-managed skill registry controls agent access to skills and MCP servers across the organization. Version pinning, approval workflows and deprecation lifecycle align agent behaviors with enterprise requirements.
-   **Compounding Knowledge:** Fixes, edge cases and workarounds feed back as updated specifications, project rules, skills or persistent memory. Reusable behaviors publish to the registry, turning project-local knowledge into organization-wide assets.

## Business Problem

Accelerating S/4HANA extension delivery with coding agents while maintaining enterprise requirements for security, performance and reliability requires addressing the knowledge barrier inherent in CAP, Fiori Elements and UI5. Annotation semantics, OData wiring and CDS conventions appear correct after implementation by the coding agent but fail silently at runtime, producing blank pages, empty columns and non-functional UI elements that require extensive debugging cycles to identify and correct.

### Solution

Connecting coding agents to SAP MCP servers for CAP, Fiori and UI5 reduces architectural error rates by grounding generation in authoritative sources that override stale training data. Specifications co-created before generation, quality pipelines treating all output as untrusted, and model access routed through SAP Generative AI Hub transform debugging cycles that previously consumed days per feature into rapid delivery with elevated code quality.


## Key Outcomes

-   **Faster Time to Value:** Parallel code production across specialized agents compresses delivery timelines from weeks to days for standard BTP extensions.
-   **Higher Code Quality:** Grounding through SAP MCP servers eliminates hallucinated APIs, deprecated syntax and incorrect annotation patterns at generation time rather than at review time.
-   **Reduced Rework:** SAP-grounded specifications co-created before generation ensure alignment between requirements and implementation, catching misunderstandings before code exists.
-   **Governed Model Access:** A single proxy endpoint enforces enterprise compliance, content filtering and audit logging across all foundation model interactions.
-   **Compounding Returns:** Every fix, edge case and workaround feeds back into the knowledge infrastructure, making each subsequent generation more accurate than the last.

:::note[User Journey: Alex]
With this architecture, Alex's team delivers BTP extensions for S/4HANA faster with agentic engineering. He focuses on architecture and acceptance criteria while agents handle grounded code production, and the quality pipeline ensures nothing reaches main without passing every gate.
:::

Agentic engineering transforms how development teams build BTP extensions. By connecting coding agents to authoritative SAP knowledge through context engineering, enforcing quality through deterministic pipelines, and governing model access through SAP Generative AI Hub, organizations accelerate delivery while improving code quality. The architecture scales from a single developer with one coding agent to enterprise teams with federated governance, and the knowledge infrastructure compounds value with every session.

## Resources

- [LiteLLM SAP Provider Documentation](https://docs.litellm.ai/docs/providers/sap)
- [SAP CAP MCP Server](https://github.com/cap-js/mcp-server?tab=readme-ov-file#cli-usage)
- [Fiori MCP Server](https://www.npmjs.com/package/@sap-ux/fiori-mcp-server)
- [UI5 Web Components MCP Server](https://github.com/UI5/webcomponents-mcp-server)
- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core)
- [SAP Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core)
- [SAP Cloud Application Programming Model](https://cap.cloud.sap/docs/)
- [SAP HANA Cloud](https://discovery-center.cloud.sap/serviceCatalog/sap-hana-cloud)
- [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite)
- [SAP Business Technology Platform](https://www.sap.com/products/technology-platform.html)
- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/)
- [SAP Cloud SDK for AI](https://help.sap.com/docs/sap-ai-core)