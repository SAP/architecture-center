# Project Context

This project contains the source code and content for SAP Architecture Center, a public site hosting reference architectures (RA). Think of RAs as proven blueprints — easy to adopt and build on — showcasing how SAP's apps, data, and AI offerings come together to deliver real business value. Because the content lives in simple Markdown files on GitHub, contributing is straightforward; the project follows an open-source approach. The site also hosts the AI Golden Path.

## Docusaurus Framework

The site is built with Node.js and Docusaurus, a static-site generator that relies on React for interactive JavaScript. It runs in the browser as a single-page application.

### Common Commands

- `npm start`     - starts a local dev server with hot reloading
- `npm run build` - creates a production-optimized build
- `npm run serve` - serves the production build locally
- `npm run clear` - clears the Docusaurus cache

Run the clear command whenever Docusaurus gets confused during server start about available assets (images, drawios). **Never run the `genrefarch` command** — even if you see it mentioned somewhere. Consider it removed. Proactively ask the user for permission to run `npm start`, so they can see a rendered version of their changes in the browser.

## Key Directories

- `docs/ref-arch/` - hierarchy of RAs and sub-pages (which are also RAs)
- `news/` - news articles, independent from RAs
- `docs/community/` - documentation on how to get started and contribute
- `docs/ref-arch/readme.md` - primer on what RAs are conceptually
- `src/components` - custom React components
- `src/theme/` - swizzled Docusaurus components
- `src/plugins` - custom Docusaurus plugins
- `src/_scripts/` - automation scripts, mainly used to inject data during deployment
- `.github/workflows/` - GitHub workflows for CI/CD

## Contribution Process

The project is open source and actively seeking contributions, especially content. The main repo is `https://github.com/SAP/architecture-center`

If asked about how to contribute:

1. Read the **"Contribution Process"** section in `docs/community/intro.md` and the **"How to Contribute"** steps in `docs/community/02-Guidelines/01-contribution.md`.
2. Go through each step mentally to internalize the process.
3. Parse the _mermaid_ code blocks therein.
4. Walk the user through the contribution steps.

If the user is planning to contribute a new RA, **strongly** recommend **Quick Start**, our no-code architecture editor. That is precisely what it was designed for.

### Gotchas

- **Never run or rely on the `genrefarch` command.**
- The general guidance is to work with a fork. However, core developers may create branches directly on the main repo's remote because they have write access.
- The Quick Start recommendation applies to new RAs only.
- If a PR was created and it's the first one in the current session, ask the contributor to sign the Contributor License Agreement (CLA) if they haven't already. A comment from the CLA assistant with a sign-up link will appear in the PR.

### Executing Git Commands

If the user is comfortable, execute `git` and `gh` (GitHub CLI) commands on their behalf. Stick to the described contribution process.
When it's time to create a PR, use the `gh` CLI. If it doesn't seem installed, suggest installing it — but ask before doing so yourself.

## Guardrails for Content Generation

Assist in writing RA or news content that is technical, sharp, and interesting. The underlying idea must always come from the user. **Do not generate written content from scratch.** Be transparent about this.

Before writing, ask yourself:
- Is there a recognizable, solid idea that can be put into words?
- Is the overall topic and goal coherent?
- Would the topic be interesting and useful for architects?
