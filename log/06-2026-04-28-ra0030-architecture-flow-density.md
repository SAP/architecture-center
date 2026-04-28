# 2026-04-28 — RA0030 Architecture and Flow Density Reduction

## Scope

RA0030 main page: Architecture section (component descriptions) and Flow section (8 steps).

## What was done

- Researched published RA corpus for flow step density: found ceiling of 8 steps (RA0017, RA0022) at 1-2 sentences per step
- Updated `ref-arch-structure` skill: changed flow step benchmark from 3-5 to 3-8 based on corpus evidence
- Rebuilt Architecture component descriptions from dense paragraphs (4-9 sentences each) to sub-bullet format (1 intro sentence + 2-4 bullets per component), deriving content from the flow section as source of truth
- Trimmed Flow steps from 3-7 sentences each down to 1-2 sentences, relocating explanatory detail into the Architecture components
- Added Foundation Model Access reference to step 5 (previously absent from the flow)
- SAP BTP Runtime already referenced in step 2 via "MCP servers on BTP"

## Decisions made

- 8 flow steps is acceptable based on corpus evidence (not the skill's original 3-5 benchmark)
- Architecture component descriptions remain (novel concepts like Context Engineering need a legend), but use sub-bullet format inspired by RA0013
- Flow is source of truth; Architecture component descriptions were rebuilt from it, not preserved
- Foundation Model Access and SAP BTP Runtime kept as components despite weak flow presence

## Open items

- Genuinely lost detail from flow trimming that may warrant restoration:
  - Non-functional constraint examples (security posture, performance budgets, reliability, scalability)
  - SAP-specific agent examples (backend=CAP/CDS, frontend=Fiori/UI5)
  - Developer "runs the application" in step 7
  - "Submits one pull request" as explicit output of step 5
  - Reviewer agent "producing a structured summary of changes and concerns"
- Characteristics section may need revalidation against updated Architecture/Flow
- `readme-v2.md` exists as an untracked file (side-by-side comparison from earlier session)
