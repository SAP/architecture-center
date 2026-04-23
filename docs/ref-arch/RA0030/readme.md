---
id: id-ra0030
slug: /ref-arch/a3f7c2d1e8
sidebar_position: 30
sidebar_custom_props:
  category_index:
    - genai
    - appdev
title: Agentic Engineering for SAP
description: >-
  Agentic engineering with SAP — context engineering, grounding through MCP
  servers and SDKs, multi-agent orchestration and architecture patterns for
  AI-native development on SAP BTP.
sidebar_label: Agentic Engineering for SAP
keywords:
  - sap
  - agentic engineering
  - context engineering
  - grounding
  - mcp servers
  - sap sdks
  - multi-agent orchestration
  - ai coding agents
  - sap ai core
  - intelligent applications
  - sap btp
image: img/ac-soc-med.png
tags:
  - genai
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
unlisted: false
contributors:
  - guilherme-segantini
discussion:
last_update:
  author: guilherme-segantini
  date: 2026-04-22
---

AI coding agents generate code rapidly, but without grounding in authoritative sources they produce incorrect APIs, deprecated patterns and insecure dependencies. The cost of ungrounded generation spans quality, security and rework. Agentic engineering addresses this by connecting coding agents to a layered infrastructure of SAP knowledge sources, automated quality gates and governed model access so that generated code is correct by construction.

This reference architecture defines the system that makes agentic engineering work in SAP environments. Five layers connect to form that system: grounding feeds agents authoritative SAP knowledge, quality enforcement blocks non-conforming code before it reaches a branch, orchestration coordinates parallel agent work, model access routes to foundation models on SAP AI Core and the SAP runtime layer provides the deployment target. The patterns are tooling-agnostic; named tools serve as recommended examples, not requirements.

## Architecture

![drawio](./drawio/agentic-engineering-overview.drawio)

The architecture comprises five interconnected layers.

-   **Grounding Layer:** SAP Build MCP servers for CAP, Fiori Elements, SAPUI5 and MDK provide authoritative, current knowledge. Context Hub aggregates additional domain sources. Project-level rules, structured specifications capturing non-functional requirements and context-activated skills route agent queries to these sources before code generation begins.
-   **Quality Enforcement Layer:** Pre-commit and pre-push hooks execute linters, test suites, security scans and browser-based runtime verification at defined lifecycle points. Security scans cover credential scanning, dependency auditing, dependency freshness validation and injection-pattern detection. All agent-generated code is treated as untrusted by default, and context boundary controls prevent secrets from entering the agent’s working context. These gates operate deterministically without relying on the agent’s judgment.
-   **Orchestration Layer:** A lead agent decomposes work into tasks with explicit dependencies, delegates to specialized agents operating in isolated git worktrees and coordinates task completion across dependency waves.
-   **Model Access Layer:** An LLM proxy such as LiteLLM with SAP Generative AI Hub provides a single compliant endpoint to multiple foundation models on SAP AI Core. Strength-based routing directs generation, review and routine tasks to different models without requiring changes to agent code.
-   **SAP Runtime Layer:** SAP Business Technology Platform provides the deployment target. SAP Business Data Cloud supplies governed data products for design-time context and runtime data access. SAP AI Core hosts the foundation models.

## Flow

1.  **Grounding Configuration:** Project-level rules, structured specifications, context-activated skills and MCP server connections load into the agent environment from version control. The grounding layer is fully configured before code generation begins.
2.  **Task Decomposition:** The orchestration layer receives a development objective, decomposes it into discrete tasks with dependency mappings and assigns each task to a specialized agent operating in an isolated worktree.
3.  **MCP-Grounded Generation:** Each agent queries SAP MCP servers for current API patterns, annotation semantics and framework conventions before generating code. The grounding layer overrides the agent’s training knowledge when the two conflict.
4.  **Quality Gate Execution:** Pre-commit hooks execute the test suite, linters, security scans and browser-based verification against the generated output. Non-conforming code is rejected and returned to the agent for correction. No code advances without passing all gates.
5.  **Merge Gate Enforcement:** The version control system enforces branch protection rules requiring passing automated gates and an approved review before accepting any merge. Each merged change carries a semantic commit with testing evidence and traceability to requirements.

## Characteristics

-   **Grounded by Construction:** The grounding layer ensures agents consult authoritative SAP sources before every code generation decision. MCP servers, persistent rules and context-activated skills compound to eliminate hallucinated APIs, deprecated syntax and incorrect annotation patterns.
-   **Deterministic Enforcement:** Quality gates execute automatically at lifecycle hooks without relying on agent judgment. A hook that blocks a commit on test failure cannot be reasoned away or bypassed by the agent.
-   **Unified Model Access:** The model access layer normalizes provider differences behind a single proxy endpoint, enabling cross-model review and strength-based routing while enforcing enterprise compliance through SAP Generative AI Hub.
-   **Progressive Trust:** The permission layer enforces least-privilege defaults and exposes escalation paths gated by quality evidence. Permission scopes widen only after the agent passes defined quality thresholds, balancing safety with development velocity.
-   **Compounding Knowledge:** Every fix, edge case and workaround feeds back into the grounding layer as updated rules, skills or annotations. The system produces higher-quality output with each iteration without requiring manual knowledge transfer.
-   **Tooling Agnosticism:** The same layered architecture of grounding, orchestration, quality enforcement and model access applies across coding agent implementations. The integration mechanism differs; the architectural pattern holds.

## Examples in an SAP Context

-   **CAP Application Grounded by MCP:** Skills route every CDS decision through the CAP MCP server and every annotation through the Fiori MCP server. The quality enforcement layer runs the UI5 linter and Fiori annotation validator before any commit advances, producing code that follows current best practices from the first generation.
-   **Multi-Agent Team Delivery:** The orchestration layer assigns backend, frontend and testing concerns to individual agents, each operating in an isolated git worktree. Agents execute tasks within dependency waves, communicating through the task coordination system. Features converge through pull requests reviewed by the architect.
-   **Cross-Model Review:** The model access layer routes CAP service generation to one model, annotation review to a second and structured output validation to a third. SAP Generative AI Hub ensures every model is enterprise-approved. No agent code changes are required to switch or add models.
-   **Discovery Before Custom Build:** A project-level skill directs the agent to query SAP Joule and existing agent registries before provisioning new capabilities. Only functionality that is unique to the organization proceeds to custom development.

## Services and Components

- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core)
- [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html)
- [SAP Business Data Cloud](https://www.sap.com/products/technology-platform/business-data-cloud.html)
- [SAP Business Technology Platform](https://www.sap.com/products/technology-platform.html)
- [SAP Cloud SDK for AI](https://pages.community.sap.com/topics/cloud-sdk)
- [SAP Build MCP Servers](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-build-introduces-new-mcp-servers-to-enable-agentic-development-for/ba-p/14205602)
- [SAP Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core)
- [SAP BTP Audit Log Service](https://help.sap.com/docs/btp/sap-business-technology-platform/audit-log-service)
- [LiteLLM](https://docs.litellm.ai/docs/providers/sap)

## Resources

- [SAP Build Introduces New MCP Servers](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-build-introduces-new-mcp-servers-to-enable-agentic-development-for/ba-p/14205602)
- [LiteLLM SAP Provider Documentation](https://docs.litellm.ai/docs/providers/sap)
- [Set Up Generative AI Hub in SAP AI Core](https://developers.sap.com/tutorials/ai-core-genaihub-provisioning.html)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Cline Documentation](https://docs.cline.bot/getting-started/what-is-cline)
- [SAP Architecture Center](https://architecture.learning.sap.com/)
- [Context Hub](https://github.com/andrewyng/context-hub)
- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/)
- [SAP Cloud SDK for AI](https://pages.community.sap.com/topics/cloud-sdk)
- [Building Effective Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents)

## Related Missions
