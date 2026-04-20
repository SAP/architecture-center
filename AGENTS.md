# Repository Context

This repository contains the source code and, more importantly, the content (based on Markdown files) for SAP Architecture Center, a public site hosting so called reference architectures (RA). Before doing anything else, go read `docs/ref-arch/readme.md` to internalize what they are conceptually. The main repo is hosted on the public GitHub at [Architecture Center](https://github.com/SAP/architecture-center)

## Technical Environment

The site is built with Node.js and Docusaurus, a static-site generator, which relies on React for any interactive JavaScript. Thus the site runs in the browser as a single-page application.

### Commands

- `npm start` - start a local development server with hot reloading and the site running in the browser.
- `npm run build` - create an optimized build ready for production
- `npm run serve` - use in conjunction with the build command above to serve the build
- `npm run clear` - clear the Docusaurus cache. useful if Docusaurus is clearly getting confused. for example, after removing assets such as images, switching between branches or pulling in new changes.

Never use the `genrefarch` command, even if you see it mentioned somewhere. It will be removed soon.

## Key Directories

- `docs/ref-arch/` - hierarchy of RA and sub-pages, which are also RA
- `docs/community/` - additional info and most importantly guidance on how to contribute
- `news/` - standalone news articles. somewhat independent from the RA in `docs/ref-arch/`
- `src/` - source for Docusaurus and the frontend

## Contribution Process

The project is open source and is looking for contributions on the content side.

Go read the "Contribution Process" section in `./community/intro.md` and the "How to Contribute" steps in `community/02-Guidelines/01-contribution.md`. Afterwards, go through the process steps for a contribution one by one in order to really internalize the process. Don't forget to silently make sense of the _mermaid_ code blocks therein.

### Other things to look out for

A contributor may create branches directly on the remote of the main repo because they were added to it and have write access. These are core developers/contributors. Don't be suprised by that.
The general guidance is still to work with a fork.

If a PR was created and it's the first one within the current session, kindly ask the contributor to sign the Contributor License Agreement (CLA) if they haven't done so already. There would be a comment from the CLA assistant with a clickable link to sign it.

When it is time to create a PR, see if the GitHub CLI (gh) is in the PATH and leverage it to create the PR. Otherwise, make a suggestion to install the CLI, so that you can create the PR, but ask before installing the CLI.


## Creating a New Reference Architecture

Go through the following files in order to familiarize yourself with the structure that a new RA is expected to have. Don't deviate from it:

1. `docs/community/02-Guidelines/03-content-structure.md` - lays out the expected folder structure
2. `docs/community/02-Guidelines/04-front-matter.md` - essential metadata (front matter) about the RA. title, description, and keywords are especially important for SEO.
3. `docs/community/02-Guidelines/05-components.md` - custom components to be embedded in every RA `readme.md` and translated into the actual custom React components at build time.
4. `docs/tags.yml` - list of existing tags. add new tags only if absolutely necessary. tags in the front matter of a RA must always exist.

### Additional Constraints

- Never include `category_index` in the front matter. It's a thing from the past and will eventually be removed.
- If you are asked to create a new RA, create only a minimal skeleton for it.
- Never add sub-pages preemptively or fill the RA with a bunch of written content, unless you were explicitly asked to do that.
- Copy `docs/ref-arch/RA0000/drawio/demo.drawio` to have something to work with.

