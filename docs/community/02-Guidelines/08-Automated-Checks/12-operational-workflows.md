---
sidebar_position: 12
slug: /community/automated-checks/operational-workflows
title: Build, Deploy, and Security Scanning Workflows
description: "A tour of the background workflows that build and deploy the site to GitHub Pages and Cloudflare, scan for vulnerabilities, and check license compliance."
sidebar_label: Operational Workflows
keywords:
    - sap
    - github actions
    - build
    - deploy
    - security
    - codeql
image: img/ac-soc-med.png
tags:
    - community
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
last_update:
  author: cernus76
  date: 2026-10-15
---

Most pages in this section describe the **content checks** that run on your pull request and give you line-by-line feedback. This page is different: it tours the **operational workflows** that build the site, publish it, and keep the supply chain healthy.

Unlike the content checks, these workflows run mostly in the background. As a contributor you rarely interact with them directly. The build workflow runs on your pull request and again after merge; the deployment workflows run after your change is merged or on demand. The security scans run on a schedule and, for CodeQL and the dependency and workflow audits, on your pull request before merge. They become most relevant to you when your change touches **dependencies** (`package.json`, the lockfile) or the **workflow files** themselves. If that is you, read on. If you are only editing or adding reference-architecture content, you can safely skim.

:::info Where these live
All of these workflows are defined in the [`.github/workflows/`](https://github.com/SAP/architecture-center/tree/main/.github/workflows) directory of the repository. The descriptions below reflect what those files actually do.
:::

## Build and deploy

Three workflows build the site; two of them also publish it.

| Workflow | File | Trigger | What it does |
| --- | --- | --- | --- |
| Build for GitHub Pages | `build-main.yml` | Push or pull request to `main` or `dev` | Installs dependencies, runs the unit tests, and builds the site, then uploads the result as a Pages artifact. |
| Deploy to Cloudflare | `deploy-to-cloudflare.yml` | Push to `main`, or manual run | The **production deployment**. Builds with backend configuration and exported diagrams, then publishes to Cloudflare Pages. |
| Deploy to GitHub Pages | `deploy-manual.yml` | Manual run only | A manual build and publish to GitHub Pages, useful for fork builds and previews. |

### Build for GitHub Pages

On every push and pull request to `main` or `dev`, the `build-main.yml` workflow runs a clean install (`npm ci`), the unit tests (`npm test`), and a production build (`npm run build`) on Node.js 24. If everything succeeds, it uploads the compiled site as a Pages artifact. The workflow only verifies that the site still builds; it does not publish anything (publishing is handled by the deployment workflows). Because it runs on the pull request too, a broken internal link (Docusaurus fails the build on those by default), malformed front matter, or a failing test fails the check **before** merge.

### Deploy to Cloudflare

The `deploy-to-cloudflare.yml` workflow is the one that updates the public production site. It runs when a change reaches `main`, and can also be started manually. Compared with the plain build, it does extra work so the deployed site is complete:

- fetches contributor details from the GitHub API,
- exports the Draw.io diagrams to SVG (and caches them to speed up later runs),
- builds the site with the backend environment configuration, and
- rewrites Draw.io links to their hashed URLs.

The finished build is then published to Cloudflare Pages. For how diagrams are authored and exported, see the [diagramming guide](../06-diagrams.md).

### Deploy to GitHub Pages (manual)

The `deploy-manual.yml` workflow is triggered on demand (`workflow_dispatch`). It performs the same diagram export and build steps and publishes to GitHub Pages. It is especially useful for **fork builds**, for example previewing your contribution on your own GitHub Pages site before opening a pull request.

:::tip You do not deploy by hand
As a contributor you never need to run these yourself. Merging an approved change is what moves it toward production. The manual deploy exists mainly for maintainers and for fork previews.
:::

## Security and supply chain

These workflows protect the project from vulnerable dependencies and risky workflow changes. Three run automatically; one is manual.

| Workflow | File | Trigger | Purpose |
| --- | --- | --- | --- |
| CodeQL | `codeql.yml` | Push and PRs to `dev`, plus a weekly schedule | Static code scanning for JavaScript/TypeScript and GitHub Actions. |
| Scorecard | `scorecard.yml` | Push to `dev`, weekly, and branch-protection changes | OpenSSF supply-chain security scoring. |
| Security Audit | `security-audit.yml` | PRs touching dependencies or workflows, plus weekly and manual | Audits npm scripts, runs `npm audit`, lints workflows, and reviews dependencies. |
| Security Headers | `check-security-headers.yml` | PRs and pushes to `dev` touching `vercel.json`, the security-headers plugin, or the header generator | Verifies the committed `vercel.json` still matches the single source of truth. |
| REUSE compliance | `reuse-check.yml` | Manual run only | Checks license and copyright compliance. |

### CodeQL

[CodeQL](https://docs.github.com/en/code-security/code-scanning) is GitHub's static-analysis engine. The `codeql.yml` workflow scans the `javascript-typescript` and `actions` code on every push and pull request to `dev`, and again on a weekly schedule. Findings appear in the repository's code-scanning dashboard.

### Scorecard

The `scorecard.yml` workflow runs the [OpenSSF Scorecard](https://github.com/ossf/scorecard), which rates the project against a set of supply-chain security best practices (such as pinned dependencies and branch protection). It runs on pushes to `dev`, weekly, and whenever a branch-protection rule changes.

### Security Audit

The `security-audit.yml` workflow is the one most likely to touch your pull request, but only if your change modifies `package.json`, `package-lock.json`, or anything under `.github/workflows/`. It also runs weekly and can be started manually. It bundles several checks:

- **Audit npm scripts**: inspects `package.json` for dangerous lifecycle hooks (such as `preinstall`, `postinstall`, `prepare`) and suspicious command patterns, and flags scripts that pull in and execute code.
- **npm audit**: runs [`npm audit`](https://docs.npmjs.com/cli/commands/npm-audit) to surface known vulnerabilities in dependencies and uploads the results to the code-scanning dashboard. On a pull request from a fork the dashboard upload is skipped (the token is read-only), but the audit output and job summary still appear.
- **Audit workflows**: lints every workflow with [actionlint](https://github.com/rhysd/actionlint) and checks for risky patterns, for example unpinned third-party actions or missing permission blocks.
- **Dependency Review**: on pull requests, uses [GitHub's dependency-review action](https://github.com/actions/dependency-review-action) to block newly introduced dependencies that carry high-severity vulnerabilities or disallowed (strong copyleft) licenses.

:::warning If you add or update a dependency
Expect the Security Audit to run on your pull request. If it reports a high-severity vulnerability or a disallowed license, the dependency-review step will fail and the maintainers will ask you to pick a different package or version. This is normal, and it keeps the project's dependency tree clean.
:::

### REUSE compliance

The `reuse-check.yml` workflow runs the [FSFE REUSE tool](https://reuse.software/), which verifies that every file carries clear license and copyright information. It is a **manual** check (`workflow_dispatch`), used to verify compliance on demand rather than on every change.

### Security Headers

The `check-security-headers.yml` workflow keeps the two deployment targets from drifting apart on their HTTP security headers. The project defines the Content-Security-Policy and related headers once, in `src/plugins/security-headers/csp-config.js`, from which the Cloudflare `_headers` file is generated at build time and the committed `vercel.json` is generated by `npm run gen:headers`. On any pull request or push to `dev` that touches `vercel.json`, the security-headers plugin, or the header generator, this check regenerates `vercel.json` from the source and **fails if the committed file differs**. If it fails, run `npm run gen:headers` and commit the updated `vercel.json`.

:::note Scanners target `dev`, not `main`
The security scanners (CodeQL and Scorecard) run against the `dev` branch. The `main` branch receives only validated content that has already been promoted from `dev`, so scanning `dev` is where issues are caught first.
:::

## Where to go next

- New here? Start with the [community intro](../../intro.md) and the [contribution process](../01-contribution.md).
- Contributing a new reference architecture? The no-code [Quick Start](../02-GetStarted/01-get-started-quickstart.md) editor is the recommended path.
- Curious about the checks that give you direct feedback on a PR? See the [Automated Checks overview](readme.md) and [Errors & Warnings](13-pr-checks-errors-and-warnings.md).
