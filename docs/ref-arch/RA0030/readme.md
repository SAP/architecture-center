---
id: id-ra0028
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

Code generation has become inexpensive. AI coding agents scaffold applications, write tests and iterate quickly. Without proper grounding, however, they use incorrect APIs, rely on deprecated patterns, introduce risky dependencies and create avoidable rework. The bottleneck has shifted from writing code to ensuring that code is correct, secure and cost-effective.

Agentic engineering applies production discipline to AI-assisted development. It adds authoritative grounding, automated quality gates, human governance and compounding project memory so that agents produce trustworthy results. In SAP environments, this means connecting agents to SAP knowledge and controls through MCP servers, SDKs and governance services so that generated code follows current APIs, security practices and compliance requirements.

This reference architecture covers grounding infrastructure, multi-agent orchestration and patterns that connect AI-generated applications to SAP data and services. The patterns are tooling-agnostic; named tools serve as recommended examples, not requirements.

## Architecture

![drawio](drawio/agentic-engineering-overview.drawio)

## Flow

1.  **Specification Co-creation:** The architect and agent co-create a versioned project specification through structured Q&A, producing requirements, workstreams, acceptance criteria and architecture decisions. Agents load this specification at the start of each session to restore context consistently.
2.  **Grounding Infrastructure Setup:** The architect configures project rules, mandatory skills that consult sources of truth and commit/push quality hooks. For SAP projects, CAP, Fiori and UI5 MCP servers connect so that agents query them before generating code. All configuration resides in version control and propagates to every agent session.
3.  **Research Before Build:** Agents check SAP capabilities (Joule, Cloud SDK for AI, existing MCP integrations), scan the codebase for established patterns and reuse runnable examples. Findings feed back into the specification to avoid rebuilding and reduce rework.
4.  **Team Creation and Concern Assignment:** A lead assigns distinct concerns (data model, backend API, UI, prompts, testing) to individual agents. Each agent operates in an isolated git worktree with least-privilege permissions that expand as trust is earned.
5.  **Explore, Plan and Approve:** Each agent reads relevant code, surfaces risks and proposes a plan with observable success criteria and verification commands. Implementation begins only after plan approval to prevent scope creep.
6.  **Concurrent Build with Task-Driven Coordination:** Work organizes into dependency waves. Tasks within a wave run in parallel; the next wave starts when prerequisites complete. Each task follows an explore, implement, verify and commit cycle. One agent handles one task at a time.
7.  **Quality Gate Enforcement:** Failing tests are written first and implementation proceeds until they pass. Pre-commit and pre-push hooks run linting, security checks and the full test suite. Failing code cannot advance. Manual testing complements automation to cover edge cases.
7a. **Continuous Evals and Model QA:** Golden tasks and datasets feed offline eval suites that run on every pull request and nightly for correctness, grounding/attribution, safety and cost/latency. Merges are gated on thresholds and trends are stored over time.
8.  **Lead Orchestration and Steering:** The team lead tracks progress, manages dependencies, reassigns work as needed and synthesizes results. Developers interact with the lead or individual agents to adjust approach or redirect effort.
9.  **Compounding Lessons:** Every fix, edge case and workaround updates rules, skills or documentation so that future sessions inherit improvements. The system becomes more accurate with every task, not only at project end.
10. **Convergence Through Human Review:** Each task yields a single semantic commit with testing evidence and traceability to requirements. Merges require passing tests and human approval. AI accelerates delivery; humans govern what ships.

## Deep Dives

- [Continuous Evals and Model QA for Agentic Engineering](/ref-arch/evals)
- [Grounding and Context Engineering in SAP](/ref-arch/grounding)
- [Orchestration, Trust, and Governance](/ref-arch/orchestration-governance)
- [Secure Agent Tooling and Red Teaming for SAP](/ref-arch/security)

## Characteristics

-   **Context Engineering as a First-Class Discipline:** Context is the agent’s scarcest and most fragile resource. Too much invites hallucinations; too little yields generic output. Persistent rules, targeted skills and MCP-backed progressive disclosure ensure the model sees the right facts at the right time. This approach delivers accurate, consistent results from the first prompt instead of weeks of ramp-up.
-   **Grounding Through SAP MCP Servers and SDKs:** Agents consult authoritative SAP sources before generating code, eliminating hallucinated APIs, deprecated syntax and incorrect annotation patterns. With MCP grounding, a UI5 controller follows current async patterns and architecture guidance, then clears linting and review on the first cycle.
-   **Hybrid CLI and MCP Integration:** CLIs handle local, deterministic work (tests, linting, git, builds) while MCP servers provide governed, schema-validated access to SAP knowledge and APIs. The combination delivers fast feedback loops on the workstation and authoritative truth with proper consent models.
-   **Spec-Driven Development with Persistent Project Memory:** A steady loop of explore, plan, implement, verify and commit structures every session. Spec-driven development frameworks persist specifications, roadmaps and decisions across sessions, decompose work into atomic tasks and dependency waves, and provide researchers, planners, executors and verifiers with fresh context to avoid token drift. Each task ends in a single semantic commit for clean rollback and review.
-   **Testing and Verification as Non-Negotiable Gates:** Red/green TDD is the standard: write failing tests, observe the failure, then implement until green. Pre-commit and pre-push hooks enforce linting, security scans and full test suites. Targeted manual UI and API checks complement automation for edge cases.
-   **Evaluation as a First-Class Gate:** Beyond tests, offline task-based evals (golden tasks, perturbations), grounding/attribution checks against MCP responses, adversarial safety suites and cost/latency budgets gate pull requests on thresholds and track trends over time.
-   **Enterprise Model Access Through a Unified Proxy:** An LLM proxy (such as LiteLLM with SAP Generative AI Hub) routes to multiple models on SAP AI Core through a single compliant endpoint. Different models serve generation, review and routine tasks without requiring changes to agent code.
-   **Multi-Agent Orchestration for Parallel Delivery:** Multiple agents coordinate to run work in parallel, shifting the bottleneck from production to integration and review. The topology (hierarchical, pipeline, parallel workers or hybrid) is selected based on dependencies and complexity.
-   **Progressive Trust Model:** Agents start with least-privilege permissions and require approvals for destructive or external actions. Permissions broaden as agents demonstrate reliability, balancing safety with velocity.
-   **Human-in-the-Loop Governance:** Automated gates catch known patterns; human review catches novel risks and architectural misalignment. Every pull request ties to acceptance criteria and requires approval. AI accelerates delivery; humans decide what ships.
-   **Compounding Intelligence:** Fixes, edge cases and decisions become rules, skills and annotations so that quality improves with every session. Tools such as Context Hub enable teams to curate APIs and add local notes, spreading learning across projects.
-   **Discovery Before Custom Build:** The search order is SAP Joule, hyperscaler agent services and open source before custom development. Only capabilities that are unique to the organization warrant new development.
-   **Tooling-Agnostic Patterns:** The same architectural patterns (grounding, skills, testing gates and multi-agent coordination) apply across Claude Code, Cline, Cursor, Windsurf and GitHub Copilot. The mechanism differs; the principle holds.

## Grounding Agents in SAP

The central challenge of agentic engineering is ensuring that AI-generated code reflects reality: correct APIs and versions, current syntax and actual platform conventions. Without grounding, agents draw on general training knowledge that is outdated, imprecise or misaligned with an organization’s environment. The cost of ungrounded generation spans three dimensions: quality (incorrect or outdated APIs, deprecated patterns, code rejected in review), security (injection vulnerabilities, hardcoded credentials, insecure dependency choices) and cost (wasted review cycles, rework, slower time to value).

The grounding pyramid establishes four layers that compound to eliminate this problem.

-   **Layer 1 — Persistent Rules:** Project-level configuration files define how agents behave. These encode coding standards, architectural decisions and workflow requirements. Claude Code uses `CLAUDE.md`; Cline uses `.clinerules`; Cursor uses `.cursor/rules/`. The rules are version-controlled, reviewed in pull requests and inherited by every agent session.

-   **Layer 2 — On-Demand Knowledge (Skills):** Reusable instruction sets activate based on development context. Working on a `.cds` file triggers CAP MCP routing; modifying `@UI` annotations triggers the Fiori MCP server; editing a SAPUI5 controller activates the UI5 MCP server. Skills make authoritative source consultation mandatory rather than optional. The agent does not decide whether to consult a source of truth; the skill decides for it.

-   **Layer 3 — Deterministic Enforcement (Hooks and CLIs):** Lifecycle gates execute automatically at defined points: pre-commit, post-save and pre-push. These run linters, test suites and security checks (credential scanning, dependency auditing, injection-pattern detection) without relying on the agent’s judgment. A hook that blocks a commit on test failure cannot be reasoned away or skipped by the agent.

-   **Layer 4 — External Truth (SAP MCP Servers and Context Hub):** Authoritative knowledge sources provide current, verified information. SAP Build MCP servers deliver CAP, Fiori Elements, SAPUI5 and MDK guidance. Context Hub provides curated API documentation from 75+ providers with a persistent local annotation layer so that team learnings compound across sessions and developers. These sources override the agent’s general knowledge. If the MCP server returns a pattern that differs from what the agent would have generated, the MCP pattern takes precedence.

The layers compound: rules define how agents behave; skills define where to look for guidance; hooks define what cannot be skipped; MCP servers define what the truth is. An agent operating with all four layers produces output that is correct by construction, not by coincidence.

The pyramid is necessary but not sufficient. Two additional categories of supporting infrastructure complete the picture. **LLM proxy layers** (such as LiteLLM with SAP Generative AI Hub) provide model access infrastructure: a unified proxy connecting agents to foundation models on SAP AI Core, normalizing provider differences, enabling cross-model review and strength-based routing, and enforcing enterprise compliance. **Spec-driven development frameworks** (such as GSD) provide workflow discipline: persistent planning artifacts and structured sessions that prevent context rot across the multi-session projects typical of SAP development. Both categories are described by role; the specific tools are current recommended examples, not requirements.

## Architecture Patterns

Five workflow patterns, drawn from established agent orchestration research, provide a vocabulary for structuring agentic engineering tasks. Most SAP scenarios use hybrids, combining orchestrator-workers for team coordination with evaluator-optimizer for test-driven development.

| Pattern | Structure | SAP Example |
|---------|-----------|-------------|
| **Prompt Chaining** | Sequential steps with validation gates between each | Generate CDS model, validate annotations, scaffold UI |
| **Routing** | Classify input, direct to specialized handler | A CDS question routes to CAP MCP; a UI question routes to UI5 MCP |
| **Parallelization** | Split work, process concurrently, aggregate results | Lint frontend and run backend tests simultaneously |
| **Orchestrator-Workers** | Central agent decomposes and delegates dynamically | A team lead assigning backend, frontend and testing tasks to worker agents |
| **Evaluator-Optimizer** | Generate, critique, refine loop | Red/green TDD where a test agent evaluates and the implementation agent refines until tests pass. Cross-model evaluation reduces correlated blind spots |

## Examples in an SAP Context

-   **Intelligent Application Built by an Agent Team:** An architect creates a team of agents to build an intelligent application that integrates with SAP Business Data Cloud for enterprise data and SAP AI Core (via LiteLLM) for foundation model access. The team lead assigns a backend agent to scaffold CAP services grounded by the CAP MCP server, a frontend agent to build the SAPUI5 conversational interface grounded by the UI5 MCP server, a prompt engineer to configure AI interaction patterns and a testing agent to run red/green TDD and browser-based verification. Each agent works in its own git worktree. The backend agent reads BDC metadata at design time and wires up data products as the runtime data layer using SAP Cloud SDK for AI patterns. Features converge through pull requests reviewed by the architect. The entire grounding infrastructure (rules, skills, hooks, MCP connections) is version-controlled and inherited by every agent, so the team produces code that follows current SAP best practices from the first generation.
-   **Greenfield CAP Application Grounded by MCP:** A developer prompts an AI agent to scaffold a full SAP CAP service with OData endpoints, CDS data models and Fiori Elements UI. Skills route every CDS decision through the CAP MCP server and every annotation through the Fiori MCP server, producing code that follows current best practices from the first generation.
-   **Fiori Extension with Annotation Verification:** An architect describes a custom Fiori app requirement. The agent generates SAPUI5 views and CDS annotations, with hooks running the UI5 linter and Fiori annotation validator before any commit is allowed.
-   **Multi-Agent Team Delivery:** An architect creates an agent team to deliver a full-stack SAP application. The team lead spawns teammates, each in its own git worktree, to build the CAP backend, SAPUI5 frontend, prompt configurations and test suites concurrently. Agents communicate as tasks complete and dependencies unblock, converging through pull requests.
-   **Discovery Before Custom Build:** Before building a custom procurement insights agent, a developer prompts the AI coding agent to search existing capabilities. A project-level skill directs the search to SAP Joule first, where the agent finds that Joule already provides procurement intelligence. The team integrates the existing capability and focuses custom development only on organization-specific logic.
-   **Compounding Team Knowledge:** A developer discovers that Fiori Elements silently fails on certain unbound action configurations. The fix and the root cause are documented as a skill and a rule update, so every future agent session on the project avoids the same mistake automatically.
-   **Cross-Model Review and Strength-Based Routing:** An architect configures the LLM proxy to route tasks based on model strengths, not cost alone. One model generates CAP service handlers where its code generation excels, a different model reviews the output to catch patterns the first model consistently misses and a third handles structured annotation generation where it outperforms the others. Planning tasks route to high-capability models where accuracy justifies cost; routine tasks like formatting route to cost-efficient models. The same project leverages multiple models and providers without any agent code changes. The proxy handles routing and SAP Generative AI Hub ensures every model is enterprise-approved.

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
- [Context Hub](https://github.com/andrewyng/context-hub)
- [GSD](https://github.com/gsd-framework/gsd)
- [promptfoo](https://github.com/promptfoo/promptfoo)
- [OpenTelemetry](https://opentelemetry.io/)

## Resources

- [SAP Build Introduces New MCP Servers](https://community.sap.com/t5/technology-blog-posts-by-sap/sap-build-introduces-new-mcp-servers-to-enable-agentic-development-for/ba-p/14205602)
- [LiteLLM SAP Provider Documentation](https://docs.litellm.ai/docs/providers/sap)
- [Set Up Generative AI Hub in SAP AI Core](https://developers.sap.com/tutorials/ai-core-genaihub-provisioning.html)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Cline Documentation](https://docs.cline.bot/getting-started/what-is-cline)
- [SAP Architecture Center](https://architecture.learning.sap.com/)
- [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/)
- [SAP Cloud SDK for AI](https://pages.community.sap.com/topics/cloud-sdk)
- [Building Effective Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents)
- [Agentic Engineering Patterns — Simon Willison](https://simonwillison.net/guides/agentic-engineering-patterns/)
