---
sidebar_position: 2
slug: /community/automated-checks/front-matter/seo
title: SEO Front Matter Check for Titles and Descriptions
description: "How the SEO front matter check measures the length of each page title and description, which lengths only warn, and which lengths fail your pull request build."
sidebar_label: SEO Front Matter
keywords:
    - sap
    - seo
    - front matter
    - title
    - description
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

Search engines truncate a page title or description that is too long, and gain nothing from one that is too short. This check measures the length of the `title` and `description` fields in your [front matter](../../04-front-matter.md) on each published `docs/` page your pull request changes, so your pages look their best in search results.

## What this check does

When you open a pull request, this check reads the `title` and `description` from the front matter of each affected page and measures how many characters each one has. It then decides whether that length is comfortable, slightly off, or clearly wrong.

Pages marked `draft: true` or `unlisted: true` are skipped, because search engines do not index them, so their title and description lengths do not matter.

:::info
This is a length check only. It does not judge whether your wording is good, nor whether a field is missing from the schema. That is the job of the [Front Matter Properties](01-check-front-matter-properties.md) check. Here, an empty or absent `title` or `description` is reported as "missing or empty" and fails the build.
:::

## Length thresholds

Each field has a **recommended range** (the ideal range for SEO) and wider **hard bounds**. Staying inside the recommended range keeps the check quiet. Drifting outside it but staying within the hard bounds raises a warning. Going past the hard bounds, or leaving the field empty, fails the build.

| Field | Recommended range | Hard bounds (fail outside) |
| --- | --- | --- |
| `title` | 40–60 characters | 20–65 characters |
| `description` | 120–160 characters | 50–200 characters |

## Warnings and errors

The check produces one of two outcomes per field.

- **Warning (non-blocking)**: the value is outside the recommended range but still within the hard bounds. For example, a `title` of 35 characters, or a `description` of 100. Your build is not blocked, but you are encouraged toward the ideal range.
- **Error (blocking)**: the value is empty, or outside the hard bounds (way too short or way too long). For example, a `title` of 72 characters, or a `description` of 40. This fails the check and blocks the merge until you fix it.

:::note
A short section page with a legitimately brief title will warn rather than fail, as long as it stays within the hard bounds. Warnings are safe to leave in place, but they are a good hint that the field is worth polishing.
:::

## Where you see the results

The check reports in three places, so you do not have to search through raw logs:

- **Inline annotations** on the **Files changed** tab of your pull request, attached to the exact `title:` or `description:` line, marked as a warning or an error.
- A **Check SEO Front Matter** section in the sticky pull request comment. It lists only the blocking *errors* (each as a `path:line` location followed by its message), or a success line when there are none. Non-blocking warnings are **not** repeated here. They stay as inline annotations.
- The **job summary** for the check run, which lists the recommended lengths, the failing bounds, how many pages were checked, and the error and warning counts.

## How to fix a finding

The message tells you the current character count and the range it should fall into. Adjust the wording until the length lands inside the recommended range.

### A title that is too long

An 82-character title fails with "way too long" because it exceeds the hard maximum of 65:

```yaml
# Fails: 82 characters
title: SAP Integration Suite Reference Architecture for Enterprise Event-Driven Messaging
```

Trim it to about 50 characters, inside the recommended 40–60 range:

```yaml
# Passes: 49 characters
title: Event-Driven Messaging with SAP Integration Suite
```

### A description that is too short

A description just below the recommended floor of 120 (but still above the hard minimum of 50) only warns. Expand it toward ~140 characters to clear the warning:

```yaml
# Warns: 88 characters, below the recommended 120
description: A reference architecture for event-driven messaging on SAP Business Technology Platform.
```

```yaml
# Passes: 137 characters, inside the recommended 120-160
description: A reference architecture for event-driven messaging on SAP Business Technology Platform, covering brokers, topics, and consumer patterns.
```

:::warning
A `description` of 30 characters is below the hard minimum of 50 and will **fail**, not warn. Give every published page a real one- or two-sentence description.
:::

:::tip
Only the changed docs Markdown on your pull request is checked, that is the pages you added, modified, or renamed under `docs/`, not the whole site. If your pull request touches no Markdown under `docs/`, this check has nothing to do and passes immediately.
:::

## Related pages

- [Automated Checks overview](../readme.md)
- [Front Matter Properties check](01-check-front-matter-properties.md): validates which fields exist
- [Front matter guide](../../04-front-matter.md): what each field means
- [Errors and warnings on your PR](../13-pr-checks-errors-and-warnings.md): what to do when a check reports something
