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

-   **Context Engineering:** The discipline of managing what knowledge reaches an agent and when. SAP Build MCP servers for CAP, Fiori Elements, SAPUI5 provide authoritative current knowledge. Structured specifications in markdown format live in the repository alongside source code, are version-controlled and stay in sync with the code baseline. Project-level rules and persistent instructions load at session start. Context-activated skills resolve from the skill registry and activate on demand during generation. Context Hub aggregates additional domain sources. Git commit history serves as a knowledge source: detailed semantic commits document what changed and why, giving agents the context to understand codebase evolution and providing an audit trail for traceability. Progressive disclosure keeps the context window under budget: always-on rules load first, MCP queries fire during generation, subagent contexts remain isolated. Institutional knowledge compounds across sessions as fixes, edge cases and workarounds feed back into rules, skills and updated specifications, with reusable behaviors published to the skill registry for cross-team distribution.
-   **Skill Registry:** The governance and distribution layer for reusable agent behaviors. The registry catalogs context-activated skills, project rule templates, prompt patterns and tool configurations with version metadata, approval status, authorship and usage metrics. Agents query the registry to discover existing capabilities before provisioning new ones, preventing duplication across teams. Approved entries propagate to subscribing projects without manual copying. A deprecation lifecycle retires outdated behaviors and promotes validated replacements.
-   **Coding Agent:** The agent harness serves as the central actor. Tools such as Claude Code and Cline consume context engineering, generate code and submit output to the quality pipeline. Orchestration is a built-in capability of the agent harness: task decomposition, dependency waves, worktree isolation and multi-agent coordination are native features, not a separate component. The Agent-to-Agent (A2A) protocol provides the interoperability contract for integrating agents across provider boundaries. A2A defines how agents discover capabilities, exchange task cards and report completion status across tooling boundaries.
-   **Quality Pipeline:** The enforcement boundary between agent-generated code and the repository. Pre-commit hooks execute linters, test suites, security scans and browser-based runtime verification. Pre-push hooks run additional checks. CI/CD pipelines validate before merge. Branch protection rules require passing automated gates and an approved review before accepting any change. All agent-generated code is treated as untrusted by default. Security scans cover credential scanning, dependency auditing, dependency freshness validation and injection-pattern detection. Context boundary controls prevent secrets from entering the agent's working context. This pipeline operates deterministically outside the coding agent: a hook that blocks a commit on test failure cannot be reasoned away or bypassed.
-   **Foundation Model Access:** An LLM proxy such as LiteLLM routes through SAP Generative AI Hub to multiple foundation models on SAP AI Core. The hub provides content filtering, PII masking, guardrails, data grounding and audit logging behind a single API key. Strength-based routing directs generation, review and routine tasks to different models without requiring changes to agent code. SAP Generative AI Hub controls which models are available. SAP passes through hyperscaler pricing, reducing model access cost compared to direct provider contracts.
-   **SAP BTP Runtime:** SAP Business Technology Platform provides the deployment target. Extension applications deploy as side-by-side extensions, preserving the clean core of the S/4HANA system. SAP Business Data Cloud supplies governed data products for design-time context and runtime data access. SAP AI Core hosts the foundation models.

## Flow

1.  **Project Skills Activation:** The developer loads project-specific skills from their governed skill registry into the agent session. The skill registry is a client-managed resource, either a version-controlled repository or a dedicated instance deployed on BTP. The registry catalogs approved agent behaviors and tools.
2.  **SAP Knowledge Activation:** The developer connects the coding agent to the client-managed SAP MCP servers on BTP. These servers, covering CAP, Fiori Elements and UI5, expose current SAP framework knowledge as callable tools. Specialized SAP development skills invoke the appropriate MCP server semantically during generation and code validation.
3.  **Specification and Grounding:** A Spec-Driven-Development tool configured with project context and architecture principles co-creates specification in markdown format with human input, capturing requirements, test cases and acceptance criteria. The specification captures software development practices and non-functional constraints, including security posture, performance budgets, reliability expectations and scalability limits that the generated code must satisfy.
4.  **Task Decomposition:** The coding agent decomposes the specifications into a structured plan with tasks and their phases in markdown format. Dependency mappings determine which tasks can execute concurrently and which must wait, maximizing parallel code production across the agent team. The developer approves the plan and the coding agent assigns each task to specialized agents, such as a backend agent responsible for CAP services and CDS models and a frontend agent responsible for Fiori annotations and UI5 controllers, each operating in an isolated worktree.
5.  **Code Production:** Specialized agents execute their assigned tasks concurrently, each working in an isolated git worktree. Agents query SAP MCP servers for current API patterns and framework conventions before generating code. Authoritative MCP knowledge overrides the agent's training data when the two conflict. Agents communicate with each other through the agent harness during execution, surfacing interface contracts, resolving naming conflicts and coordinating shared dependencies before incompatibilities reach merge time. When agents encounter gaps, conflicts or implementation constraints not covered by the specification, they update the requirements directly, keeping the specification accurate as development progresses. Progress and completion status are tracked through branch state and semantic commits, giving the orchestrating agent a reliable, version-controlled view of work in flight across the team. Once all tasks complete, the orchestrating agent consolidates the agent branches into a single integration branch and submits one pull request.
6.  **Quality Gate Execution:** The quality pipeline executes the test suite, linters, security scans and browser-based verification against the generated output. Gates run against the full codebase, catching regressions in existing features alongside new code. The quality pipeline rejects non-conforming code and returns it to the agent for correction. No code advances without passing all gates.
7.  **Developer Review and Testing:** The developer reviews the consolidated pull request, runs the application and validates that the implemented behavior matches the acceptance criteria. A reviewer agent pre-screens the pull request before the developer sees it, flagging code that does not trace to a spec requirement and producing a structured summary of changes and concerns, enabling the developer to focus review on substantive concerns. Rejected work returns to the agents with the developer's feedback captured in the specification, re-entering the production cycle at Step 5.
8.  **Main Branch Integration:** The developer submits the reviewed integration branch as a pull request to the project's main branch. Branch protection rules require passing automated gates and an approved review before accepting the merge. Each merged change carries a semantic commit with testing evidence and traceability to the original requirements.

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
