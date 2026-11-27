const { createHash } = require('node:crypto');
const { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } = require('node:fs');
const { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } = require('node:path');
const { resolveDocumentId } = require('./_drawio-asset-id');
const { ensureOutputDirectory, writeArtifactFile } = require('./_export-drawios/artifact-output');
const { validateOutputPath } = require('./_export-drawios/docker-export');

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
    // Emitted assets are "<stem>-[<documentId>-]<hex-content-hash><ext>". The optional
    // document id segment (added by the asset-types plugin so downloads are
    // attributable in server logs) sits between the stem and the webpack content
    // hash. The hash length is not pinned to 16 so a future bundler/hashFunction
    // change does not silently break every download link.
    const middle = emittedName.slice(stem.length + 1, -extension.length);
    return (
        emittedName === sourceName ||
        (emittedName.startsWith(`${stem}-`) &&
            emittedName.endsWith(extension) &&
            /^(?:[A-Za-z0-9._-]+-)?[0-9a-f]{8,}$/i.test(middle))
    );
}

// True when the emitted asset carries exactly this document id between the stem
// and the hex content hash, i.e. "<stem>-<documentId>-<hash><ext>". Lets the resolver
// pick the right asset when several share the same content (same hash) but
// belong to different documents (distinct id segments).
function emittedNameHasId(emittedPath, sourcePath, documentId) {
    if (!documentId) return false;
    const sourceName = basename(sourcePath);
    const extension = extname(sourceName);
    const stem = basename(sourceName, extension);
    const emittedName = basename(emittedPath);
    if (!emittedName.startsWith(`${stem}-`) || !emittedName.endsWith(extension)) return false;
    const middle = emittedName.slice(stem.length + 1, -extension.length);
    const prefix = `${documentId}-`;
    return middle.startsWith(prefix) && /^[0-9a-f]{8,}$/i.test(middle.slice(prefix.length));
}

function buildDrawioIndex(buildDir) {
    const index = new Map();
    if (!lstatSync(buildDir).isDirectory()) {
        throw new Error('Draw.io build directory must be a regular, non-symlink directory.');
    }
    const files = [];
    function visit(directory, prefix = '') {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const relativePath = join(prefix, entry.name);
            // Do not follow directory symlinks when indexing public assets.
            if (entry.isDirectory()) visit(join(directory, entry.name), relativePath);
            else if (entry.isFile() && entry.name.endsWith('.drawio')) files.push(relativePath);
        }
    }
    visit(buildDir);
    files.sort();

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

    const checkoutRoot = realpathSync(rootDir);
    const docsRoot = join(checkoutRoot, 'docs');
    const sourcePath = resolve(rootDir, sourceReference);
    const canonicalSourcePath = resolve(checkoutRoot, relative(resolve(rootDir), sourcePath));
    if (!isPathWithin(docsRoot, canonicalSourcePath)) {
        throw new Error(`Draw.io source must be a regular file under docs/: ${sourceReference}`);
    }
    // Check every ancestor, including docs itself. A symlinked docs directory
    // must not redefine the trusted boundary to a directory outside checkout.
    let directory = checkoutRoot;
    for (const component of relative(checkoutRoot, dirname(canonicalSourcePath)).split(sep)) {
        directory = join(directory, component);
        if (!lstatSync(directory).isDirectory()) {
            throw new Error(`Draw.io source directory must be a regular, non-symlink directory: ${directory}`);
        }
    }
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

        // Only accept this page's id or a legacy filename. Using another document's
        // download would silently corrupt attribution for identical diagrams.
        const documentId = resolveDocumentId(sourcePath);
        const chosen = candidates.find((candidate) => emittedNameHasId(candidate, sourcePath, documentId))
            || candidates.find((candidate) => {
                const extension = extname(sourcePath);
                const stem = basename(sourcePath, extension);
                const name = basename(candidate);
                return name === basename(sourcePath)
                    || (name.startsWith(`${stem}-`) && name.endsWith(extension)
                        && /^[0-9a-f]{8,}$/i.test(name.slice(stem.length + 1, -extension.length)));
            });
        if (!chosen) {
            throw new Error(`Could not resolve emitted Draw.io asset with matching document id for ${relative(rootDir, sourcePath)}.`);
        }
        const emittedPath = chosen.split(sep).map(encodeURIComponent).join('/');
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
    ensureOutputDirectory(buildDir, rootDir);
    ensureOutputDirectory(dirname(dataJsonPath), rootDir);
    validateOutputPath(dataJsonPath, buildDir);
    if (!existsSync(dataJsonPath)) {
        throw new Error(`${dataJsonPath} not found. Build the site before updating Draw.io links.`);
    }

    const data = JSON.parse(readFileSync(dataJsonPath, 'utf8'));
    const updatedData = resolveDrawioLinks({ data, buildDir, rootDir, baseUrl });
    writeArtifactFile(dataJsonPath, JSON.stringify(updatedData, null, 2), buildDir, rootDir);
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
