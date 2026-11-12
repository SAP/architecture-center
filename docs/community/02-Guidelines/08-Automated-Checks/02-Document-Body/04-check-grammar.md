---
sidebar_position: 4
slug: /community/automated-checks/document-body/grammar
title: Grammar and Prose Check with LanguageTool
description: "How the non-blocking LanguageTool grammar check reviews prose in your changed docs and news pages, where its suggestions appear, and why it never fails a PR."
sidebar_label: Grammar
keywords:
    - sap
    - grammar
    - languagetool
    - reviewdog
    - prose
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

When you open a pull request, a grammar and prose check reads the English text in your changed pages and offers gentle suggestions: a stray double word, a missing comma, an awkward construction. It is powered by [reviewdog](https://github.com/reviewdog/reviewdog) and [LanguageTool](https://dev.languagetool.org/), and it complements the [spell check](01-check-spelling.md) rather than replacing it.

## What this check does

LanguageTool is a mature open-source proofreading engine. In our setup it runs **bundled inside the reviewdog action's container image**. There are no calls out to any external grammar API, so your prose never leaves the GitHub Actions runner. reviewdog then takes LanguageTool's findings and surfaces them where you can act on them.

Think of it as a friendly editor reading over your shoulder:

- **Spelling** is handled elsewhere, by [cspell](01-check-spelling.md) and its [custom dictionaries](02-dictionaries.md).
- **Grammar and style** (word repetition, agreement, punctuation flow) is what this check looks at.

:::info Two layers, one goal
Spelling and grammar are deliberately split across two checks. That keeps SAP product names you have already allowed in the [custom dictionaries](02-dictionaries.md) from being re-flagged here, and it keeps each check's output focused and easy to read.
:::

## Scope: what gets checked

The check runs on pull requests that target the `dev` branch and that touch Markdown prose:

| Aspect | Value |
| --- | --- |
| File types | `.md` files under `docs/` and `news/` |
| Trigger | Pull requests and pushes to `dev` |
| Language | `en-US` only |
| `.mdx` files | **Intentionally excluded** for now |

```yaml
# From .github/workflows/check-grammar.yml
patterns: docs/**/*.md news/**/*.md
language: en-US
```

:::note Why `.mdx` is skipped
`.mdx` pages mix Markdown with JSX and `import` lines. Those lines look like broken sentences to a prose checker and generate the most false positives, so they are left out until the rules are tuned further. Plain `.md` pages (the vast majority of content, including everything the Quick Start editor produces) are fully covered.
:::

LanguageTool scans the tracked `docs/` and `news/` `.md` files on each run, and reviewdog then narrows the visible annotations down to the **lines you actually changed** in the PR. You will not be shown pre-existing issues in parts of a file you never touched.

## It never fails your PR

This is the most important thing to understand as a contributor: **the grammar check is non-blocking by design.** It can surface warnings, but it can never turn red and it can never stop your pull request from merging.

Two independent safeguards guarantee this:

1. The action is run **without** reviewdog's fail-on-error flag (and exposes no input to turn it on), so reviewdog exits successfully no matter how many findings it reports.
2. The step also carries `continue-on-error`, so even a hiccup (a read-only token on a fork PR, or the bundled server being slow to boot) cannot make the check fail.

The reported `level` is `warning`, which only sets the severity label on the comments; it does not change the pass/fail outcome.

:::tip This one is advisory
If you see grammar suggestions, treat them as a helpful second read, not a gate. You are free to apply the ones that improve your text and ignore the ones that do not fit (technical phrasing, intentional style, product terminology).
:::

## Where the suggestions appear

Where you see the findings depends on how you opened the PR:

| Your situation | Where suggestions show up |
| --- | --- |
| Branch on the main repository (core contributors) | Inline **review comments** on your changed lines, on the **Files changed** tab (`github-pr-review`) |
| Pull request from a **fork** | GitHub issues a read-only token, so the review comments cannot be posted. Open the grammar step's **Actions run log** to see the raw output, and a maintainer can relay any grammar suggestions on the pull request if needed |

Grammar is **advisory and non-blocking**, and it is **not** part of the sticky **🔎 Content check results** comment; its suggestions live only as the inline review comments above (or, for forks, in the Actions run log).

If you contributed through a fork (the recommended path for most community members) and do not see inline review comments, that is expected. Open the workflow run from the **Actions** tab and read the grammar step's log to see the same suggestions.

## What it does *not* flag

To keep the signal clean, several categories and rules are switched off on purpose:

| Turned off | Why |
| --- | --- |
| `TYPOS` category | Spelling is owned by [cspell](01-check-spelling.md) and the [custom dictionaries](02-dictionaries.md); this avoids re-flagging allowed SAP terms. |
| `TYPOGRAPHY` category | Curly quotes, fancy dashes, and arrows are noisy against code and Markdown. |
| A set of Markdown-noise rules | Rules like whitespace, underscores in words, and bracket pairing misfire on Markdown and code; they are disabled individually. |

```yaml
# From .github/workflows/check-grammar.yml
disabled_categories: TYPOS,TYPOGRAPHY
disabled_rules: WHITESPACE_RULE,EN_QUOTES,DASH_RULE,WORD_CONTAINS_UNDERSCORE,...
```

## As a contributor

Here is the short version of how to work with this check:

- **Read the suggestions, apply what helps.** A flagged repeated word or missing comma is usually worth a quick fix.
- **Do not chase a green check.** There is nothing to turn green here. The check is informational.
- **Found a false positive?** Maintainers tune the check by appending the offending rule id to the `disabled_rules` list in the workflow. If a legitimate phrasing keeps getting flagged, mention it in your PR and a maintainer can silence that specific rule.

:::warning
Because the check only reads `.md` files, prose inside `.mdx` pages is not proofread automatically today. Give those pages an extra manual read before you submit.
:::

## Related pages

- [Automated Checks overview](../readme.md): how all the checks fit together
- [Spelling check](01-check-spelling.md) and [Custom Dictionaries](02-dictionaries.md): the spelling side of prose review
- [Typos check](03-check-typos.md): a second, fast spelling pass
- [Errors and warnings](../13-pr-checks-errors-and-warnings.md): what to do when a check reports something
- [Contribution process](../../01-contribution.md) and the [Quick Start editor](../../02-GetStarted/01-get-started-quickstart.md): how to get your content in
