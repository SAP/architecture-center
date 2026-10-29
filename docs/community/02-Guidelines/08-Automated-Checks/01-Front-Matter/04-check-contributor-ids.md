---
sidebar_position: 4
slug: /community/automated-checks/front-matter/contributor-ids
title: Contributor IDs Check for Author and Contributor Fields
description: "How the contributor IDs check keeps SAP internal user IDs (I-, D-, and C-numbers) out of the author and contributors front matter, and why it can block a merge."
sidebar_label: Contributor IDs
keywords:
    - sap
    - front matter
    - contributors
    - author
    - user id
    - ci checks
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
  date: 2026-10-28
---

The **Contributor IDs** check reads the front matter of every documentation page you change in a pull request and makes sure nobody is credited by an **SAP internal user ID**. People must be credited by their public **GitHub username** instead. It is a **blocking** check: if a page lists an internal user ID as its author or a contributor, the check fails and the merge is held until you fix it.

If you are new to front matter, read the [front matter guide](../../04-front-matter.md) first. This page explains the automated rule that sits on top of it.

## Why this check exists

An SAP internal user ID (for example `I057866`) is an internal identifier. It means nothing to the public visitors who read this open-source site, it cannot be linked to a profile, and it should not be published in content that lives on the open web. Every contributor already has a **GitHub username** — that is what belongs in the `author` and `contributors` fields, because the site renders it and links it back to the person's GitHub profile.

## What this check looks at

The check runs on pull requests and inspects **only the pages you actually changed**, not the whole site. A page is in scope when both of the following are true:

- It lives under `docs/` and its filename ends in `.md` or `.mdx`.
- It was added, modified, or renamed in your pull request (deleted files are ignored).

News articles under `news/` are out of scope.

On each in-scope page the check reads three front matter fields:

- `last_update.author`
- `author` (a top-level field, if the page happens to use one)
- every entry in the `contributors` list

A value is flagged when it matches the SAP user-ID shape: **one of the letters `I`, `D`, or `C` followed by six or more digits** (case-insensitive). Examples that are flagged: `I057866`, `D012345`, `C1234567`. An ordinary GitHub username — which is never a single letter followed by only digits — is never flagged.

:::info
Scope is computed from the diff between your branch and its base, so touching one small page will never drag unrelated pages into the check.
:::

## Examples

A page that **fails** the check:

```yaml
contributors:
  - jane-doe
  - I057866        # ❌ internal user ID
last_update:
  author: I057866  # ❌ internal user ID
  date: 2026-10-27
```

The same page, **fixed** — the internal ID replaced with the person's GitHub username:

```yaml
contributors:
  - jane-doe
  - janedoe-sap    # ✅ GitHub username
last_update:
  author: janedoe-sap
  date: 2026-10-27
```

## How to fix it

1. Open the page the annotation points to (the error is pinned to the exact line on the **Files changed** tab).
2. Replace each flagged `I`/`D`/`C`-number with the person's **GitHub username**. If you do not know it, ask the person, or look them up on GitHub.
3. Commit and push. The check runs again automatically.

:::tip
Not sure what your own GitHub username is? It is the name in your profile URL, `https://github.com/<username>`.
:::

## Where results show up

- **Inline annotations** on the **Files changed** tab, pinned to the offending `author` or `contributors` line.
- **The Checks tab**, under **Check Contributor IDs**, with a job summary listing every finding.
- **The sticky 🔎 Content check results comment**, which gathers this check's findings alongside the other blocking content checks.

For a full walkthrough of where findings appear and how to resolve them, see [Errors & Warnings](../13-pr-checks-errors-and-warnings.md).
