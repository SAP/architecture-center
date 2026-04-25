# 2026-04-25 — RA0030 Architecture Critique and Restructure

## Scope

RA0030 main page architecture model, opening context, services/resources links and supporting context documents.

## What was done

- Critiqued RA0030 against ref-arch-voice and ref-arch-structure skills; identified 14 issues across structure, architecture, voice and links
- Restructured the six-layer model into five components with the coding agent as central actor (Context Engineering, Coding Agent, Quality Pipeline, Foundation Model Access, SAP BTP Runtime); Governance moved to cross-cutting concern
- Elevated Context Engineering from passive "Grounding Sources" to a first-class architectural pillar with spec-as-code, git history as agent context, progressive disclosure and compounding knowledge
- Added Clean Core / extension acceleration value proposition to the opening and SAP BTP Runtime component
- Named context engineering explicitly in the opening paragraph
- Developed the A2A protocol with one additional sentence on what it enables
- Fixed Services and Components links: SAP Cloud SDK for AI → help.sap.com, UI5 Web Components MCP Server → official UI5 repo, LiteLLM moved from Services to Resources
- Replaced em dash with colon in frontmatter description
- Moved On-Premise Extension example from position 5 to position 2
- Trimmed Characteristics from 6 to 5 (removed Governed Toolchain, woven into component descriptions)
- Created readme-v2.md for side-by-side comparison with the original
- Created diagram-task.md as a separate task for the empty drawio diagram
- Created context/critique-session-log.md with full decision trail
- Created context/architecture-decisions.md for future session context

## Decisions made

- **Components not layers:** Published RAs use "components" with a central actor; six "layers" lacked dependency hierarchy
- **Coding Agent + Orchestration merged:** Orchestration (task decomposition, worktrees, A2A) is a built-in capability of the agent harness, not a separate component
- **Quality Pipeline as 5th component:** Both RA0005 and RA0002 include CI/CD as a named component; the enforcement boundary between agent output and repository is architecturally significant
- **Context Engineering as the pillar:** The key differentiator that separates productive agentic engineering from ungrounded vibe coding
- **Diagram deferred:** Separated into its own task (diagram-task.md) since it depends on final text and is a distinct creative task
- **readme-v2.md instead of modifying original:** Enables side-by-side comparison

## Open items

- Populate the drawio diagram (see diagram-task.md) — depends on finalizing readme-v2.md content
- Review readme-v2.md word count (1,493 words, at upper edge of 700-1,500 benchmark)
- Validate SAP Build MCP Servers link (community blog post returned 403 during verification)
- Consider whether Context Engineering component description is too long for the main page and should use sub-pages
- Replace readme.md with readme-v2.md once approved
