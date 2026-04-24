---
name: create-ref-arch-skeleton
description: Creates the skeleton for a new reference architecture in terms of folders and initial front matter. Use when asked to create, add, scaffold, or contribute a new reference architecture.
---

# Create Skeleton Skill

The skill should produce the syntactically correct skeleton for a new reference architecture (RA). This should make it easy for the user to get started and add their content to the new RA.

Note that the skill is _not_ intended to create a full-fledged RA with all the content.

## Skill Inputs

There is just one input, which is required for the skill, a short description of the topic that the RA should be about. With it, you will be able to set sensable values for title, description, keywords, and tags inside the front matter.

If the user hasn't provided a topic, clarify why you need it and ask for it again.

## Expected Skeleton Structure

Go through the following files to understand what it means for the skeleton to be syntactically correct:

1. `../docs/community/02-Guidelines/03-content-structure.md` - lays out the expected folder structure. follow it to the point.
2. `../docs/community/02-Guidelines/04-front-matter.md` - mandatory metadata (front matter) about the RA. title, description, and keywords are especially important for SEO.
3. `../docs/community/02-Guidelines/05-components.md` - custom components declared in the `readme.md` of every new RA and translated into custom React components at build time.
4. `../docs/ref-arch/RA0000/readme.md` - template for a RA's `readme.md`. build on top of this template for the readme of the new RA, but never copy the comments in the front matter.
5. `../docs/tags.yml` - lists the existing tags for RA

Never deviate from the described structure.

### Additional Constraints

It's important that you keep these additional contraints in mind:

- Never add sub-pages preemptively, unless you were explicitly asked to do that.
- Always copy `../docs/ref-arch/RA0000/drawio/demo.drawio` to have an initial drawio
- Always add two sample headings and paragraphs to the created `readme.md` for the new RA.
- Always use the drawio component once together with the `demo.drawio` file that you copied.
- Prefer listing existing tags in the front matter, and only add new ones to the tags file if absolutely necessary.
- Never include `category_index` in the front matter. It's a thing from the past and will eventually be removed.

**Never execute the `genrefarch` command**. Even if you see it mentioned somewhere still, consider it removed.

