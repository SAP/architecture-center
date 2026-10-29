---
sidebar_position: 5
slug: /community/automated-checks/front-matter/h1-title
title: H1 Title Check for Reference Architectures
description: "Why Architecture Center pages must take their title from the front matter instead of a level-1 Markdown heading, and how the H1 title check enforces it."
sidebar_label: H1 Title
keywords:
    - sap
    - front matter
    - title
    - markdown
    - heading
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

The **H1 Title** check makes sure the title of a page comes from the front matter `title:` field, not from a level-1 Markdown heading in the body. It is a **blocking** check: if a changed page contains a `#` heading, the check fails until it is removed.

## Why the title lives in the front matter

Every Architecture Center page already declares its title in the front matter:

```yaml
---
title: SAP Event-Driven Architecture Technology
---
```

Docusaurus renders that `title:` as the page's heading automatically, and also uses it for the browser tab, SEO, and social-media previews (see the [front matter guide](../../04-front-matter.md#title)). If you *also* add a `#` heading in the body, the page ends up with **two titles**, a duplicated `<h1>` that hurts accessibility and SEO and breaks the document outline.

So the rule is simple:

- The title comes from the front matter `title:` field.
- Body headings start at `##` (level 2) and go deeper from there (`###`, `####`).
- A Markdown body must never contain a `#` (level-1) heading.

## What this check does

On a pull request that changes Markdown (`.md` or `.mdx`) under `docs/`, the check scans each changed file for a level-1 `#` heading in the body and fails if it finds one.

It is careful to only flag a genuine title heading:

- The **front matter** block (between the opening and closing `---`) is ignored, so a YAML `#` comment is never flagged.
- **Fenced code blocks** (```` ``` ```` or `~~~`) are ignored, so a shell `# comment` inside a code sample is never flagged.
- Only a single leading `#` followed by a space counts. `##` and deeper headings, a shebang (`#!/usr/bin/env`), and a hashtag (`#example`) are **not** flagged.

:::info
It also triggers when the workflow file itself (`.github/workflows/check-h1-title.yml`) changes, so maintainers can validate adjustments to the check safely.
:::

## Where you will see the results

Like the spelling and typo checks, this check reports **inline on the Files changed tab**, pinned to the offending `#` line, and writes a short summary to the check's **job summary**. It also appears as a **Check H1 Title** section in the sticky pull request comment.

## How to fix it

1. **Open the flagged page** at the line the annotation points to.
2. **Delete the `#` heading line.** The title is already set by the front matter `title:` field, so you do not need a heading for it.
3. If the heading text differs from your front matter title and you want that wording, update the front matter `title:` instead.
4. **Demote any real body headings.** If the `#` was actually a section heading (not the title), change it and its sub-headings down one level so the body starts at `##`.

Push the fix to the same branch and the check runs again automatically.

:::tip
If you contribute through the no-code [Quick Start editor](../../02-GetStarted/01-get-started-quickstart.md), it sets the title in the front matter for you, so you will not hit this check.
:::

## Related pages

- [Automated Checks overview](../readme.md)
- [Front matter guide](../../04-front-matter.md): the `title:` field and every other front matter property
- [Front Matter Properties](01-check-front-matter-properties.md): the sibling check for authorship and house-style fields
- [Errors & Warnings](../13-pr-checks-errors-and-warnings.md): what to expect when a check reports a problem on your PR
