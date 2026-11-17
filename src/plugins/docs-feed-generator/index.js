const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');
const { Feed } = require('feed');

// How many of the most recently updated reference architectures to list.
// Keep in sync with MAX_ITEMS in src/_scripts/_generate-ref-arch-updates.js so
// the feed and the /ref-arch-updates page show the same set.
const MAX_ITEMS = 48;
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
          // Need a front-matter slug for a stable link (matches the exclusion the
          // /ref-arch-updates page generator applies, keeping the two sets identical).
          if (!fm.slug) continue;

          const sourcePath = path.join(siteDir, source.replace(/^@site\//, ''));
          const { content } = matter(fs.readFileSync(sourcePath, 'utf8'));
          // Guard against an unparseable last_update.date: an Invalid Date would
          // not throw here but would crash feed.atom1()/rss2() below (outside this
          // try/catch) via toISOString(), aborting the whole build.
          const date = new Date(fm.last_update.date);
          if (Number.isNaN(date.getTime())) continue;
          entries.push({
            title: meta.title,
            description: meta.description || '',
            excerpt: buildExcerpt(content),
            link: `${siteUrl}${meta.permalink}`,
            date,
          });
        } catch (err) {
          // Skip anything we can't read or whose shape changed across versions,
          // rather than failing the whole build.
          console.warn(
            `docs-feed-generator: skipping ${metadataFile}: ${err.message}`,
          );
        }
      }

      // Newest first; break date ties by link so the cut at MAX_ITEMS is stable
      // and matches the /ref-arch-updates page's identical tiebreak.
      entries.sort((a, b) => (b.date - a.date) || a.link.localeCompare(b.link));
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
          rss: `${docsBaseUrl}/ref-arch/rss.xml`,
          atom: `${docsBaseUrl}/ref-arch/atom.xml`,
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

      // Write the feeds alongside the reference-architecture catalogue so they
      // are served at /docs/ref-arch/rss.xml and /docs/ref-arch/atom.xml.
      const docsOutDir = path.join(outDir, 'docs', 'ref-arch');
      fs.mkdirSync(docsOutDir, { recursive: true });
      fs.writeFileSync(path.join(docsOutDir, 'rss.xml'), feed.rss2(), 'utf8');
      fs.writeFileSync(path.join(docsOutDir, 'atom.xml'), feed.atom1(), 'utf8');

      console.log(
        `✅ Successfully generated ref-arch feeds (ref-arch/rss.xml, ref-arch/atom.xml) with ${items.length} reference architectures.`,
      );
    },
  };
};
