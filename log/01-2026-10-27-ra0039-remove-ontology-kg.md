# 01 - Remove ontology-kg sub-page from RA0039

**Date:** 2026-10-27
**Branch:** ra0039-remove-ontology-kg
**PR:** [#145](https://github.tools.sap/OCTO/architecture-center/pull/145)

## Summary

Removed the `5-ontology-kg` sub-page from the SAP Lakehouse section of RA0039. The section contained a readme and a drawio diagram file. A search confirmed no inbound references to either file existed elsewhere in the project, so removal is clean.

## Detailed Changes

### Deleted files

- `docs/ref-arch/RA0039/1-sap-lakehouse/5-ontology-kg/readme.md`
- `docs/ref-arch/RA0039/1-sap-lakehouse/5-ontology-kg/drawio/ontology-kg.drawio`

### Reference cleanup

No references to `ontology-kg` or `5-ontology-kg` were found in any Markdown, JSON, JS, or TS files across the repository. No sidebar entries, links, or imports required updating.

## Rationale

The ontology-kg content was identified as stale or out of scope for the current state of RA0039. Removing it keeps the SAP Lakehouse section focused.

## Impact

- One sub-page fewer in the RA0039 SAP Lakehouse section.
- No other pages or navigation entries are affected.

## Follow-up

None identified.
