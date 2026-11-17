# Consolidated Hardening Fixes — PR Summary

This document summarises what each of the nine PRs fixes, grouped by theme, and
notes which ones can be safely consolidated into a single merge-ready PR.

| PR | Theme | What it fixes | Safe to consolidate? |
|----|-------|---------------|----------------------|
| #1473 | Bug fix | Sidebar "Recently updated" filter silently switching off | Yes |
| #1383 | Bug fix | Deeply-nested RA pages missing from the homepage | Yes |
| #1387 | Accessibility | Tabs / Quick Start nav not keyboard-accessible | Yes |
| #1384 | CI gating | npm audit never actually failed CI | Yes |
| #1386 | CI gating | No build/lint/type/coverage gate on PRs | Yes (gate not auto-required) |
| #1381 | Supply chain | Draw.io exporter ran unpinned, over-privileged | Yes (merge before #1382) |
| #1382 | Determinism | Draw.io artifacts non-deterministic / silently stale | Yes (after #1381) |
| #1385 | Content links | 19 stale links + link-checker hardening | **No — superseded by dev** |
| #1388 | Security / auth | Tokens exposed in URLs / browser storage | **No — `do not merge`** |

---

## Bug fixes

### #1473 — Sidebar: fresh `showArchived` read + remove dead `searchTerm`
Fixes a correctness bug where the reference-architecture sidebar's "Recently
updated" filter could silently switch itself off when navigating to an archived
doc that has a recently-updated child. The URL-sync effect read a stale
`showArchived` snapshot taken before the archive branch set it to `true`; it now
reads the value fresh at the call site. Also removes `searchTerm` state that no
rendered UI ever drove (the filter bar has no search input), aligning the
active-filter checks. Pure client-side change, net negative lines.

### #1383 — Preserve nested document IDs in homepage mappings
Fixes deeply-nested reference-architecture pages disappearing from the homepage.
The page-mapping generator discarded every directory segment below the first
nested folder, so the generated Docusaurus document IDs no longer matched and
the tiles silently vanished. The ID is now built from the full nested path (with
numeric ordering prefixes stripped), and path normalisation is made
platform-independent. Root-level and single-nested docs produce byte-identical
IDs, so there is no regression for existing content.

## Accessibility

### #1387 — Keyboard navigation for interactive tabs
Makes two interactive areas keyboard- and screen-reader-accessible: the homepage
Architecture Tabs (full ARIA tab pattern — arrow keys with wrapping, Home/End,
roving tabindex, orientation derived from the responsive breakpoint) and the
Quick Start document navigation (clickable `div`s become real, named `button`s
with `aria-current`, wrapped in a labelled `nav`). Also fixes nested
`setTimeout` leaks and replaces raw `<ui5-icon>` with the React `<Icon>` wrapper
for consistency. No content change.

## CI gating

### #1384 — Make npm audit failures fail security checks
Fixes a silent-failure bug: the security-audit workflow swallowed `npm audit` and
SARIF-parser exit codes and always reported success, so registry errors and
high/critical advisories never failed CI. Replaces it with a tested policy
script that fails on real errors and unresolved high/critical advisories, while
allowing a single documented, time-boxed exception (expiry + reason) for an
unpatched upstream advisory.
*Optimisation applied:* accept `auditReportVersion >= 2` (not `=== 2`) so a
routine npm upgrade to a v3 report cannot turn into a CI outage.
*Follow-up:* the exception expires 2027-01-31 and needs an owner.

### #1386 — Gate pull requests on build and code quality
Adds a PR workflow gating on four jobs (production build, ESLint, TypeScript,
tests + coverage), using checked-in ratcheting baselines so existing debt is
preserved while new regressions are rejected.
*Optimisation applied:* the `typecheck` scripts now also run
`generate-ref-arch-updates`; without it the TypeScript gate would fail on
current dev (`ref-arch-updates.tsx` imports a generated, gitignored JSON that the
job never produced → `TS2307`). The TS baseline was regenerated against current
dev.
*Follow-ups (non-blocking):* make the coverage ratchet regression-only (it
currently also fails on improvements); loosen the TS fingerprint to tolerate
line-number drift; and mark the four checks as required branch-protection checks
only after they run green on dev.

## Supply chain & build determinism (Draw.io)

### #1381 — Pin and isolate the Draw.io exporter container
Fixes a supply-chain / container-escape exposure: the SVG export step ran a
mutable (unpinned) image with the whole repository bind-mounted read/write. Now
pins the image by OCI digest and runs it locked down (`--read-only`,
`--cap-drop=ALL`, no-new-privileges, non-root, `pids-limit`, tmpfs, minimal
read-only mounts) with symlink/path validation.
*Optimisations applied:* dropped a dead `deploy-manual.yml` reference (the file
was deleted on dev); fixed the smoke-test diff base so it does not fail on `push`
events where `GITHUB_BASE_REF` is empty.

### #1382 — Make Draw.io artifacts deterministic
Fixes non-reproducible and silently-stale diagram artifacts: diagrams are now
resolved by repository-relative source identity + content hash (fixing
duplicate-basename collisions), the cache fingerprint covers every input that
affects the rendered SVG, and export/watermark/artifact failures now abort the
build instead of being swallowed. **Stacked on #1381** — must merge after it.
*Optimisation applied:* a readme missing its `title` front-matter now throws a
clear, named error instead of an opaque `TypeError` that would abort the whole
deploy.
*Follow-up:* the fail-hard pipeline needs a full `npm run build` against current
dev content in CI (the unit-test gate does not exercise a real render).

---

## Not suitable for the consolidated PR

### #1385 — Repair stale published links — **superseded by dev**
Intended to fix 19 stale links and harden the link checker. However, dev has
since done a more thorough version of the same work (the checker now blocks only
`404`/`410`, and the same links were re-curated or removed) and relocated the
contributor doc. A merge produces 14 conflicts that are almost all "dev already
did it better". Only two pieces are genuinely unique: the `.lycheeignore` entry
for encoded Docusaurus `require(...)` image URLs, and the RA0031 DCP spec
relocation (which needs a live link check to confirm the correct target).
**Recommendation:** do not fold the whole PR in; instead carry only those two
unique items, or close #1385 as superseded.

### #1388 — HttpOnly auth sessions — **`do not merge`**
Eliminates a real credential-exposure risk (bearer tokens in redirect URLs and
browser storage) by moving to a same-origin BFF contract with `HttpOnly` session
cookies and CSRF protection. The frontend code is sound, but it has a hard
runtime dependency on a Cloudflare BFF and upstream auth services that live
**outside this repo** and are not yet deployed. Merging before that contract is
live would 404 Quick Start login and every authenticated call in production.
**Recommendation:** keep this as its own PR, blocked, and release it only when
the deployed BFF contract passes. It must not go into a consolidated PR intended
to merge.

---

## Recommended consolidation scope

Fold the **seven safe PRs** into one branch off current dev:
**#1473, #1383, #1387, #1384, #1386, #1381, #1382** (Draw.io pair in order).
Keep **#1385** and **#1388** out, for the reasons above.
