---
name: create-ref-arch-skeleton
description: Creates the skeleton for a new reference architecture in terms of folders and initial front matter. Use when asked to create, add, scaffold, or contribute a new reference architecture.
---

# Create Skeleton Skill

Produce the syntactically correct skeleton for a new reference architecture (RA). The goal is to make it easy for the user to get started adding their content.

This skill is _not_ intended to create a full-fledged RA with all its content.

## Prerequisites

The underlying idea/topic must always come from the user. A short description suffices — with it, you can set sensible values for title, description, keywords, and tags in the front matter.

If the user hasn't provided a topic, explain why you need one and ask again.

## Expected Skeleton Structure

Once the topic is sorted out, read the following files to understand what a syntactically correct skeleton looks like:

1. `../docs/community/02-Guidelines/03-content-structure.md` - the expected folder structure. Follow it to the point.
2. `../docs/community/02-Guidelines/04-front-matter.md` - mandatory RA metadata (front matter). Title, description, and keywords are especially important for SEO.
3. `../docs/community/02-Guidelines/05-components.md` - custom components declared in every RA's `readme.md` and translated into React components at build time.
4. `../docs/ref-arch/RA0000/readme.md` - template for a RA's `readme.md`. Build on this template, but never copy the comments in the front matter.
5. `../docs/tags.yml` - existing tags for RAs.

**Never deviate from the described structure.**

### Additional Constraints

- Never add sub-pages preemptively unless explicitly asked to.
- No unnecessary blank lines between front matter fields.
- Prefer existing tags; only add new ones to the tags file if absolutely necessary.
- Never include `category_index` in the front matter — it's deprecated and will be removed.

### Reasonable Placeholders

Include some placeholders to work with:
- Copy `../docs/ref-arch/RA0000/drawio/demo.drawio` as the initial drawio file.
- Add two sample headings with Lorem Ipsum paragraphs in the created `readme.md`.
- Use the drawio component once, referencing the copied `demo.drawio`.

Ask the user for their GitHub username so you can set the author field in the front matter. Don't forget to also list it under contributors.

Until then, use 'octocat' as a placeholder if needed. Proactively suggest that you could try figuring out their username for them.

