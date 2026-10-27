const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');
const { Feed } = require('feed');

// How many of the most recently updated reference architectures to list.
const MAX_ITEMS = 50;
// Length of the plain-text body excerpt included with each item.
const EXCERPT_LENGTH = 500;

// Normalize to forward slashes so path checks work on every platform.
function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

// Turn Markdown/MDX source into a short, readable plain-text excerpt.
function buildExcerpt(markdown) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/<!--[\s\S]*?-->/g, ' ') // HTML/MDX comments
    .replace(/^\s*(import|export)\s.+$/gm, ' ') // MDX import/export lines
    .replace(/^\s*:::.*$/gm, ' ') // admonition markers (:::info, :::, ...)
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ') // JSX/HTML tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> link text
    .replace(/^#{1,6}\s+/gm, ' ') // heading markers
    .replace(/^\s{0,3}>\s?/gm, ' ') // blockquote markers
    .replace(/[*_~`>#|]/g, ' ') // leftover formatting characters
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();

  if (text.length <= EXCERPT_LENGTH) {
    return text;
  }
  return `${text.slice(0, EXCERPT_LENGTH).trimEnd()}...`;
}

module.exports = function (context) {
  return {
    name: 'docusaurus-plugin-docs-feed-generator',

    // Runs at the end of `npm run build`, once Docusaurus has resolved every
    // doc's permalink and written per-doc metadata into the generated files dir.
    async postBuild({ outDir }) {
      const { siteDir, generatedFilesDir, siteConfig } = context;
      const siteUrl = siteConfig.url.replace(/\/+$/, '');
      const docsBaseUrl = `${siteUrl}${siteConfig.baseUrl}docs`;

      // Authoritative, slug-aware doc metadata written by the content-docs plugin.
      const metadataDir = path.join(
        generatedFilesDir,
        'docusaurus-plugin-content-docs',
        'default',
      );
      const pattern = `${normalizePath(metadataDir)}/site-docs-*.json`;
      const metadataFiles = glob.sync(pattern, { windowsPathsNoEscape: true });

      const entries = [];
      for (const metadataFile of metadataFiles) {
        try {
          const meta = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
          const source = meta.source || '';
          const fm = meta.frontMatter || {};
          const tags = Array.isArray(fm.tags) ? fm.tags : [];

          // Reference architectures only (the RA#### directories, not the
          // ref-arch catalogue landing page itself).
          if (!/\/docs\/ref-arch\/RA\d{4}\//.test(normalizePath(source))) continue;
          // Need a last_update.date to place the item on the timeline.
          if (!fm.last_update || !fm.last_update.date) continue;
          // Exclusions: drafts, unlisted, archived, and the RA0000 demo page.
          if (fm.draft === true || fm.unlisted === true) continue;
          if (tags.includes('archive') || tags.includes('demo')) continue;
          if (meta.id === 'id-ra0000' || normalizePath(source).includes('/RA0000/')) continue;

          const sourcePath = path.join(siteDir, source.replace(/^@site\//, ''));
          const { content } = matter(fs.readFileSync(sourcePath, 'utf8'));

          entries.push({
            title: meta.title,
            description: meta.description || '',
            excerpt: buildExcerpt(content),
            link: `${siteUrl}${meta.permalink}`,
            date: new Date(fm.last_update.date),
          });
        } catch (err) {
          // Skip anything we can't read or whose shape changed across versions,
          // rather than failing the whole build.
          console.warn(
            `docs-feed-generator: skipping ${metadataFile}: ${err.message}`,
          );
        }
      }

      entries.sort((a, b) => b.date - a.date);
      const items = entries.slice(0, MAX_ITEMS);

      const updated = items.length ? items[0].date : new Date();
      const feed = new Feed({
        title: `${siteConfig.title} - Reference Architectures`,
        description:
          'The most recently updated SAP reference architectures from the SAP Architecture Center.',
        id: `${docsBaseUrl}/ref-arch`,
        link: `${docsBaseUrl}/ref-arch`,
        language: 'en',
        favicon: `${siteUrl}${siteConfig.baseUrl}${siteConfig.favicon}`,
        copyright: `Copyright © ${updated.getFullYear()} ${siteConfig.organizationName}`,
        updated,
        feedLinks: {
          rss: `${docsBaseUrl}/rss.xml`,
          atom: `${docsBaseUrl}/atom.xml`,
        },
      });

      for (const item of items) {
        feed.addItem({
          title: item.title,
          id: item.link,
          link: item.link,
          description: item.description,
          content: item.excerpt,
          date: item.date,
        });
      }

      const docsOutDir = path.join(outDir, 'docs');
      fs.mkdirSync(docsOutDir, { recursive: true });
      fs.writeFileSync(path.join(docsOutDir, 'rss.xml'), feed.rss2(), 'utf8');
      fs.writeFileSync(path.join(docsOutDir, 'atom.xml'), feed.atom1(), 'utf8');

      console.log(
        `✅ Successfully generated docs feeds (rss.xml, atom.xml) with ${items.length} reference architectures.`,
      );
    },
  };
};
