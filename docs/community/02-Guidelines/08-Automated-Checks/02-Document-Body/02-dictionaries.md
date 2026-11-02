---
sidebar_position: 2
slug: /community/automated-checks/document-body/dictionaries
title: Custom Spelling Dictionaries in the Architecture Center
description: "Learn how the sap, industry, partners, and people dictionaries teach cspell your terms, when to add a word, and how they differ from the typos word list."
sidebar_label: Custom Dictionaries
keywords:
    - sap
    - cspell
    - custom dictionary
    - spelling
    - word list
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
  date: 2026-10-28
---

<!-- cspell:ignore recieve occured teh -->
<!-- The words above are deliberate misspellings used as examples below. -->

Reference architectures are full of words no general-purpose spell checker has ever seen: SAP product names, cloud and AI acronyms, partner brands, and the names and GitHub handles of the people who write them. Custom dictionaries are how we teach our spell checker that these words are correct, so it only flags the mistakes that actually matter.

## Why custom dictionaries exist

A standard English dictionary knows `architecture` and `deployment`. It does **not** know `BTP`, `Datasphere`, `OAuth`, `Snowflake`, or a contributor handle like `fabianleh`. Without a curated word list, the spell checker would underline every single one of these as a mistake, drowning the one real typo in a sea of false positives. Nobody would trust the check, and everybody would learn to ignore it.

The custom dictionaries fix that. They are the project's shared vocabulary: an agreed-upon taxonomy of the specialised words that legitimately appear in our content. When you add a term once, it is accepted everywhere, for everyone, forever.

:::info Non-developers welcome
Editing a dictionary means adding one word to a plain text file. There is no code to run and nothing to compile. If you can edit a Markdown page, you can add a word to a dictionary.
:::

## Two layers, two jobs

Spelling in the Architecture Center is guarded by two independent tools that do opposite things. Understanding the division of labour tells you exactly where a given word belongs.

- **cspell is proactive.** It is the *taxonomy of valid words*. cspell flags anything it does not recognise, so the custom dictionaries exist to list every specialised term we consider correct. This is the layer you extend most often. See [Spelling](01-check-spelling.md).
- **typos is reactive.** It does **not** flag a word just for being unfamiliar. It only fires when a word closely resembles a known misspelling (for example `teh` for `the`). Because of that, SAP, industry, and partner names almost never trip it. See [Typos](03-check-typos.md).

The practical consequence: when a valid term gets flagged, **which** check flagged it tells you **which** file to edit. cspell flagging an unknown word means it belongs in a `.cspell` dictionary. typos "correcting" a real word means it belongs in the typos word list.

:::note
These two checks are complementary, not redundant. cspell catches *unknown* words; typos catches *plausible-looking* words that are actually wrong (`recieve`, `occured`). Running both gives broad coverage without either one becoming too noisy.
:::

## How `cspell.json` is wired

All of the spelling configuration lives in `cspell.json` at the repository root. Here is the shape of it:

```json
{
  "version": "0.2",
  "language": "en,en-US,en-GB",
  "dictionaryDefinitions": [
    { "name": "sap",      "path": ".cspell/sap.txt",      "addWords": true },
    { "name": "industry", "path": ".cspell/industry.txt", "addWords": true },
    { "name": "partners", "path": ".cspell/partners.txt", "addWords": true },
    { "name": "people",   "path": ".cspell/people.txt",   "addWords": true }
  ],
  "dictionaries": ["sap", "industry", "partners", "people"],
  "words": ["RAXXXX", "claudeignore", "Conv", "Ashburn", "gingershot"],
  "ignoreRegExpList": ["Urls", "Email", "HexValues", "FrontMatterTags", "..."],
  "ignorePaths": ["**/node_modules/**", "**/*.drawio", "..."],
  "files": ["docs/**/*.md", "docs/**/*.mdx", "news/**/*.md", "news/**/*.mdx"]
}
```

The pieces that matter to a contributor:

- **`dictionaryDefinitions`** registers each of the four custom word lists and gives it a name. `addWords: true` means these are the lists the project treats as its own extendable vocabulary.
- **`dictionaries`** switches those four lists on for the whole project.
- **`words`** is an inline array for a handful of true one-offs that do not fit any category: currently `RAXXXX`, `claudeignore`, `Conv`, `Ashburn`, and `gingershot`. Use the `.cspell` files for anything that has a natural category; reserve this inline list for genuine oddities.
- **`ignoreRegExpList` and `patterns`** tell cspell to skip things that are not prose: `Urls`, `Email` addresses, `HexValues` (colour codes), and several front-matter fields such as `tags`, `contributors`, `author`, `id`, and `slug`. That is why you never need to add a URL or a slug to a dictionary.
- **`ignorePaths`** excludes whole paths from spell checking, including `node_modules`, binary and diagram assets (`*.drawio`, `*.svg`, `*.png`, …), the `RA0000` template, the cookie-and-privacy pages, and the team page.
- **`files`** scopes the check to Markdown under `docs/` and `news/` only.

## The four custom dictionaries

Each dictionary has a clear theme. Picking the right one keeps the shared vocabulary organised and easy to review. All four use the same simple format: **case-insensitive**, **one term per line**, and `#` to start a comment. (The `addWords: true` flag that makes them extendable lives on each entry in `cspell.json`, not in the text files themselves.)

| Dictionary | File | What belongs here | Example terms | Rough size |
| --- | --- | --- | --- | --- |
| **SAP** | `.cspell/sap.txt` | SAP acronyms, product names, and SAP-specific terms | `BTP`, `HANA`, `ABAP`, `Fiori`, `Kyma` | ~77 terms |
| **Industry** | `.cspell/industry.txt` | General cloud, architecture, and AI acronyms and terms (not SAP- or vendor-specific) | `OAuth`, `OIDC`, `gRPC` | ~177 terms |
| **Partners** | `.cspell/partners.txt` | Partner and competitor names, plus their products and technologies | `AWS`, `Azure`, `Snowflake`, `Kafka` | ~96 terms |
| **People** | `.cspell/people.txt` | Contributor names and GitHub handles that appear in prose and bylines | author names and handles | ~120 terms |

:::tip Keep the taxonomy clean
The categories exist for a reason. A SAP product goes in `sap.txt`, a protocol like `SAML` goes in `industry.txt`, a vendor like `Databricks` goes in `partners.txt`, and a person goes in `people.txt`. Do not dump everything into one file. A tidy taxonomy is far easier to review and keep correct.
:::

## How to add a word

When cspell flags a valid term, adding it is three quick steps:

1. **Choose the right dictionary** by category, using the table above.
2. **Add the term on its own line** in that file. Order is not critical, but keeping it near related entries (under the existing `#` section comments) helps reviewers.
3. **Commit the change** alongside the content that uses the word, so the check passes in the same pull request.

For example, to teach cspell a new SAP service, you would add one line to `.cspell/sap.txt`:

```diff
  # Platform & core
  BTP
  HANA
+ BuildApps
```

That is the entire change. Because the match is case-insensitive, you do not need to list `btp`, `BTP`, and `Btp` separately. One entry covers them all.

:::warning One word per line
Do not put multiple terms on a single line or separate them with commas. cspell reads each line as one entry, so `AWS, Azure` would be treated as a single (never-matching) token. Give each term its own line.
:::

## The typos word list

The reactive check is configured in `_typos.toml` at the repository root. You should rarely touch it. Add an entry **only** when typos wrongly "corrects" a real term, not just because a word is unfamiliar (that is cspell's job).

To allow a word, map it **to itself** under `[default.extend-words]`, and keep the keys **lowercase**:

```toml
[default.extend-words]
advices = "advices"   # "remittance advices", a valid accounting term
rto      = "rto"      # Recovery Time Objective
alo      = "alo"      # At-Least-Once (delivery QoS)
aks      = "aks"      # Azure Kubernetes Service
aci      = "aci"      # Azure Container Instance
```

The same file also has a `[files]` section with `extend-exclude`, which lists path and file patterns typos skips entirely, for example `*.min.js`, `*.lock`, `*.svg`, `*.drawio`, and the `docs/ref-arch/RA0000/` template (its Latin placeholder text would otherwise trip the check).

:::note Keep it small and reactive
The typos list is intentionally short. If a word is simply specialised and unknown, it belongs in a `.cspell` dictionary, not here. Only genuine false "corrections" earn a line in `_typos.toml`.
:::

## Which file do I edit? A quick rule

:::tip The decision in one line
- **Is cspell flagging a valid word?** Add it to the matching `.cspell` list: SAP, industry, partners, or people.
- **Is typos wrongly correcting a valid word?** Add it (mapped to itself, lowercase) to `_typos.toml`.
:::

One more thing worth remembering: the team page (`docs/community/10-the-team.md`) and the cookie-and-privacy page are **excluded wholesale** via `ignorePaths` in `cspell.json`. So `people.txt` only needs the names and handles that appear **outside** those two pages: in article prose, bylines, and front-matter examples.

## Related checks

- [Overview](../readme.md): all automated checks at a glance
- [Spelling](01-check-spelling.md): the cspell check these dictionaries feed
- [Typos](03-check-typos.md): the reactive misspelling check
- [Grammar](04-check-grammar.md): the companion language check
- [Errors & Warnings](../13-pr-checks-errors-and-warnings.md): what to expect when a check fails on your pull request

If you are still finding your feet, start with the [community intro](../../../intro.md) and the [contribution process](../../01-contribution.md). Contributing a brand-new reference architecture? Use the no-code [Quick Start](../../02-GetStarted/01-get-started-quickstart.md) editor.
