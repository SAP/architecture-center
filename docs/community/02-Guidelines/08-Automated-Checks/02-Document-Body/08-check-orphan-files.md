---
sidebar_position: 8
slug: /community/automated-checks/document-body/orphan-files
title: Orphan Files Check for Unreferenced Assets
description: "How the orphan files check verifies that every image or diagram you add is actually referenced by a Markdown page, and when it warns instead of failing."
sidebar_label: Orphan Files
keywords:
    - sap
    - orphan files
    - assets
    - images
    - ci checks
    - references
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

When you add an image or a diagram to the SAP Architecture Center, it should actually be used somewhere. The **Orphan Files** check makes sure of that: it confirms every asset you add is referenced by at least one Markdown page, so unused files do not quietly pile up in the repository.

This page explains what the check looks at, how it decides between an error and a warning, where you see the results, and how to fix anything it flags. For the full picture of how the checks fit together, see the [Automated Checks overview](../readme.md).

## What this check looks at

The check runs on a pull request only when you add or modify asset files. It does not re-scan the whole repository every time. It targets these locations and file types:

| What | Details |
| --- | --- |
| Folders watched | `assets/`, `diagrams/`, and `docs/` |
| File types | `.png`, `.jpg`, `.jpeg`, `.svg`, `.drawio`, `.docx` |
| Scope | Only assets **added, modified, or renamed** in your PR, compared against the base branch |

:::info
Because it compares your branch against the base branch, nothing happens if your PR touches no assets. In that case the check reports that there is nothing to review and passes immediately.
:::

## How it decides whether an asset is "used"

For each new or changed asset, the check searches **all** Markdown files (`.md` and `.mdx`) in the repository for a reference to that asset's file name. If a page embeds or links the file, the asset counts as used.

There is one important nuance for reference architectures. When an asset lives inside a reference-architecture folder (a path like `docs/ref-arch/RA0001/`), the reference that "counts" must come from a Markdown page **within that same RA directory**. This prevents a same-named file in a different RA from accidentally masking a genuine orphan.

:::note
Shared assets that live outside any `RA####` folder (for example under `assets/` or `diagrams/`) are matched repository-wide: any Markdown page that references them counts.
:::

## The two possible outcomes

The check produces one of two signals for a flagged asset:

| Outcome | When | Effect |
| --- | --- | --- |
| **Error** | The asset is referenced **nowhere** in any Markdown file | Blocking: the check fails and the PR cannot merge until it is resolved |
| **Warning** | The asset is referenced **only outside its own RA directory** | Non-blocking: the PR can still merge, but you should verify |

The warning exists on purpose. An asset matched only outside its own RA directory is usually one of two things: a legitimately **shared** asset, or a **same-named file** that happens to match a reference elsewhere while the real file in your RA is actually unused. Rather than block a genuinely shared asset, the check warns so you can confirm which case applies.

:::tip
A warning is not a failure. If the asset is intentionally shared, you can leave it as is. If it turns out your RA page never references its own copy, treat the warning as encouragement to add the reference or remove the file.
:::

## Where you see the results

The findings show up in three places on your pull request:

- **Inline annotations** on the **Files changed** tab, titled `Orphan files`, marked as an error or a warning on the affected asset.
- A **Check Orphan Files** section in the sticky PR comment, aggregated with the other content checks. This section lists blocking **errors** only.
- A **job summary** on the workflow run, listing each flagged asset with a clear status icon.

:::note Warnings are not in the sticky comment
A non-blocking **warning** (an asset referenced only outside its own RA folder) appears inline on the **Files changed** tab and in the job summary, but not in the sticky PR comment. A pull request with only warnings still shows this check as a pass.
:::

A clean run simply reports that no unreferenced files were found.

## How to fix it

You have two straightforward options whenever an asset is flagged:

1. **Reference it**: embed or link the asset from the page where it belongs.
2. **Remove it**: delete the file if you added it by mistake or no longer need it.

### Concrete example

Say you add a banner image for a new reference architecture:

```text
docs/ref-arch/RA0042/assets/hero.png
```

...but you forget to actually embed it in the RA page. Because no Markdown page references `hero.png`, the check reports an **error**. The inline annotation on the **Files changed** tab reads:

```text
Asset is not referenced in any Markdown file
```

and the job summary lists the offending file:

```text
- ❌ docs/ref-arch/RA0042/assets/hero.png
```

To fix it, embed the image in your RA's Markdown page:

```md
![Reference architecture overview](./assets/hero.png)
```

Once a page inside `docs/ref-arch/RA0042/` references the file, the check passes.

:::warning
If you only reference `hero.png` from a page in a **different** RA folder, you will get a **warning** instead of a pass, because the reference does not live in the asset's own RA directory. Add the reference from within the correct RA to clear it.
:::

## Related pages

- [Automated Checks overview](../readme.md): how all the checks fit together
- [Draw.io Files](07-check-drawio-files.md): validation for `.drawio` diagrams
- [Internal Links](05-check-internal-links.md): checking links between pages
- [Errors & Warnings](../13-pr-checks-errors-and-warnings.md): what to expect when a check flags your PR
- [Diagramming guide](../../06-diagrams.md): how to add diagrams and images to a page
- [Quick Start](../../02-GetStarted/01-get-started-quickstart.md): the no-code editor for new reference architectures
