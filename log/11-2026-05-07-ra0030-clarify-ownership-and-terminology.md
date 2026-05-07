# 2026-05-07: RA0030 Clarify Ownership and Terminology

## Scope

RA0030 Key Components, Development Flow, and Characteristics sections.

## What was done

- Clarified customer vs SAP ownership in Key Components: renamed "Customer-managed MCP Servers" to "SAP MCP Servers" (SAP provides these), kept "Skill Registry" and "Model Proxy" as customer-managed (implicit)
- Simplified terminology: "Foundation Model Proxy" to "Model Proxy", "Customer-managed Skill Registry" to "Skill Registry"
- Enhanced MCP server description: clarified they "expose authoritative knowledge" and "enhance context at code generation and validation time"
- Improved specification-driven grounding description: changed "enhance" to "enrich", "eliminate ambiguity" to "reduces ambiguity" (more accurate)
- Added "customer-managed" qualifier to model proxy and skill registry in Characteristics section for clarity
- Fixed typo: "comphreensive" to "comprehensive"
- Updated drawio diagram (coordinate adjustments)

## Decisions made

- MCP servers are SAP-provided (not customer-managed), while skill registries and model proxies are customer-managed infrastructure
- Kept terminology simple in Key Components section (ownership implied by context), made ownership explicit in Characteristics section where governance is discussed
- Used "enriches" instead of "enhances" for specification improvements (more precise)

## Open items

None. Changes are ready to commit and push.
