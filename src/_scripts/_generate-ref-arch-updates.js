/**
 * Generates src/data/ref-arch-updates.json: the most recently updated
 * reference-architecture documents (capped at MAX_ITEMS, newest first),
 * carrying the title, description, last-updated date, and link. Consumed by
 * the /ref-arch-updates page (paginated, 6 per page).
 *
 * Runs before `start` and `build` (see package.json), like generate-news. It
 * mirrors the filtering/exclusion logic of the feed plugin
 * (src/plugins/docs-feed-generator/index.js) but reads front matter directly,
 * so the data is available at render time (the feed plugin runs in postBuild,
 * which is too late for a page to import).
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

const repoRoot = path.join(__dirname, '../..');
const docsDir = path.join(repoRoot, 'docs');
const outputPath = path.join(repoRoot, 'src/data/ref-arch-updates.json');

// Keep in sync with MAX_ITEMS in src/plugins/docs-feed-generator/index.js so the
// page shows the same set of reference architectures the RSS/Atom feeds carry.
const MAX_ITEMS = 48;

// Normalize to forward slashes so path checks and globs work on every platform.
function normalizePath(filePath) {
    return filePath.split(path.sep).join('/');
}

// Ensure the data directory exists.
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Every Markdown/MDX page under a four-digit RA#### directory.
const pattern = `${normalizePath(docsDir)}/ref-arch/RA[0-9][0-9][0-9][0-9]/**/*.{md,mdx}`;
const files = glob.sync(pattern, { windowsPathsNoEscape: true });

const entries = [];
for (const abs of files) {
    try {
        const rel = normalizePath(path.relative(repoRoot, abs));
        // Exclude the RA0000 demo/template page.
        if (rel.includes('/ref-arch/RA0000/')) continue;

        const { data: fm } = matter(fs.readFileSync(abs, 'utf8'));
        const tags = Array.isArray(fm.tags) ? fm.tags : [];

        // Same exclusions as the feed: need a date; skip drafts, unlisted,
        // archived, demo, and anything without a slug (needed for the link).
        if (!fm.last_update || !fm.last_update.date) continue;
        if (fm.draft === true || fm.unlisted === true) continue;
        if (tags.includes('archive') || tags.includes('demo')) continue;
        if (!fm.slug) continue;

        // The date must come from the front matter last_update.date, not the
        // git commit date.
        const date = new Date(fm.last_update.date);
        if (Number.isNaN(date.getTime())) continue;

        entries.push({
            id: fm.id || rel,
            title: fm.title || 'Untitled',
            description: fm.description || '',
            // GitHub handle of whoever last updated the page (pairs with date).
            author: fm.last_update.author || '',
            date: date.toISOString().slice(0, 10),
            // Docs are served under /docs; the RA slug is e.g. /ref-arch/<hash>.
            // Docusaurus prepends the site baseUrl for in-site <Link to>.
            permalink: `/docs${fm.slug}`,
            sortKey: date.getTime(),
        });
    } catch (err) {
        // Skip anything we can't read or parse rather than failing the build.
        console.warn(`generate-ref-arch-updates: skipping ${abs}: ${err.message}`);
    }
}

const latest = entries
    .sort((a, b) => (b.sortKey - a.sortKey) || a.permalink.localeCompare(b.permalink)) // newest first, stable tie-break
    .slice(0, MAX_ITEMS) // match the feed: only the most recent MAX_ITEMS
    .map(({ sortKey, ...entry }) => ({
        ...entry,
        formattedDate: new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            // entry.date is a plain YYYY-MM-DD string, which Date parses as UTC
            // midnight. Format it in UTC too, otherwise it shows the previous
            // day west of UTC.
            timeZone: 'UTC',
        }),
    }));

fs.writeFileSync(outputPath, JSON.stringify(latest, null, 2));

console.log(
    `✅ Generated ref-arch-updates.json with ${latest.length} reference architectures.`,
);
