---
sidebar_position: 7
slug: /community/automated-checks/document-body/drawio-files
title: Draw.io File Checks for Size and External Images
description: "How the drawio check keeps diagram files under one megabyte and blocks external image references, so every diagram stays self-contained and loads reliably."
sidebar_label: Draw.io Files
keywords:
    - sap
    - drawio
    - diagrams
    - file size
    - ci checks
    - images
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

Diagrams are a core part of every reference architecture, and they ship as `.drawio` files committed right next to your Markdown. When your pull request adds or changes any `.drawio` file, this workflow runs two quick checks on just the files you touched, making sure each diagram is small enough to load fast and fully self-contained.

:::info Only your changed files are checked
This check compares your branch against the pull request base and looks only at `.drawio` files you **added, modified, or renamed**. Diagrams that already live in the repository and that you did not touch are left alone. If your PR changes no `.drawio` files at all, the workflow reports "nothing to check" and passes.
:::

## What this check looks for

| # | Check | Rule | Annotation title |
|---|-------|------|------------------|
| 1 | File size | A `.drawio` file must be **at most 1024 KB (1 MB)** | `drawio size` |
| 2 | External images | A `.drawio` file must **not** reference external images (`image=http...`) | `drawio external image` |

Both checks run independently, so a single file can be flagged by one, the other, or both.

## Check 1: File size

Every changed `.drawio` file is measured. If it exceeds **1024 KB**, the check fails and reports the file's measured size so you know how far over the limit you are.

```text
❌ docs/ref-arch/.../my-diagram.drawio is too large (1337 KB). Maximum allowed size is 1024 KB.
```

Diagrams usually grow past the limit when raster images (screenshots, exported PNG files, logos) are pasted directly into the canvas. A compact, vector-based diagram comfortably stays well under a megabyte.

:::tip Keeping diagrams small
- Prefer the built-in SAP and technology shapes over pasted screenshots.
- Crop and compress any bitmap image before embedding it.
- If a diagram is genuinely large, split it into focused sub-diagrams. This is usually clearer for readers, too.
:::

## Check 2: External image references

A `.drawio` file must not point to images hosted somewhere else on the web. The check scans each changed file for an external image reference (an `image=http...` entry) and fails if it finds one.

```text
❌ docs/ref-arch/.../my-diagram.drawio contains external image references (image=http).
   External images are not allowed in drawio files. Please embed the image directly.
```

Images must be **embedded directly** in the diagram (stored inline as base64 data) rather than linked by URL. Embedding keeps every diagram:

- **Self-contained**: the file carries everything it needs.
- **Reliable**: nothing breaks when a remote URL moves, expires, or goes offline.
- **Free of external dependencies**: no request leaves the reader's browser to a third-party host, which also avoids privacy concerns.

:::note How external links get in
Draw.io can insert an external reference when you paste an image by URL, or drag an image in from a browser tab instead of from a local file. If you always add images from a local file (or copy-paste the pixels), draw.io embeds them for you.
:::

## When a check fails

Both checks are **blocking**: a failure keeps the pull request from being merged until it is resolved. Results show up in three places:

1. **Annotations** attached to the offending file, titled `drawio size` and `drawio external image`. They carry no line number, so they appear on the **Checks** tab and at the top of the file on the **Files changed** tab, rather than against a specific line.
2. A **"Check drawio Files" section** in the sticky summary comment the PR check bot posts on your PR.
3. A **job summary** on the workflow run, listing each flagged file with its measured size or the external-reference finding.

:::warning
A green run means the diagrams you changed are within limits and self-contained. It does not re-check diagrams you did not touch.
:::

## How to fix findings

| Finding | Fix |
|---------|-----|
| File too large | Simplify or optimise the diagram, compress embedded bitmaps, or split it into smaller diagrams until it is under **1024 KB**. |
| External image reference | Open the diagram, remove the linked image, and re-add it so it is **embedded** (base64) instead of referenced by URL. |

After you push the fix, the workflow re-runs automatically on the new commit. Once both checks pass, the "Check drawio Files" section turns green.

:::tip Diagramming guide
For the full conventions on creating and editing diagrams (naming, theming, light and dark variants, and export), see the [diagramming guide](../../06-diagrams.md).
:::

## Related checks

This is one of several automated checks that run on your contributions. See the [Automated Checks overview](../readme.md) for the full picture, and the companion pages:

- [Spelling](01-check-spelling.md) and [Custom Dictionaries](02-dictionaries.md)
- [Typos](03-check-typos.md) and [Grammar](04-check-grammar.md)
- [Front Matter Properties](../01-Front-Matter/01-check-front-matter-properties.md) and [SEO Front Matter](../01-Front-Matter/02-check-seo-front-matter.md)
- [Reference Architecture IDs](../01-Front-Matter/03-check-reference-architecture-ids.md)
- [Internal Links](05-check-internal-links.md) and [External Links](06-check-external-links.md)
- [Orphan Files](08-check-orphan-files.md)
- [Operational Workflows](../12-operational-workflows.md)
- [What errors and warnings mean on your PR](../13-pr-checks-errors-and-warnings.md)

New to contributing? Start with the [community intro](../../../intro.md), the [contribution process](../../01-contribution.md), and, for a new reference architecture, the no-code [Quick Start editor](../../02-GetStarted/01-get-started-quickstart.md).
