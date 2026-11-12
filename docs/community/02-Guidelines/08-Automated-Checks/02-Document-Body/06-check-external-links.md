---
sidebar_position: 6
slug: /community/automated-checks/document-body/external-links
title: External Link Check for Broken Links with Lychee
description: "How the external link check uses lychee to verify that outbound links in your changed pages still resolve, and why network issues are reported, not inlined."
sidebar_label: External Links
keywords:
    - sap
    - external links
    - broken links
    - lychee
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

When you add or edit a page, the links that point *out* to the wider web should still lead somewhere. The external link check verifies exactly that: it runs [lychee](https://github.com/lycheeverse/lychee) against the Markdown you changed and flags any outbound link that no longer resolves.

## What this check does

Whenever you open or update a pull request that touches Markdown (`.md` or `.mdx`) under `docs/` or `news/`, this check collects the files you added, modified, or renamed and asks lychee to visit every external URL in them. If a link resolves, you hear nothing. If a link is dead, the check fails and tells you which one.

The check only looks at the files in your diff, not the whole site. That keeps it fast and keeps the feedback focused on what you actually changed.

:::info
It also triggers when the workflow file itself (`.github/workflows/check-ext-links.yml`) changes, so maintainers can validate adjustments to the check safely.
:::

## Why it reports differently from the local checks

Most checks in this suite (spelling, [typos](03-check-typos.md), [internal links](05-check-internal-links.md), [front matter](../01-Front-Matter/01-check-front-matter-properties.md)) are deterministic. They look at your text, find a problem on a specific line, and leave an inline annotation right there in the diff.

External links are different. Their status depends on the network, not just your edit:

- the remote server is briefly down (a transient `5xx` error),
- the server is rate-limiting the check (a `429 Too Many Requests`),
- the URL moved or was retired since you first copied it.

Because that behaviour is network-dependent and often *not* tied to a particular changed line, this check does **not** post per-line annotations. Instead it writes its results to two places:

| Where | What you see |
| --- | --- |
| The **job summary** | A full lychee report under the heading *External links check* |
| The **sticky PR comment** | A *Check External Links* section, aggregated alongside the other content checks |

So if you are looking for an external-link problem, look at the PR comment and the job summary rather than the inline diff.

## When it blocks your PR

The check is configured to fail only when a link is definitively dead, so that kind of URL will stop the PR from going green until it is fixed.

A few details worth knowing:

- **Among HTTP responses, only `404` and `410` block the PR.** A `404 Not Found` or a `410 Gone` means the page is genuinely gone, so the check fails on those. Every other HTTP status is treated as reachable (see the next point).
- **A link that cannot be reached at all still fails.** `--accept` only governs HTTP status codes, so a failure that happens before a usable HTTP response, a refused connection, a DNS name that does not resolve, a TLS or certificate error, a timeout, a malformed URL, or too many redirects, also fails the check. An unreachable link is a real problem.
- **Ambiguous HTTP responses are treated as reachable.** A `403 Forbidden` (usually an authentication or login wall), a `429 Too Many Requests`, a `5xx` server error, or any other unrecognised status code is **not** flagged. These almost never mean your link is broken, so they no longer fail the check.
- **Transient blips clear on a re-run.** `lychee` retries a failing link before giving up, so a brief network blip usually clears on its own. If a host was only momentarily unreachable, re-running the check (see below) normally turns it green. A link that is genuinely broken stays failed until you fix it.
- **It fails closed on odd filenames.** As a safety measure, if a changed file path contains anything outside letters, digits, and the characters `. _ / -`, the check refuses to run and reports that instead. This is a security guard against unusual characters in paths from fork pull requests. In practice your file names will never trip this, so just name files normally.

:::note
If none of your changed Markdown lives under `docs/` or `news/`, the check has nothing to look at and simply reports that there was nothing to check. That is a pass, not a problem.
:::

## How to fix a failure

1. **Open the report.** Find the *Check External Links* section in the sticky PR comment (or the *External links check* heading in the job summary) and read which URL failed and with what status.
2. **Decide if it is real or transient.** A `404 Not Found` or a `410 Gone` means the page is genuinely gone, so you need to fix it. A link that cannot be reached at all (a refused connection, an unresolved DNS name, a TLS error, a timeout, a malformed URL, or too many redirects) may be a real outage or a brief blip. A `403`, `429`, or `5xx` is no longer reported at all, since those almost never mean your link is broken.
3. **For a real break:** correct the typo in the URL, or replace it with the current canonical address of the resource. If the resource is gone for good, link to an equivalent source or remove the link.
4. **For an unreachable host:** if it was only briefly down, simply re-run the check. Short outages normally clear, and a re-run often turns the check green with no change on your side.

:::info Re-running the check
You can re-run a failed check from the PR's **Checks** tab on GitHub. See [GitHub's docs on re-running workflows](https://docs.github.com/en/actions/managing-workflow-runs/re-running-workflows-and-jobs) for the exact steps.
:::

## Writing links that last

The best way to pass this check is to never add a fragile link in the first place.

:::tip Prefer stable, canonical URLs
Link to official, long-lived sources (a project's own documentation site, or its repository on [github.com](https://github.com/SAP/architecture-center)) rather than short-lived links such as URL shorteners, search-result pages, or temporary preview environments. Canonical URLs are far less likely to move or disappear, which keeps your page working long after you publish it.
:::

If you ever need to show an internal, non-public URL as an *example* in your prose, use an obviously fake placeholder (for instance, `https://internal.example.com/your-resource`) and say in the text that it is a placeholder. The check validates real links, and internal hosts are never reachable from the public CI runner.

## Related pages

- [Automated Checks overview](../readme.md): how the whole suite fits together
- [Internal Links](05-check-internal-links.md): the sibling check for links *within* the site
- [Errors & Warnings](../13-pr-checks-errors-and-warnings.md): what to expect when a check reports a problem on your PR
- [Operational Workflows](../12-operational-workflows.md): the behind-the-scenes automation
- [Contribution process](../../01-contribution.md) and [Quick Start](../../02-GetStarted/01-get-started-quickstart.md): if you are new, start here
