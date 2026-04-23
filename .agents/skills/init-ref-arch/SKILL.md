---
name: init-ref-arch
description: Creates the initial skeleton of folders and front matter for a new reference architecture. Use when the user wants to create, scaffold, add, or contribute a new reference architecture.
---

# Initialize New Reference Architecture

Go through the files below and familiarize yourself with the expected structure of a new reference architecture (RA):

1. `../docs/community/02-Guidelines/03-content-structure.md` - lays out the expected folder structure
2. `../docs/community/02-Guidelines/04-front-matter.md` - essential metadata (front matter) about the RA. title, description, and keywords are especially important for SEO.
3. `../docs/community/02-Guidelines/05-components.md` - custom components declared in the `readme.md` of every new RA and translated into custom React components at build time.
4. `../docs/tags.yml` - lists the existing tags for RA

Never deviate from the structure.

### Additional Constraints

- The created `readme.md` should contain no more than the front matter, maximum two sample headings, paragraphs, and a declaration of the drawio component.
- Never add sub-pages preemptively, unless you were explicitly asked to do that.
- Copy `../docs/ref-arch/RA0000/drawio/demo.drawio` to have an initial drawio
- Prefer listing existing tags in the front matter, and only add new ones to the tags file if absolutely necessary.
- Never include `category_index` in the front matter. It's a thing from the past and will eventually be removed.

