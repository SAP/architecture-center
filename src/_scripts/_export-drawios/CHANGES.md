# Draw.io Export Pipeline — Change Log (PR #1520)

This document records the changes to the Draw.io export pipeline in PR #1520
(`fix/drawio-hardening-combined`), which combines two previously separate PRs:

- **#1381 — Pin and isolate the Draw.io exporter container** (supply-chain hardening)
- **#1382 — Make Draw.io artifacts deterministic** (reproducible, never silently stale)

plus a set of review- and bot-driven fixes applied on top.

---

## Why the change set is large

The diff is **12 files, +1216 / −175**, but that is less than it looks:

1. **Two feature sets in one branch** — container isolation (#1381) and artifact
   determinism (#1382).
2. **A refactor, not net-new scope.** The old `_export.js` did Docker invocation,
   caching, fingerprinting, the export loop, and link rewriting inline, and
   swallowed errors. Those responsibilities were split into small, focused,
   testable modules — so most "new files" are extractions from `_export.js`.
3. **Tests where there were none.** 5 of the 12 files are new `*.test.js`
   (~495 of the added lines). The original pipeline had no tests.

Set aside the tests and extractions, and the real behavior change is concentrated
in `_export.js`, `drawio-cache.js`, `_update-drawio-links.js`, and the new
`docker-export.js`.

---

## File inventory

| File | Status | Lines | From | Purpose |
|------|--------|-------|------|---------|
| `_export.js` | Modified | +217/−105 | both | Main export orchestrator. Calls the new modules, fail-hard error aggregation, title/slug guards, safe cleanup, deterministic artifact selection. |
| `docker-export.js` | New | +200 | #1381 | Extracted Docker runner: image pinned by digest, locked down (`--read-only`, `--cap-drop=ALL`, no-new-privileges, non-root, tmpfs, `--network=none`), with input/output path validation. |
| `docker-export.test.js` | New | +185 | #1381 | Tests the isolation flags, path/symlink rejection, opt-in real-container smoke test. |
| `drawio-fingerprint.js` | New | +40 | #1382 | Composite cache fingerprint over every input affecting the SVG (source, title, slug, logo, date, renderer + pipeline identity, QR version, base URL). |
| `drawio-fingerprint.test.js` | New | +39 | #1382 | Tests fingerprint stability / sensitivity. |
| `drawio-cache.js` | Modified | +81/−15 | #1382 | Schema-versioned manifest, artifact integrity re-hashing, atomic writes, symlink rejection, consistent file permissions. |
| `drawio-cache.test.js` | New | +117 | #1382 | Tests cache hit/miss, integrity, atomic write. |
| `export-batch.js` | New | +26 | #1382 | Runs export jobs with before/success/failure hooks and aggregates failures. Extracted from the old inline loop. |
| `export-batch.test.js` | New | +56 | #1382 | Tests the batch runner's hook and failure behavior. |
| `_update-drawio-links.js` | Modified | +115/−54 | #1382 | Post-build placeholder → emitted-asset link rewrite. Matches by content hash (fixes duplicate-basename collisions) with `docs/` containment + symlink rejection. |
| `_update-drawio-links.test.js` | New | +98 | #1382 | Tests link resolution incl. duplicate-basename disambiguation. |
| `../../../.github/workflows/check-drawio-file.yml` | Modified | +42/−1 | both | CI gate: `node --check` + unit tests + hardened-container smoke test; trigger paths widened. |

> Paths are relative to `src/_scripts/_export-drawios/` except the workflow.

---

## Fixes applied during review

These were applied on top of the original #1381/#1382 work, each addressing a
code-review or PR-bot finding.

### 1. Guard a readme missing its `title` (bugfix)
- **File:** `_export.js` (`getRenderContext`)
- **Was:** `title.includes('#')` with no guard → opaque `TypeError` that, under the
  fail-hard pipeline, aborted the whole export.
- **Now:** throws a clear error naming the readme and the diagram.

### 2. Container runs with `--network=none` (security — PR-bot finding)
- **Files:** `docker-export.js`, `docker-export.test.js`
- **Why:** the hardened container still had default outbound network access while
  rendering untrusted diagram XML through Chromium (SSRF / exfiltration surface);
  local `.drawio` → SVG rendering needs no network and external images are banned.
- **Now:** `--network=none` added to the isolation flags, asserted in the unit test.

### 3. Guard a readme missing its `slug` (bugfix — code review)
- **File:** `_export.js` (`getRenderContext`)
- **Why:** `slug` fed `qrLink` and `slug.match(...)`; a missing slug threw an opaque
  `TypeError`, and with caching on it bypassed the per-file error aggregation.
- **Now:** guarded the same way as `title`.

### 4. Skip `getPipelineIdentity()` when caching is off (robustness — code review)
- **File:** `_export.js`
- **Why:** it ran on every invocation, reading `package-lock.json` + every pipeline
  source, and would abort a non-cache run with `ENOENT` if the lockfile were absent.
- **Now:** short-circuits to `'cache-disabled'` when caching is off, mirroring
  `getRendererIdentity()`.

### 5. Consistent artifact permissions (consistency — code review)
- **File:** `drawio-cache.js` (`restore`, `_writeFileAtomically`)
- **Why:** cache-restored SVGs were written `0o600` while a fresh export used umask
  defaults (`0o644`), so a file's mode depended on cache hit vs miss.
- **Now:** restored artifacts written `0o644`; cache-internal files stay `0o600`.

### 6. Validate output path before cleanup (security — PR-bot finding)
- **Files:** `_export.js` (`safeCleanOutput`), `docker-export.js` (exports
  `validateOutputPath`)
- **Why:** `beforeExport` / `onFailure` ran `rmSync(output)` before validation, so a
  symlinked `images/` dir could delete a file outside `docs/`; the non-DOCKER path
  had no validation at all.
- **Now:** `safeCleanOutput()` runs `validateOutputPath()` (within-`docs/` +
  non-symlink) before every delete.

### 7. Deterministic, referenced artifact selection (correctness — code review)
- **File:** `_export.js` (`generateArtifacts`)
- **Why:** the artifact `.drawio` was picked via non-deterministic
  `readdirSync().find()`; on an RA with several diagrams it could pick one not
  embedded in the page, which `resolveDrawioLinks` then failed to resolve, aborting
  the whole build.
- **Now:** prefers the `.drawio` the readme actually references (so it is an emitted
  asset); falls back to the first file sorted, for determinism.

---

## Verification

- `node --check` passes on `_export.js` and `docker-export.js`.
- All Draw.io unit tests pass (16 passing, 1 skipped — the opt-in Docker smoke test
  that runs in CI / with `DRAWIO_DOCKER_SMOKE=1`).
- The output-path guard was checked directly: a normal output is accepted, a
  symlinked-outside parent is rejected.

> Not verified locally: a full `npm run build` of the export against live content
> (needs Docker). The `check-drawio-file` CI gate and a `DOCKER=1` build cover that.
