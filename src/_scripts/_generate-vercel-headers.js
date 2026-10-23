/**
 * Regenerates the committed vercel.json from the single source of truth,
 * src/plugins/security-headers/csp-config.js.
 *
 * Run via `npm run gen:headers` after changing csp-config.js. CI
 * (check-security-headers.yml) runs this and fails if vercel.json is out of date,
 * which prevents the Cloudflare (_headers) and Vercel (vercel.json) policies from
 * drifting apart again.
 */
const fs = require('fs');
const path = require('path');
const { buildVercelConfig } = require('../plugins/security-headers/csp-config');

const outPath = path.join(__dirname, '..', '..', 'vercel.json');
const json = JSON.stringify(buildVercelConfig(), null, 2) + '\n';

fs.writeFileSync(outPath, json, 'utf8');
console.log('✅ vercel.json regenerated from csp-config.js at:', outPath);
