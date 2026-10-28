---
sidebar_position: 3
slug: /community/automated-checks/front-matter/reference-architecture-ids
title: Reference Architecture ID and Slug Validation Check
description: "How the ID check validates that every reference architecture has a unique six-character id and a matching slug, and what happens when two pages collide."
sidebar_label: Reference Architecture IDs
keywords:
    - sap
    - reference architecture
    - id
    - slug
    - front matter
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

Every reference architecture lives in a `readme.md` whose front matter carries two linked fields: an `id` and a `slug`. This check keeps those fields valid and makes sure no two reference architectures ever claim the same `id` across the whole site.

## Why this check exists

The `id` is the stable, permanent identity of a reference architecture, and the `slug` is the public URL it is served from. The two must agree, and the `id` must be unique, otherwise two pages would compete for the same address and links would break. This check runs automatically on every pull request so that collisions are caught before they ever reach the live site.

:::info The id and slug are generated for you
You are not meant to invent these values yourself. The `id` and its matching `slug` are assigned by an external application: our no-code [Quick Start](../../02-GetStarted/01-get-started-quickstart.md) editor generates a valid `id` and the correct `slug` when you scaffold a new reference architecture. These initial values are temporary placeholders: the Architecture Center team finalises them while reviewing your contribution, so the `id` on the live site may differ from the one you first received. This check is not the generator. It is a safety net that verifies nobody has changed those values by hand or accidentally duplicated an `id` that another reference architecture already uses. In normal use, if you let the tooling create your pages, the check simply passes.
:::

If you want the bigger picture of how all the pull-request checks fit together, start with the [Automated Checks overview](../readme.md).

## The rules

The check validates three things about each reference architecture `readme.md`:

| Field | Rule |
| --- | --- |
| `id` | Must be exactly **six characters**, each one a lowercase letter `a–z` or a digit `0–9`. |
| `id` | Must be **unique** across every reference architecture on the site. |
| `slug` | Must be exactly `/ref-arch/<id>`: the same six-character `id`, prefixed with `/ref-arch/`. |

So if your `id` is `a06a95`, your `slug` must be `/ref-arch/a06a95`. Nothing more, nothing less.

:::info Two pages are deliberately skipped
The conceptual landing page at `docs/ref-arch/readme.md` (whose slug is just `/ref-arch`) and the `RA0000` demo page do **not** follow the `/ref-arch/<id>` convention, so the check leaves them alone.
:::

For the full meaning of `id`, `slug`, and the other front matter fields, see the [Front Matter guide](../../04-front-matter.md).

## What gets checked, and what can fail

This check is triggered when a pull request touches a `docs/ref-arch/**/readme.md` file (or the check's own script or workflow).

There is an important subtlety in how it decides what passes and what fails:

- To verify that `id` values are **globally unique**, the check reads *every* reference architecture `readme.md` in the repository, not only the ones you changed.
- But only a **changed** file can actually fail the check. If a problem exists purely in files your pull request never touched, it is not held against you.

:::note Duplicate `id` is a special case
A duplicate `id` involves two files. The check reports it when **either** of the two colliding files was changed in your pull request, and it points the error at the file you changed, so the fix lands where you are working.
:::

## The error types

When something is wrong, the check reports one of four error types:

| Error | Meaning |
| --- | --- |
| `MISSING id` | The `readme.md` has no `id` field in its front matter. |
| `INVALID id` | The `id` is present but not exactly six characters of `a–z` / `0–9`. |
| `SLUG MISMATCH` | The `slug` is not exactly `/ref-arch/<id>` for this file's `id`. |
| `DUPLICATE id` | Another reference architecture already uses this `id`. |

## Where results show up

If the check finds a problem, it surfaces in three places so you cannot miss it:

1. **Inline annotations** pinned directly to the offending `id:` or `slug:` line in your pull request diff (a `MISSING id` error, having no line to point at, is attached to the file as a whole).
2. A **Check Reference Architecture IDs** section inside the sticky pull-request comment that aggregates the content checks.
3. A **job summary** on the check's run, listing every error it found.

A passing run simply reports that all files have valid, unique ids.

## How to fix it

Seeing one of these errors usually means an `id` or `slug` was typed or copied by hand, rather than left as the tooling generated it. The cleanest fix is to use the generator (see the tip below). If you do need to correct the front matter directly, make sure your reference architecture's `readme.md` has a six-character `id` and a `slug` that matches it exactly:

```yaml
---
id: a06a95
slug: /ref-arch/a06a95
title: SAP Event-Driven Architecture Technology
# ...other front matter fields...
---
```

Here is what each error is telling you to do:

- **`MISSING id`**: add an `id` field with a valid six-character value.
- **`INVALID id`**: fix the value so it is exactly six characters, lowercase letters and digits only. For example, `A06A95` (uppercase) and `a06a9` (five characters) both fail; `a06a95` passes.
- **`SLUG MISMATCH`**: set the `slug` to `/ref-arch/<id>`, reusing the exact `id`. If your `id` is `a06a95`, the `slug` is `/ref-arch/a06a95`.
- **`DUPLICATE id`**: this usually means an `id` was copied from another page. Regenerate the page with the tooling, or give it a different, unused `id` (and update its `slug` to match).

:::tip Let Quick Start generate the id for you
The easiest way to never hit these errors is to not type the `id` by hand. Our no-code [Quick Start](../../02-GetStarted/01-get-started-quickstart.md) editor generates the `id` and `slug` for you when you scaffold a new reference architecture. If you start from the create-ref-arch-skeleton template instead, it leaves placeholder values that the Architecture Center team finalises during review, so do not edit them by hand to force this check green.
:::

## Related checks

- [Front Matter Properties](01-check-front-matter-properties.md) validates the required front matter fields.
- [SEO Front Matter](02-check-seo-front-matter.md) checks `title`, `description`, and other SEO fields.
- [Internal Links](../02-Document-Body/05-check-internal-links.md) verifies that links between pages resolve.

New to contributing? See the [community intro](../../../intro.md) and the [contribution process](../../01-contribution.md).
