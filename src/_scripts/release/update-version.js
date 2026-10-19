const fs = require("fs");
const path = require("path");

const pkgPath = path.join(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const currentVersion = pkg.version; // e.g. "v2.2612.1"
const parts = currentVersion.split(".");
const prefix = parts[0]; // "v2" (static)
const oldYearWeek = parts[1]; // e.g. "2612"
const oldCount = parseInt(parts[2], 10); // e.g. 1

// Calculate current ISO week number
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

const now = new Date();
const year = String(now.getFullYear()).slice(-2); // "26"
const week = String(getISOWeek(now)).padStart(2, "0"); // e.g. "12"
const newYearWeek = year + week;

let newCount;
if (newYearWeek === oldYearWeek) {
  // Same week — increment the release count
  newCount = oldCount + 1;
} else {
  // New week — reset to 1
  newCount = 1;
}

const newVersion = `${prefix}.${newYearWeek}.${newCount}`;
pkg.version = newVersion;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4), "utf8");

// Keep package-lock.json in sync WITHOUT running `npm install`.
// This repo uses a non-semver version scheme (e.g. "v3.2642.1"), so `npm version`
// cannot be used, and a bare `npm install` is an unpinned dependency-fetch that
// OpenSSF Scorecard flags (Pinned-Dependencies). Only the version fields change at
// release time; the dependency tree is already locked by prior PRs, so we patch the
// two version fields in place. The file's existing indentation and trailing newline
// are preserved so the release diff stays limited to the version lines.
const lockPath = path.join(process.cwd(), "package-lock.json");
if (fs.existsSync(lockPath)) {
  const raw = fs.readFileSync(lockPath, "utf8");
  const lock = JSON.parse(raw);
  lock.version = newVersion;
  if (lock.packages && lock.packages[""]) {
    lock.packages[""].version = newVersion;
  }
  // Reuse the lockfile's own indentation (npm matches package.json, e.g. 4 spaces)
  // instead of hard-coding one, to avoid reformatting the whole file.
  const indentMatch = raw.match(/\n([ \t]+)"/);
  const indent = indentMatch ? indentMatch[1] : 2;
  const trailingNewline = raw.endsWith("\n") ? "\n" : "";
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, indent) + trailingNewline, "utf8");
}

console.log(newVersion);
