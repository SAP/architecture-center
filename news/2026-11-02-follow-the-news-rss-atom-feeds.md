---
title: Follow the news your way with RSS and Atom feeds
description: The SAP Architecture Center publishes RSS and Atom feeds for both the news and the reference architectures, so you can have new content delivered to your reader instead of checking back.
keywords: ["rss", "atom", "feed", "news", "reference architectures", "architecture center", "sap", "subscribe", "syndication", "opensource"]
hide_table_of_contents: false
authors: [cernus76]
date: 2026-11-02
---

Most people read a website when they happen to remember it. That works, but it puts all the effort on you to keep checking back for something new. There is a quieter option that many readers overlook: you can subscribe to the SAP Architecture Center and let new content come to you. We have supported this for the news since the section first went live, and there are now feeds for the reference architectures as well, so it felt worth a short write-up.

<!-- truncate -->

## Two feeds, the same news

The news section publishes two machine-readable feeds that refresh automatically whenever we post a new article:

- RSS: `https://architecture.learning.sap.com/news/rss.xml`
- Atom: `https://architecture.learning.sap.com/news/atom.xml`

Both carry exactly the same content: the latest articles with their titles, publication dates, authors, a short summary, and the full text. You do not need an account, and there is nothing to install. A feed is simply a plain file that your reader fetches on a schedule and then shows you whatever has changed since the last time it looked.

## RSS or Atom, which one?

The honest answer is that it rarely matters, because almost every feed reader understands both. If you just want something that works, pick either link and move on.

If you are curious about the difference, here it is in plain terms. RSS, short for Really Simple Syndication, is the older and more widely recognised of the two formats, and it is the one most people have heard of. Atom came later and was designed to be a bit stricter and more precise, particularly around dates, authorship, and how article content is encoded. Neither is better for the reader in any way you would notice. The articles you receive are identical whichever one you choose.

So the practical approach is to try whatever your reader suggests first. If that feed ever gives you trouble, switch to the other one and it will almost certainly sort itself out.

## Feeds for the reference architectures too

The news feeds have been around for a while. What is new is that the reference architectures now have their own pair of feeds as well:

- RSS: `https://architecture.learning.sap.com/docs/rss.xml`
- Atom: `https://architecture.learning.sap.com/docs/atom.xml`

Each one lists the fifty most recently updated reference architectures, newest first. For every entry you get the title, the short description, and the opening of the page, so you can tell at a glance whether it is worth a closer look before clicking through. The feeds rebuild themselves whenever we publish a new architecture or revise an existing one, which makes them a handy way to keep an eye on what is changing without working through the whole catalogue by hand.

## How to subscribe

Copy any of the links above and paste it into the "add feed" or "new subscription" field of your feed reader. Popular readers include NetNewsWire, Feedly, Inoreader, and Thunderbird, among many others. Nothing stops you adding both the news and the reference architecture feeds, so you can follow whichever parts of the site matter to you. From then on, new content turns up in your reader soon after we publish it, and you no longer have to visit the site to find out what is new.

If you work with code, the same two URLs are easy to consume from a script, a scheduled job, or a chat tool. You fetch the XML, parse it, and do whatever you like with the result, from a simple notification to a fuller integration. Because these are open, well-documented standards, you are not tied to any particular tool or library.

## Why we think feeds are worth it

Feeds hand control back to the reader. There is no algorithm deciding what you see, nothing landing in an already crowded inbox, and no sign-up to regret later. You subscribe once, you can unsubscribe at any time, and in the meantime the news finds you. That openness fits the spirit of the project rather well, given that everything here is built in the open on GitHub.

Give it a try with your reader of choice. We hope it makes keeping up with the Architecture Center that little bit easier. Until next time.
