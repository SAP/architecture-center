# Changelog

## 2026-05-06

Refined RA0030 keywords to focus on specific SAP technologies (Fiori, CAP, UI5) instead of generic terms (SDKs, multi-agent orchestration, intelligent applications).

Replaced RA0030 inline Mermaid diagram with drawio reference to support visual diagram editing. Added new agentic-for-sap-extensions.drawio diagram and removed draft/empty drawio files.

## 2026-05-04

Consolidated RA0030 Key Components, Development Flow, and Characteristics sections using ref-arch-structure skill to eliminate redundancy while preserving architectural content. Merged 8 Key Components bullets to 5 (grouped SAP BTP services), refined Flow steps to remove repeated qualifiers, consolidated 6 Characteristics to 5 by merging overlapping Zero Trust and Deterministic Enforcement concepts. See [log/09-2026-05-04-ra0030-consolidate-redundancy.md](log/09-2026-05-04-ra0030-consolidate-redundancy.md).

## 2026-04-29

Applied ref-arch-voice corrections to RA0030: converted architecture table to bold-label bullets with colons, removed colloquial idiom "from day one", removed desire-framing "wants to", strengthened declarative statements, removed "Conclusion" heading, updated last_update date. Created readme-v5.md.

Restructured RA0030 to align with industry patterns (AWS/Azure/GCP): renamed "Design Principles" to "Design Considerations" and moved it after Development Lifecycle section. Research of AWS Well-Architected Framework, Google Cloud Architecture Framework, and Azure reference architectures revealed that all three major cloud providers position design guidance **after** architecture diagrams, not before. This aligns with both industry standards (12/12 SAP RAs and all major cloud providers) and the principle that reference architectures document results (what the system is) rather than process (how to design it). Updated ref-arch-structure skill to recognize "Design Considerations" as valid alternative to "Characteristics" when content includes prescriptive guidance alongside system properties.

Updated RA0030 Design Considerations with "Specification-Driven Grounding" principle: replaced generic "Context Engineering" with specific concept describing how humans and agents co-create specifications before code generation. Added GSD and Superpowers as examples of spec-driven development tools that identify gaps and increase specification detail. Clarifies that enhanced specifications combined with MCP servers, persistent rules and context-activated skills eliminate hallucinated APIs, deprecated syntax and incorrect annotation patterns at generation time.

## 2026-04-28

Rebuilt RA0030 Architecture table and Services section: replaced abstract "Context Engineering" and "Coding Agent" rows with "Agent Harness" carrying named MCP server sub-components; renamed "Foundation Model Access" to "Foundation Model Proxy"; expanded SAP BTP Runtime with HANA Cloud, Integration Suite and Audit Log Service; trimmed Services list to only services named in the body. See [log/08-2026-04-28-ra0030-services-architecture-table.md](log/08-2026-04-28-ra0030-services-architecture-table.md).

Redesigned RA0030 structure for decision-maker scanning: created readme-v4.md with Inverted Pyramid layout, Alex persona, Design Principles promoted before Architecture, component table replacing dense paragraphs, 5-phase mermaid lifecycle replacing 8-step flow, new Deployment Scenarios, Best-Practice Checklist and Conclusion sections. See [log/07-2026-04-28-ra0030-v4-structure-redesign.md](log/07-2026-04-28-ra0030-v4-structure-redesign.md).

Reduced density of RA0030 Architecture and Flow sections: rebuilt component descriptions from paragraph blocks into sub-bullet format (1 intro sentence + 2-4 bullets each); trimmed flow steps from 3-7 sentences to 1-2 each; updated ref-arch-structure skill flow benchmark from 3-5 to 3-8 based on corpus evidence. See [log/06-2026-04-28-ra0030-architecture-flow-density.md](log/06-2026-04-28-ra0030-architecture-flow-density.md).

## 2026-04-27

Moved RA0030 context and draft files into `human-only/` directory; removed superseded `context/` sources and `readme-v2.md`; updated `AGENTS.md` with open issues linked to the fork.

Reworked RA0030 Flow section from six generic steps to an explicit 8-step agentic engineering lifecycle: split agent setup into two activation steps (project skills and SAP MCP knowledge), added specification co-creation as a human+agent step before generation, surfaced parallel code production with inter-agent communication and agent-driven spec updates, added reviewer agent pre-screening before developer review, and separated the main branch merge from automated quality gates. Framed steps 1-3 as one-time setup and steps 4-8 as the repeating development cycle. Replaced all em dashes throughout.

Applied nine ref-arch-voice style fixes to the RA0030 Flow section: removed inline bold emphasis, Oxford commas and parenthetical asides; converted passive constructions to active; renamed the "Merge to Main" verb-phrase label to "Main Branch Integration". See [log/05-2026-04-27-ra0030-flow-style-fixes.md](log/05-2026-04-27-ra0030-flow-style-fixes.md).

## 2026-04-25

Critiqued and restructured RA0030 architecture from six "layers" to five components with coding agent as central actor; elevated Context Engineering to first-class pillar; anchored Clean Core extension acceleration value; fixed links and voice issues. Changes written to readme-v2.md for side-by-side comparison. See [log/04-2026-04-25-ra0030-architecture-critique-restructure.md](log/04-2026-04-25-ra0030-architecture-critique-restructure.md).

Elevated the governance registry to a first-class Skill Registry component in RA0030, mediating between Context Engineering and the Coding Agent; added Federated Governance characteristic; promoted Capability Discovery as flow step 3. Updated diagram task to reflect the six-component model.

Removed the Vibe Coding with Cline sub-page from RA0005 and its index reference.

## 2026-04-23

Analyzed RA0030 against the idea.md knowledge source and closed 9 content gaps on the main page: added Governance Layer, A2A protocol, Gen AI Hub depth, hyperscaler pricing, human-AI collaboration, institutional memory, on-prem example and spec-driven development framing. Architecture moved from 5 to 6 layers. See [log/03-2026-04-23-ra0030-gap-analysis-against-idea.md](log/03-2026-04-23-ra0030-gap-analysis-against-idea.md).

Reviewed RA0030 readme against the agentic engineering blog context. Fixed 11 issues: filled content gaps for spec-driven development, browser-based verification and security posture; reframed methodological content as system-centric; fixed voice compliance and front matter id collision. See [log/02-2026-04-23-ra0030-review-against-blog-context.md](log/02-2026-04-23-ra0030-review-against-blog-context.md).

## 2026-04-22

Rewrote RA0030 (Agentic Engineering for SAP) readme.md to conform to the ref-arch voice: third-person impersonal, declarative, zero-hedge, colon-separated bold-label pattern, link-only Services and Components, corrected front matter. See [log/01-2026-04-22-ra0030-ref-arch-voice-rewrite.md](log/01-2026-04-22-ra0030-ref-arch-voice-rewrite.md).
