# Architecture Decisions — RA0030 Agentic Engineering for SAP

Concise reference for future Claude Code sessions working on this RA.

## Architecture Model (v2)

Five components with the coding agent as central actor. Governance is cross-cutting.

| Component | Role |
|---|---|
| **Context Engineering** | The central pillar. Manages what knowledge reaches the agent and when. MCP servers, specs-as-code (markdown, version-controlled alongside source), git history as context, project rules, skills, progressive disclosure, compounding institutional knowledge. |
| **Coding Agent** | Central actor. Agent harness (Claude Code, Cline) with built-in orchestration — task decomposition, worktrees, A2A are native features, not separate components. |
| **Quality Pipeline** | Enforcement boundary. Hooks, CI/CD, branch protection, merge gates. Operates outside the agent. Agent output is untrusted by default. |
| **Foundation Model Access** | LLM proxy (LiteLLM) → SAP Gen AI Hub → SAP AI Core. Strength-based routing. Single API key. |
| **SAP BTP Runtime** | Deployment target. Side-by-side extensions preserving clean core. BDC for governed data. |

**Cross-cutting:** Governance registry controlling available MCP servers, skills and models.

## Architecture Model (v3) — Skill Registry

Six components. The Skill Registry was elevated from an implicit "centralized governance registry" sentence inside Context Engineering to a first-class component.

| Component | Role |
|---|---|
| **Context Engineering** | Manages what knowledge reaches the agent and when. Skills now resolve from the Skill Registry. Reusable behaviors publish back to the registry for cross-team distribution. |
| **Skill Registry** | Governance and distribution layer for reusable agent behaviors. Catalogs skills, rule templates, prompt patterns, tool configurations. Owns version pinning, approval workflows, deprecation lifecycle, usage metrics. Controls which skills and MCP servers are available. |
| **Coding Agent** | Central actor. Agent harness with built-in orchestration — task decomposition, worktrees, A2A are native features. |
| **Quality Pipeline** | Enforcement boundary. Hooks, CI/CD, branch protection, merge gates. Agent output is untrusted by default. |
| **Foundation Model Access** | LLM proxy (LiteLLM) → SAP Gen AI Hub → SAP AI Core. Model governance now attributed to SAP Gen AI Hub directly. |
| **SAP BTP Runtime** | Deployment target. Side-by-side extensions preserving clean core. BDC for governed data. |

### Why a Separate Component

The Skill Registry mediates between Context Engineering and the Coding Agent — analogous to how Foundation Model Access mediates between the agent and the models. Foundation Model Access governs *which models* agents use; the Skill Registry governs *which behaviors* agents use. Keeping it inside Context Engineering conflated the discipline of assembling context with the governance of what is available to assemble. Separation earns its place when skills flow across project and team boundaries.

### Governance Responsibility Split

The former "centralized governance registry" governed MCP servers, skills and models in a single sentence. This was split:

- **Skills and MCP servers** → Skill Registry component
- **Models** → SAP Generative AI Hub (within Foundation Model Access)

### Flow Change: Capability Discovery

Discovery Before Custom Build was promoted from an Example to flow step 3 (between Task Decomposition and MCP-Grounded Generation). Rationale: discovery is a system behavior — after decomposition reveals what needs to be built, agents query the registry and SAP Joule for existing solutions before generating anything custom. The six-step flow slightly exceeds the 3–5 benchmark but is architecturally justified since discovery is a distinct system action.

### New Characteristic: Federated Governance

Added to capture the registry's security and compliance role: version pinning, approval workflows and deprecation lifecycle align agent behaviors with enterprise requirements across the organization.

### Compounding Knowledge Extended

The characteristic now includes cross-team distribution: reusable behaviors publish to the skill registry, turning project-local knowledge into organization-wide assets.

## Key Value Proposition

Accelerating BTP extensions to keep the S/4HANA core clean. Clean Core increases extension volume; agentic engineering with context engineering accelerates development while maintaining quality.

## Why Not "Layers"

The original six "layers" were not layers — they lacked dependency hierarchy. Governance is cross-cutting, quality enforcement is a gate mechanism, SAP Runtime is platform infrastructure. Published RAs (RA0002, RA0003, RA0005, RA0007) use "components" with a central actor.

## Context Engineering Details

- **Spec-as-code:** Markdown specifications version-controlled alongside source, kept in sync with the code baseline
- **Git history as context:** Semantic commits serve as agent knowledge source and audit trail
- **Progressive disclosure:** Always-on rules → on-demand MCP queries → isolated subagent contexts
- **Compounding knowledge:** Fixes and edge cases feed back into rules, skills and specifications

## Voice and Structure

Follow `ref-arch-voice` and `ref-arch-structure` skills. Key norms: components not layers, central actor, bold-label pattern with colons, no Oxford comma, third-person declarative, zero-hedge, 700-1500 words.

## Files

- `readme.md` — current (six components, v3 with Skill Registry)
- `readme-v2.md` — previous restructured version (five components)
- `diagram-task.md` — separate task for the drawio diagram
- `context/critique-session-log.md` — full session log with all decisions
- `context/architecture-decisions.md` — this file
