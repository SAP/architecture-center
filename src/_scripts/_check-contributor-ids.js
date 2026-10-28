/**
 * Contributor / author ID check (blocking).
 *
 * Fails a pull request when a changed docs page credits an SAP-internal user ID
 * (an I-, D-, or C-number such as `I057866`) as its author or in its contributors
 * list. Public contributions must credit people by their GitHub username, never by
 * an internal user ID — the ID is an internal identifier that does not belong in
 * public content.
 *
 * Checked front matter fields:
 *   - last_update.author
 *   - author  (top-level, if present)
 *   - every entry in contributors
 *
 * A value is flagged when it matches /^[IDC]\d{6,}$/i — one of the letters I, D,
 * or C followed by six or more digits (the SAP D/I/C user-ID format). The match is
 * anchored to the whole value, so ordinary GitHub usernames (which are not a single
 * letter followed by only digits) are never flagged.
 *
 * Scope:
 *   - The workflow passes the PR's changed docs Markdown (.md / .mdx under docs/) as
 *     CLI arguments. An empty argument list therefore means "nothing changed".
 *   - Locally (no GITHUB_ACTIONS and no arguments) every docs page is scanned so the
 *     script stays runnable for debugging.
 *
 * The script exits 1 when any ID is found, so the check FAILS and — as a required
 * status check — blocks the merge until the ID is replaced with a GitHub username.
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

const DOCS_GLOB = 'docs/**/*.{md,mdx}';
const repoRoot = path.join(__dirname, '../..');
const inActions = Boolean(process.env.GITHUB_ACTIONS);

// SAP internal user IDs: a single I/D/C followed by 6+ digits (e.g. I057866, D012345,
// C1234567). Case-insensitive so a lower-cased variant (i057866) is caught too.
const USER_ID_RE = /^[IDC]\d{6,}$/i;

/** Emit a GitHub Actions error annotation (falls back to a plain line locally). */
function annotate(file, line, message) {
  // Include the path in the message itself: GitHub consumes the `file=` part to attach
  // the annotation, but the plain workflow log only shows the message.
  const loc = line ? `${file}:${line}` : file;
  const msg = `${loc} — ${message}`;
  if (inActions) {
    // Escape per the GitHub Actions command protocol so a crafted filename or message
    // can't forge/corrupt the annotation (data vs. property escaping).
    const escData = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    const escProp = (s) => escData(s).replace(/,/g, '%2C').replace(/:/g, '%3A');
    const lineAttr = line ? `,line=${line}` : '';
    console.log(`::error file=${escProp(file)}${lineAttr},title=Contributor IDs::${escData(msg)}`);
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

/**
 * 1-based line of a nested key under a top-level parent (e.g. `author` under
 * `last_update:`), so the annotation lands on the offending line rather than the
 * parent key. Falls back to the parent's line, then undefined.
 */
function nestedFrontMatterLine(raw, parent, child) {
  const lines = raw.split('\n');
  let parentLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`^${parent}:`).test(lines[i])) { parentLine = i; break; }
  }
  if (parentLine === -1) return undefined;
  const childRe = new RegExp(`^\\s+${child}:`);
  for (let j = parentLine + 1; j < lines.length; j++) {
    // Stop at the next top-level key or the front matter fence (both column 0).
    if (/^\S/.test(lines[j])) break;
    if (childRe.test(lines[j])) return j + 1;
  }
  return parentLine + 1;
}

/** Best-effort line of a specific `- value` contributor entry, else the contributors: line. */
function contributorLine(raw, value) {
  const lines = raw.split('\n');
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^\\s*-\\s*['"]?${escaped}['"]?\\s*$`);
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return i + 1;
  }
  return frontMatterLine(raw, 'contributors');
}

/** Normalize a contributors value (array, single string, or absent) to a string array. */
function toList(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') return [v];
  return [];
}

/**
 * Resolve the set of files to check. In CI the workflow passes the PR's changed docs
 * Markdown as CLI arguments; an empty list means "nothing changed". Locally (no
 * GITHUB_ACTIONS and no arguments) every docs page is scanned.
 */
function resolveFiles() {
  const argvFiles = process.argv.slice(2).filter((f) => /^docs\/.*\.(md|mdx)$/.test(f));
  if (inActions || process.argv.length > 2) return argvFiles;
  console.log('No file arguments — scanning all docs pages (local mode).');
  return glob.sync(DOCS_GLOB, { cwd: repoRoot });
}

/** Flag any author/contributor value that looks like an internal user ID.
 *  Emits annotations as a side effect and returns the list of messages. */
function checkFile(rel, raw, data) {
  const findings = [];
  const flag = (line, message) => {
    annotate(rel, line, message);
    findings.push(message);
  };

  const lastUpdate = data.last_update && typeof data.last_update === 'object' ? data.last_update : {};

  // last_update.author
  if (lastUpdate.author != null) {
    const v = String(lastUpdate.author).trim();
    if (USER_ID_RE.test(v)) {
      flag(
        nestedFrontMatterLine(raw, 'last_update', 'author'),
        `last_update.author \`${v}\` looks like an SAP internal user ID (I/D/C-number). Credit the author by their GitHub username instead.`
      );
    }
  }

  // top-level author (defensive — not the house-style field, but flag it if present)
  if (data.author != null) {
    const v = String(data.author).trim();
    if (USER_ID_RE.test(v)) {
      flag(
        frontMatterLine(raw, 'author'),
        `author \`${v}\` looks like an SAP internal user ID (I/D/C-number). Credit the author by their GitHub username instead.`
      );
    }
  }

  // contributors
  for (const c of toList(data.contributors)) {
    const v = String(c).trim();
    if (USER_ID_RE.test(v)) {
      flag(
        contributorLine(raw, v),
        `contributor \`${v}\` looks like an SAP internal user ID (I/D/C-number). List the person by their GitHub username instead.`
      );
    }
  }

  return findings;
}

function main() {
  const files = resolveFiles().sort();
  const findingsByFile = [];
  let checked = 0;

  for (const rel of files) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) continue; // defensive: diff listed it but it is gone
    const raw = fs.readFileSync(abs, 'utf8');
    let data;
    try {
      ({ data } = matter(raw));
    } catch {
      // A front-matter parse error is out of scope here; the front-matter checks report it.
      continue;
    }
    checked++;
    const findings = checkFile(rel, raw, data);
    if (findings.length) findingsByFile.push({ file: rel, findings });
  }

  const errors = findingsByFile.reduce((n, f) => n + f.findings.length, 0);

  const summary = [
    '## Contributor IDs check',
    '',
    'Fails when a changed docs page credits an SAP internal user ID (an I-, D-, or',
    'C-number such as `I057866`) as its author or a contributor. People must be',
    'credited by their GitHub username, not an internal user ID.',
    '',
    `Checked **${checked}** changed page(s). Result: **${errors}** error(s).`,
    '',
  ];
  if (errors > 0) {
    for (const { file, findings } of findingsByFile) {
      summary.push(`**\`${file}\`**`);
      for (const m of findings) summary.push(`- ${m}`);
      summary.push('');
    }
    summary.push('📖 How to fix (replace the ID with the GitHub username): https://architecture.learning.sap.com/docs/community/automated-checks/contributor-ids');
  }
  const summaryText = summary.join('\n');

  console.log('\n' + summaryText);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryText + '\n');
  }

  if (errors > 0) {
    console.log(`\n✖ Contributor IDs check failed with ${errors} error(s).`);
    process.exitCode = 1;
    return;
  }
  console.log('\n✔ No internal user IDs found in author/contributors.');
}

main();
