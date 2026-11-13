---
sidebar_position: 13
slug: /community/automated-checks/errors-and-warnings
title: What Happens When PR Checks Find Errors or Warnings
description: "A worked walkthrough of a pull request: which checks run, where errors and warnings appear, what blocks a merge, and how to read and fix each message."
sidebar_label: Errors & Warnings
keywords:
    - sap
    - pull request
    - ci checks
    - errors
    - warnings
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
  date: 2026-10-15
---

<!-- cspell:ignore integreation -->
<!-- "integreation" is a deliberate misspelling used as an example below. -->

You have opened your pull request. Now what? This page walks through exactly what happens next: which checks run, where their results appear, which ones can hold up a merge, and how to read and fix each message with concrete examples. If you have not yet met the individual checks, the [Overview](readme.md) introduces them one by one.

## What happens the moment you open or update a PR

As soon as you open a pull request against `dev`, or push a new commit to it, GitHub starts the relevant checks. Two things are worth knowing from the start:

- **The checks are path-filtered.** Each one only runs when the files it cares about actually changed. Edit a single Markdown page and you will not trigger the Draw.io check; add an image and the spelling check stays quiet. You only ever see feedback that is relevant to what you touched.
- **Results arrive within a few minutes.** The checks run in parallel. Most finish in well under five minutes, and each one reports as soon as it is done, so you do not have to wait for all of them before fixing the first problem.

:::tip
Contributing through the no-code [Quick Start editor](../02-GetStarted/01-get-started-quickstart.md)? The same checks run on the pull request it opens for you. Everything on this page applies in exactly the same way; you just read the results on GitHub.
:::

## Three places results show up

The checks never leave you searching. Findings land in one (or more) of three surfaces, and every check also writes an expandable **job summary** under its entry on the **Checks** tab.

| Where you look | What you find there | Checks that report here |
| --- | --- | --- |
| **Files changed** tab: inline annotations pinned to the exact line | A speech-bubble comment next to the offending word, link, or front matter field | [Typos](02-Document-Body/03-check-typos.md), [Spelling](02-Document-Body/01-check-spelling.md), [Grammar](02-Document-Body/04-check-grammar.md) (review comments), [Internal Links](02-Document-Body/05-check-internal-links.md), [SEO Front Matter](01-Front-Matter/02-check-seo-front-matter.md), [Front Matter Properties](01-Front-Matter/01-check-front-matter-properties.md), [Reference Architecture IDs](01-Front-Matter/03-check-reference-architecture-ids.md), [Contributor IDs](01-Front-Matter/04-check-contributor-ids.md), [H1 Title](01-Front-Matter/05-check-h1-title.md) |
| **Checks** tab: one entry per check | Status (tick / cross / note), full run log, and a job summary | Every check writes a job summary here |
| **One sticky PR comment** titled **🔎 Content check results** | Findings grouped by check, rebuilt on every run | All content checks except grammar: [Internal Links](02-Document-Body/05-check-internal-links.md), [External Links](02-Document-Body/06-check-external-links.md), [SEO Front Matter](01-Front-Matter/02-check-seo-front-matter.md), [Front Matter Properties](01-Front-Matter/01-check-front-matter-properties.md), [Contributor IDs](01-Front-Matter/04-check-contributor-ids.md), [Reference Architecture IDs](01-Front-Matter/03-check-reference-architecture-ids.md), [H1 Title](01-Front-Matter/05-check-h1-title.md), [Draw.io Files](02-Document-Body/07-check-drawio-files.md), [Orphan Files](02-Document-Body/08-check-orphan-files.md), [Spelling](02-Document-Body/01-check-spelling.md), and [Typos](02-Document-Body/03-check-typos.md) |

A few deliberate details about the sticky comment:

- **[Grammar](02-Document-Body/04-check-grammar.md) is not in this comment.** It is advisory and non-blocking, and posts as inline **review comments** on the **Files changed** tab instead (on a fork pull request, the read-only token blocks those, so the suggestions appear in the grammar step's **Actions run log**).
- **It shows blocking errors only.** Non-blocking warnings (for example an SEO length outside the recommended range, or an asset referenced only outside its RA folder) appear inline on the **Files changed** tab and in the job summary, not in this comment. A check that reports only warnings still shows as a pass here.
- **It is idempotent.** The comment rebuilds its entire body every time a check finishes, so it always reflects your latest commit. Look for the footer line noting the commit it was updated for.
- **It works on fork pull requests.** The comment is assembled in the base repository's context and never checks out your PR's code, so it can post results even for contributions from a fork, without ever running your changes with a writable token.

:::info
If a check does not appear in the sticky comment at all, that usually means its paths did not match your changes, so it never ran. That is normal and expected, not a failure.
:::

## Blocking vs non-blocking

Not every finding stops a merge. Some are hard gates; others are friendly suggestions. Here is the split.

| Blocking: fails the check and holds the merge | Non-blocking: a warning you should weigh, but which never fails the build |
| --- | --- |
| [Typos](02-Document-Body/03-check-typos.md): any typo in changed Markdown | [Grammar](02-Document-Body/04-check-grammar.md): always advisory, by design |
| [Spelling](02-Document-Body/01-check-spelling.md): any unknown word | [SEO Front Matter](01-Front-Matter/02-check-seo-front-matter.md): a value merely outside the recommended range |
| [SEO Front Matter](01-Front-Matter/02-check-seo-front-matter.md): a value past the hard bounds | [Orphan Files](02-Document-Body/08-check-orphan-files.md): an asset referenced only *outside* its own RA directory |
| [Front Matter Properties](01-Front-Matter/01-check-front-matter-properties.md): any missing/non-conforming field | |
| [Reference Architecture IDs](01-Front-Matter/03-check-reference-architecture-ids.md): bad `id` or `slug` | |
| [Internal Links](02-Document-Body/05-check-internal-links.md): any SAP-internal-only host | |
| [External Links](02-Document-Body/06-check-external-links.md): any broken external URL | |
| [Draw.io Files](02-Document-Body/07-check-drawio-files.md): oversized file or external image reference | |
| [Orphan Files](02-Document-Body/08-check-orphan-files.md): an asset referenced *nowhere* | |

:::note
The [SEO](01-Front-Matter/02-check-seo-front-matter.md) and [Orphan Files](02-Document-Body/08-check-orphan-files.md) checks each sit on both sides of the line. SEO *fails* only when a title or description blows past the hard minimum/maximum; a value that is merely shorter or longer than the ideal range is a warning. Orphan Files *fails* only when an asset is referenced nowhere; an asset referenced only outside its RA folder is a warning (it might legitimately be shared).
:::

## A pull request with nine problems

Imagine a single PR that adds a new reference architecture and manages to trip almost everything at once. Here is each problem, the message you would see, and the one-line fix. (All values below are illustrative.)

### 1. A misspelling: "integreation"

You wrote `integreation` instead of `integration`.

```text
docs/ref-arch/RA1234/readme.md:12:5 - Unknown word (integreation)
```

An inline annotation lands on that word on the **Files changed** tab, titled **Spelling** (and **Typos** flags common slips like this too). **Fix:** correct the spelling. See [Spelling](02-Document-Body/01-check-spelling.md) and [Typos](02-Document-Body/03-check-typos.md).

### 2. A valid new product name flagged by cspell

Your architecture legitimately mentions a brand-new SAP product, but cspell has never heard of it, so it reports it as an unknown word, the same shape of message as above.

**Fix:** this is not a typo, so do not change the text. Add the term to the project dictionary at `.cspell/sap.txt` (one word per line) and commit that too. The next run will accept it. See [Custom Dictionaries](02-Document-Body/02-dictionaries.md).

:::tip
The custom dictionaries are how the project teaches cspell every SAP-specific name: products, acronyms, service names. When a *correct* term is flagged, the fix is almost always "add it to the dictionary," never "reword the sentence." The [Custom Dictionaries](02-Document-Body/02-dictionaries.md) page explains which file to use.
:::

### 3. A 72-character title: SEO "way too long"

Your front matter `title` runs to 72 characters. The hard maximum is 65.

```text
docs/ref-arch/RA1234/readme.md:4: title is way too long (72 characters, hard maximum 65; recommended 40-60 characters).
```

This is a **blocking** error (past the hard bound). **Fix:** tighten the title into the recommended 40–60 character range. Had it been, say, 63 characters, you would have seen a non-blocking *warning* instead. See [SEO Front Matter](01-Front-Matter/02-check-seo-front-matter.md).

### 4. Missing contributors / stale date

You forgot to add yourself to `contributors`, and the `last_update.date` is from last month.

```text
docs/ref-arch/RA1234/readme.md: contributors is missing or does not include the PR author.
docs/ref-arch/RA1234/readme.md: last_update.date is older than 7 days before today.
```

Both are **blocking**. **Fix:** add your GitHub login to `contributors`, set `last_update.author` to your login, and bump `last_update.date` to today. See [Front Matter Properties](01-Front-Matter/01-check-front-matter-properties.md) and the general [front matter guide](../04-front-matter.md).

### 5. `slug` not matching `id`: "SLUG MISMATCH"

Your readme has `id: ra1234` but `slug: /ref-arch/ra9999`.

```text
SLUG MISMATCH  slug "/ref-arch/ra9999" != "/ref-arch/ra1234"  ->  docs/ref-arch/RA1234/readme.md
```

The `id` must be exactly six lowercase letters/digits, and the `slug` must be `/ref-arch/<id>`. **Fix:** make the slug match the id (`/ref-arch/ra1234`). See [Reference Architecture IDs](01-Front-Matter/03-check-reference-architecture-ids.md).

### 6. A link to an SAP-internal host

You linked to an internal wiki that external visitors cannot reach.

```md
See the [internal design note](https://wiki.example-internal.invalid/display/ARCH/notes).
```

```text
docs/ref-arch/RA1234/readme.md:40: Internal-only SAP link (breaks for external visitors): https://wiki.example-internal.invalid/...
```

(The `.invalid` host above is a stand-in. On a real PR this would be a host ending in one of the internal suffixes below. We never put a real internal host in content, including in examples.) The check flags any host matching `*.tools.sap`, `*.int.sap`, `*.sap.corp`, or `sap.sharepoint.com`. **Fix:** link to a public source instead, or remove the link. See [Internal Links](02-Document-Body/05-check-internal-links.md).

### 7. A dead external URL (404)

One of your external links returns `404 Not Found`. The check reports it in the job summary and in the sticky comment (not as an inline annotation, because broken links are often network-dependent and not tied to a changed line).

```text
✗ https://example.com/this-page-moved | 404 Not Found
```

**Fix:** update the URL or point it at a working page. See [External Links](02-Document-Body/06-check-external-links.md).

### 8. A 1.4 MB `.drawio` diagram

You committed a diagram source file of about 1.4 MB. The limit is 1024 KB.

```text
❌ docs/ref-arch/RA1234/diagram.drawio is too large (1434 KB). Maximum allowed size is 1024 KB.
```

**Fix:** slim the diagram down: embedded raster images are the usual culprit. (The same check also fails on *external* image references inside a `.drawio`; images must be embedded, not linked.) See [Draw.io Files](02-Document-Body/07-check-drawio-files.md) and the [diagramming guide](../06-diagrams.md).

### 9. An added image that nothing references

You added `architecture-overview.png` but no page links to it.

```text
❌ docs/ref-arch/RA1234/architecture-overview.png: Asset is not referenced in any Markdown file
```

This is **blocking**. **Fix:** reference the image from your Markdown, or remove it if it is not needed. If the same image is instead referenced *only from another RA's folder*, you would get a non-blocking ⚠️ warning ("referenced only outside its RA directory") rather than an error. See [Orphan Files](02-Document-Body/08-check-orphan-files.md).

## Fixing and re-running

There is nothing special to trigger: **push a new commit** to the same branch and the checks re-run automatically on your updated files. The sticky **🔎 Content check results** comment updates in place (it does not pile up new comments), so you always read the latest state in one spot.

:::info
**Contributing from a fork?** GitHub hands fork pull requests a read-only token, so the [Grammar](02-Document-Body/04-check-grammar.md) suggestions cannot be posted to the **Checks** tab; they appear in the Actions run log instead. The aggregated content-check comment still posts normally, because it is built in the base repository's context. Everything else behaves the same.
:::

## When everything is green

You can relax: the checks are there to help. They exist to help your content meet the house style in seconds, long before a human reviewer weighs in on the ideas. Because almost every check is path-scoped, you only ever see feedback about the files you actually changed. And when every check shows a green tick and the sticky comment reads *all clean*, your pull request is ready for human review.

For the big picture of how the whole system fits together, go back to the [Overview](readme.md). For the schedule-based and deployment workflows that run outside the PR flow, see [Operational Workflows](12-operational-workflows.md).
