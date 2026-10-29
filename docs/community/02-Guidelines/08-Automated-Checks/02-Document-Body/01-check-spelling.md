---
sidebar_position: 1
slug: /community/automated-checks/document-body/spelling
title: Spelling Check with cspell for Docs and News Pages
description: "How the cspell spelling check scans changed Markdown on your pull request, what it flags as unknown words, and how custom dictionaries keep it quiet."
sidebar_label: Spelling
keywords:
    - sap
    - cspell
    - spelling
    - spell check
    - ci checks
    - markdown
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

<!-- cspell:ignore Kubernets -->
<!-- "Kubernets" is a deliberate misspelling used as an example below. -->

When you open a pull request, a spelling check reads the Markdown you changed and flags words it does not recognise. It runs on [cspell](https://cspell.org), a fast, open-source spell checker built for code and documentation.

## What this check is

cspell looks at the prose in your `.md` and `.mdx` files and compares every word against its dictionaries. Anything it cannot find is reported as an *unknown word*. The goal is simple: catch typos in reference architectures and news before they reach readers, while leaving the many legitimate technical terms we use every day alone.

:::info Why a spell checker needs help
Our content is full of product names, acronyms, and partner and author names that no general English dictionary knows. cspell handles those through [custom dictionaries](02-dictionaries.md), so a flagged word is often a real typo, not a false alarm.
:::

## What it checks and when

The check is **incremental**: it only looks at Markdown that was **added or modified** compared to the base branch of your pull request. Pages you did not touch are never scanned, so historical gaps in older content can never block your contribution.

| Aspect | Value |
| --- | --- |
| Trigger | Pull requests and pushes to `dev` |
| Scope | Files added, modified, or renamed vs. the PR base |
| File types | `.md` and `.mdx` under `docs/` and `news/` |
| Also triggers on | Changes to `cspell.json`, `.cspell/**`, or the workflow file itself |
| Runtime | Node.js 24, cspell 9.1.0 |

In short: if your pull request changes a Markdown page under `docs/` or `news/`, or touches the spelling configuration, this check runs against just those changed files. A pull request that changes only the spelling configuration, with no Markdown, has nothing to re-check and passes automatically; the configuration simply takes effect the next time a page that relies on it changes.

## When it blocks your PR

If cspell finds **even one unknown word** in your changed files, the check fails. A failing check marks the pull request so maintainers know something needs attention before merging.

:::tip This is a prompt, not a punishment
A failed spelling check almost always means one of two things: a genuine typo you can fix in seconds, or a real term that simply needs to be added to a dictionary. Both are quick.
:::

## Where you see the results

The findings show up in two places:

- **Inline annotations on the _Files changed_ tab.** Each unknown word is pinned to its exact line and column, under the annotation title **Spelling**. The message follows this format:

  ```text
  docs/ref-arch/my-architecture/readme.md:42:17 - Unknown word (Kubernets)
  ```

- **The job summary.** The check run also lists every finding in its summary, wrapped in a code block, so you can scan them all in one place.

:::note In the sticky comment
A **Check Spelling** section is included in the single sticky pull request comment that aggregates the content checks. It lists each unknown word as a `path:line` location (capped, with an "and N more" line when a page has many). You can also review spelling as inline annotations on the **Files changed** tab, right next to the word in question, and in the job summary.
:::

## How to fix a finding

You have two good options, depending on whether the flagged word is wrong or simply unknown.

### 1. It is a typo, so correct it

Fix the spelling in your Markdown and push again. The check re-runs automatically.

```md
<!-- before -->
We deploy the workload to a Kubernets cluster.

<!-- after -->
We deploy the workload to a Kubernetes cluster.
```

### 2. It is a real term, so add it to a dictionary

Product names, acronyms, partner names, and people's names are correct even though a general dictionary rejects them. Add them to the right custom dictionary so cspell (and everyone's future PRs) accept them.

See [Custom Dictionaries](02-dictionaries.md) for which file to use (`sap`, `industry`, `partners`, or `people`) and how to add a word.

:::warning Add real words only
Only add a word to a dictionary when it is genuinely correct. Adding a misspelling silences the checker for everyone and lets the typo spread.
:::

## What the checker ignores

A `cspell.json` file at the repository root defines the behaviour. A few parts of that configuration explain why some text is never flagged.

:::note Configuration highlights
- **Languages:** English in three flavours (`en`, `en-US`, and `en-GB`), so both "color" and "colour" are accepted.
- **URLs and e-mail addresses** are ignored, so links and contact addresses never trip the checker.
- **Front matter is partly skipped:** `tags`, `contributors`, `author`, `id`, and `slug` values are ignored via patterns, because those hold slugs and names rather than prose.
- **Ignored paths:** some files are never scanned at all: the `docs/ref-arch/RA0000/**` template, the cookie-and-privacy pages (`docs/community/99-cookie-and-privacy/**`), the team page (`docs/community/10-the-team.md`), plus images (`.png`, `.jpg`, `.jpeg`, `.gif`), `.svg`, and `.drawio` files.
:::

Everything else (the body of your page, including headings and list items) is fair game for the spell checker.

## How it relates to the other text checks

Spelling is one of three complementary checks on your prose. They overlap a little but each catches different things:

| Check | Catches | Blocks the PR? |
| --- | --- | --- |
| [Spelling](01-check-spelling.md) (this page) | Unknown words vs. the dictionaries | Yes |
| [Typos](03-check-typos.md) | Common misspellings and typo patterns | see that page |
| [Grammar](04-check-grammar.md) | Grammar and style issues | see that page |

Think of spelling as the first line of defence for individual words, with [Typos](03-check-typos.md) and [Grammar](04-check-grammar.md) adding broader checks on top.

## Related pages

- [Automated Checks overview](../readme.md): how all the checks fit together
- [Custom Dictionaries](02-dictionaries.md): where to add legitimate terms
- [Front Matter guide](../../04-front-matter.md): the metadata block at the top of every page
- [Contribution process](../../01-contribution.md): the full journey from idea to merged PR
- [Quick Start](../../02-GetStarted/01-get-started-quickstart.md): our no-code editor for new reference architectures
