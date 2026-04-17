# Repository Context

This repository contains the source code and, more importantly, the content for SAP Architecture Center (AC), a public site hosting so called reference architectures (RA). Go read `docs/ref-arch/readme.md` to internalize what these are conceptually. The main AC repo is hosted on the public GitHub at [Architecture Center](https://github.com/SAP/architecture-center)

## Key Directories

- `docs/ref-arch/` - hierarchy of RA and sub-pages (also RA)
- `blog/` - standalone news articles somewhat independent from RA
- `community/` - additional info and guidance for how to contribute
- `src/` - source for Docusaurus frontend. can skip if it's just about contributing content 

## Contribution Process

The project follows an open source approach and is actively looking for contributions on the content side. Follow the "Contribution Process" in `./community/intro.md` and the "How to Contribute" steps in `community/02-Guidelines/01-contribution.md`. Don't forget to silently make sense of the _mermaid_ code blocks therein.

Things to look out for:

- Some contributors may insist on working with the main AC repo as remote because they have write access.
- Ask first before creating a pull request (PR)
- After creating a PR, kindly ask the contributor to sign the Contributor License Agreement (CLA) if they haven't done so already. In that case, there would be a comment from the CLA assistant with a link, which they would need to click.

When it is time to create a PR, see if the GitHub CLI (gh) is in PATH. If not, suggest installing it, so that you can take care of creating the PR.

## Commands

- `npm start` - serve local dev server with hot reloading. preferred initial command to see a rendered version.
- `npm run build` - create an optimized build ready for production. resort to this command once the changes are becoming mature for a final test.
- `npm run serve` - use in combination (after) the build command above for final testing locally and seeing a rendered version
- `npm run clear` - clearing the Docusaurus cache. run this if Docusaurus is getting confused during serve. for example, after switching branches

## Create New RA

Don't rely on the `genrefarch` CLI to create a new RA even if you see it mentioned somewhere. It was removed.

Do some reading first:

1. `community/02-Guidelines/03-content-structure.md` - for the folder structure of a new RA. follow it precisely
2. `community/02-Guidelines/04-front-matter.md` - metadata (front matter) about the RA. title, description, keywords are important for SEO, also take note of tags
3. `community/02-Guidelines/05-components.md` - provided components used as part of every RA

Always choose tags from `docs/tags.yml`, which fit to the RA. And never include `category_index` in the front matter. It's a thing from the past.
