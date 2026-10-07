import type { ParseFrontMatter } from '@docusaurus/types';

/**
 * Window, in days, during which a doc is considered "New/Updated".
 */
const RECENT_WINDOW_DAYS = 90;

const MS_PER_DAY = 86_400_000;

/**
 * Docusaurus `markdown.parseFrontMatter` hook that automatically applies the
 * dynamic `new-updated` tag to docs whose `last_update.date` falls within the
 * last {@link RECENT_WINDOW_DAYS} days (relative to build time).
 *
 * The tag is a real Docusaurus tag, so it renders as a clickable chip and gets
 * its own `/docs/tags/new-updated` listing page. It is injected here rather than
 * written into frontmatter by authors because it is time-derived.
 *
 * Notes:
 * - Runs for every markdown file site-wide, so it early-returns cheaply for
 *   anything that is not a doc with a `last_update.date`.
 * - `archive`-tagged docs are skipped (they are, by definition, old).
 * - Idempotent: never adds the tag twice.
 */
export const parseFrontMatter: ParseFrontMatter = async ({
    filePath,
    fileContent,
    defaultParseFrontMatter,
}) => {
    const result = await defaultParseFrontMatter({ filePath, fileContent });
    const frontMatter = result.frontMatter as Record<string, unknown> & {
        last_update?: { date?: unknown };
        tags?: unknown;
    };

    // Scope: docs only (news posts use a top-level `date:`, not `last_update.date`).
    const isDoc = filePath.includes('/docs/') && !filePath.includes('/news/');
    const rawDate = frontMatter?.last_update?.date;
    if (!isDoc || rawDate == null) {
        return result;
    }

    // A date-only YAML value parses to a JS Date; a quoted value stays a string.
    const updated = rawDate instanceof Date ? rawDate : new Date(rawDate as string);
    if (Number.isNaN(updated.getTime())) {
        return result;
    }

    const ageDays = (new Date().getTime() - updated.getTime()) / MS_PER_DAY;
    const isRecent = ageDays >= 0 && ageDays <= RECENT_WINDOW_DAYS; // future dates excluded

    const tags = Array.isArray(frontMatter.tags) ? frontMatter.tags : [];
    const tagKeys = tags.map((tag) => (typeof tag === 'string' ? tag : (tag as { label?: string })?.label));

    if (isRecent && !tagKeys.includes('archive') && !tagKeys.includes('new-updated')) {
        frontMatter.tags = [...tags, 'new-updated'];
    }

    return result;
};
