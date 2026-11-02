---
sidebar_position: 5
slug: /community/automated-checks/document-body/internal-links
title: Internal Link Check for SAP-Only Hosts in Content
description: "How the internal link check finds SAP-internal-only URLs that break for public visitors, which host patterns it flags, and which customer-facing hosts are safe."
sidebar_label: Internal Links
keywords:
    - sap
    - internal links
    - links
    - public site
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

The SAP Architecture Center is a public site, open to everyone on the internet. A link that only works inside the SAP network or behind single sign-on (SSO) is a dead end for external readers. This check scans the Markdown you changed and flags any link that points to an SAP-internal-only host.

## What this check does

When your pull request (PR) touches Markdown under `docs/` or `news/`, this workflow looks at the files you added or modified and searches them for links to hosts that are reachable only from inside SAP. It does not scan the whole site, only your changed `.md` and `.mdx` files, so it runs fast and points straight at your edits.

The goal is simple: everything we publish should work for every visitor. An internal wiki page or an internal tooling link may be perfectly valid for you, but a customer, partner, or community member reading the public site will hit a login wall or a "server not found" error.

:::info Where this fits
This is one of several content checks that run on every PR. For the big picture and the full list, see the [Overview](../readme.md) and [Operational Workflows](../12-operational-workflows.md) pages. For how results are surfaced across all checks, see [Errors & Warnings](../13-pr-checks-errors-and-warnings.md).
:::

## Host patterns that are flagged

The check matches the following internal-only host patterns, case-insensitively, inside any link in your content.

| Host pattern | What it is |
| --- | --- |
| `*.tools.sap` | Internal tooling (code hosting, project tracking, and similar) |
| `*.int.sap` | Internal services (internal wikis and intranet apps) |
| `*.sap.corp` | Legacy corporate network hosts |
| `sap.sharepoint.com` | Internal SharePoint |

A couple of details worth knowing:

- **Subdomains count.** Any host ending in one of these patterns is flagged, for example a deep subdomain under `*.tools.sap` or `*.sap.corp`.
- **Protocol-relative links are caught too.** A link that starts with `//` and omits the `https:` scheme (for example `//<internal-host>/path`) is matched as well, not just a full `https://` link.
- **Look-alike hosts are safe.** The check uses a host-label boundary, so a decoy like a `.sapient.com` host is *not* mistaken for a `.sap` host.

## Hosts that are intentionally allowed

Not every SAP host is internal. The following customer-facing hosts are public and are **not** flagged, so you can link to them freely:

- `*.cloud.sap`
- `*.hana.ondemand.com`
- `docs.sap`
- `help.sap.com`
- `me.sap.com`
- `community.sap.com`

:::tip Prefer a public source
When you need to point readers at SAP material, use a public destination first, most often [help.sap.com](https://help.sap.com) or [community.sap.com](https://community.sap.com). These are the public homes for official documentation and community content.
:::

## How results appear on your PR

If the check finds an internal-only link, it reports in three places so you cannot miss it:

- An **"Internal link"**-titled annotation inline on the **Files changed** tab, attached to the exact line.
- A **Check Internal Links** section in the sticky PR comment, which gathers the blocking findings from this and the other content checks.
- A **job summary** on the workflow run, listing each hit as `path:line:url`.

A finding here is a blocking error: the check fails until the internal link is gone. The message tells you the file, the line, and the offending URL.

:::note
If your PR changes no Markdown under `docs/` or `news/`, the check simply reports that there is nothing to scan and passes.
:::

## How to fix a flagged link

You have two options:

1. **Replace** the internal link with a public equivalent: the same information on a customer-facing host such as `help.sap.com` or `community.sap.com`.
2. **Remove** the link if no public equivalent exists, and reword the sentence so it still reads well.

Here is a concrete before/after. The "before" stands in for an internal-only link. The host shown is a non-internal placeholder so this page itself stays clean:

```md
<!-- Before: internal-only, breaks for public visitors (placeholder host) -->
See the [onboarding guide](https://wiki.corp.example/onboarding) for details.

<!-- After: public, works for everyone -->
See the [onboarding guide](https://help.sap.com/docs) for details.
```

If the content you were linking to simply has no public counterpart, drop the link and keep the surrounding prose standalone:

```md
<!-- After (removal): no public equivalent available -->
Follow your team's internal onboarding guide before you start.
```

:::warning Even "example" internal URLs are flagged
This page is scanned by this very check. It matches **any** host ending in `*.tools.sap`, `*.int.sap`, `*.sap.corp`, or `sap.sharepoint.com` **when it appears as a link** (with `https://`, `http://`, or a protocol-relative `//`), whether the host is real or an invented example, and even inside a code block or inline code, because the scan reads the raw text. A bare mention of such a hostname in prose, with no scheme or `//`, is not flagged. Labelling a host as a "placeholder" does **not** exempt it. In examples, use a host that does **not** end in one of those patterns at all, as the before/after above does.
:::

## Related checks

- [External Links](06-check-external-links.md): verifies that your *public* links actually resolve.
- [Front Matter Properties](../01-Front-Matter/01-check-front-matter-properties.md) and [SEO Front Matter](../01-Front-Matter/02-check-seo-front-matter.md): validate the metadata at the top of each page.
- [Overview](../readme.md): the full map of automated checks.

Need a refresher on how contributions flow through the project, or on writing content without touching Markdown by hand? See the [contribution process](../../01-contribution.md), the [Quick Start](../../02-GetStarted/01-get-started-quickstart.md) no-code editor, and the [community intro](../../../intro.md). For links that live inside diagrams, see the [diagramming guide](../../06-diagrams.md).
