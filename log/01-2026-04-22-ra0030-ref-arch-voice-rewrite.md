# 2026-04-22 — RA0030 Ref-Arch Voice Rewrite

## Scope

`docs/ref-arch/RA0030/readme.md` — the Agentic Engineering for SAP reference architecture.

## What was done

- Rewrote the entire readme.md to conform to the ref-arch-voice skill (third-person, impersonal, declarative, zero-hedge)
- Fixed front matter: added `sap` as first keyword, added `discussion:` field, shortened title to 60-char limit, tightened description to front-load first 110 characters
- Converted all bold-label patterns from em-dash separators to colon separators
- Converted all bold-label subjects from verb phrases to noun phrases (e.g. "Agents research before building" to "Research Before Build")
- Removed all hedging language ("can", "may", "might") and made every capability statement declarative
- Removed all second-person references ("you", "your") and imperative verbs addressing the reader
- Removed contractions throughout
- Removed Oxford commas from serial lists
- Removed informal language ("vibe coding", "not by luck", "the MCP pattern wins")
- Removed ALL-CAPS emphasis (HOW/WHERE/WHAT) from the grounding compound summary
- Cleaned Services and Components to link-only format (removed inline descriptions per RA standard)
- Added SAP Generative AI Hub as a standalone service entry
- Removed split entries (DeepEval/LangSmith) and APM-specific tools (Grafana/Datadog) that had inline descriptions
- Restructured grounding pyramid layers from free-form bold paragraphs to proper bold-label bullets with four-space indentation
- Renamed Architecture Patterns table column from "Use when..." to "SAP Example" for declarative tone

## Decisions made

- Kept em dashes in grounding pyramid layer labels (e.g. "Layer 1 — Persistent Rules:") as structural hierarchy markers, distinct from the bold-label colon separator
- Kept em dashes in Resource link titles where they are part of the proper name (e.g. "Building Effective Agents — Anthropic")
- Retained structural commas before "and" in multi-clause sentences where each clause has internal "and" — these aid parsing and are not Oxford commas

## Open items

- Deep Dive sub-pages (evals, grounding, orchestration-governance, security) do not exist yet
- The drawio diagram was not modified — verify it renders correctly on the site
- Draft flag remains `true` — flip to `false` after content review
- Tags use `genai` and `appdev` only — consider adding `agents` tag from tags.yml
