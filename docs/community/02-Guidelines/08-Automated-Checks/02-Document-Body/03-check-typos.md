---
sidebar_position: 3
slug: /community/automated-checks/document-body/typos
title: Typos Check for Common Misspellings in Markdown
description: "How the typos check catches real misspellings in changed docs and news pages without flagging valid SAP product names, and how to allow a word it corrects."
sidebar_label: Typos
keywords:
    - sap
    - typos
    - spelling
    - misspelling
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

<!-- cspell:ignore recieve teh occured -->
<!-- The words above are deliberate misspellings used as examples below. -->

The **Typos** check scans the Markdown you changed for common, high-confidence misspellings: the kind of slip that no reader should have to stumble over. It is deliberately narrow: it only reacts to words that look like a known typo, so it rarely gets in the way of valid SAP, industry, or partner terminology.

## What this check does

When your pull request touches Markdown under `docs/` or `news/`, this check runs the [`typos`](https://github.com/crate-ci/typos) binary (pinned to version `1.50.3`) over the files you added or modified. If it finds a likely misspelling, it flags it and the check fails.

Because it is scoped to **changed files only**, it never flags pre-existing typos elsewhere in the project. You are responsible for the lines you touched, and nothing more.

The check is triggered by changes to any of these paths:

| Path | What it covers |
| --- | --- |
| `docs/**/*.md`, `docs/**/*.mdx` | Reference architectures and community docs |
| `news/**/*.md`, `news/**/*.mdx` | News articles |
| `_typos.toml` | The check's own configuration |
| `.github/workflows/check-typos.yml` | The workflow definition |

## How it differs from the spelling check

This is the single most important thing to understand about Typos, especially if you have already met the [Spelling](01-check-spelling.md) check (cspell).

:::info The key difference
`typos` **only flags words that closely resemble a known misspelling**: for example `recieve` → `receive`, or `teh` → `the`. It does **not** flag a word simply because the word is unfamiliar.
:::

That means an unusual-but-correct product name, acronym, or technical term (the kind of word that cspell might not recognise) will almost always pass straight through Typos untouched. There is no need to register SAP product names, partner names, or industry jargon here just because they are uncommon.

Think of it this way:

| Check | Reacts to | Typical fix |
| --- | --- | --- |
| **Typos** (this page) | Words that look like a *known misspelling* | Correct the spelling, or allow a wrongly corrected real term |
| **[Spelling](01-check-spelling.md)** (cspell) | Words that are *unknown* to its dictionaries | Add the valid term to a [custom dictionary](02-dictionaries.md) |

## Where results appear

If Typos finds something, it does three things:

1. **Fails the check**, which blocks the pull request until it is resolved.
2. **Adds inline annotations** on the **Files changed** tab of your PR, right on the offending line. These annotations carry the title **"Typos"**.
3. **Writes a job summary** listing every typo it found.

:::note In the PR comment
A **Check Typos** section is included in the sticky summary comment on your PR, listing each finding as a `path:line` location. You can also review the findings as inline annotations on the **Files changed** tab, or open the check's job summary.
:::

## Configuration (`_typos.toml`)

The check reads its rules from [`_typos.toml`](https://github.com/SAP/architecture-center/blob/main/_typos.toml) at the repository root. Here are the parts worth knowing about.

### Locale

```toml
[default]
locale = "en"
```

The `en` locale is **variant-neutral**: both en-US and en-GB spellings are accepted, so you will not be pushed from `colour` to `color` or vice versa. (`typos` supports a single locale value, and `en` is the neutral one.)

### Allowing a word with `extend-words`

Occasionally `typos` will "correct" a word that is actually valid in our context. To stop that, you map the word to itself under `[default.extend-words]`. Keys are **lowercase**.

```toml
[default.extend-words]
advices = "advices"       # "remittance advices", a valid accounting term
rto = "rto"               # Recovery Time Objective
alo = "alo"               # At-Least-Once (delivery QoS)
aks = "aks"               # Azure Kubernetes Service
aci = "aci"               # Azure Container Instance
```

:::tip Keep this list small and reactive
Only add an entry when `typos` wrongly corrects a real term. There is no need to pre-register valid vocabulary here. That proactive, exhaustive job belongs to the [custom dictionaries](02-dictionaries.md) used by the spelling check.
:::

### Leaving identifiers alone

```toml
[default.extend-identifiers]
```

The `extend-identifiers` section is for identifier-like tokens (code symbols or names) that `typos` should never touch. It is currently empty.

### Excluded files

```toml
[files]
extend-exclude = [
  "*.min.js",
  "*.lock",
  "*.svg",
  "*.drawio",
  "docs/ref-arch/RA0000/",
  "docs/community/02-Guidelines/08-Automated-Checks/01-check-spelling.md",
  "docs/community/02-Guidelines/08-Automated-Checks/02-dictionaries.md",
  "docs/community/02-Guidelines/08-Automated-Checks/03-check-typos.md",
  "docs/community/02-Guidelines/08-Automated-Checks/13-pr-checks-errors-and-warnings.md",
]
```

| Pattern | Why it is excluded |
| --- | --- |
| `*.min.js` | Minified JavaScript, not prose |
| `*.lock` | Dependency lock files |
| `*.svg` | Vector graphics markup |
| `*.drawio` | Draw.io diagram source (see the [Draw.io Files](07-check-drawio-files.md) check and the [diagramming guide](../../06-diagrams.md)) |
| `docs/ref-arch/RA0000/` | The new-RA template, which holds Latin lorem-ipsum placeholder text |
| The Automated Checks pages that show example misspellings (including this one) | They must display real misspellings such as `recieve` and `teh` as examples. `typos` has no per-line ignore, so the whole file is excluded here. cspell still scans these pages, with a scoped `cspell:ignore` for just the example words |

## How to fix a reported typo

You have two paths, depending on who is right: you or the tool.

### 1. It really is a typo

Correct the spelling in your Markdown and push again. The inline annotation tells you the exact file, line, and suggested correction.

```text
docs/ref-arch/my-architecture/index.md:42:8: error: `recieve` should be `receive`
```

Change `recieve` to `receive`, commit, and the check turns green.

### 2. It is a valid term being wrongly corrected

If `typos` is flagging a word that is genuinely correct in our content, add it to `extend-words` in `_typos.toml`, mapping it to itself.

For example, suppose a page legitimately uses the accounting term **remittance advices** and `typos` tries to "fix" `advices`. The allowance looks like this:

```toml
[default.extend-words]
advices = "advices"       # "remittance advices", a valid accounting term
```

:::warning Choose the right list
Add a word to `_typos.toml` **only** when `typos` is actively wrongly correcting it. If instead the [Spelling](01-check-spelling.md) check reports a word as *unknown*, that word belongs in a [custom dictionary](02-dictionaries.md), not here. The two lists solve different problems.
:::

## Where this fits

Typos is one of several automated checks that run on your contribution. For the full picture, see the [Automated Checks overview](../readme.md), and for what to do when a check reports a problem, read [Errors & Warnings](../13-pr-checks-errors-and-warnings.md).

New to contributing? Start with the [community intro](../../../intro.md), the [contribution process](../../01-contribution.md), and, for new reference architectures, the no-code [Quick Start](../../02-GetStarted/01-get-started-quickstart.md) editor.
