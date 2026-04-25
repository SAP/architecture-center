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
  Agentic engineering for SAP: context engineering, grounding through MCP
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
  date: 2026-04-25
---

AI coding agents generate code rapidly, but without grounding in authoritative sources they produce incorrect APIs, deprecated patterns and insecure dependencies. Clean Core strategies increase the volume of extension work on BTP while development capacity stays flat, making grounded acceleration essential. Agentic engineering addresses this by connecting coding agents to an infrastructure of SAP knowledge sources, automated quality pipelines and governed model access so that generated code is correct by construction.

This reference architecture defines the system that makes agentic engineering work for SAP extension development. Context engineering — the discipline of managing what knowledge reaches an agent and when — is the central pillar of this architecture. Five components form the system: context engineering feeds agents authoritative SAP knowledge, the coding agent generates and orchestrates work, a quality pipeline blocks non-conforming code before it reaches a branch, foundation model access routes to models on SAP AI Core and the SAP BTP runtime provides the deployment target. A centralized governance function controls which tools and models are available across the system. The patterns are tooling-agnostic; named tools serve as recommended examples, not requirements.

## Architecture

![drawio](./drawio/agentic-engineering-overview.drawio)

The architecture comprises five components with the coding agent as the central actor.

-   **Context Engineering:** The discipline of managing what knowledge reaches an agent and when. SAP Build MCP servers for CAP, Fiori Elements, SAPUI5 and MDK provide authoritative, current knowledge. Structured specifications in markdown format live in the repository alongside source code, are version-controlled and stay in sync with the code baseline. Project-level rules and persistent instructions load at session start. Context-activated skills activate on demand during generation. Context Hub aggregates additional domain sources. Git commit history serves as a knowledge source — detailed semantic commits document what changed and why, giving agents the context to understand codebase evolution and providing an audit trail for traceability. Progressive disclosure keeps the context window under budget: always-on rules load first, MCP queries fire during generation, subagent contexts remain isolated. Institutional knowledge compounds across sessions as fixes, edge cases and workarounds feed back into rules, skills and updated specifications. A centralized governance registry controls which MCP servers and skills are available to agents, ensuring that knowledge sources align with enterprise security and compliance requirements.
-   **Coding Agent:** The agent harness serves as the central actor. Tools such as Claude Code and Cline consume context engineering, generate code and submit output to the quality pipeline. Orchestration is a built-in capability of the agent harness — task decomposition, dependency waves, worktree isolation and multi-agent coordination are native features, not a separate component. The Agent-to-Agent (A2A) protocol provides the interoperability contract for integrating agents across provider boundaries. A2A defines how agents discover capabilities, exchange task cards and report completion status across tooling boundaries.
-   **Quality Pipeline:** The enforcement boundary between agent-generated code and the repository. Pre-commit hooks execute linters, test suites, security scans and browser-based runtime verification. Pre-push hooks run additional checks. CI/CD pipelines validate before merge. Branch protection rules require passing automated gates and an approved review before accepting any change. All agent-generated code is treated as untrusted by default. Security scans cover credential scanning, dependency auditing, dependency freshness validation and injection-pattern detection. Context boundary controls prevent secrets from entering the agent's working context. This pipeline operates deterministically outside the coding agent — a hook that blocks a commit on test failure cannot be reasoned away or bypassed.
-   **Foundation Model Access:** An LLM proxy such as LiteLLM routes through SAP Generative AI Hub to multiple foundation models on SAP AI Core. The hub provides content filtering, PII masking, guardrails, data grounding and audit logging behind a single API key. Strength-based routing directs generation, review and routine tasks to different models without requiring changes to agent code. The governance registry controls which models are available. SAP passes through hyperscaler pricing, reducing model access cost compared to direct provider contracts.
-   **SAP BTP Runtime:** SAP Business Technology Platform provides the deployment target. Extension applications deploy as side-by-side extensions, preserving the clean core of the S/4HANA system. SAP Business Data Cloud supplies governed data products for design-time context and runtime data access. SAP AI Core hosts the foundation models.

## Flow

1.  **Specification and Grounding:** Structured specifications define requirements and acceptance criteria. Project-level rules, persistent instructions, context-activated skills and MCP server connections load from version control, fully configuring the context engineering component before code generation begins.
2.  **Task Decomposition:** The coding agent receives a development objective from the specification, decomposes it into discrete tasks with dependency mappings and assigns each task to a specialized agent operating in an isolated worktree.
3.  **MCP-Grounded Generation:** Each agent queries SAP MCP servers for current API patterns, annotation semantics and framework conventions before generating code. Authoritative MCP knowledge overrides the agent's training data when the two conflict.
4.  **Quality Gate Execution:** The quality pipeline executes the test suite, linters, security scans and browser-based verification against the generated output. Non-conforming code is rejected and returned to the agent for correction. No code advances without passing all gates.
5.  **Merge Gate Enforcement:** Branch protection rules require passing automated gates and an approved review before accepting any merge. Each merged change carries a semantic commit with testing evidence and traceability to requirements.

## Characteristics

-   **Grounded by Construction:** Context engineering ensures agents consult authoritative SAP sources before every generation decision. MCP servers, persistent rules and context-activated skills compound to eliminate hallucinated APIs, deprecated syntax and incorrect annotation patterns.
-   **Deterministic Enforcement:** The quality pipeline executes automatically at lifecycle hooks without relying on agent judgment. A hook that blocks a commit on test failure cannot be reasoned away or bypassed.
-   **Unified Model Access:** Foundation model access normalizes provider differences behind a single proxy endpoint, enabling cross-model review and strength-based routing while enforcing enterprise compliance through SAP Generative AI Hub.
-   **Progressive Trust:** The coding agent operates under least-privilege defaults. Permission scopes widen only after the agent passes defined quality thresholds, balancing safety with development velocity.
-   **Compounding Knowledge:** Every fix, edge case and workaround feeds back into the context engineering component as updated specifications, project rules, skills or persistent memory. This institutional knowledge accumulates across sessions without requiring manual knowledge transfer.

## Examples in an SAP Context

-   **CAP Application Grounded by MCP:** Skills route every CDS decision through the CAP MCP server and every annotation through the Fiori MCP server. The quality pipeline runs the UI5 linter and Fiori annotation validator before any commit advances, producing code that follows current best practices from the first generation.
-   **On-Premise Extension with Cloud AI:** Foundation model access connects an S/4HANA on-premise extension to models on SAP AI Core through SAP Generative AI Hub. The on-premise system retains its existing deployment while the extension gains AI-assisted development capabilities without requiring migration to Rise or public cloud.
-   **Multi-Agent Team Delivery:** The coding agent assigns backend, frontend and testing concerns to specialized agents, each operating in an isolated git worktree. Agents execute tasks within dependency waves, communicating through the built-in task coordination system. Features converge through pull requests gated by the quality pipeline.
-   **Cross-Model Review:** Foundation model access routes CAP service generation to one model, annotation review to a second and structured output validation to a third. SAP Generative AI Hub ensures every model is enterprise-approved. No agent code changes are required to switch or add models.
-   **Discovery Before Custom Build:** A project-level skill directs the agent to query SAP Joule and existing agent registries before provisioning new capabilities. Only functionality that is unique to the organization proceeds to custom development.

## Services and Components

- [SAP AI Core](https://discovery-center.cloud.sap/serviceCatalog/sap-ai-core)
- [SAP Joule](https://www.sap.com/products/artificial-intelligence/ai-assistant.html)
- [SAP Business Data Cloud](https://www.sap.com/products/technology-platform/business-data-cloud.html)
- [SAP Business Technology Platform](https://www.sap.com/products/technology-platform.html)
- [SAP Cloud SDK for AI](https://help.sap.com/docs/sap-ai-core)
- [SAP Build MCP Servers](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-build-introduces-new-mcp-servers-to-enable-agentic-development-for/ba-p/14205602)
- [Fiori MCP Server](https://www.npmjs.com/package/@sap-ux/fiori-mcp-server)
- [UI5 Web Components MCP Server](https://github.com/UI5/webcomponents-mcp-server)
- [SAP Generative AI Hub](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/generative-ai-hub-in-sap-ai-core)
- [SAP BTP Audit Log Service](https://help.sap.com/docs/btp/sap-business-technology-platform/audit-log-service)

## Resources

- [SAP Build Introduces New MCP Servers](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-build-introduces-new-mcp-servers-to-enable-agentic-development-for/ba-p/14205602)
- [LiteLLM SAP Provider Documentation](https://docs.litellm.ai/docs/providers/sap)
- [Set Up Generative AI Hub in SAP AI Core](https://developers.sap.com/tutorials/ai-core-genaihub-provisioning.html)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Cline Documentation](https://docs.cline.bot/getting-started/what-is-cline)
- [SAP Architecture Center](https://architecture.learning.sap.com/)
- [Context Hub](https://github.com/andrewyng/context-hub)
- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/)
- [SAP Cloud SDK for AI](https://help.sap.com/docs/sap-ai-core)
- [Building Effective Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents)
- [OpenSpec — Spec-Driven Development](https://github.com/Fission-AI/OpenSpec)
- [Fiori MCP Server](https://www.npmjs.com/package/@sap-ux/fiori-mcp-server)
- [UI5 Web Components MCP Server](https://github.com/UI5/webcomponents-mcp-server)

## Related Missions
