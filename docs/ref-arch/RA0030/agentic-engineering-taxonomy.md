# Agentic Engineering Reference Architecture

## Overview

- **Reference Architecture**: `docs/ref-arch/RA0030/readme.md`
- **Blog Post**: `docs/ref-arch/RA0030/context/2026-03-30-agentic-engineering.md`
- **Audience**: Architects and developers
- **Depth**: Architecture patterns & decision frameworks (not implementation guides)

## Topic Structure

### Foundations

| # | Topic | Core Concern | Context Sources |
|---|-------|--------------|-----------------|
| 1 | **The Economics of Agentic Development** | Code cost collapse — what's cheap now, what remains expensive, how this changes planning | Willison ch.1, ch.4, parallel agent economics, quality vs. speed tension |
| 2 | **Context Engineering** | Managing context as the scarcest resource — persistent rules, progressive disclosure, isolation | Grounding pyramid, CLAUDE.md architecture, skills, subagent isolation, <50% window |
| 3 | **Grounding & Hallucination Reduction** | Eliminating fabricated APIs/patterns — connecting agents to authoritative sources | Context Hub (chub), MCP servers, CLI vs. MCP framework, trust policies |

### Execution

| # | Topic | Core Concern | Context Sources |
|---|-------|--------------|-----------------|
| 4 | **Agentic Development Workflows** | The disciplined loop: explore → plan → implement → verify → commit | Boris Cherny workflow, GSD/SDD, knowledge hoarding (Willison ch.2), compounding intelligence |
| 5 | **Testing & Verification for Agents** | Ensuring agent output actually works — not just compiles | Red/Green TDD (ch.5-6), manual/smoke testing (ch.7), UI bootstrap hole, Playwright |

### Scaling

| # | Topic | Core Concern | Context Sources |
|---|-------|--------------|-----------------|
| 6 | **Multi-Agent Orchestration** | Coordinating multiple agents — topologies, state, decomposition | Sequential/parallel/hierarchical, orchestrator-workers, A2A protocol, shared vs. isolated state |
| 7 | **Human Governance & Safety** | Keeping humans in control — gates, enforcement, auditability | HITL gates, hooks, provenance logging, anti-patterns (Willison ch.3) |
| 8 | **MCP & Tool Integration for SAP** | Connecting agents to SAP ecosystem | SAP Build MCP servers, BDC pattern, LiteLLM proxy, Cloud SDK for AI, discovery hierarchy |

---

## Key Tensions to Address

These represent the core trade-offs and decision points in agentic engineering:

1. **Speed vs. Quality**: Vibe coding vs. disciplined agentic engineering
2. **Context Explosion vs. Coverage**: MCP eager-loading vs. CLI discovery
3. **Agent Autonomy vs. Oversight**: Free-roaming vs. HITL gates
4. **Grounding Infrastructure Investment**: Heavy upfront vs. on-demand prompting
5. **Specification Overhead vs. Maintenance**: GSD structure vs. pure vibe

## Detailed Topic Scope

### 1. Economics of Agentic Development

- **Cost inversion**: Generation cheap, quality expensive
- **When to invest** in agent infrastructure vs. just prompt
- **Parallel agent ROI**: 5-15 sessions, coordination overhead
- **Refactoring/tech debt paydown** now cost-justified

### 2. Context Engineering

- **Context window** as scarcest resource
- **Three-tier model**: Always-on (CLAUDE.md), on-demand (skills), isolated (subagents)
- **Progressive disclosure patterns**
- **Budget management**: <50% utilization target

### 3. Grounding & Hallucination Reduction

- **Grounding pyramid** (4 layers)
- **CLI vs. MCP vs. Context Hub** decision framework
- **Trust hierarchy** for documentation sources
- **SAP-specific grounding** via MCP servers

### 4. Agentic Development Workflows

- **Core loop**: Explore → Plan → Implement → Verify → Commit
- **Spec-driven development** (GSD framework)
- **Knowledge hoarding**: Reusable proven examples
- **Compounding intelligence** loop

### 5. Testing & Verification for Agents

- **Red/Green TDD** as non-negotiable gate
- **Manual testing patterns**: CLI, curl, Playwright
- **UI bootstrap testing hole**
- **Proof-of-work** in PRs

### 6. Multi-Agent Orchestration

- **Topologies**: Sequential, parallel, hierarchical, evaluator-optimizer
- **A2A protocol**
- **Shared state vs. isolated context**
- **Task decomposition and coordination**

### 7. Human Governance & Safety

- **HITL gate design**
- **Hooks** as deterministic policy enforcement
- **Provenance logging and auditability**
- **Anti-patterns**: Unreviewed code, suppressed errors, skipped gates

### 8. MCP & Tool Integration for SAP

- **SAP Build MCP servers**: CAP, Fiori, UI5, MDK
- **BDC integration**: Read-only design-time, bidirectional runtime
- **LiteLLM + SAP AI Core** proxy architecture
- **Agent/SDK discovery hierarchy**
