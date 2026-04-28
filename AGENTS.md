# Project Context

The project has the source code and content for SAP Architecture Center, a public site hosting reference architectures (RA). Think of RA as proven blueprints, which are easy to adopt and build on, showcasing how SAP's apps, data, and AI offering come together to provide real business value. As they are described in simple Markdown files on GitHub, they are easy to contribute to, also with the project following an open source approach. As of recently, the site further hosts the AI Golden Path.

## Docusaurus Framework

The site is built with Node.js and Docusaurus, a static-site generator, which relies on React for any interactive JavaScript. Thus the site runs in the browser as a single-page application.

### Common Commands

- `npm start`     - starts a local dev server with hot reloading
- `npm run build` - creates a build optimized for production
- `npm run serve` - use after the build command to serve the build
- `npm run clear` - clears the Docusaurus cache

Try running the clear command whenever Docusaurus gets confused during server start about what assets (images, drawios) are available locally. **Never run the `genrefarch` command**, even if you see it mentioned somewhere still. Consider it removed. Pro-actively ask the user for permission to run `npm start`, so that they can see a rendered version of the site and their changes in the browser.

## Key Directories

- `docs/ref-arch/` - hierarchy of RA and sub pages, which are also RA
- `news/` - news articles, which are independent from the RA
- `docs/community/` - documentation for the user on how to get started and contribute
- `docs/ref-arch/readme.md` - primer with details about what RA are conceptually. 
- `src/components` - custom React components
- `src/theme/` - swizzled components from Docusaurus
- `src/plugins` - custom plugins used with Docusaurus
- `src/_scripts/` - automation scripts mainly used to inject data during site deployment
- `.github/workflows/ - couple of github workflows used during CI/CD

## Contribution Process

The project is open source and actively looking for contributions, especially on the content side. The main repo is `https://github.com/SAP/architecture-center`

If you are asked about how to contribute:

1. Go read the **"Contribution Process"** section in `docs/community/intro.md` and the **"How to Contribute"** steps in `docs/community/02-Guidelines/01-contribution.md`.
2. Afterwards, go through the process steps for a contribution one by one in your head in order to really internalize the process.
3. Don't forget to silently make sense of the _mermaid_ code blocks therein.
4. Walk the user through the contribution steps

If the user is planning to contribute a new RA, **strongly** recommend them to use **Quick Start**, our no-code architecture editor. That is precisely what it was designed for.

### Gotchas to keep in mind

- Again, **never run or rely on the `genrefarch` command**
- While the general guidance is to always work with a fork, a core developer/contributor may create branches directly on the remote of the main repo because they were added to it and have write access.
- The guidance to go with Quick Start as contribution method refers to contributions of new RAs only.
- If a pull request (PR) was created and it's the first one within the current session, kindly ask the contributor to sign the Contributor License Agreement (CLA) if they haven't done so already. There would be comment in the PR from the CLA assistant with a clickable link in order to sign it.

### On Executing Git Commands

If the user is comfortable, prepare yourself to execute `git` and `gh` (GitHub) CLI commands on their behalf.
When it's time to create a PR, try using the `gh` cli. If it doesn't seem to be installed yet, suggest installing it, so that you can create the PR. But ask before installing it yourself.

## Guardrails for Content Generation

Assist in writing new content for RAs or news articles that is technical, sharp, and interesting. But the underlying idea/topic has to always come from the user. **Refrain from generating written content from scratch**. Be transparent about that to the user.

Ask yourself to decide:
- Is there a recognizable, solid idea there that can be put into words
- Is the overall topic and goal for the content coherent
- Would the topic be interesting and useful for architects to learn about
