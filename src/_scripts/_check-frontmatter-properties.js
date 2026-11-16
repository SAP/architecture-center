/**
 * Front matter properties check (blocking).
 *
 * On a pull request, inspects the front matter of the changed reference-
 * architecture pages under `docs/` and emits GitHub **error** annotations when
 * a page drifts from the house style or forgets to credit its author / bump its
 * date. The script exits 1 when any issue is found, so the check FAILS — and,
 * if configured as a required status check, blocks the merge until fixed.
 *
 * Checks (all errors):
 *   Default-value fields — flagged only when explicitly set to a non-conforming
 *   value. Absent means the Docusaurus default is in effect, which is fine:
 *     1. hide_table_of_contents  — present and not false
 *     2. hide_title              — present and not false
 *     3. toc_min_heading_level   — present and not 2
 *     4. toc_max_heading_level   — present and not 4
 *     5. draft                   — present and not false
 *     6. unlisted                — present and not false
 *   Authorship fields — a changed RA page should credit a person and carry a
 *   fresh date, so a MISSING value is also flagged:
 *     7. contributors            — missing/empty, or PR author not in the list
 *     8. last_update.date        — missing, or older than a week before today
 *     9. last_update.author      — missing, or different from the PR author
 *
 *   Admin exemption: for the maintainer logins in AUTHORSHIP_CHECK_EXEMPT, the
 *   authorship checks (7–9) and the draft/unlisted checks (5–6) are skipped, so
 *   admins can unlist or hold back a page, and make quick cross-page fixes,
 *   without tripping the check or rewriting its authorship metadata. Checks 1–4
 *   still apply to everyone.
 *
 * Scope:
 *   - Only reference-architecture pages: changed files under docs/ref-arch/RA####/
 *     (four-digit RA folders), filtered to *.{md,mdx}.
 *   - docs/ref-arch/RA0000/** is excluded (deliberate demo/template page).
 *   - Other docs/ pages (e.g. docs/ref-arch/readme.md, docs/community/**) and
 *     news/** are out of scope (not authored RAs / different front matter scheme).
 *
 * Environment (provided by the workflow; all optional so the script runs
 * locally too):
 *   PR_AUTHOR   GitHub login of the pull request author
 *   TODAY       run date as YYYY-MM-DD (keeps the script free of new Date())
 *
 * The set of files to check is passed as CLI arguments by the workflow (the
 * changed docs Markdown); with no arguments and outside CI the script scans
 * every docs page so it stays runnable locally.
 */
const STALE_DAYS = 7;
const RA0000_PREFIX = 'docs/ref-arch/RA0000/';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

const DOCS_GLOB = 'docs/**/*.{md,mdx}';
const repoRoot = path.join(__dirname, '../..');
const inActions = Boolean(process.env.GITHUB_ACTIONS);

const PR_AUTHOR = (process.env.PR_AUTHOR || '').trim();
const TODAY = (process.env.TODAY || '').trim();

// Admins who routinely make small fixes across other people's RA pages are exempt
// from the authorship checks (7–9), and may also set `draft`/`unlisted` to true
// (checks 5–6 are skipped for them); the remaining default-value checks (1–4)
// still apply. GitHub logins are case-insensitive, so store and compare lower-case.
const AUTHORSHIP_CHECK_EXEMPT = new Set([
  'cernus76',
  'navyakhurana',
  'julian-schambeck',
  'fabianleh',
]);
const authorshipCheckExempt = AUTHORSHIP_CHECK_EXEMPT.has(PR_AUTHOR.toLowerCase());

/** Emit a GitHub Actions error annotation (falls back to a plain line locally). */
function annotate(file, line, message) {
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
    console.log(`::error file=${escProp(file)}${lineAttr},title=Front matter properties::${escData(msg)}`);
  } else {
    console.log(`  error: ${msg.replace(/\n/g, ' ')}`);
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

/** Case-insensitive GitHub-login compare (logins are case-insensitive). */
function sameLogin(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

/** Whole days between two YYYY-MM-DD dates (todayStr - dateStr), or null if unparseable. */
function daysBetween(dateStr, todayStr) {
  const d = Date.parse(`${dateStr}T00:00:00Z`);
  const t = Date.parse(`${todayStr}T00:00:00Z`);
  if (Number.isNaN(d) || Number.isNaN(t)) return null;
  return Math.round((t - d) / 86400000);
}

/**
 * Resolve the set of files to check.
 * In CI the workflow passes the PR's changed docs Markdown as CLI arguments
 * (computed with the same `git diff` incantation as the sibling checks); an
 * empty argument list therefore means "nothing changed", so nothing is checked.
 * Locally (no GITHUB_ACTIONS and no arguments) every docs page is scanned so the
 * script stays runnable for debugging.
 */
function resolveFiles() {
  const argvFiles = process.argv.slice(2).filter((f) => /^docs\/.*\.(md|mdx)$/.test(f));
  if (inActions || process.argv.length > 2) {
    return argvFiles;
  }
  console.log('No file arguments — scanning all docs pages (local mode).');
  if (!PR_AUTHOR || !TODAY) {
    console.log('Note: PR_AUTHOR/TODAY unset — author and date checks are skipped locally.\n');
  }
  return glob.sync(DOCS_GLOB, { cwd: repoRoot });
}

/** Run the nine checks on one file's parsed front matter.
 *  Emits annotations as a side effect and returns the list of warning messages. */
function checkFile(rel, raw, data) {
  const findings = [];
  const warn = (key, message) => {
    const line = frontMatterLine(raw, key);
    annotate(rel, line, message);
    findings.push({ line, message });
  };

  // 1-6: default-value fields — flag only an explicit non-conforming value.
  if ('hide_table_of_contents' in data && data.hide_table_of_contents !== false) {
    warn('hide_table_of_contents', `hide_table_of_contents is \`${data.hide_table_of_contents}\`; expected false.`);
  }
  if ('hide_title' in data && data.hide_title !== false) {
    warn('hide_title', `hide_title is \`${data.hide_title}\`; expected false.`);
  }
  if ('toc_min_heading_level' in data && data.toc_min_heading_level !== 2) {
    warn('toc_min_heading_level', `toc_min_heading_level is \`${data.toc_min_heading_level}\`; the default is 2.`);
  }
  if ('toc_max_heading_level' in data && data.toc_max_heading_level !== 4) {
    warn('toc_max_heading_level', `toc_max_heading_level is \`${data.toc_max_heading_level}\`; the default is 4.`);
  }
  // 5-6: draft / unlisted — expected false. Maintainers in AUTHORSHIP_CHECK_EXEMPT
  // may set them to boolean `true` (e.g. to unlist or hold back a page), but any
  // other non-false value (a typo, a string, a non-boolean) is still flagged,
  // even for them, so a malformed value never slips through unnoticed.
  if ('draft' in data && data.draft !== false && !(authorshipCheckExempt && data.draft === true)) {
    warn('draft', `draft is \`${data.draft}\`; expected false (a draft page is not deployed).`);
  }
  if ('unlisted' in data && data.unlisted !== false && !(authorshipCheckExempt && data.unlisted === true)) {
    warn('unlisted', `unlisted is \`${data.unlisted}\`; expected false (an unlisted page is hidden from navigation).`);
  }

  // 7-9: authorship fields — need PR context; skipped when it is unavailable.
  if (!PR_AUTHOR) return findings;
  if (authorshipCheckExempt) return findings;

  const contributors = Array.isArray(data.contributors) ? data.contributors : [];
  if (contributors.length === 0) {
    warn('contributors', 'contributors list is missing or empty.');
  } else if (!contributors.some((c) => sameLogin(c, PR_AUTHOR))) {
    warn('contributors', `PR author \`${PR_AUTHOR}\` is not in the contributors list.`);
  }

  const lastUpdate = data.last_update && typeof data.last_update === 'object' ? data.last_update : {};

  // last_update.date — gray-matter may yield a Date object or a string.
  const rawDate = lastUpdate.date;
  if (rawDate == null || rawDate === '') {
    warn('last_update', 'last_update.date is missing.');
  } else if (TODAY) {
    const dateStr = rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : String(rawDate).slice(0, 10);
    const age = daysBetween(dateStr, TODAY);
    if (age == null) {
      warn('last_update', `last_update.date (${dateStr}) is invalid; expected YYYY-MM-DD.`);
    } else if (age < 0) {
      warn('last_update', `last_update.date (${dateStr}) is in the future; expected today or an earlier date.`);
    } else if (age > STALE_DAYS) {
      warn('last_update', `last_update.date (${dateStr}) exceeds the ${STALE_DAYS}-day freshness window; set it to a recent date. This fails the check.`);
    }
  }

  // last_update.author
  const lastAuthor = lastUpdate.author;
  if (lastAuthor == null || String(lastAuthor).trim() === '') {
    warn('last_update', 'last_update.author is missing.');
  } else if (!sameLogin(lastAuthor, PR_AUTHOR)) {
    warn('last_update', `last_update.author \`${lastAuthor}\` differs from the PR author \`${PR_AUTHOR}\`.`);
  }

  return findings;
}

/** Render a finding as "line N — message" (or just the message when no line). */
function formatFinding(f) {
  return f.line ? `line ${f.line} — ${f.message}` : f.message;
}

function main() {
  const files = resolveFiles()
    .filter((f) => /^docs\/ref-arch\/RA\d{4}\//.test(f))
    .filter((f) => !f.startsWith(RA0000_PREFIX))
    .sort();

  const findingsByFile = [];
  let checked = 0;

  for (const rel of files) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) continue; // defensive: diff listed it but it is gone
    const raw = fs.readFileSync(abs, 'utf8');
    let data;
    try {
      ({ data } = matter(raw));
    } catch (e) {
      annotate(rel, 1, `Could not parse front matter: ${e.message}`);
      findingsByFile.push({ file: rel, findings: [{ line: 1, message: `Could not parse front matter: ${e.message}` }] });
      checked++;
      continue;
    }
    checked++;
    const findings = checkFile(rel, raw, data);
    if (findings.length) findingsByFile.push({ file: rel, findings });
  }

  const errors = findingsByFile.reduce((n, f) => n + f.findings.length, 0);

  const summary = [
    '## Front matter properties check',
    '',
    'Flags reference-architecture pages whose front matter drifts from the house',
    'style or is missing author/date information. The check fails when any issue',
    'is found.',
    '',
    PR_AUTHOR ? `PR author: **${PR_AUTHOR}**` : '_PR author unknown — author/date checks skipped._',
    '',
    `Checked **${checked}** changed page(s). Result: **${errors}** error(s).`,
    '',
  ];

  if (errors > 0) {
    // List every finding with its file and line, so the summary alone shows
    // exactly what failed and where, without digging into the annotations.
    summary.push('### Errors');
    summary.push('');
    for (const { file, findings } of findingsByFile) {
      summary.push(`**\`${file}\`**`);
      for (const f of findings) summary.push(`- ${formatFinding(f)}`);
      summary.push('');
    }
    summary.push('📖 How to fix (add yourself to contributors and set a recent last_update.date): https://architecture.learning.sap.com/docs/community/automated-checks/front-matter/properties');
  }

  const summaryText = summary.join('\n');

  console.log('\n' + summaryText);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryText + '\n');
  }

  // Keep the final line on stdout (same stream as the annotations/summary) and
  // let Node flush before exiting, so the log stays in written order. Using
  // console.error + process.exit(1) here lets the eager stderr line jump ahead
  // of buffered stdout and orphan the first annotation.
  if (errors > 0) {
    console.log(`\n✖ Front matter properties check failed with ${errors} error(s).`);
    process.exitCode = 1;
    return;
  }
  console.log('\n✔ No front matter property errors.');
}

main();
