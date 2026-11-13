---
sidebar_position: 0
slug: /community/automated-checks
title: Automated Checks for Architecture Center Contributions
description: "A contributor guide to the GitHub Actions checks that run on every SAP Architecture Center pull request, what they verify, and where results appear."
sidebar_label: Overview
keywords:
    - sap
    - architecture center
    - github actions
    - ci checks
    - pull request
    - contribution
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
  date: 2026-10-27
---

When you open a pull request against the SAP Architecture Center repository, a set of automated **checks** runs automatically. These are [GitHub Actions](https://docs.github.com/en/actions) workflows that read your changes and give you fast, friendly feedback, before a human maintainer ever looks at your contribution.

## What the checks do for you

Think of the checks as an automated first reviewer. They catch the small, mechanical things (a misspelled product name, a missing front matter field, a dead link) so that you can fix them in seconds and the human reviewer can focus on what really matters: the quality and clarity of your reference architecture.

A few things worth knowing up front:

- **The checks are here to help, not to get in your way.** Most issues they report take moments to fix, and the feedback points you straight at the file and line.
- **You do not need to install anything.** Everything runs in GitHub when you push. If you contribute through our no-code [Quick Start editor](../02-GetStarted/01-get-started-quickstart.md), the same checks still run on the pull request it opens for you.
- **A failing check is normal.** It simply means something needs a small adjustment. Push a new commit and the checks run again automatically.

:::info
New to contributing? Start with the [community introduction](../../intro.md) and the [contribution process](../01-contribution.md) first, then come back here to understand the checks you'll see on your pull request.
:::

## Where results show up

The checks report their findings in three places, so you'll never have to go searching:

1. **Inline annotations** on the **Files changed** tab: comments pinned to the exact line that needs attention (for example, the spelling and typo checks mark the offending word right where it appears).
2. **The Checks tab**: one entry per check, each with a green tick, a red cross, or a neutral note, plus a detailed log and a per-job summary you can expand.
3. **One sticky pull request comment** titled **🔎 Content check results**: a single, continuously-updated comment that gathers the content findings grouped by check. It rebuilds itself every time a check finishes, so it always reflects your latest commit (look for the footer noting the commit it was updated for).

:::note
The sticky comment aggregates the content checks that can block a merge, each as its own section, and it shows their blocking **errors**. Spelling, typos, and the H1 title check are included alongside the link, front matter, Draw.io, and orphan-file checks. **Grammar is not in this comment:** it is advisory and non-blocking, and posts as inline review comments on the **Files changed** tab instead. Other non-blocking **warnings**, such as an SEO length just outside the recommended range, stay inline on the **Files changed** tab and in the job summary, not in this comment.
:::

For a full, example-driven walkthrough of what each surface looks like and how to resolve what you find, see [Errors & Warnings](13-pr-checks-errors-and-warnings.md).

## The content checks at a glance

The content checks fall into two groups, mirroring how this documentation is organised: checks that read the **front matter** at the top of a page, and checks that read the **document body**, meaning the prose, links, and diagrams. The two tables below index every content check. "Blocking?" tells you whether a failure must be resolved before the pull request can merge. Follow the **Learn more** link for the detail page on each check.

### Front Matter Checks

These checks validate the metadata block at the top of each page.

| Check | What it verifies | Blocking? | Learn more |
| --- | --- | --- | --- |
| Front Matter Properties | Changed reference architecture pages credit their author, carry a fresh date, and keep the house-style default fields. | Yes | [Front Matter Properties](01-Front-Matter/01-check-front-matter-properties.md) |
| SEO Front Matter | The `title` and `description` lengths sit in the search-engine-friendly range. | Yes* | [SEO Front Matter](01-Front-Matter/02-check-seo-front-matter.md) |
| Reference Architecture IDs | Each reference architecture carries a valid, unique six-character `id` and a matching `slug`. | Yes | [Reference Architecture IDs](01-Front-Matter/03-check-reference-architecture-ids.md) |
| Contributor IDs | The `author` and `contributors` fields credit people by their GitHub username, not an SAP internal user ID (an I-, D-, or C-number). | Yes | [Contributor IDs](01-Front-Matter/04-check-contributor-ids.md) |
| H1 Title | Pages take their title from the front matter, so Markdown bodies must not contain a level-1 `#` heading. | Yes | [H1 Title](01-Front-Matter/05-check-h1-title.md) |

### Document Body Checks

These checks read the prose, links, and diagrams in the body of each page.

| Check | What it verifies | Blocking? | Learn more |
| --- | --- | --- | --- |
| Spelling | Every word in your Markdown is spelled correctly, using [cspell](https://cspell.org) plus the project's custom dictionaries. | Yes | [Spelling](02-Document-Body/01-check-spelling.md) |
| Typos | Common typos and misspellings, caught by the fast [typos](https://github.com/crate-ci/typos) checker. | Yes | [Typos](02-Document-Body/03-check-typos.md) |
| Grammar | Prose style and grammar, via [LanguageTool](https://languagetool.org). Advisory only. | No | [Grammar](02-Document-Body/04-check-grammar.md) |
| Internal Links | No links point to SAP-internal-only hosts that would break for public visitors. | Yes | [Internal Links](02-Document-Body/05-check-internal-links.md) |
| External Links | Links pointing to the public web are reachable, checked with [lychee](https://github.com/lycheeverse/lychee). | Yes | [External Links](02-Document-Body/06-check-external-links.md) |
| Draw.io Files | Diagram files stay under 1 MB and embed their images (no external references). | Yes | [Draw.io Files](02-Document-Body/07-check-drawio-files.md) |
| Orphan Files | Images, diagrams, and other assets you add are actually referenced somewhere. | Yes* | [Orphan Files](02-Document-Body/08-check-orphan-files.md) |

:::tip
Grammar is the only check that **never** blocks a merge. Treat its notes as a friendly proofreader's second opinion. A couple of checks marked **Yes\*** can also emit *non-blocking warnings* alongside their blocking errors: SEO Front Matter warns when a length is merely outside the recommended range, and Orphan Files warns when an asset is referenced only outside its own reference architecture folder. See each check's page for the detail.
:::

## Custom dictionaries

Technical writing is full of words that no general dictionary knows, such as product names, acronyms, partner brands, and the names of people. So the spell checker is **taught** the project's vocabulary through four custom dictionaries:

```text
sap        : SAP product and solution names
industry   : general technology and industry terms
partners   : partner and vendor names
people     : contributor and author names
```

If the Spelling check flags a word that is genuinely correct, the fix is usually to add it to the right dictionary rather than to change your text. The dictionaries are plain text files, one word per line, so updating them is easy.

:::tip
See [Custom Dictionaries](02-Document-Body/02-dictionaries.md) for exactly which file to edit, how the four dictionaries are organised, and how to add a new term.
:::

## Operational workflows

Alongside the content checks, a second group of workflows keeps the site itself healthy: building and deploying the site, scanning for security issues, and verifying open-source license compliance. These run largely in the background and are not something you normally act on as a content contributor, but it's good to know they exist.

See [Operational Workflows](12-operational-workflows.md) for a tour of what runs behind the scenes.

## Which checks run on my pull request?

:::tip
Most checks are **path-filtered**: they only run when files relevant to them change. Edit a Markdown page and you'll see the spelling, typo, link, and front matter checks; touch a `.drawio` diagram and the Draw.io check runs. The checks run on pull requests targeting the `dev` branch, and on pushes to `dev`, so you only ever see the checks that actually apply to your change, with no distractions.
:::

This keeps feedback focused: a small text fix won't trigger diagram validation, and a diagram-only change won't run the grammar linter. When you're ready to start resolving findings, go to [Errors & Warnings](13-pr-checks-errors-and-warnings.md) for concrete examples.
