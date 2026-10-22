const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const { normalize: normalizePath, dirname, basename, join, relative, sep } = require('node:path');
const { homedir } = require('node:os');
const { createHash } = require('node:crypto');
const QRCode = require('qrcode');
const fm = require('front-matter'); // Added for front-matter parsing
const DrawioCache = require('./drawio-cache');
const { DRAWIO_IMAGE, exportDrawioWithDocker } = require('./docker-export');
const { createDrawioFingerprint } = require('./drawio-fingerprint');
const { runExportBatch } = require('./export-batch');

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
    cacheDir: `${homedir()}/.cache/architecture-center/drawio-svgs`
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
    const sourceFiles = [
        __filename,
        require.resolve('./drawio-cache'),
        require.resolve('./drawio-fingerprint'),
        require.resolve('./export-batch'),
    ];
    const dockerExporterPath = join(__dirname, 'docker-export.js');
    if (existsSync(dockerExporterPath)) sourceFiles.push(dockerExporterPath);

    const hash = createHash('sha256');
    sourceFiles.forEach((filePath) => hash.update(readFileSync(filePath)));
    return hash.digest('hex');
}

const rendererIdentity = getRendererIdentity();
const pipelineIdentity = getPipelineIdentity();

// Ensure artifacts directories exist
if (!existsSync(ARTIFACTS_DIR)) mkdirSync(ARTIFACTS_DIR, { recursive: true });
if (!existsSync(THUMBNAILS_DIR)) mkdirSync(THUMBNAILS_DIR, { recursive: true });

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
    const readmeContent = readFileSync(getReadmePath(drawioPath), 'utf8');
    const { attributes } = fm(readmeContent);
    let title = attributes.title;
    if (title.includes('#')) title = title.split('#')[0];
    const slug = attributes.slug;
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

// Export all drawios to svgs
function exportAllDrawios() {
    const jobs = Object.entries(transforms).map(([input, output]) => ({ input, output }));
    jobs.forEach(({ output }) => mkdirSync(dirname(output), { recursive: true }));

    runExportBatch({
        jobs,
        isCached: ({ input }) => drawioCache.isValid(input, getCacheFingerprint(input)),
        beforeExport: ({ output }) => {
            rmSync(output, { force: true });
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
            rmSync(output, { force: true });
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
            let svg = readFileSync(svgPath, 'utf8');
            const viewBoxMatch = svg.match(/viewBox="([^"]*)"/);
            if (!viewBoxMatch) throw new Error('Exported SVG is missing a viewBox.');
            const viewBox = viewBoxMatch[1].split(' ');
            const height = parseInt(viewBox[3]);
            const width = parseInt(viewBox[2]);
            let scaleBox = width / 1500;
            scaleBox = Math.max(1, scaleBox);
            const pad = 20 * scaleBox;
            viewBox[0] = -pad;
            viewBox[1] = -pad;
            viewBox[2] = width + pad * 2;
            const logo = { h: 57, w: 116, mt: 36 };
            let scaleDown = width / 1500;
            scaleDown = Math.max(0.7, scaleDown);
            logo.h = logo.h * scaleDown;
            logo.w = logo.w * scaleDown;
            const yShift = 56 * scaleBox;
            viewBox[3] = height + pad * 2 + logo.mt + logo.h + yShift;
            logo.y = viewBox[3] - pad * 2 - logo.h - yShift;
            const textX = logo.w + pad;
            const qrSvgContent = await generateQrSvg(qrLink);
            const qrSize = 33 * 2.4 * scaleDown;

            const mark = `<text id="drawio-title" x="0" y="${pad}" font-family="Arial" font-weight="bold" font-size="${Math.round(27 * scaleDown)}">
                            <![CDATA[${title}]]>
                        </text>
                        <g transform="translate(0, ${yShift})">
                        <text x="${textX}" y="${(logo.y + Math.round(logo.h * 0.5))}" font-family="Arial" font-weight="bold"
                                font-size="${Math.round(22 * scaleDown)}">
                            Architecture Center
                        </text>
                        <text x="${textX}" y="${logo.y + Math.round(logo.h * 0.9)}" font-family="Arial" font-style="italic"
                                font-size="${Math.round(17 * scaleDown)}">
                            Last update on ${lastUpdated}
                        </text>
                        <g transform="translate(0, ${logo.y})">
                            <image width="${logo.w}" height="${logo.h}" href="data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}" />
                        </g>
                        <text x="${width / 2 - pad}" y="${logo.y + Math.round(logo.h * 0.75)}" font-family="Arial"
                                font-size="${Math.round(20 * scaleDown)}">
                            ${smallSlug}
                        </text>
                        </g>
                        <g transform="translate(${width - qrSize}, ${viewBox[3] - pad * 2 - qrSize}) scale(${2.4 * scaleDown})">
                            ${qrSvgContent}
                        </g>`;

            const bg = `<rect x="${-pad}" y="${-pad}" width="${viewBox[2]}" height="${viewBox[3]}" fill="${SVG_BACKGROUND_COLOR}"/>`;
            svg = svg
                .replace(/<svg([^>]*)>/, '<svg$1>' + bg)
                .replace('<g>', `<g transform="translate(0, ${yShift})">`)
                .replace(/<\/svg>$/, mark + '</svg>')
                .replace(/viewBox="([^"]*)"/, `viewBox="${viewBox.join(' ')}"`)
                .replace(/height="([^"]*)"/, `height="${viewBox[3]}"`)
                .replace(/width="([^"]*)"/, `width="${viewBox[2]}"`);

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
    const refArchRoot = ROOT + '/docs/ref-arch';
    let topLevelRADirs = readdirSync(refArchRoot, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('RA') && dirent.name !== 'RA0000')
        .map(dirent => dirent.name);

    // Include subdirectories only for RA0004 for vendor specific integrations
    // through BDC as per request.
    topLevelRADirs = topLevelRADirs.concat(['RA0004/1-aws-data-integration', 'RA0004/2-azure-data-integration', 'RA0004/3-databricks-data-integration', 'RA0004/4-gcp-data-integration', 'RA0004/5-snowflake-data-integration']);
    topLevelRADirs.sort();

    for (const dirName of topLevelRADirs) {
        let readmePath;
        let drawioFilePath; // This will be the path to the original .drawio file
        let svgThumbnailSourcePath; // This will be the path to the watermarked SVG

        if (dirName === 'RA0007') {
            readmePath = join(refArchRoot, dirName, 'readme.md');
            drawioFilePath = join(refArchRoot, dirName, '5-mt-architecture', 'drawio', 'susaas-app-architecture.drawio');
            svgThumbnailSourcePath = join(refArchRoot, dirName, '5-mt-architecture', 'images', 'susaas-app-architecture.svg');
        } else if (dirName === 'RA0014') { // Explicitly handle RA0014
            readmePath = join(refArchRoot, dirName, 'readme.md');
            drawioFilePath = join(refArchRoot, dirName, 'drawio', 'measurement_landscape.drawio');
            svgThumbnailSourcePath = join(refArchRoot, dirName, 'images', 'measurement_landscape.svg');
        } else if (dirName === 'RA0025') {
            readmePath = join(refArchRoot, dirName, '1-sap-pi-po-to-integration-suite', 'readme.md');
            drawioFilePath = join(refArchRoot, dirName, '1-sap-pi-po-to-integration-suite', 'drawio', 'sap_architecture_center_is_eic_post.drawio');
            svgThumbnailSourcePath = join(refArchRoot, dirName, '1-sap-pi-po-to-integration-suite', 'images', 'sap_architecture_center_is_eic_post.svg');
        } else if (dirName.includes('RA0004/') && dirName.includes('snowflake')) {
            readmePath = join(refArchRoot, dirName, 'readme.md');
            drawioFilePath = join(refArchRoot, dirName, 'drawio', 'snowflake-solex-data-integration.drawio');
            svgThumbnailSourcePath = join(refArchRoot, dirName, 'images', 'snowflake-solex-data-integration.svg');
        } else {
            readmePath = join(refArchRoot, dirName, 'readme.md');
            const drawioDir = join(refArchRoot, dirName, 'drawio');
            if (!existsSync(drawioDir)) {
                log(`[WARNING] Skipping artifact generation for ${dirName}: No 'drawio' directory found at ${drawioDir}`);
                continue;
            }
            const drawioFile = readdirSync(drawioDir).find(file => file.endsWith('.drawio'));
            if (!drawioFile) {
                log(`[WARNING] Skipping artifact generation for ${dirName}: No .drawio file found in ${drawioDir}`);
                continue;
            }
            drawioFilePath = join(drawioDir, drawioFile);
            svgThumbnailSourcePath = join(refArchRoot, dirName, 'images', basename(drawioFile, '.drawio') + '.svg');
        }

        if (!existsSync(readmePath)) {
            log(`[WARNING] Skipping artifact generation for ${dirName}: Missing readme.md at ${readmePath}`);
            continue;
        }
        if (!existsSync(svgThumbnailSourcePath)) {
            log(`[WARNING] Skipping artifact generation for ${dirName}: Missing watermarked SVG at ${svgThumbnailSourcePath}`);
            continue;
        }

        try {
            const readmeContent = readFileSync(readmePath, 'utf8');
            const { attributes } = fm(readmeContent);
            let title = attributes.title;

            if (dirName.includes('RA0004/')) {
                title = 'SAP Business Data Cloud: ' + title;
            }

            const titleAsFileName = title.toLowerCase().replace(/[\s/]+/g, '-').replace(/:/g, '');
            const thumbnailSvgPath = join(THUMBNAILS_DIR, `${titleAsFileName}.svg`);

            // Copy the watermarked SVG to the thumbnails directory
            const watermarkedSvgContent = readFileSync(svgThumbnailSourcePath, 'utf8');
            writeFileSync(thumbnailSvgPath, watermarkedSvgContent);
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

    writeFileSync(join(ARTIFACTS_DIR, 'data.json'), JSON.stringify(allArtifacts, null, 2));
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
