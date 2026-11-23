const { createHash } = require('node:crypto');
const { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, writeFileSync } = require('node:fs');
const { basename, extname, isAbsolute, join, relative, resolve, sep } = require('node:path');

const log = console.log;
const PLACEHOLDER_PREFIX = 'PLACEHOLDER:';
const ROOT = join(__dirname, '..', '..');
const BUILD_DIR = join(ROOT, 'build');
const DATA_JSON_PATH = join(BUILD_DIR, 'artifacts', 'data.json');
const BASE_URL = 'https://architecture.learning.sap.com';

function isPathWithin(root, candidate) {
    const relativePath = relative(root, candidate);
    return (
        relativePath === '' ||
        (relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath))
    );
}

function hashFile(filePath) {
    return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function emittedNameMatchesSource(emittedPath, sourcePath) {
    const sourceName = basename(sourcePath);
    const extension = extname(sourceName);
    const stem = basename(sourceName, extension);
    const emittedName = basename(emittedPath);
    const hash = emittedName.slice(stem.length + 1, -extension.length);
    return (
        emittedName === sourceName ||
        (emittedName.startsWith(`${stem}-`) && emittedName.endsWith(extension) && /^[0-9a-f]{16}$/i.test(hash))
    );
}

function buildDrawioIndex(buildDir) {
    const index = new Map();
    const files = readdirSync(buildDir, { recursive: true })
        .filter((file) => file.endsWith('.drawio'))
        .sort();

    for (const relativePath of files) {
        const absolutePath = join(buildDir, relativePath);
        const stat = lstatSync(absolutePath);
        if (stat.isSymbolicLink() || !stat.isFile()) continue;
        const hash = hashFile(absolutePath);
        const matches = index.get(hash) || [];
        matches.push(relativePath);
        index.set(hash, matches);
    }

    return index;
}

function resolveSourcePath(rootDir, placeholder) {
    const sourceReference = placeholder.slice(PLACEHOLDER_PREFIX.length).replace(/\\/g, '/');
    if (!sourceReference || isAbsolute(sourceReference)) {
        throw new Error(`Invalid Draw.io source placeholder: ${placeholder}`);
    }

    const docsRoot = realpathSync(join(rootDir, 'docs'));
    const sourcePath = resolve(rootDir, sourceReference);
    if (!existsSync(sourcePath)) {
        throw new Error(`Draw.io source does not exist: ${sourceReference}`);
    }

    const sourceStat = lstatSync(sourcePath);
    const realSourcePath = realpathSync(sourcePath);
    if (sourceStat.isSymbolicLink() || !sourceStat.isFile() || !isPathWithin(docsRoot, realSourcePath)) {
        throw new Error(`Draw.io source must be a regular file under docs/: ${sourceReference}`);
    }

    return realSourcePath;
}

function resolveDrawioLinks({ data, buildDir, rootDir, baseUrl }) {
    if (!Array.isArray(data)) throw new TypeError('Draw.io artifact data must be an array.');

    const drawioIndex = buildDrawioIndex(buildDir);
    return data.map((item) => {
        if (!item.drawioLink?.startsWith(PLACEHOLDER_PREFIX)) return item;

        const sourcePath = resolveSourcePath(rootDir, item.drawioLink);
        const candidates = (drawioIndex.get(hashFile(sourcePath)) || []).filter((candidate) =>
            emittedNameMatchesSource(candidate, sourcePath)
        );
        if (candidates.length === 0) {
            throw new Error(`Could not resolve emitted Draw.io asset for ${relative(rootDir, sourcePath)}.`);
        }

        const emittedPath = candidates[0].replace(/\\/g, '/');
        return {
            ...item,
            drawioLink: `${baseUrl.replace(/\/$/, '')}/${emittedPath}`,
        };
    });
}

function updateDrawioLinks({
    dataJsonPath = DATA_JSON_PATH,
    buildDir = BUILD_DIR,
    rootDir = ROOT,
    baseUrl = BASE_URL,
} = {}) {
    if (!existsSync(dataJsonPath)) {
        throw new Error(`${dataJsonPath} not found. Build the site before updating Draw.io links.`);
    }

    const data = JSON.parse(readFileSync(dataJsonPath, 'utf8'));
    const updatedData = resolveDrawioLinks({ data, buildDir, rootDir, baseUrl });
    writeFileSync(dataJsonPath, JSON.stringify(updatedData, null, 2));
    log('Successfully updated Draw.io links in data.json.');
    return updatedData;
}

if (require.main === module) {
    try {
        updateDrawioLinks();
    } catch (error) {
        console.error(`Error updating Draw.io links: ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = {
    resolveDrawioLinks,
    updateDrawioLinks,
};
