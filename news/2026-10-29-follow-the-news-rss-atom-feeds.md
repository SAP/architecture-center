---
title: Follow the news your way with RSS and Atom feeds
description: The SAP Architecture Center publishes RSS and Atom feeds for both the news and the reference architectures, so you can have new content delivered to your reader instead of checking back.
keywords: ["rss", "atom", "feed", "news", "reference architectures", "architecture center", "sap", "subscribe", "syndication", "opensource"]
hide_table_of_contents: false
authors: [cernus76]
date: 2026-10-29
---

Most of us only check a website when we happen to think of it. It works, but the effort's all on you: you keep coming back just to see if anything's new. There's a quieter way. You can subscribe to the SAP Architecture Center and let the new content come to you instead. We've had this going for the news for a while, and now the reference architectures have feeds too, so here's a quick run-through of how it all works.

<!-- truncate -->

## Two feeds, the same news

The news section runs on Docusaurus, the framework this whole site is built with, and feeds come baked right in. We didn't have to do anything clever: flip the option on, and you get two machine-readable feeds that refresh themselves the moment we post something new.

- RSS: `https://architecture.learning.sap.com/news/rss.xml`
- Atom: `https://architecture.learning.sap.com/news/atom.xml`

They carry the same thing: the latest articles, each with its title, publication date, authors, a short summary, and the full text. No account, nothing to install. A feed is really just a plain file sitting at a fixed address. Your reader checks it on a schedule and shows you whatever's turned up since it last looked.

## RSS or Atom, which one?

Honestly, it rarely matters, because nearly every feed reader speaks both. If you just want something that works, grab a link and get on with your day.

If you like to know the why, here it is in plain terms. RSS, short for Really Simple Syndication, is the older and better-known of the two, and the name most people recognise. Atom came along later, built to be a bit stricter and more precise about things like dates, authorship, and how article content is encoded. For you as a reader, neither has an edge you'd ever notice. The articles land the same way whichever you pick.

So let your reader guide you. Start with whatever it suggests, and if that feed ever acts up, switch to the other one. That almost always sorts it.

## Feeds for the reference architectures too

Here's the catch. Docusaurus hands you feeds for the blog, but it has nothing for ordinary documentation pages, and our reference architectures are exactly that. So if you're one of the people who lives in a feed reader and wants to know the moment an architecture lands or changes, you were out of luck.

That's the gap we closed. We built a feed for the reference architectures ourselves, so they now have their own pair:

- RSS: `https://architecture.learning.sap.com/docs/ref-arch/rss.xml`
- Atom: `https://architecture.learning.sap.com/docs/ref-arch/atom.xml`

Each one lists the 48 reference architectures we've touched most recently, newest first. Every entry gives you the title, the short description, and the opening of the page, enough to tell whether it's worth a closer look before you click through. The feeds rebuild whenever we publish a new architecture or revise an existing one, so they're an easy way to keep an eye on what's changing without combing through the whole catalogue by hand.

## How to subscribe

Copy any of the links above and paste it into the "add feed" or "new subscription" box in your reader. NetNewsWire, Feedly, Inoreader, and Thunderbird are all popular picks, and there are plenty more. Add both the news and the reference architecture feeds if you like, or just the parts of the site you care about. From then on, new content shows up in your reader shortly after we publish it, and you don't have to drop by the site to find out what you missed.

If you're handy with code, these URLs are easy to pull into a script, a scheduled job, or a chat tool. You fetch the XML, parse it, and do whatever you want with the result, from a quick notification to something more involved. They're open, well-documented standards, so you're never locked into one particular tool or library.

## Why feeds are worth it

Feeds put you back in charge. No algorithm deciding what you see, nothing piling up in an already crowded inbox, no sign-up you'll regret six months from now. You subscribe once, you can leave whenever you want, and in the meantime the news quietly finds you. That openness fits a project like this one, where everything is built in the open on [GitHub](https://github.com/SAP/architecture-center).

Give it a go with whichever reader you prefer. We hope it makes keeping up with the Architecture Center that bit easier.
