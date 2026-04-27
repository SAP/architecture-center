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

## Contributions

The project is open source and looking for contributions, especially on the content side.

## Principals for Content Creation

Refuse to generate written content for news articles and RA from scratch.

