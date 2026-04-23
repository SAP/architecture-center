# 2026-04-23 — Agentic Engineering Blog: Cross-Reference and Polish

## Scope
Blog post: `news/2026-04-27-agentic-engineering.md`

## What was done
- Added inline reference to Anuj Gupta's "Finding the Needle" blog post in the intro paragraph, linking to his AI-assisted debugging story as evidence that post-hoc debugging is expensive
- Added the same post to the References section under "Agentic Engineering & Spec-Driven Development"
- Placed the architecture diagram (`agentic-engineering-architecture.svg`) before the "How to Equip Your Agent" section as a visual overview
- Updated `spotlight_image` in front matter to use the architecture diagram
- Refined intro paragraph voice through several iterations: rephrased for clarity, fixed typos, tightened the transition from frustration to the post's thesis

## Decisions made
- Placed Anuj's reference in the intro (option 1) rather than the closing section, to reinforce the debugging cost argument early before presenting the MCP solution
- Placed the architecture diagram before the config code section rather than after the "full-stack picture" paragraph, so readers get the visual overview before implementation details
- Kept the blog's first-person conversational tone for the cross-reference sentence rather than strict ref-arch voice, since the rest of the post is narrative

## Open items
- Branch `new-blog` has diverged from `origin/new-blog` (30 local vs 15 remote commits) — needs reconciliation before merge
- `news/svg-creator.js` is untracked — decide whether to commit or gitignore
