---
name: create-ref-arch-skeleton
description: Creates the skeleton for a new reference architecture in terms of folders and initial front matter. Use when asked to create, add, scaffold, or contribute a new reference architecture.
---

# Create Skeleton Skill

The skill should produce the syntactically correct skeleton for a new reference architecture (RA). This should make it easy for the user to get started and add their content to the new RA.

Note that the skill is _not_ intended to create a full-fledged RA with all the content.

## Prerequisites

The underlying idea/topic for the new RA has to always come from the user. A short description of the topic is sufficient here. With it, you will be able to set sensable values for title, description, keywords, and tags inside the front matter.

If the user hasn't provided a topic, clarify why you need it and ask for it again.

## Expected Skeleton Structure

Once the topic is sorted out, go through the following files to understand what it means for the skeleton to be syntactically correct:

1. `../docs/community/02-Guidelines/03-content-structure.md` - lays out the expected folder structure. follow it to the point.
2. `../docs/community/02-Guidelines/04-front-matter.md` - mandatory metadata (front matter) about the RA. title, description, and keywords are especially important for SEO.
3. `../docs/community/02-Guidelines/05-components.md` - custom components declared in the `readme.md` of every new RA and translated into custom React components at build time.
4. `../docs/ref-arch/RA0000/readme.md` - template for a RA's `readme.md`. build on top of this template for the readme of the new RA, but never copy the comments in the front matter.
5. `../docs/tags.yml` - lists the existing tags for RA

**Never deviate from the described structure**.

### Additional Constraints

- Never add sub-pages preemptively, unless you were explicitly asked to do that.
- No unnecessary new lines between front matter fields
- Prefer listing existing tags in the front matter, and only add new ones to the tags file if absolutely necessary.
- Never include `category_index` in the front matter. It's a thing from the past and will eventually be removed.

### Reasonable Placeholders

Let's have some placeholders to work with:
- Copy over `../docs/ref-arch/RA0000/drawio/demo.drawio` to have an initial drawio
- Add two sample headings and paragraphs, the latter as Lorem Ipsum, in the created `readme.md`
- Use the drawio component once together with the `demo.drawio` file that you copied.

Ask the user for their GitHub username, so that you can set the author field in the front matter to it. Don't forget to also list it in the contributors field therein.

Until then, work with the 'octocat' as placeholder for the username, if need be. Proactively suggest to the user that you could try figuring out their username for them.

