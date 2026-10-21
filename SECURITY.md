<!-- START SAP SECURITY.MD V0.0.1 BLOCK -->
<!-- Please do not remove the version header, this is needed for automatic updates of the SECURITY.md -->
# SAP Open Source Security Policy

SAP takes the security of our software products and services seriously, which includes all source code repositories managed through our GitHub organizations, including our primary [SAP](https://github.com/SAP), [SAP-docs](https://github.com/SAP-docs) organizations as well as [our other GitHub organizations and projects](https://opensource.sap.com).

If you believe you have found a security vulnerability in any SAP-owned repository, please report it to us as described below.

## Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via the SAP Trust Center at [https://www.sap.com/about/trust-center/security/incident-management.html](https://www.sap.com/about/trust-center/security/incident-management.html).

If you prefer to submit via email, please send an email to [secure@sap.com](mailto:secure@sap.com). If possible, encrypt your message with our PGP key; please download it from the [SAP Trust Center](https://www.sap.com/keyblock).

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

  - The repository name or URL
  - Type of issue (buffer overflow, SQL injection, cross-site scripting, etc.)
  - Full paths of the source file(s) related to the manifestation of the issue
  - The location of the affected source code (tag/branch/commit or direct URL)
  - Any particular configuration required to reproduce the issue
  - Step-by-step instructions to reproduce the issue
  - Proof-of-concept or exploit code (if possible)
  - Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Disclosure Guidelines

We like to ask you to follow the [Disclosure Guidelines for SAP Security Advisories](https://www.sap.com/documents/2022/02/9ccd9ca0-167e-0010-bca6-c68f7e60039b.html).

## SAP Internal Response Process

As an SAP employee, please check our internal open source security response process ([url.sap/isgc2y](https://url.sap/isgc2y)) for further details on how to handle security incidents.

<!-- END SAP SECURITY.MD V0.0.1 BLOCK -->

---

## Project Security Posture

This section is specific to **SAP Architecture Center** and is not part of the auto-synced SAP block above.

### What this project is

SAP Architecture Center is a **static content website** built with [Docusaurus](https://docusaurus.io/). It is compiled to static HTML/CSS/JS and deployed to Cloudflare Pages. It is **not** a published package, library, binary, or service: `package.json` sets `"private": true`, nothing is published to a package registry, and no versioned release artifacts are produced for download.

### Supply-chain and build hardening

- All GitHub Actions are pinned to full commit SHAs, and every workflow declares least-privilege `permissions`.
- Dependencies are locked via a committed `package-lock.json`; CI installs with `npm ci` for reproducible builds.
- Automated vulnerability bumps are delivered through repository-level **Dependabot security updates** (enabled in repo settings); there is intentionally no committed `dependabot.yml`, as the version-update PR noise it generated was not worth the churn for a static site.
- Static Application Security Testing runs on every change via **CodeQL** (`.github/workflows/codeql.yml`).
- A dedicated **Security Audit** workflow (`.github/workflows/security-audit.yml`) runs `npm audit`, scans for dangerous npm lifecycle scripts, lints workflows with `actionlint`, and performs dependency review on pull requests.
- Supply-chain posture is tracked publicly via the [OpenSSF Scorecard](https://scorecard.dev/viewer/?uri=github.com/SAP/architecture-center).

### Known, accepted dependency advisories

`npm audit` reports advisories in **transitive dependencies** of Docusaurus. The affected webpack/CSS-minification/globbing/content-parsing tooling runs only while the site is being built on trusted CI; it is **not shipped into the visitor's browser bundle** and is not reachable by site visitors. Where a patched version exists that is compatible with the pinned Docusaurus release, it is applied via `overrides` in `package.json` — for example `webpack-dev-middleware` is pinned to `^7.4.6` to clear GHSA-g84c-rxfj-3j2c, and `katex` is pinned to `^0.18.2` to clear GHSA-238p-pmpm-9mq7 (the prototype-pollution trust-bypass). `katex` reaches the browser via Mermaid's client-side renderer but only ever processes **project-controlled diagram content**, never visitor input; the override is pinned below `0.19` to avoid KaTeX 0.19's strict-mode breaking change and is verified against the pinned Mermaid at build time.

The following currently have **no fixed version** at any published release and are accepted as low residual risk until an upstream fix ships (monitored by the Security Audit workflow):

- `braces` (stack-exhaustion DoS; the latest published version is still affected) — reachable only via build-time glob patterns the project controls, never shipped to visitors.
- `sprintf-js` (unbounded-precision DoS; no published version is unaffected, so an `overrides` pin cannot clear it) — reached only via build-time front-matter/`.docx` parsing (`argparse` 1.x under `js-yaml` 3.x), never shipped to visitors.

### Checks that are not applicable

The following OpenSSF Scorecard checks do not apply to a static content website and are intentionally not pursued:

- **Fuzzing** — there is no runtime input-parsing, network, or binary attack surface to fuzz.
- **Packaging / Signed-Releases** — nothing is published to a registry and no release artifacts are cut; delivery is static-asset deployment over HTTPS with integrity provided by the hosting platforms.

### Branch-Protection posture

CI validation is split across several triggers: CodeQL runs on pull requests into `dev`; the link, content, and security checks run on pull requests into `dev` (and most also run on pull requests into `main`); and the site build runs after pushes to `dev` and `main`. `dev` is fully protected: required reviews, code-owner review, required CodeQL status checks, up-to-date-before-merge, linear history, no force-pushes, and administrator enforcement.

`main` is a **promotion target** for content that has *already* passed the required validation on `dev` — a release is a `dev -> main` pull request, and nothing new is introduced there. It is review-protected (required approvals, code-owner review, dismiss-stale, no force-pushes), but it intentionally has **no required status checks**: applicable workflows may still run on a promotion pull request, but their results do not gate the merge.

As a result, OpenSSF Scorecard's **Branch-Protection** check does not reach its maximum: its tiered scoring expects a required status check on every protected branch, including release branches. The missing required status check on `main` is **by design, not an unmitigated risk** — the branch where code is actually validated (`dev`) is hardened to the check's top tier.

### Confidential reporting

Security issues must be reported through the SAP channels described above (or, as an alternative, via GitHub private vulnerability reporting on this repository). Please do not open public issues or pull requests for security vulnerabilities.
