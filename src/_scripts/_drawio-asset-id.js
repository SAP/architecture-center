// Shared filename identity for the webpack asset plugin and post-build link
// resolver. Keep this dependency-free: CI runs its tests before npm ci.
const { lstatSync, readFileSync, realpathSync } = require('node:fs');
const { dirname, isAbsolute, join, relative, resolve, sep } = require('node:path');

const ID_MAX_LENGTH = 64;

function sanitizeId(id) {
    if (id === null || id === undefined || id === '') return null;
    // Reject rather than strip or truncate: different contributor-controlled
    // IDs must never collapse into the same downloadable asset filename.
    if (typeof id !== 'string' || id.length > ID_MAX_LENGTH || !/^[A-Za-z0-9._-]+$/.test(id)) {
        throw new Error('Draw.io document id must contain 1 to 64 filename-safe letters, digits, dots, underscores, or dashes.');
    }
    // "." and ".." pass the character allowlist but are not usable filename
    // segments: reject them so an id can never be a relative-path component.
    if (id === '.' || id === '..') {
        throw new Error('Draw.io document id must not be "." or "..".');
    }
    return id;
}

// IDs use a deliberately narrow subset of YAML: a top-level, single-line plain
// or quoted scalar, with an optional comment. Read the lexical plain value so
// numeric-looking IDs keep their leading zeroes. Do not parse other metadata,
// YAML tags, aliases, or block scalars as filename identities.
function parseReadmeId(readmePath) {
    const lines = readFileSync(readmePath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
    if (!/^---[ \t]*$/.test(lines[0])) return null;
    const end = lines.findIndex((line, index) => index > 0 && /^---[ \t]*$/.test(line));
    if (end === -1) throw new Error('Draw.io document readme has unterminated front matter.');
    const fields = lines.slice(1, end).map((line) => line.match(/^(?:id|'id'|"id")[ \t]*:[ \t]*(.*)$/)).filter(Boolean);
    if (fields.length === 0) return null;
    if (fields.length > 1) throw new Error('Draw.io document readme has duplicate id fields.');

    const value = fields[0][1];
    let id;
    if (value.startsWith("'")) {
        const quoted = value.match(/^'((?:[^']|'')*)'[ \t]*(?:#.*)?$/);
        if (!quoted) throw new Error('Draw.io document id must be a single-line quoted scalar.');
        id = quoted[1].replace(/''/g, "'");
    } else if (value.startsWith('"')) {
        const quoted = value.match(/^("(?:[^"\\]|\\.)*")[ \t]*(?:#.*)?$/);
        if (!quoted) throw new Error('Draw.io document id must be a single-line quoted scalar.');
        // JSON string escapes are also valid YAML escapes; reject other YAML
        // escape forms instead of misreading their bytes as an ID.
        id = JSON.parse(quoted[1]);
    } else {
        id = value.replace(/[ \t]+#.*$/, '').trim();
        if (!id || id.startsWith('#') || /^(?:null|Null|NULL|~)$/.test(id)) return null;
        if (/^(?:true|True|TRUE|false|False|FALSE)$/.test(id)) {
            throw new Error('Draw.io document id must be a string, not a YAML boolean.');
        }
    }
    return sanitizeId(id);
}

function isWithin(root, candidate) {
    const path = relative(root, candidate);
    return path === '' || (path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path));
}

function optionalStat(path) {
    try {
        return lstatSync(path);
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
}

// Resolve the closest page readme under docs/ref-arch, never the primer or a
// readme elsewhere on disk. No persistent memoization: a watch build must see
// metadata edits, removals, and newly created child readmes immediately.
// onReadme(path, exists) lets webpack register file and missing dependencies.
function resolveDocumentId(drawioPath, { repositoryRoot, onReadme } = {}) {
    const absolutePath = resolve(drawioPath);
    if (!repositoryRoot) {
        const components = absolutePath.split(sep);
        const docsIndex = components.findIndex((component, index) => component === 'docs' && components[index + 1] === 'ref-arch');
        if (docsIndex < 0) return null;
        repositoryRoot = components.slice(0, docsIndex).join(sep) || sep;
    }
    const lexicalRoot = resolve(repositoryRoot);
    const refArchRoot = join(lexicalRoot, 'docs', 'ref-arch');
    const pageDirectory = dirname(dirname(absolutePath));
    if (pageDirectory === refArchRoot || !isWithin(refArchRoot, pageDirectory)) return null;

    // Anchor the checkout once, then inspect every descendant with lstat.
    // realpath alone would accept a symlinked readme or docs ancestor and could
    // copy an external file's id into a publicly emitted download filename.
    let directory = realpathSync(lexicalRoot);
    const components = relative(lexicalRoot, dirname(absolutePath)).split(sep);
    const pageDirectories = [];
    for (const [index, component] of components.entries()) {
        directory = join(directory, component);
        const stat = optionalStat(directory);
        if (!stat) return null;
        if (!stat.isDirectory()) throw new Error('Draw.io document metadata ancestor must be a regular, non-symlink directory: ' + directory);
        if (index >= 2 && index < components.length - 1) pageDirectories.push(directory);
    }

    for (const page of pageDirectories.reverse()) {
        const readmePath = join(page, 'readme.md');
        const stat = optionalStat(readmePath);
        onReadme?.(readmePath, Boolean(stat));
        if (!stat) continue;
        if (!stat.isFile()) throw new Error('Draw.io document readme must be a regular, non-symlink file: ' + readmePath);
        try {
            return parseReadmeId(readmePath);
        } catch (error) {
            throw new Error('Invalid Draw.io document id in ' + readmePath + ': ' + error.message, { cause: error });
        }
    }
    return null;
}

module.exports = { resolveDocumentId, sanitizeId, ID_MAX_LENGTH };
