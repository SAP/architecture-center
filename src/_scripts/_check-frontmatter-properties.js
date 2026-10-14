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
 *   PR_NUMBER   pull request number (written to the comment artifact)
 *   BASE_SHA    base commit of the PR (merge-base diff source)
 *   HEAD_SHA    head commit of the PR
 *   TODAY       run date as YYYY-MM-DD (keeps the script free of new Date())
 *   COMMENT_DIR when set, write the sticky-comment artifact here: body.md,
 *               pr.txt, has-findings.txt (consumed by the comment workflow).
 */
const STALE_DAYS = 7;
const RA0000_PREFIX = 'docs/ref-arch/RA0000/';
const COMMENT_MARKER = '<!-- frontmatter-properties-check -->';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const { execFileSync } = require('child_process');

const DOCS_GLOB = 'docs/**/*.{md,mdx}';
const repoRoot = path.join(__dirname, '../..');
const inActions = Boolean(process.env.GITHUB_ACTIONS);

const PR_AUTHOR = (process.env.PR_AUTHOR || '').trim();
const PR_NUMBER = (process.env.PR_NUMBER || '').trim();
const BASE_SHA = (process.env.BASE_SHA || '').trim();
const HEAD_SHA = (process.env.HEAD_SHA || '').trim();
const TODAY = (process.env.TODAY || '').trim();
const COMMENT_DIR = (process.env.COMMENT_DIR || '').trim();

/** Emit a GitHub Actions error annotation (falls back to a plain line locally). */
function annotate(file, line, message) {
  // Include the path in the message itself: GitHub consumes the `file=` part to
  // attach the annotation to the file, but the plain workflow log only shows the
  // message — so without this the log line has no idea which page is at fault.
  const loc = line ? `${file}:${line}` : file;
  const msg = `${loc} — ${message}`.replace(/\n/g, ' ');
  if (inActions) {
    const lineAttr = line ? `,line=${line}` : '';
    console.log(`::error file=${file}${lineAttr},title=Front matter properties::${msg}`);
  } else {
    console.log(`  error: ${msg}`);
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
 * In CI (BASE_SHA/HEAD_SHA present) → the PR's changed files via git diff.
 * Locally → every docs page, so the script is runnable for debugging.
 */
function resolveFiles() {
  if (BASE_SHA && HEAD_SHA) {
    const out = execFileSync(
      'git',
      ['diff', '--name-only', '--diff-filter=d', `${BASE_SHA}...${HEAD_SHA}`],
      { cwd: repoRoot, encoding: 'utf8' },
    );
    return out
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
      .filter((f) => /^docs\/.*\.(md|mdx)$/.test(f));
  }
  console.log('No BASE_SHA/HEAD_SHA set — scanning all docs pages (local mode).');
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
    annotate(rel, frontMatterLine(raw, key), message);
    findings.push(message);
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
  if ('draft' in data && data.draft !== false) {
    warn('draft', `draft is \`${data.draft}\`; expected false (a draft page is not deployed).`);
  }
  if ('unlisted' in data && data.unlisted !== false) {
    warn('unlisted', `unlisted is \`${data.unlisted}\`; expected false (an unlisted page is hidden from navigation).`);
  }

  // 7-9: authorship fields — need PR context; skipped when it is unavailable.
  if (!PR_AUTHOR) return findings;

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
    if (age != null && age > STALE_DAYS) {
      warn('last_update', `last_update.date (${dateStr}) is ${age} days old; consider bumping it to a recent date.`);
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

/** Build the sticky PR comment body (markdown) from the per-file findings. */
function buildCommentBody(findingsByFile, checked) {
  const total = findingsByFile.reduce((n, f) => n + f.findings.length, 0);
  const lines = [COMMENT_MARKER, ''];
  if (total === 0) {
    lines.push('### ✅ Front matter properties');
    lines.push('');
    lines.push(`No front matter property issues on the ${checked} changed page(s). Thanks!`);
    return lines.join('\n');
  }
  lines.push('### ❌ Front matter properties');
  lines.push('');
  lines.push(`Found **${total}** error(s) across **${findingsByFile.length}** page(s). This check **fails until these are fixed.**`);
  lines.push('');
  const MAX_FILES = 50; // keep the comment well under GitHub's 65 KB limit
  const shown = findingsByFile.slice(0, MAX_FILES);
  for (const { file, findings } of shown) {
    lines.push(`**\`${file}\`**`);
    for (const m of findings) lines.push(`- ${m}`);
    lines.push('');
  }
  if (findingsByFile.length > MAX_FILES) {
    lines.push(`_…and ${findingsByFile.length - MAX_FILES} more page(s) with errors — see the job log / annotations for the full list._`);
    lines.push('');
  }
  lines.push('<sub>Reference: the front matter guide in `docs/ref-arch/RA0000/readme.md`.</sub>');
  return lines.join('\n');
}

/** Write the comment artifact (body + PR number + status) for the comment workflow. */
function writeCommentArtifact(body, hasFindings) {
  if (!COMMENT_DIR) return;
  fs.mkdirSync(COMMENT_DIR, { recursive: true });
  fs.writeFileSync(path.join(COMMENT_DIR, 'body.md'), body + '\n');
  fs.writeFileSync(path.join(COMMENT_DIR, 'pr.txt'), `${PR_NUMBER}\n`);
  fs.writeFileSync(path.join(COMMENT_DIR, 'has-findings.txt'), `${hasFindings ? 1 : 0}\n`);
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
      findingsByFile.push({ file: rel, findings: [`Could not parse front matter: ${e.message}`] });
      checked++;
      continue;
    }
    checked++;
    const findings = checkFile(rel, raw, data);
    if (findings.length) findingsByFile.push({ file: rel, findings });
  }

  const errors = findingsByFile.reduce((n, f) => n + f.findings.length, 0);

  const body = buildCommentBody(findingsByFile, checked);
  writeCommentArtifact(body, errors > 0);

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
  ].join('\n');

  console.log('\n' + summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
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
