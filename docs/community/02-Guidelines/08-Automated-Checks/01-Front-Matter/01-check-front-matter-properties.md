---
sidebar_position: 1
slug: /community/automated-checks/front-matter/properties
title: Front Matter Properties Check for Reference Architectures
description: "How the front matter properties check validates authorship, dates, and house-style fields on changed reference architecture pages, and why it can block a merge."
sidebar_label: Front Matter Properties
keywords:
    - sap
    - front matter
    - metadata
    - reference architecture
    - ci checks
    - contributors
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

The **Front Matter Properties** check reads the front matter block at the top of every reference architecture (RA) page you touched in a pull request and makes sure it follows house style, and that it credits you and carries a fresh date. It is a **blocking** check: if a page drifts from the rules below, the check fails and the merge is held until you fix it.

If you are new to front matter, read the [front matter guide](../../04-front-matter.md) first. This page explains the automated rules that sit on top of it.

## What this check looks at

The check runs on pull requests and inspects **only the RA pages you actually changed**, not the whole site. A page is in scope when all of the following are true:

- It lives under a four-digit RA folder: `docs/ref-arch/RA####/` (for example `docs/ref-arch/RA0042/`).
- Its filename ends in `.md` or `.mdx`.
- It was added, modified, or renamed in your pull request (deleted files are ignored).

Everything else is **out of scope**, including:

- The `docs/ref-arch/RA0000/` demo and template page (deliberately excluded).
- Other docs such as `docs/ref-arch/readme.md` and the community guideline pages.
- News articles under `news/`.

:::info
Scope is computed from the diff between your branch and its base, so adding one small RA page will never drag unrelated pages into the check.
:::

## The nine rules

The check runs nine rules, split into two groups.

### Group A: default-value fields

These six fields have sensible Docusaurus defaults. The check only complains when a field is **present and set to the wrong value**. If you leave a field out entirely, the default applies and the check stays quiet.

| Field | Must be | Why |
| --- | --- | --- |
| `hide_table_of_contents` | `false` | The on-page table of contents stays visible. |
| `hide_title` | `false` | The page title renders from front matter. |
| `toc_min_heading_level` | `2` | Matches the site default. |
| `toc_max_heading_level` | `4` | Matches the site default. |
| `draft` | `false` | A `draft` page is not deployed. Maintainers may override (see exemption below). |
| `unlisted` | `false` | An `unlisted` page is hidden from navigation. Maintainers may override (see exemption below). |

:::tip
The simplest way to stay green here is to copy the field values straight from the [front matter guide](../../04-front-matter.md) and not change them.
:::

### Group B: authorship fields

These three fields credit the author and track freshness. Because an RA page should always name a person and carry a recent date, a **missing** value fails here too (unlike Group A).

| Field | Fails when | Notes |
| --- | --- | --- |
| `contributors` | Missing or empty, **or** the pull request author is not in the list | Compared case-insensitively against your GitHub login. |
| `last_update.date` | Missing, not a valid `YYYY-MM-DD` date, in the future, or **more than 7 days old** | Keep it recent, and bump it when you edit the page. |
| `last_update.author` | Missing, or different from the pull request author | Must be your GitHub login. |

:::warning
The date rule has a 7-day freshness window. A `last_update.date` more than a week before the day the check runs is flagged, and a date in the future is flagged too. When you edit a page, set the date to the day you make the change.
:::

:::note Maintainer exemption
The repository maintainers `cernus76`, `navyakhurana`, `julian-schambeck`, and `fabianleh` are exempt from the three Group B authorship checks, and may also set `draft` or `unlisted` to `true` (those two Group A checks are skipped for them). This lets them unlist or hold back a page, and make quick fixes on pages they did not author, without changing authorship credit or update metadata. The other four Group A default-value checks still apply to them.
:::

## Where you will see the results

When the check finds a problem, it reports in three places:

- **Inline annotations** on the **Files changed** tab of the pull request, pinned to the exact front matter line.
- A **Check Front Matter Properties** section in the sticky summary comment the PR check bot keeps on the pull request.
- A **job summary** on the check's run, listing how many pages were checked and how many errors were found.

Each message names the file and the field, for example:

```text
docs/ref-arch/RA0042/readme.md:24 last_update.author `octocat` differs from the PR author `your-handle`.
```

## How to fix it

Open the flagged page and align its front matter with the rules. A correct block looks like this. Replace `your-handle` with your own GitHub login and set the date to the day you are editing:

```yaml
---
# ... other fields ...
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - your-handle
last_update:
  author: your-handle
  date: 2026-10-15
---
```

Checklist:

- Add your GitHub handle to the `contributors` list (keep any existing contributors).
- Set `last_update.author` to your GitHub handle.
- Set `last_update.date` to today, in `YYYY-MM-DD` format.
- Leave the Group A fields at their expected values, or remove them to use the defaults.

Push the fix to the same branch and the check re-runs automatically. For a full field-by-field reference, see the [front matter guide](../../04-front-matter.md).

:::note
These rules apply to **authored reference architecture pages** under `docs/ref-arch/RA####/`. They do **not** apply to community guideline pages like this one, so the author and date fields here follow a different convention.
:::

## Related pages

- [Automated Checks overview](../readme.md)
- [SEO Front Matter](02-check-seo-front-matter.md)
- [Reference Architecture IDs](03-check-reference-architecture-ids.md)
- [Errors & Warnings](../13-pr-checks-errors-and-warnings.md)
- [Front matter guide](../../04-front-matter.md)
- [Contribution process](../../01-contribution.md)
