# Diagram Task: Agentic Engineering Overview

## Status

Not started. The drawio file at `drawio/agentic-engineering-overview.drawio` is currently an empty skeleton with no shapes or connections.

## Requirements

Use the `ref-arch-diagram` skill to create the diagram. It should reflect the restructured five-component architecture from `readme-v2.md`:

### Components to show

- **Coding Agent** at center — the agent harness as the central actor (handles generation, orchestration, worktrees)
- **Context Engineering** feeding into the agent — MCP servers (CAP, Fiori, UI5, MDK), structured specifications (markdown, version-controlled), project rules, context-activated skills, Context Hub, git commit history as knowledge source
- **Quality Pipeline** as the enforcement boundary between agent output and the repository — pre-commit hooks, CI/CD pipelines, branch protection, merge gates
- **Foundation Model Access** providing inference — LLM proxy (LiteLLM), SAP Generative AI Hub, strength-based routing, SAP AI Core
- **SAP BTP Runtime** as the deployment target — BTP, BDC for governed data products, AI Core for model hosting

### Cross-cutting

- **Governance** shown as a policy overlay on Context Engineering and Foundation Model Access (centralized registry controlling available MCP servers, skills and models)

### Flow arrows

Match the numbered steps from the Flow section in readme-v2.md:

1. Specification and Grounding
2. Task Decomposition
3. MCP-Grounded Generation
4. Quality Gate Execution
5. Merge Gate Enforcement

### Style

- Follow ref-arch-diagram skill conventions
- One diagram per main page
- Syntax: `![drawio](./drawio/agentic-engineering-overview.drawio)`

## Dependencies

Complete all text changes in `readme-v2.md` before starting the diagram so component names and flow steps are final.
