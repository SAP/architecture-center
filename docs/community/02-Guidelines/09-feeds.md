---
sidebar_position: 9
slug: /community/feeds
title: RSS and Atom Feeds
description: How the SAP Architecture Center publishes RSS and Atom feeds for the news and the reference architectures, and how to control which content appears in them.
sidebar_label: RSS & Atom Feeds
keywords:
    - sap
    - sap architecture center
    - rss
    - atom
    - feed
    - syndication
    - docusaurus
    - reference architectures
    - business ai platform
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
  date: 2026-10-29
---

The site publishes machine-readable feeds in both RSS and Atom so readers can follow new content from a feed reader instead of checking back by hand. There are two separate feed systems, and they are built in very different ways. This page explains both, and how the content you contribute ends up in them.

## Two Feed Systems

| Content | Feeds | How it is produced |
| --- | --- | --- |
| News (the blog) | `/news/rss.xml`, `/news/atom.xml` | Built into Docusaurus |
| Reference architectures | `/docs/ref-arch/rss.xml`, `/docs/ref-arch/atom.xml` | Custom plugin in this repository |

## News Feeds (Built In)

The news section is a standard Docusaurus blog, and Docusaurus generates blog feeds out of the box. There is nothing bespoke here: the feeds are enabled through the blog preset in `docusaurus.config.ts`.

```ts
blog: {
    path: 'news',
    routeBasePath: 'news',
    // ...
    feedOptions: {
        type: ['rss', 'atom'],
        title: 'SAP Architecture Center News',
        limit: 48,
    },
},
```

With `type: ['rss', 'atom']` set, Docusaurus writes `rss.xml` and `atom.xml` under the `news` route at build time and lists the 48 most recently published articles (the `limit: 48` in `feedOptions`, kept the same as the reference-architecture feeds below). As a contributor you do not have to do anything: publish a news article in the normal way and it appears in the feed automatically.

## Reference Architecture Feeds (Custom Plugin)

Docusaurus only generates feeds for the blog. It has **no** feed support for ordinary documentation pages, and the reference architectures are ordinary docs. To serve the readers who rely on feeds to keep up with the catalogue, we built this ourselves.

:::tip Prefer to browse?
If you would rather read the recent updates in your browser than in a feed reader, the [Recently Updated Reference Architectures](/ref-arch-updates) page shows the latest reference architectures as a web page, with the same updates the feeds carry.
:::

The feeds are produced by a custom plugin at `src/plugins/docs-feed-generator`, registered in the `plugins` array of `docusaurus.config.ts`. It uses the [`feed`](https://www.npmjs.com/package/feed) package to build valid RSS and Atom documents.

### How It Works

The plugin runs in the `postBuild` phase, after Docusaurus has resolved every permalink and written the per-doc metadata. For each reference architecture it then:

1. Reads the resolved doc metadata and keeps only pages under a `docs/ref-arch/RA####/` directory.
2. Sorts the surviving pages by `last_update.date`, newest first.
3. Takes the **48** most recently updated entries.
4. Builds each feed item from the page title, description, a plain-text excerpt (the first 500 characters of the body), the permalink, and the update date.
5. Writes `rss.xml` and `atom.xml` into the `docs/ref-arch` output directory.

Because this happens during `npm run build`, the feeds are only regenerated when the site is rebuilt and redeployed, not live on every content change.

### What Gets Excluded

A reference architecture page is left out of the feeds when any of the following is true:

- It has no `last_update.date` in its front matter. A date is required to place the entry on the timeline.
- Its front matter sets `draft: true`.
- Its front matter sets `unlisted: true`.
- Its `tags` list contains `archive` or `demo`.
- It is the RA0000 demo page.

So if a reference architecture you expect is missing from the feed, check its front matter first. The most common cause is a missing `last_update.date`, an `archive` tag, or a page left as `draft`.

```yaml
# This page would be excluded from the feeds
tags:
    - archive
draft: false
unlisted: false
last_update:
  author: your-github-handle
  date: 2026-10-28
```

## RSS or Atom?

Nearly every feed reader understands both formats, so the choice rarely matters to a reader. We publish both for compatibility: RSS is the older and more widely recognised format, while Atom is stricter about dates, authorship, and how content is encoded.

## References

- [Docusaurus: Blog feed](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog#feedOptions)
- [`feed` package on npm](https://www.npmjs.com/package/feed)
- [RSS 2.0 specification](https://www.rssboard.org/rss-specification)
- [Atom (RFC 4287)](https://www.rfc-editor.org/rfc/rfc4287)
