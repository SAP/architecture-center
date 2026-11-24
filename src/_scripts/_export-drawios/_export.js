const { readdirSync, readFileSync, writeFileSync, existsSync, rmSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const { normalize: normalizePath, dirname, basename, join, relative, sep } = require('node:path');
const { homedir } = require('node:os');
const { createHash } = require('node:crypto');
const QRCode = require('qrcode');
const fm = require('front-matter'); // Added for front-matter parsing
const DrawioCache = require('./drawio-cache');
const { DRAWIO_IMAGE, exportDrawioWithDocker, validateOutputPath } = require('./docker-export');
const { createDrawioFingerprint } = require('./drawio-fingerprint');
const { runExportBatch } = require('./export-batch');
const { toThumbnailFileName } = require('./sanitize');
const { watermarkSvg } = require('./watermark');
const { ensureOutputDirectory, writeArtifactFile } = require('./artifact-output');

const log = console.log;

// DOCKER=1 -> run drawio cli via docker
const { DOCKER = 0 } = process.env;
// searching in different directories, depending on OS
const isMac = process.platform === 'darwin';
const DRAWIO_CLI_BINARY = isMac
    ? '/Applications/draw.io.app/Contents/MacOS/draw.io'
    : 'C:\\Program Files\\draw.io\\draw.io.exe';
// assuming script is in src/_scripts/
const ROOT = normalizePath(__dirname + '/../../..');
const SAP_LOGO = __dirname + '/../../../static/img/logo.svg';
const SVG_BACKGROUND_COLOR = '#ffffff';
const BASE_URL = 'https://architecture.learning.sap.com'; // Changed from URL to BASE_URL for consistency
const QR_CODE_VERSION = require('qrcode/package.json').version;
const ARTIFACTS_DIR = ROOT + '/static/artifacts'; // Added for artifacts generation
const THUMBNAILS_DIR = ARTIFACTS_DIR + '/thumbnails'; // Added for thumbnails generation
const { CACHE_ENABLED = 0 } = process.env;
const cacheEnabled = Boolean(Number(CACHE_ENABLED));

const drawioCache = new DrawioCache({
    isEnabled: cacheEnabled,
    // Allow redirecting the cache (e.g. to an isolated dir in the e2e fixture)
    // so a test run never reads or pollutes the developer's real cache.
    cacheDir: process.env.DRAWIO_CACHE_DIR || `${homedir()}/.cache/architecture-center/drawio-svgs`
});
const logoSvg = readFileSync(SAP_LOGO, 'utf8');
const renderContexts = new Map();

if (!DOCKER) {
    if (!existsSync(DRAWIO_CLI_BINARY)) {
        throw new Error(`Drawio executable not found at ${DRAWIO_CLI_BINARY}. Please check the path.`);
    }
    try {
        execFileSync(DRAWIO_CLI_BINARY, ['-h'], { encoding: 'utf8' });
    } catch (e) {
        throw new Error(`Cannot run Drawio CLI at ${DRAWIO_CLI_BINARY}.`, { cause: e });
    }
}

function getRendererIdentity() {
    if (!cacheEnabled) return 'cache-disabled';
    if (DOCKER) return DRAWIO_IMAGE;
    return execFileSync(DRAWIO_CLI_BINARY, ['--version'], { encoding: 'utf8', timeout: 60000 }).trim();
}

function getPipelineIdentity() {
    // Only consumed by the cache fingerprint. Skip the hashing I/O when caching
    // is disabled, mirroring getRendererIdentity() above.
    //
    // Deliberately NOT hashing package-lock.json: every release bumps its
    // version field, which would needlessly bust the whole drawio cache. The
    // dependencies that actually affect output are already fingerprinted at a
    // finer grain (rendererIdentity for the drawio engine, qrCodeVersion for
    // the QR library), and any pipeline change edits the source files below.
    if (!cacheEnabled) return 'cache-disabled';
    const sourceFiles = [
        __filename,
        require.resolve('./drawio-cache'),
        require.resolve('./drawio-fingerprint'),
        require.resolve('./export-batch'),
        require.resolve('./sanitize'),
        require.resolve('./watermark'),
        require.resolve('./artifact-output'),
    ];
    const dockerExporterPath = join(__dirname, 'docker-export.js');
    if (existsSync(dockerExporterPath)) sourceFiles.push(dockerExporterPath);

    const hash = createHash('sha256');
    sourceFiles.forEach((filePath) => hash.update(readFileSync(filePath)));
    return hash.digest('hex');
}

const rendererIdentity = getRendererIdentity();
const pipelineIdentity = getPipelineIdentity();

// Create artifact directories only after checking their ancestry against the
// trusted checkout; recursive mkdir could otherwise follow a committed symlink.
ensureOutputDirectory(THUMBNAILS_DIR, ROOT);

// --- Phase 1: Export and Watermark all Draw.io files ---

const filterPath = process.argv[2] || null; // Optional: restrict to a subfolder, e.g. "ref-arch/RA0030"

const files = readdirSync(ROOT + '/docs', { recursive: true }); // Scan all docs for drawio files
const drawios = files
    .filter((file) => file.match(/\.drawio$/))
    .filter((file) => !filterPath || file.startsWith(filterPath));
log(`Found ${drawios.length} drawios to process\n`);

const transforms = {}; // Maps original drawio path to output SVG path
for (const drawio of drawios) {
    const fullInput = join(ROOT + '/docs', drawio); // Full path to the drawio file
    const name = basename(drawio, '.drawio');
    const baseDir = dirname(drawio);
    const outputDir = join(ROOT + '/docs', baseDir, '..', 'images'); // Output SVG to 'images' dir relative to its parent
    const svg = join(outputDir, `${name}.svg`);
    transforms[fullInput] = svg;
}

function getReadmePath(drawioPath) {
    if (drawioPath.includes(`RA0007${sep}5-mt-architecture${sep}drawio${sep}`)) {
        return join(ROOT, 'docs', 'ref-arch', 'RA0007', 'readme.md');
    }
    return join(dirname(drawioPath), '..', 'readme.md');
}

function getRenderContext(drawioPath) {
    const cachedContext = renderContexts.get(drawioPath);
    if (cachedContext) return cachedContext;

    const sourceContent = readFileSync(drawioPath);
    const readmePath = getReadmePath(drawioPath);
    const readmeContent = readFileSync(readmePath, 'utf8');
    const { attributes } = fm(readmeContent);
    let title = attributes.title;
    // Fail with a diagnosable message rather than an opaque TypeError: with the
    // hardened fail-hard pipeline, a readme missing its title front-matter would
    // otherwise abort the whole export on `title.includes(...)`.
    if (typeof title !== 'string' || title.trim() === '') {
        throw new Error(
            `Draw.io export: "${readmePath}" is missing a "title" front-matter field (required to render "${drawioPath}").`,
        );
    }
    if (title.includes('#')) title = title.split('#')[0];
    const slug = attributes.slug;
    // Same rationale as the title guard above: slug feeds qrLink and
    // `slug.match(...)` below, so a missing slug would otherwise throw an opaque
    // TypeError and abort the export (and, with caching on, bypass the per-file
    // error aggregation since the fingerprint is computed before the try block).
    if (typeof slug !== 'string' || slug.trim() === '') {
        throw new Error(
            `Draw.io export: "${readmePath}" is missing a "slug" front-matter field (required to render "${drawioPath}").`,
        );
    }
    const lastUpdateIso = execFileSync('git', ['log', '-1', '--format=%cI', '--', drawioPath], {
        encoding: 'utf8',
    }).trim();
    if (!lastUpdateIso) throw new Error(`Could not determine the last update date for ${drawioPath}.`);
    const lastUpdated = new Date(lastUpdateIso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });

    const context = {
        fingerprint: cacheEnabled
            ? createDrawioFingerprint({
                sourceContent,
                title,
                slug,
                logoContent: logoSvg,
                lastUpdated,
                rendererIdentity,
                pipelineIdentity,
                qrCodeVersion: QR_CODE_VERSION,
                baseUrl: BASE_URL,
            })
            : null,
        lastUpdated,
        qrLink: `${BASE_URL}/docs${slug}`,
        smallSlug: slug.match(/\/ref-arch\/(\S+)/)?.[1] || '',
        title,
    };
    renderContexts.set(drawioPath, context);
    return context;
}

function getCacheFingerprint(drawioPath) {
    return cacheEnabled ? getRenderContext(drawioPath).fingerprint : null;
}

// Check directory ancestry against the trusted checkout before creating any
// children, and reject symlink/non-regular destinations for both fresh exports
// and cached restores. Cache hits must never bypass this guard.
function prepareOutputPath(output) {
    ensureOutputDirectory(dirname(output), ROOT);
    return validateOutputPath(output, join(ROOT, 'docs'));
}

function safeCleanOutput(output) {
    prepareOutputPath(output);
    rmSync(output, { force: true });
}

// Export all drawios to svgs
function exportAllDrawios() {
    const jobs = Object.entries(transforms).map(([input, output]) => ({ input, output }));
    jobs.forEach(({ output }) => prepareOutputPath(output));

    runExportBatch({
        jobs,
        isCached: ({ input }) => drawioCache.isValid(input, getCacheFingerprint(input)),
        beforeExport: ({ output }) => {
            safeCleanOutput(output);
        },
        exportOne: ({ input, output }) => {
            let stdout;
            if (DOCKER) {
                stdout = exportDrawioWithDocker({
                    inputPath: input,
                    outputPath: output,
                    allowedFilesRoot: join(ROOT, 'docs'),
                    repositoryRoot: ROOT,
                });
            } else {
                const args = ['--export', '--embed-svg-images', '--svg-theme', 'light', '--output', output, input];
                stdout = execFileSync(DRAWIO_CLI_BINARY, args, { encoding: 'utf8', timeout: 600000 });
            }
            return stdout;
        },
        onCacheHit: ({ input }) => log(`Cache hit for ${prettyPaths(input, 0)}, nothing to do.`),
        onSuccess: (_job, stdout) => log('Export', prettyPaths(stdout)),
        onFailure: ({ input, output }, error) => {
            safeCleanOutput(output);
            const msg = prettyPaths(`Export failed ${input} -> ${output}`);
            console.error(`\n[ERROR] ${msg}. Reason: ${String(error.stderr || error.message)}\n`);
        },
    });

    log('\nAll Draw.io files exported successfully.');
}

// generate qrcode, only get inner part
async function generateQrSvg(link) {
    const rawSvg = await QRCode.toString(link, { type: 'svg', margin: 0 });
    const qrInner = rawSvg.replace(/<\/*svg[^>]*>/g, '');
    return qrInner;
}

// Watermark the svgs, which were created in the previous step
async function watermarkAll() {
    const failures = [];
    for (const [drawioPath, svgPath] of Object.entries(transforms)) {
        const cacheFingerprint = getCacheFingerprint(drawioPath);

        if (drawioCache.isValid(drawioPath, cacheFingerprint)) {
            prepareOutputPath(svgPath);
            if (drawioCache.restore(drawioPath, svgPath)) {
                log(`Using watermarked SVG from cache for ${prettyPaths(svgPath, 0)}`);
                continue;
            }
            throw new Error(`Failed to restore valid cache entry for ${prettyPaths(drawioPath)}.`);
        }
        if (!existsSync(svgPath)) {
            failures.push(new Error(`Cannot watermark missing exported SVG: ${prettyPaths(svgPath)}.`));
            continue;
        }

        try {
            const { lastUpdated, qrLink, smallSlug, title } = getRenderContext(drawioPath);
            const svg = watermarkSvg(readFileSync(svgPath, 'utf8'), {
                title,
                lastUpdated,
                smallSlug,
                logoSvg,
                qrSvgContent: await generateQrSvg(qrLink),
                backgroundColor: SVG_BACKGROUND_COLOR,
            });

            writeFileSync(svgPath, svg);
            log(prettyPaths('Watermarked ' + svgPath, 0));
            
            drawioCache.store(drawioPath, cacheFingerprint, svg);
        } catch (e) {
            rmSync(svgPath, { force: true });
            const failure = new Error(`Failed to watermark ${prettyPaths(svgPath)}.`, { cause: e });
            failures.push(failure);
            console.error(`[ERROR] ${failure.message} Reason: ${e.message}`);
        }
    }

    if (failures.length > 0) {
        throw new AggregateError(failures, `Failed to watermark ${failures.length} Draw.io file(s).`);
    }
}

// --- Phase 2: Generate Artifacts for Top-Level RAs ---

async function generateArtifacts() {
    const allArtifacts = [];
    const failures = [];
    // Guards against two RAs whose titles normalize to the same thumbnail
    // filename silently overwriting each other (and cross-wiring data.json).
    const usedThumbnailNames = new Map();
    const refArchRoot = ROOT + '/docs/ref-arch';
    let topLevelRADirs = readdirSync(refArchRoot, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('RA') && dirent.name !== 'RA0000')
        .map(dirent => dirent.name);

    // Include subdirectories only for RA0004 for vendor specific integrations
    // through BDC as per request.
    topLevelRADirs = topLevelRADirs.concat(['RA0004/1-aws-data-integration', 'RA0004/2-azure-data-integration', 'RA0004/3-databricks-data-integration', 'RA0004/4-gcp-data-integration', 'RA0004/5-snowflake-data-integration']);
    topLevelRADirs.sort();

    for (const dirName of topLevelRADirs) {
        let drawioFilePath; // This will be the path to the original .drawio file
        let svgThumbnailSourcePath; // This will be the path to the watermarked SVG

        const readmePath = join(refArchRoot, dirName, 'readme.md');

        if (!existsSync(readmePath)) {
            log(`[WARNING] Skipping artifact generation for ${dirName}: Missing readme.md at ${readmePath}`);
            continue;
        }

        const readmeContent = readFileSync(readmePath, 'utf8');
        const { attributes } = fm(readmeContent);

        // Skip archived/draft/unlisted/community-contrib RAs. RA0004 vendor sub-pages
        // are exempted because people still rely on them being exposed.
        const tags = Array.isArray(attributes.tags) ? attributes.tags : [];
        const isArchived = tags.includes('archive');
        const isCommunityContrib = tags.includes('community-contrib');
        const isHidden = attributes.draft === true || attributes.unlisted === true;
        if ((isArchived || isCommunityContrib || isHidden) && !dirName.includes('RA0004/')) {
            log(`[SKIPPING] Artifact for ${dirName}: readme is archived/draft/unlisted/community-contrib.`);
            continue;
        }

        if (dirName.includes('RA0004/') && dirName.includes('snowflake')) {
            drawioFilePath = join(refArchRoot, dirName, 'drawio', 'snowflake-solex-data-integration.drawio');
            svgThumbnailSourcePath = join(refArchRoot, dirName, 'images', 'snowflake-solex-data-integration.svg');
        } else {
            const drawioDir = join(refArchRoot, dirName, 'drawio');
            if (!existsSync(drawioDir)) {
                log(`[WARNING] Skipping artifact generation for ${dirName}: No 'drawio' directory found at ${drawioDir}`);
                continue;
            }
            // Pick the .drawio the readme actually references, so the artifact's
            // PLACEHOLDER link resolves to an emitted webpack asset. readdirSync
            // order is not guaranteed, so an arbitrary pick could later abort the
            // whole build in resolveDrawioLinks when the chosen file is not the
            // one embedded in the page. Fall back to the first file (sorted, for
            // determinism) when the readme references none.
            const availableDrawios = readdirSync(drawioDir)
                .filter((file) => file.endsWith('.drawio'))
                .sort();
            if (availableDrawios.length === 0) {
                log(`[WARNING] Skipping artifact generation for ${dirName}: No .drawio file found in ${drawioDir}`);
                continue;
            }
            const referencedDrawio = [...readmeContent.matchAll(/(?:\.\/)?drawio\/([A-Za-z0-9_.-]+\.drawio)/g)]
                .map((match) => match[1])
                .find((name) => availableDrawios.includes(name));
            const drawioFile = referencedDrawio || availableDrawios[0];
            drawioFilePath = join(drawioDir, drawioFile);
            svgThumbnailSourcePath = join(refArchRoot, dirName, 'images', basename(drawioFile, '.drawio') + '.svg');
        }

        if (!existsSync(svgThumbnailSourcePath)) {
            log(`[WARNING] Skipping artifact generation for ${dirName}: Missing watermarked SVG at ${svgThumbnailSourcePath}`);
            continue;
        }

        try {
            let title = attributes.title;

            if (dirName.includes('RA0004/')) {
                title = 'SAP Business Data Cloud: ' + title;
            }

            // Derive the thumbnail filename from the (untrusted) title. Collapse
            // whitespace AND both path separators ("/" and Windows "\") so no
            // separator survives — which also makes any ".." inert and keeps the
            // name a single path segment on every platform.
            const titleAsFileName = toThumbnailFileName(title);
            if (usedThumbnailNames.has(titleAsFileName)) {
                throw new Error(
                    `Thumbnail filename collision: "${dirName}" and "${usedThumbnailNames.get(titleAsFileName)}" `
                    + `both normalize to "${titleAsFileName}.svg". Give the reference architectures distinct titles.`
                );
            }
            usedThumbnailNames.set(titleAsFileName, dirName);
            const thumbnailSvgPath = join(THUMBNAILS_DIR, `${titleAsFileName}.svg`);
            // Validate directory ancestry and the target, then atomically copy
            // the SVG without following a destination symlink.
            const watermarkedSvgContent = readFileSync(svgThumbnailSourcePath, 'utf8');
            writeArtifactFile(thumbnailSvgPath, watermarkedSvgContent, THUMBNAILS_DIR, ROOT);
            log(`Generated thumbnail: ${thumbnailSvgPath}`);

            allArtifacts.push({
                id: attributes.id,
                name: title,
                // Use a placeholder for drawioLink, to be updated in a post-build step
                drawioLink: `PLACEHOLDER:${relative(ROOT, drawioFilePath).split(sep).join('/')}`,
                thumbnailLink: `${BASE_URL}/artifacts/thumbnails/${titleAsFileName}.svg`,
                acLink: `${BASE_URL}/docs${attributes.slug}`,
                shortDescription: attributes.description,
            });

        } catch (e) {
            const failure = new Error(`Failed to generate Draw.io artifact for ${dirName}.`, { cause: e });
            failures.push(failure);
            console.error(`[ERROR] ${failure.message} Reason: ${e.message}`);
        }
    }

    if (failures.length > 0) {
        throw new AggregateError(failures, `Failed to generate ${failures.length} Draw.io artifact(s).`);
    }

    writeArtifactFile(join(ARTIFACTS_DIR, 'data.json'), JSON.stringify(allArtifacts, null, 2), ARTIFACTS_DIR, ROOT);
    log('Successfully generated artifacts data.json.');
}

function prettyPaths(log, isInDocker = DOCKER) {
    const strip = isInDocker ? 'docs/' : ROOT + '/docs/'; // Adjusted strip path for full docs scan
    return log.replaceAll(strip, '').replaceAll('\n', '');
}

// Main execution flow
async function main() {
    exportAllDrawios(); // Phase 1: Export all drawios
    await watermarkAll(); // Phase 1: Apply watermarks
    
    drawioCache.flush(); // Persist manifest to disk
    
    await generateArtifacts(); // Phase 2: Generate artifacts for top-level RAs
}

main().catch(e => {
    log('Error during processing:', e);
    process.exit(1);
});
