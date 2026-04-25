# Diagram Task: Agentic Engineering Overview

## Status

Not started. The drawio file at `drawio/agentic-engineering-overview.drawio` is currently an empty skeleton with no shapes or connections.

## Requirements

Use the `ref-arch-diagram` skill to create the diagram. It should reflect the six-component architecture from `readme.md`:

### Components to show

- **Coding Agent** at center — the agent harness as the central actor (handles generation, orchestration, worktrees, A2A protocol for cross-provider interoperability)
- **Context Engineering** feeding into the agent — MCP servers (CAP, Fiori, UI5), structured specifications (markdown, version-controlled), project rules, context-activated skills (resolved from skill registry), persistent memory, Context Hub, git commit history as knowledge source, progressive disclosure for context budget
- **Skill Registry** connected to Context Engineering and Coding Agent — governance and distribution layer for reusable agent behaviors (version metadata, approval status, authorship, usage metrics, deprecation lifecycle). Agents query the registry to discover existing capabilities before provisioning new ones
- **Quality Pipeline** as the enforcement boundary between agent output and the repository — pre-commit hooks, pre-push hooks, CI/CD pipelines, branch protection, merge gates, security scans (credential scanning, dependency auditing, injection-pattern detection), context boundary controls
- **Foundation Model Access** providing inference — LLM proxy (LiteLLM), SAP Generative AI Hub (content filtering, PII masking, guardrails, audit logging), strength-based routing, SAP AI Core
- **SAP BTP Runtime** as the deployment target — side-by-side extensions (clean core), SAP Business Data Cloud for governed data products, SAP AI Core for model hosting

### Flow arrows

Match the six numbered steps from the Flow section in `readme.md`:

1. Specification and Grounding — structured specs, project rules, skills and MCP server connections resolve from the skill registry before generation begins
2. Task Decomposition — coding agent decomposes objective into discrete tasks with dependency mappings, assigns to specialized agents in isolated worktrees
3. Capability Discovery — agents query the skill registry and SAP Joule for existing skills, prompt patterns and tool configurations; only tasks without existing solutions proceed to generation
4. MCP-Grounded Generation — each agent queries SAP MCP servers for current API patterns, annotation semantics and framework conventions before generating code
5. Quality Gate Execution — quality pipeline executes test suite, linters, security scans and browser-based verification; non-conforming code rejected and returned to agent
6. Merge Gate Enforcement — branch protection requires passing automated gates and approved review; merged changes carry semantic commits with testing evidence and traceability

### Style

- Follow ref-arch-diagram skill conventions
- One diagram per main page
- Syntax: `![drawio](./drawio/agentic-engineering-overview.drawio)`

## Dependencies

Complete all text changes in `readme.md` before starting the diagram so component names and flow steps are final.
