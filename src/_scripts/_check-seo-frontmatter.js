/**
 * SEO front matter check for `title` and `description`.
 *
 * Validates the length of the `title` and `description` front matter fields on
 * every published page under `docs/`. Search engines truncate titles and
 * descriptions that are too long and gain nothing from ones that are too short,
 * so this guards the SEO quality of the site.
 *
 * Recommended ranges (best practice):
 *   - title:       40-60 characters
 *   - description: 120-160 characters
 *
 * The build FAILS (exit 1) only when a value is "way too short" or "way too
 * long" (the hard bounds below). Values that merely fall outside the
 * recommended range produce a non-blocking warning so contributors are nudged
 * toward the sweet spot without red builds for legitimately short section
 * pages.
 *
 * Draft and unlisted pages are skipped (they are not indexed).
 *
 * Tune the thresholds here:
 */
const LIMITS = {
  title: { recMin: 40, recMax: 60, errMin: 10, errMax: 65 },
  description: { recMin: 120, recMax: 160, errMin: 50, errMax: 200 },
};

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

const DOCS_GLOB = 'docs/**/*.{md,mdx}';
const repoRoot = path.join(__dirname, '../..');
const inActions = Boolean(process.env.GITHUB_ACTIONS);

/** Emit a GitHub Actions annotation (falls back to a plain line locally). */
function annotate(level, file, line, message) {
  // Include the path in the message itself: GitHub consumes the `file=` part to
  // attach the annotation to the file, but the plain workflow log only shows the
  // message — so without this the log line has no idea which page is at fault.
  const loc = line ? `${file}:${line}` : file;
  const msg = `${loc} — ${message}`;
  if (inActions) {
    // Escape per the GitHub Actions command protocol so a crafted filename or
    // message can't forge/corrupt the annotation (data vs. property escaping).
    const escData = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    const escProp = (s) => escData(s).replace(/,/g, '%2C').replace(/:/g, '%3A');
    const lineAttr = line ? `,line=${line}` : '';
    console.log(`::${level} file=${escProp(file)}${lineAttr},title=SEO front matter::${escData(msg)}`);
  } else {
    console.log(`  ${level === 'error' ? 'ERROR' : 'warn '}: ${msg.replace(/\n/g, ' ')}`);
  }
}

/** 1-based line number of a top-level front matter key, or undefined. */
function frontMatterLine(raw, key) {
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`^${key}:`).test(lines[i])) return i + 1;
  }
  return undefined;
}

/** Classify one field's length. Returns { level, message } or null when fine. */
function evaluate(field, value, limits) {
  const len = value.length;
  const rec = `recommended ${limits.recMin}-${limits.recMax} characters`;
  if (value.trim() === '') {
    return { level: 'error', message: `${field} is missing or empty (${rec}).` };
  }
  if (len < limits.errMin) {
    return { level: 'error', message: `${field} is way too short (${len} characters, hard minimum ${limits.errMin}; ${rec}).` };
  }
  if (len > limits.errMax) {
    return { level: 'error', message: `${field} is way too long (${len} characters, hard maximum ${limits.errMax}; ${rec}).` };
  }
  if (len < limits.recMin || len > limits.recMax) {
    return { level: 'warning', message: `${field} is ${len} characters, outside the ${rec}.` };
  }
  return null;
}

function main() {
  // Changed-files mode: the workflow passes the changed docs Markdown as args, so
  // check only those. In CI an empty argument list therefore means "nothing
  // changed", so nothing is checked. Locally (no GITHUB_ACTIONS and no args) fall
  // back to the whole corpus so the script stays runnable for debugging.
  const argvFiles = process.argv.slice(2).filter((f) => f.startsWith('docs/') && /\.(md|mdx)$/.test(f));
  const files = (
    inActions || process.argv.length > 2
      ? argvFiles
      : glob.sync(DOCS_GLOB, { cwd: repoRoot })
  ).sort();
  let errors = 0;
  let warnings = 0;
  let checked = 0;
  let skipped = 0;

  for (const rel of files) {
    const raw = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
    let data;
    try {
      ({ data } = matter(raw));
    } catch (e) {
      annotate('error', rel, 1, `Could not parse front matter: ${e.message}`);
      errors++;
      continue;
    }

    if (data.draft === true || data.unlisted === true) {
      skipped++;
      continue;
    }
    checked++;

    for (const field of ['title', 'description']) {
      const value = data[field] == null ? '' : String(data[field]);
      const result = evaluate(field, value, LIMITS[field]);
      if (!result) continue;
      annotate(result.level, rel, frontMatterLine(raw, field), result.message);
      if (result.level === 'error') errors++;
      else warnings++;
    }
  }

  const summary = [
    '### SEO front matter check',
    '',
    'Recommended lengths:',
    '',
    `- **title**: ${LIMITS.title.recMin}-${LIMITS.title.recMax} characters`,
    `- **description**: ${LIMITS.description.recMin}-${LIMITS.description.recMax} characters`,
    '',
    'The build fails when a value is way too short or too long:',
    '',
    `- **title**: fewer than ${LIMITS.title.errMin} or more than ${LIMITS.title.errMax} characters`,
    `- **description**: fewer than ${LIMITS.description.errMin} or more than ${LIMITS.description.errMax} characters`,
    '',
    `Checked **${checked}** published pages (skipped ${skipped} draft/unlisted).`,
    '',
    `Result: **${errors}** error(s), **${warnings}** warning(s).`,
    '',
  ];

  if (errors > 0 || warnings > 0) {
    summary.push('');
    summary.push('📖 How to fix (adjust the title or description length): https://architecture.learning.sap.com/docs/community/automated-checks/front-matter/seo');
  }

  const summaryText = summary.join('\n');

  console.log('\n' + summaryText);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryText + '\n');
  }

  if (errors > 0) {
    console.error(`\n❌ SEO front matter check failed with ${errors} error(s).`);
    process.exit(1);
  }
  console.log('\n✅ SEO front matter check passed.');
}

main();
