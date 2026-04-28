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

AI coding agents generate code rapidly, but the cost of ungrounded generation compounds across quality, security, rework and time to value. Without authoritative sources they produce code on top of incorrect APIs, deprecated patterns and insecure dependencies. Agentic engineering with context engineering addresses this by connecting coding agents to an infrastructure of SAP knowledge sources, automated quality pipelines and governed model access so that generated code is produced rapidly with enhanced quality for the enterprise.

This reference architecture defines the system that makes agentic engineering accelerate BTP extensions to keep the S/4HANA core clean. Context engineering is central to agentic engineering. Humans and agents co-create specification before code generation begins. Agents follow authoritative and updated SAP knowledge for increased code quality. Code is produced in parallel on worktrees. LiteLLM with SAP Gen AI Hub provides solid enterprise foundation for foundation models and SAP BTP provides the deployment target.

## Architecture

![drawio](./drawio/agentic-engineering-overview.drawio)

The architecture comprises six components with the coding agent as the central actor.

-   **Context Engineering:** The discipline of managing what knowledge reaches an agent and when.
    -   SAP Build MCP servers for CAP, Fiori Elements and SAPUI5 expose authoritative framework knowledge as callable tools
    -   Structured specifications in markdown capture requirements, test cases, acceptance criteria and non-functional constraints
    -   Authoritative MCP knowledge overrides the agent's training data when the two conflict
    -   Agents update specifications directly when encountering gaps or implementation constraints, keeping requirements accurate as development progresses
-   **Skill Registry:** The governance and distribution layer for reusable agent behaviors.
    -   A client-managed resource deployed as a version-controlled repository or a dedicated instance on BTP
    -   Catalogs approved agent behaviors, project rule templates, prompt patterns and tool configurations
    -   Agents query the registry to discover existing capabilities before provisioning new ones
-   **Coding Agent:** The agent harness serving as the central orchestration actor.
    -   Decomposes specifications into dependency-mapped plans and assigns tasks to specialized agents
    -   Specialized agents execute concurrently in isolated git worktrees, coordinating interface contracts through the harness
    -   A reviewer agent pre-screens pull requests, flagging code that does not trace to a spec requirement
    -   The orchestrating agent consolidates agent branches into a single integration branch
-   **Quality Pipeline:** The deterministic enforcement boundary between agent-generated code and the repository.
    -   Pre-commit hooks execute linters, test suites, security scans and browser-based runtime verification
    -   Gates run against the full codebase, catching regressions in existing features alongside new code
    -   Non-conforming code returns to the agent for correction; no code advances without passing all gates
    -   Branch protection rules require passing automated gates and an approved review before accepting any merge
-   **Foundation Model Access:** An LLM proxy routing through SAP Generative AI Hub to multiple foundation models on SAP AI Core.
    -   Content filtering, PII masking, guardrails and audit logging behind a single API key
    -   Strength-based routing directs generation, review and routine tasks to different models
    -   SAP Generative AI Hub controls model availability and enforces enterprise compliance
-   **SAP BTP Runtime:** SAP Business Technology Platform providing the deployment target and runtime infrastructure.
    -   Extension applications deploy as side-by-side extensions, preserving the clean core of the S/4HANA system
    -   SAP AI Core hosts the foundation models accessed through SAP Generative AI Hub
    -   SAP Business Data Cloud supplies governed data products for design-time context and runtime data access

## Flow

1.  **Project Skills Activation:** The developer loads project-specific skills from the governed skill registry into the agent session, activating approved behaviors and tools for the project.
2.  **SAP Knowledge Activation:** The developer connects the coding agent to client-managed SAP MCP servers on BTP, exposing current CAP, Fiori Elements and UI5 framework knowledge as callable tools.
3.  **Specification and Grounding:** A Spec-Driven-Development tool co-creates a markdown specification with the developer, capturing requirements, test cases, acceptance criteria and non-functional constraints that the generated code must satisfy.
4.  **Task Decomposition:** The coding agent decomposes the specification into a dependency-mapped plan and assigns tasks to specialized agents operating in isolated worktrees. The developer approves the plan before execution begins.
5.  **Code Production:** Specialized agents execute assigned tasks concurrently, querying SAP MCP servers and generating code through foundation models routed via SAP Generative AI Hub. The orchestrating agent consolidates completed branches into a single integration branch.
6.  **Quality Gate Execution:** The quality pipeline executes the test suite, linters, security scans and browser-based verification against the full codebase. Non-conforming code returns to the agent for correction.
7.  **Developer Review and Testing:** A reviewer agent pre-screens the pull request before the developer validates implemented behavior against acceptance criteria. Rejected work returns to the agents with feedback captured in the specification.
8.  **Main Branch Integration:** Branch protection rules require passing automated gates and an approved review before the integration branch merges to main. Each merged change carries a semantic commit with testing evidence and requirement traceability.

## Characteristics

-   **Grounded by Construction:** Context engineering ensures agents consult authoritative SAP sources before every generation decision. MCP servers, persistent rules and context-activated skills compound to eliminate hallucinated APIs, deprecated syntax and incorrect annotation patterns.
-   **Deterministic Enforcement:** The quality pipeline executes automatically at lifecycle hooks without relying on agent judgment. A hook that blocks a commit on test failure cannot be reasoned away or bypassed.
-   **Unified Model Access:** Foundation model access normalizes provider differences behind a single proxy endpoint, enabling cross-model review and strength-based routing while enforcing enterprise compliance through SAP Generative AI Hub.
-   **Progressive Trust:** The coding agent operates under least-privilege defaults. Permission scopes widen only after the agent passes defined quality thresholds, balancing safety with development velocity.
-   **Federated Governance:** The skill registry controls which skills and MCP servers are available to agents across the organization. Version pinning, approval workflows and a deprecation lifecycle align agent behaviors with enterprise security and compliance requirements.
-   **Compounding Knowledge:** Every fix, edge case and workaround feeds back into the context engineering component as updated specifications, project rules, skills or persistent memory. Reusable behaviors publish to the skill registry, turning project-local knowledge into organization-wide assets that accumulate across sessions and across teams without requiring manual knowledge transfer.

## Examples in an SAP Context

-   **CAP Application Grounded by MCP:** Skills route every CDS decision through the CAP MCP server and every annotation through the Fiori MCP server. The quality pipeline runs the UI5 linter and Fiori annotation validator before any commit advances, producing code that follows current best practices from the first generation.
-   **On-Premise Extension with Cloud AI:** Foundation model access connects an S/4HANA on-premise extension to models on SAP AI Core through SAP Generative AI Hub. The on-premise system retains its existing deployment while the extension gains AI-assisted development capabilities without requiring migration to Rise or public cloud.
-   **Multi-Agent Team Delivery:** The coding agent assigns backend, frontend and testing concerns to specialized agents, each operating in an isolated git worktree. Agents execute tasks within dependency waves, communicating through the built-in task coordination system. Features converge through pull requests gated by the quality pipeline.
-   **Cross-Model Review:** Foundation model access routes CAP service generation to one model, annotation review to a second and structured output validation to a third. SAP Generative AI Hub ensures every model is enterprise-approved. No agent code changes are required to switch or add models.
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
- [Building Effective Agents (Anthropic)](https://www.anthropic.com/research/building-effective-agents)
- [OpenSpec: Spec-Driven Development](https://github.com/Fission-AI/OpenSpec)
- [Fiori MCP Server](https://www.npmjs.com/package/@sap-ux/fiori-mcp-server)
- [UI5 Web Components MCP Server](https://github.com/UI5/webcomponents-mcp-server)

## Related Missions
