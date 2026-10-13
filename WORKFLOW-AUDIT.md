# GitHub Workflows Audit & Consistency Pass

A multi-pass audit of all 15 workflows in `.github/workflows/`, focused on making our
**checks consistent**: one Node source of truth, one runner policy, uniform checkout
hardening, least-privilege permissions, a single concurrency scheme, and action-update
hygiene. Each recommendation was independently generated per dimension, then
adversarially challenged before being applied — several first-pass ideas were dropped
or corrected during that challenge (noted below).

## TL;DR — what changed

| # | Change | Files | Risk |
|---|--------|-------|------|
| 1 | **Single Node source of truth**: new `.nvmrc` (`24`); all `setup-node` use `node-version-file: .nvmrc` + `cache: npm`. Kills the floating `lts/*`. | `.nvmrc`, build-main, deploy ×2, check-seo, security-audit | low |
| 2 | **Runner policy**: first-party workflows pinned to `ubuntu-24.04`; vendor templates (codeql, scorecard) stay `ubuntu-latest` as **documented exceptions**. | build-main, deploy ×2, find-unreferenced, periodic-link-watcher, reuse-check | low |
| 3 | **Checkout hardening**: `persist-credentials: false` on every checkout (was missing on 7). | 7 workflows | none |
| 4 | **Least privilege**: dropped unused `pages: write` (build-main) & `pull-requests: write` (periodic-link-watcher); explicit `permissions: {}` on the Cloudflare deploy job. | build-main, periodic-link-watcher, deploy-to-cloudflare | none |
| 5 | **Dependabot** for `github-actions` + `npm` (weekly, grouped). Pinned SHAs now get reviewed update PRs instead of silently freezing. | `.github/dependabot.yml` | none |
| 6 | **Concurrency on every workflow** under one principled scheme (below). Prevents racing production deploys and cancels superseded PR runs. | all 15 | low |
| 7 | **build-main repurposed** from a dead post-merge Pages-artifact build into a **PR build-validation** check (+ keeps `push: dev`). | build-main | medium |
| 8 | **drawio cache key fixed**: content-addressed (`hashFiles`) instead of `github.run_id` (which never hit the exact key and wrote a fresh cache every run). | deploy ×2 | low |
| 9 | **CodeQL hardening**: added `persist-credentials: false` + a security-appropriate concurrency group. Scope intentionally stays **`dev`-only** (see note). | codeql | none |
| 10 | **Perf/cleanup**: collapsed the O(assets×markdown) grep loop in find-unreferenced; normalized YAML to 2-space + consistent step names. | find-unreferenced + 4-space files | low |

14 workflows modified, 2 files added. No secrets, triggers-to-prod, or action pins were weakened. All 16 files validated with `js-yaml`.

---

## The consistency framework (the canonical rules)

**Node runtime** — one source of truth: `.nvmrc` = `24` (satisfies `engines.node >=22`, matches what build/deploy already pinned). Every `setup-node` reads `node-version-file: .nvmrc` + `cache: npm`. `engines.node` left untouched (an upper bound would add friction for outside contributors).

**Runner images** — first-party workflows pin `ubuntu-24.04` for reproducibility (not a security measure — the label is still rolling). GitHub-maintained vendor templates (`codeql`, `scorecard`) stay on `ubuntu-latest` to ease upstream re-sync; this is a *deliberate, documented* exception, not an oversight. ⚠️ **Revisit `ubuntu-24.04` before it hits its deprecation brownout** — pinned labels break on a fixed future date; `ubuntu-latest` would have auto-migrated.

**Checkout** — two rules applied everywhere: (a) `persist-credentials: false` on every checkout (generic token-exposure hygiene — no workflow pushes via the checkout credential); (b) `fetch-depth: 0` only where git history is genuinely read (the builds, because `docusaurus.config.ts` sets `showLastUpdateTime/Author: true`, and the base-diff checks). We **kept** every needed `fetch-depth: 0` — an early suggestion to drop it from build-main was rejected after confirming the build reads git log.

**Permissions** — top-level `permissions: {}` (already universal) + explicit minimal job-level block on every job; no reliance on inheritance.

**Concurrency** — trigger-type-driven:
- **PR checks** → `group: ${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true` (new push cancels stale runs).
- **Production deploys** → stable per-target group (`deploy-cloudflare-production`, `deploy-pages-production`), `cancel-in-progress: false` (queue, never interrupt an in-flight upload).
- **Scheduled / security scans** → `${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: false`.
- **Shared-state job** (periodic-link-watcher updates one tracking issue) → ref-independent `${{ github.workflow }}`, `cancel-in-progress: false`.

**Action pinning** — keep the existing full-40-char-SHA policy; Dependabot now keeps the pins current. (`security-audit`'s own unpinned-action check still enforces the policy on every Dependabot PR.)

---

## Notable fixes worth calling out

- **`build-main.yml` was dead work.** It built the site on every push to `main` *and* `dev` and uploaded a GitHub Pages artifact that **no job ever deploys** (the real deploys are `deploy-to-cloudflare` and `deploy-manual`). On `push: main` it fully duplicated the Cloudflare build. It is now a **PR build-validation** gate (we previously had *no* build signal on PRs — breakage was only caught post-merge), still covering direct `push: dev` for core devs. The orphaned artifact upload and its `pages: write` grant are removed. *If the team prefers, it can instead be deleted outright.*
- **drawio cache never hit its exact key.** The key embedded `github.run_id` (unique per run), so every run missed the exact key and wrote a brand-new cache entry — churning the cache quota. Now keyed on `hashFiles('docs/**/*.drawio')`: unchanged diagrams reuse the exact cache and write nothing.
- **CodeQL scope is intentionally `dev`-only.** `main` only ever receives content already validated on `dev` (promotion flow), so scanning `main` would be redundant. CodeQL keeps its `dev` push/PR triggers + weekly cron; we only hardened the checkout (`persist-credentials: false`) and added concurrency.
- **check-drawio-file didn't self-trigger.** It was the only PR check whose path filter didn't include its own workflow file; edits to it never re-ran it. Fixed.

---

## Deliberately NOT auto-applied — needs a maintainer decision

These surfaced in the audit but carry behavior/compliance risk, so they're left as recommendations:

1. **Promote `reuse-check.yml` to a PR gate.** Today it's `workflow_dispatch`-only, so REUSE/SPDX license compliance gates nothing. **Before** making it a required check, run it once to confirm the repo is compliant, then land the `pull_request` trigger with `continue-on-error: true` for one cycle — otherwise every open PR fails immediately. (Config was already normalized; only the trigger is deferred.)
2. **Replace the bespoke grep scanner in `security-audit.yml` with [zizmor](https://github.com/woodruffw/zizmor).** zizmor is the OpenSSF-standard workflow scanner and far more reliable than regex. But it does **not** cover everything our grep does (missing-timeout, missing-permissions, `secrets: inherit`, `continue-on-error` on security steps) — so add it *alongside* (SARIF/non-blocking for one triage cycle, then enforce), pin it to a SHA, and keep the npm-lifecycle-script check. Don't rip the grep out.
3. **Inline PR annotations for `typos`/`internal-links`/`ids`.** Nice for consistency, but `crate-ci/typos` needs `format: brief` for a problem matcher to work, and the id/link scripts need light refactoring to emit `::error file=…::` with correct paths. Deferred to avoid shipping broken annotations.
4. **lychee cache** in periodic-link-watcher — the current args use `--cache-exclude-status` but **no `--cache` flag**, so caching isn't even enabled. Enabling it properly needs `--cache` + `actions/cache`. Low value; left as-is.
5. **`engines.node` range** — intentionally left as `>=22.0`; an upper bound risks `npm install` friction for outside contributors.

---

## Review follow-ups (PR-bot)

- **deploy-manual build job → `pages: read`.** The "Get pages deployment URL" step calls the Pages REST API (`gh api .../pages`), which needs the `pages` scope. Pre-existing condition (the job had `contents: read` only before this PR too); fixed for correctness + least privilege.
- **find-unreferenced-files → NUL-delimited file list.** `mapfile -d '' -t … < <(find … -print0)` so filenames with whitespace *or* newlines are never split into multiple grep args.

## Verification done

- All 15 workflows + `dependabot.yml` parse cleanly (`js-yaml`).
- No hardcoded `node-version:` literals remain — all via `.nvmrc`.
- Every checkout sets `persist-credentials: false`.
- Consistency matrix (runner + concurrency) reviewed across all 15 — uniform within each class, with the two vendor-template runner exceptions documented above.
- `actionlint` was not available locally — **recommend letting the existing `security-audit` → actionlint job run on this PR** as the authoritative lint check before merge.
