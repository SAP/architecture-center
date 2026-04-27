# Critique Session Log — RA0030 Agentic Engineering for SAP

**Date:** 2026-04-25
**Participants:** Guilherme Segantini + Claude Code (Opus)
**Branch:** agentic-engineering-ra
**Scope:** Architectural critique and restructure plan for RA0030

---

## 1. Initial Critique

Reviewed `readme.md` against `ref-arch-voice` and `ref-arch-structure` skills. The document has 1,228 body words (within 700-1,500 benchmark), 7 H2 sections, 5 flow steps, 6 characteristics and 5 examples. Voice compliance is strong: third-person, declarative, zero-hedge, correct bold-label pattern, no Oxford commas.

### Critical issues identified

1. **Empty diagram** — the drawio file has no shapes, just a skeleton mxGraphModel
2. **"Permission layer" ghost reference** — Characteristics mentions "the permission layer" but no such layer exists in the six-layer model
3. **Characteristics exceed density norms** — 6 at ~40 words each vs. benchmark of 3-6 at ~30 words; two overlap with layer descriptions (Governed Toolchain restates Governance Layer, Grounded by Construction restates Grounding Layer)

### Structural issues identified

4. **Methodology leakage** — several passages describe what people do rather than what the system does ("Humans and agents collaborate...", "reviewed by the architect")
5. **Context engineering is invisible** — taxonomy identifies it as foundational but the architecture body never uses the term
6. **A2A protocol is asserted but not developed** — one sentence with no explanation of what crosses the boundary
7. **On-premise story is buried** — only appears as the 5th (last) example despite being a primary audience per idea.md

### Services/Resources issues

8. **Link quality** — SAP Build MCP Servers links to a blog post, UI5 Web Components MCP Server links to a personal GitHub, SAP Cloud SDK for AI links to a community page, LiteLLM is OSS mixed with SAP services
9. **Resources overlap with Services** — Fiori MCP Server, UI5 Web Components, LiteLLM, SAP Build MCP Servers appear in both
10. **Cline documentation disconnected** — in Resources but never mentioned in architecture body
11. **OpenSpec and GSD in Resources but not in architecture** — idea.md positions them as central but architecture ignores them

### Voice items

12. **Flow steps are long** — step 1 is 47 words, borderline
13. **Characteristic bullets are wordy** — several at 40+ words vs. ~30 benchmark
14. **Em dash in front matter description** — displays inconsistently in search previews

### What works well

- Opening context is clean: problem in paragraph 1, solution in paragraph 2, ~135 words
- Voice is consistently third-person, declarative, no marketing language
- Bold-label pattern correctly applied throughout
- Section ordering follows canonical sequence
- "Correct by construction" framing is strong
- Tooling-agnostic framing with disclaimer is well done

---

## 2. User Feedback: Narrow Scope

User selected items #1 (empty diagram), #5 (context engineering), #7 (A2A), #8 (link quality), #14 (em dash) for the plan. Other items deferred.

---

## 3. User Feedback: Clean Core Value Proposition

**Key insight:** The holy grail for clients is accelerating extensions on BTP to keep the core clean. The current document doesn't make this value proposition clear. The opening frames the problem as "ungrounded code generation" (a technical problem) when the business problem is "Clean Core demands more extensions but development capacity is flat."

idea.md captures this: "Customers need extension apps; this approach gets them to production faster" and "Biggest SAP customer pain point: time to value." But the readme opens with hallucinated APIs instead of time to value.

**Decision:** Anchor the Clean Core / extension acceleration message in the main page opening and SAP BTP Runtime component.

---

## 4. User Feedback: Architecture Structure

**Key question:** Is the six-layer architecture model correct?

### Analysis

The six "layers" are not layers. Layers in software architecture imply dependency hierarchy (higher consumes lower). These six don't stack:

- **Governance** is cross-cutting — controls which MCP servers, skills and models are available across multiple other "layers"
- **Quality Enforcement** is a gate mechanism — checkpoints in a flow, not a service layer
- **SAP Runtime** is platform infrastructure — exists with or without agentic engineering
- **The coding agent is invisible** — the central actor has no architectural placement

The flow confirms the mismatch: Grounding → Orchestration → Grounding again → Quality Enforcement → merge gate (unmapped). If truly layered, the flow would traverse sequentially.

### Research: published RA conventions

Analyzed RA0002, RA0003, RA0004, RA0005, RA0007, RA0011:
- All use "components" or "services", never "layers" (except rare data-flow contexts)
- 4-8 major components per RA
- All place a central actor at the hub (CAP, DNS load balancers, Datasphere, etc.)
- Cross-cutting concerns (security, governance, monitoring) are described in narrative flow or characteristics, not as separate layers

### Decision: restructure to components with central actor

Six "layers" → components + cross-cutting. Coding agent becomes the central actor.

---

## 5. User Feedback: Agent Runtime and Orchestration

**Key insight:** Orchestration and the agent runtime are not separate architectural components. They are features handled by the coding agent harness (Claude Code, Cline, etc.). Task decomposition, dependency waves, worktrees and A2A are built-in capabilities of the agent — not a separate component.

**Decision:** Merge into a single "Coding Agent" component.

---

## 6. User Feedback: Context Engineering as a Pillar

**Key insight:** Context engineering is one of the most important pillars for higher code quality. It should not be buried as a passive "Grounding Sources" component — it should be the first-class name for the component.

**Decision:** Rename from "Grounding Sources" to "Context Engineering" as a first-class architectural component. It is the active discipline of managing what knowledge reaches the agent and when, not just a collection of MCP servers.

---

## 7. User Feedback: Spec-as-Code and Git History

**Key insight from user:** The system spec is provided in markdown format and lives in the repository alongside the source code, version-controlled. The spec must stay in sync with the code baseline. Commits provide agents with the history of changes. Commits need to be documented in detail so agents know what's going on. This serves as an audit trail.

**Decision:** Add to Context Engineering component:
- Structured specifications in markdown, version-controlled alongside source code
- Git commit history as a knowledge source for agents
- Detailed semantic commits for codebase evolution context
- Audit trail for traceability

---

## 8. User Feedback: Sub-Page Scope

Initially proposed creating a sub-page at `1-accelerating-extensions/` for the Clean Core story. User feedback: this expands scope too much. But the extension acceleration value is still the key proposition.

**Decision:** Light touch — anchor the Clean Core message with a few sentences in the opening and SAP BTP Runtime component, not a separate sub-page. Move on-premise example up in the Examples section.

---

## 9. User Feedback: Quality Pipeline as 5th Component

Both RA0005 and RA0002 include CI/CD as a named component. For agentic engineering where the agent generates at scale, the enforcement boundary between agent output and repository is even more critical.

**Decision:** Add Quality Pipeline as a 5th component (not just cross-cutting). It includes pre-commit hooks, CI/CD pipelines, branch protection and merge gates. Agent-generated code is treated as untrusted by default.

---

## 10. Final Architecture Model

**Five components:**

1. **Context Engineering** — the grounding pillar (MCP servers, specs-as-code, git history, project rules, skills, progressive disclosure, compounding knowledge)
2. **Coding Agent** — central actor (agent harness with built-in orchestration, worktrees, A2A)
3. **Quality Pipeline** — enforcement boundary (hooks, CI/CD, branch protection, merge gates)
4. **Foundation Model Access** — inference infrastructure (LiteLLM, Gen AI Hub, AI Core)
5. **SAP BTP Runtime** — deployment target (BTP, BDC, AI Core hosting)

**Cross-cutting:** Governance (centralized registry for MCP servers, skills and models)

---

## 11. Execution Decisions

- **readme-v2.md** instead of modifying readme.md — for side-by-side comparison
- **Diagram is a separate task** — `diagram-task.md` at RA0030 root
- **Execute items #1-#6 as one coherent pass**, not one-at-a-time (tightly coupled changes)
- **Session log** (this file) to preserve full decision trail
- **Architecture decisions document** as concise reference for future sessions

---

## 12. Plan Items (Final)

| # | Item | Scope |
|---|---|---|
| 1 | Restructure six layers → five components | Architecture section rewrite |
| 2 | Anchor Clean Core / extension acceleration | Opening + SAP BTP Runtime + examples reorder |
| 3 | Name context engineering in opening | One sentence in paragraph 2 |
| 4 | Develop A2A one more sentence | Within Coding Agent component |
| 5 | Fix Services and Components links | Link corrections + move LiteLLM |
| 6 | Fix em dash in frontmatter | Description field |
| 7 | Architecture decisions document | context/architecture-decisions.md |
| Separate | Diagram task | diagram-task.md |
