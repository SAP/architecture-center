# Repository Context

The repository contains the source code and, more importantly, the content (based on Markdown files) for SAP Architecture Center, a public site hosting reference architectures (RA). The first step is always to read `docs/ref-arch/readme.md` and internalize what RA are conceptually. The main repo is hosted on GitHub at [Architecture Center](https://github.com/SAP/architecture-center)

## Technical Environment

The site is built with Node.js and Docusaurus, a static-site generator, which relies on React for any interactive JavaScript. Thus the site runs in the browser as a single-page application.

### Commands

- `npm start` - start a local development server with hot reloading and the site running in the browser.
- `npm run build` - create an optimized build ready for production
- `npm run serve` - use in conjunction with the build command above to serve the build
- `npm run clear` - clear the Docusaurus cache. useful if Docusaurus gets confused during server start. for example, after removing assets such as images, switching between branches or pulling in new changes.

Never execute the `genrefarch` command, even if you see it mentioned somewhere. It was removed.

## Key Directories

- `docs/ref-arch/` - hierarchy of RA and sub pages, which are also RA
- `docs/community/` - documentation and most importantly guidance on how to contribute
- `news/` - news articles, which are independent from the RA in `docs/ref-arch/`
- `src/components` - custom React components
- `src/theme/` - swizzled components from Docusaurus
- `src/plugins` - custom plugins used with Docusaurus
- `src/_scripts/` - automation scripts mainly used to inject data during site deployment
- `.github/workflows/ - couple of github workflows used during CI/CD

## Contribution Process

The project is open source and looking for contributions, especially on the content side.

Go read the "Contribution Process" section in `docs/community/intro.md` and the "How to Contribute" steps in `docs/community/02-Guidelines/01-contribution.md`. Afterwards, go through the process steps for a contribution one by one in your head in order to really internalize the process. Don't forget to silently make sense of the _mermaid_ code blocks therein.

### Things to look out for

While the general guidance is to always work with a fork, a core developer/contributor may create branches directly on the remote of the main repo because they were added to it and have write access.

The guidance to go with Quick Start as contribution method refers to contributions of new RAs only.

If a PR was created and it's the first one within the current session, kindly ask the contributor to sign the Contributor License Agreement (CLA) if they haven't done so already. There would be comment in the PR from the CLA assistant with a clickable link in order to sign it.

When it's time to create a PR, try using the GitHub CLI (gh). If it doesn't seem to be installed yet, suggest installing it, so that you can create the PR. But ask before installing it yourself.

## Creating a New Reference Architecture

Go through the files below and familiarize yourself with the expected structure of a new RA:

1. `docs/community/02-Guidelines/03-content-structure.md` - lays out the expected folder structure
2. `docs/community/02-Guidelines/04-front-matter.md` - essential metadata (front matter) about the RA. title, description, and keywords are especially important for SEO.
3. `docs/community/02-Guidelines/05-components.md` - custom components declared in the `readme.md` of every new RA and translated into custom React components at build time.
4. `docs/tags.yml` - lists the existing tags for RA

Never deviate from the structure.

### Additional Constraints

- If you are asked to create a new RA, create only a skeleton for it, including two headings and short paragraphs, and a declaration for the drawio component in the `readme.md`.
- Never add sub-pages preemptively, unless you were explicitly asked to do that.
- Copy `docs/ref-arch/RA0000/drawio/demo.drawio` to have an initial drawio
- Add new tags only if absolutely necessary. Tags used in the front matter must always exist.
- Never include `category_index` in the front matter. It's a thing from the past and will eventually be removed.

