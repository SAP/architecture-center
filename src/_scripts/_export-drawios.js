const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require('node:fs');
const { execFileSync, execSync } = require('node:child_process');
const { normalize: normalizePath, dirname, basename, join } = require('node:path');
const { userInfo } = require('os');
const QRCode = require('qrcode');
const fm = require('front-matter'); // Added for front-matter parsing

const log = console.log;

// DOCKER=1 -> run drawio cli via docker
const { DOCKER = 0 } = process.env;
const GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true' ? true : false;
// searching in different directories, depending on OS
const isMac = process.platform === 'darwin';
const DRAWIO_CLI_BINARY = isMac
    ? '/Applications/draw.io.app/Contents/MacOS/draw.io'
    : 'C:\\Program Files\\draw.io\\draw.io.exe';
// assuming script is in src/_scripts/
const ROOT = normalizePath(__dirname + '/../..');
const SEARCH_DIR = ROOT + '/docs/ref-arch';
const SAP_LOGO = __dirname + '/../../static/img/logo.svg';
const SVG_BACKGROUND_COLOR = '#ffffff';
const BASE_URL = 'https://architecture.learning.sap.com'; // Changed from URL to BASE_URL for consistency
const ARTIFACTS_DIR = ROOT + '/static/artifacts'; // Added for artifacts generation
const THUMBNAILS_DIR = ARTIFACTS_DIR + '/thumbnails'; // Added for thumbnails generation

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

// Ensure artifacts directories exist
if (!existsSync(ARTIFACTS_DIR)) mkdirSync(ARTIFACTS_DIR, { recursive: true });
if (!existsSync(THUMBNAILS_DIR)) mkdirSync(THUMBNAILS_DIR, { recursive: true });

// --- Phase 1: Export and Watermark all Draw.io files ---

const files = readdirSync(ROOT + '/docs', { recursive: true }); // Scan all docs for drawio files
const drawios = files.filter((file) => file.match(/\.drawio$/));
log(`Found ${drawios.length} drawios to export to svg\n`);

const transforms = {}; // Maps original drawio path to output SVG path
for (const drawio of drawios) {
    const fullInput = join(ROOT + '/docs', drawio); // Full path to the drawio file
    const name = basename(drawio, '.drawio');
    const baseDir = dirname(drawio);
    const outputDir = join(ROOT + '/docs', baseDir, '..', 'images'); // Output SVG to 'images' dir relative to its parent
    const svg = join(outputDir, `${name}.svg`);
    transforms[fullInput] = svg;
}

// Export all drawios to svgs
function exportAllDrawios() {
    for (let [input, out] of Object.entries(transforms)) {
        const dir = dirname(out);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); // Ensure recursive creation

        try {
            let cmd = DRAWIO_CLI_BINARY;
            let args = ['--export', '--embed-svg-images', '--svg-theme', 'light', '--output'];
            if (DOCKER) {
                const d = 'docs/';
                const relativeOut = d + out.split(d)[1];
                const relativeInput = d + input.split(d)[1];
                cmd = 'docker';
                args = [
                    'run',
                    '--rm',
                    '--timeout=300',
                    '-w', '/data',
                    '-v', `${ROOT}:/data`,
                    'rlespinasse/drawio-desktop-headless'
                ].concat(args);
                args.push(relativeOut, relativeInput);

                log(`[DEBUG] Docker command: ${cmd} ${args.join(' ')}`);
            } else {
                args.push(out, input);
            }

            const stdout = execFileSync(cmd, args, {
                encoding: 'utf8',
                timeout: 300000, // 5 minutes timeout
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            log(prettyPaths(stdout));

            if (GITHUB_ACTIONS) {
                const user = userInfo().username;
                const group = execFileSync('id', ['-gn'], { encoding: 'utf8' }).trim();
                execFileSync('sudo', ['chown', '-R', `${user}:${group}`, dir]);
            }
        } catch (e) {
            const msg = prettyPaths(`Export failed ${input} -> ${out}`);
            log(`[ERROR] ${msg}`);
            log(`[ERROR] Command: ${cmd} ${args ? args.join(' ') : ''}`);
            log(`[ERROR] Exit code: ${e.status}`);
            log(`[ERROR] Signal: ${e.signal}`);
            log(`[ERROR] Stdout: ${e.stdout || 'empty'}`);
            log(`[ERROR] Stderr: ${e.stderr || 'empty'}`);

            // Don't abort on single file failure, continue with other files
            log(`[WARNING] Skipping failed export: ${input}`);
            continue;
        }
    }
    log('\n');
}

// generate qrcode, only get inner part
async function generateQrSvg(link) {
    const rawSvg = await QRCode.toString(link, { type: 'svg', margin: 0 });
    const qrInner = rawSvg.replace(/<\/*svg[^>]*>/g, '');
    return qrInner;
}

// Watermark the svgs, which were created in the previous step
async function watermarkAll() {
    for (const [drawioPath, svgPath] of Object.entries(transforms)) {
        let svg = readFileSync(svgPath, 'utf8');
        const viewBox = svg.match(/viewBox="([^"]*)"/)[1].split(' ');
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

        try {
            const iso = execFileSync('git', ['log', '-1', '--format=%cd', '--date=iso', drawioPath]);
            const lastUpdate = new Date(iso).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
            });

            const logoSvg = readFileSync(SAP_LOGO, 'utf8');
            // Determine readmePath based on drawioPath
            let currentReadmePath;
            if (drawioPath.includes('RA0007/5-mt-architecture/drawio/')) {
                currentReadmePath = join(ROOT, 'docs', 'ref-arch', 'RA0007', 'readme.md');
            } else {
                currentReadmePath = join(dirname(drawioPath), '..', 'readme.md');
            }

            const readmeContent = readFileSync(currentReadmePath, 'utf8');
            const { attributes } = fm(readmeContent);
            let title = attributes.title;
            if (title.includes('#')) title = title.split('#')[0];
            const slug = attributes.slug;
            const smallSlug = slug.match(/\/ref-arch\/(\S+)/)?.[1] || '';
            const qrLink = `${BASE_URL}/docs${slug}`; // Corrected QR link
            const qrSvgContent = await generateQrSvg(qrLink);
            const qrSize = 33 * 2.4 * scaleDown;

            const mark = `<text x="0" y="${pad}" font-family="Arial" font-weight="bold" font-size="${Math.round(27 * scaleDown)}">
                            <![CDATA[${title}]]>
                        </text>
                        <g transform="translate(0, ${yShift})">
                        <text x="${textX}" y="${(logo.y + Math.round(logo.h * 0.5))}" font-family="Arial" font-weight="bold"
                                font-size="${Math.round(22 * scaleDown)}">
                            Architecture Center
                        </text>
                        <text x="${textX}" y="${logo.y + Math.round(logo.h * 0.9)}" font-family="Arial" font-style="italic"
                                font-size="${Math.round(17 * scaleDown)}">
                            Last update on ${lastUpdate}
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
            log(prettyPaths('Watermarked ' + svgPath));
        } catch (e) {
            log(`[ERROR] Failed to watermark ${svgPath}. Error: ${e.message}`);
            // Do not throw, continue processing other files
        }
    }
}

// --- Phase 2: Generate Artifacts for Top-Level RAs ---

async function generateArtifacts() {
    const allArtifacts = [];
    const refArchRoot = ROOT + '/docs/ref-arch';
    const topLevelRADirs = readdirSync(refArchRoot, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('RA') && dirent.name !== 'RA0000')
        .map(dirent => dirent.name);

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
        }
        else {
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

            const titleAsFileName = attributes.title.toLowerCase().replace(/\s+/g, '-');
            const thumbnailSvgPath = join(THUMBNAILS_DIR, `${titleAsFileName}.svg`);

            // Copy the watermarked SVG to the thumbnails directory
            const watermarkedSvgContent = readFileSync(svgThumbnailSourcePath, 'utf8');
            writeFileSync(thumbnailSvgPath, watermarkedSvgContent);
            log(`Generated thumbnail: ${thumbnailSvgPath}`);

            allArtifacts.push({
                id: dirName.toLowerCase(),
                name: attributes.title,
                // Use a placeholder for drawioLink, to be updated in a post-build step
                drawioLink: `PLACEHOLDER:${basename(drawioFilePath)}`,
                thumbnailLink: `${BASE_URL}/artifacts/thumbnails/${titleAsFileName}.svg`,
                acLink: `${BASE_URL}/docs${attributes.slug}`,
                shortDescription: attributes.description,
            });

        } catch (e) {
            log(`[ERROR] Failed to generate artifact for ${dirName}. Error: ${e.message}`);
        }
    }

    writeFileSync(join(ARTIFACTS_DIR, 'data.json'), JSON.stringify(allArtifacts, null, 2));
    log('Successfully generated artifacts data.json.');
}

function prettyPaths(log) {
    const strip = DOCKER ? 'docs/' : ROOT + '/docs/'; // Adjusted strip path for full docs scan
    return log.replaceAll(strip, '').replaceAll('\n', '');
}

// Main execution flow
async function main() {
    exportAllDrawios(); // Phase 1: Export and watermark all drawios
    await watermarkAll(); // Phase 1: Apply watermarks
    await generateArtifacts(); // Phase 2: Generate artifacts for top-level RAs
}

main().catch(e => {
    log('Error during processing:', e);
    process.exit(1);
});
