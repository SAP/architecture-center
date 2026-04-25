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

- `readme.md` — original (six layers)
- `readme-v2.md` — restructured (five components)
- `diagram-task.md` — separate task for the drawio diagram
- `context/critique-session-log.md` — full session log with all decisions
- `context/architecture-decisions.md` — this file
