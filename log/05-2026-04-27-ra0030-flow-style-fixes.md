# 2026-04-27 - RA0030 Flow Section Style Fixes

**Scope:** RA0030 readme.md, Flow section (Steps 1-8)

## What was done

- Reviewed the Flow section against the `ref-arch-voice` skill, identifying nine style violations
- Removed inline bold emphasis from prose in Steps 3, 4 and 5 (`**curated specification**`, `**concurrently**`, `**SAP MCP servers**`) — bold is reserved for the label pattern, not in-sentence emphasis
- Removed three Oxford commas (Steps 2, 4, 5) per ref-arch-voice no-Oxford-comma rule
- Removed parenthetical asides in Steps 2 and 3: integrated `(client-managed)` into the sentence; removed `(i.e.: superpowers)` entirely
- Rewrote Step 3 opening from a gerund phrase ("Using a Spec-Driven-Development tool...") to a technology-as-subject active sentence
- Fixed the dangling comma before "that" in Step 3's constraint list
- Fixed "Human approves" → "The developer approves" in Step 4 (missing article)
- Fixed passive "Non-conforming code is rejected" → active "The quality pipeline rejects..." in Step 6
- Replaced "is responsible for reviewing...running...and validating" with direct active construction in Step 7
- Fixed informal "so the developer can focus review on what matters" → "enabling the developer to focus review on substantive concerns" in Step 7
- Removed double space in Step 7
- Renamed Step 8 label from "Merge to Main" (verb phrase) to "Main Branch Integration" (noun phrase)
- Rewrote Step 8 opening from passive "Once...is fully reviewed and tested" to direct active sentence

## Decisions made

- Step 5 length (seven sentences) was not trimmed — the user did not request content changes, only style fixes; splitting it is an architectural decision for a future session
- The `(i.e.: superpowers)` reference was removed rather than integrated, as the tool name is implementation-specific and not appropriate for RA content at this level

## Open items

- Step 5 remains the longest step at ~130 words; consider splitting or trimming in a content pass
- Step 3 still references "Spec-Driven-Development tool" without naming a specific component — may need a Services and Components entry or a Resources link
