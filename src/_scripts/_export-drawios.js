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
const BASE_URL = 'https://architecture.learning.sap.com'; // Changed from URL to BASE_URL for consistency with generate-artifacts.js
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

if (!existsSync(ARTIFACTS_DIR)) mkdirSync(ARTIFACTS_DIR, { recursive: true }); // Added for artifacts generation
if (!existsSync(THUMBNAILS_DIR)) mkdirSync(THUMBNAILS_DIR, { recursive: true }); // Added for thumbnails generation

// Function to recursively find .drawio files and their corresponding readme.md
function findDrawioFilesAndReadmes(baseDir) {
    const foundFiles = [];
    const refArchDirs = readdirSync(baseDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('RA'))
        .map(dirent => dirent.name);

    for (const dirName of refArchDirs) {
        const refArchPath = join(baseDir, dirName);
        const readmePath = join(refArchPath, 'readme.md');

        // Special handling for RA0007
        if (dirName === 'RA0007') {
            const nestedDrawioPath = join(refArchPath, '5-mt-architecture', 'drawio');
            if (existsSync(readmePath) && existsSync(nestedDrawioPath)) {
                const drawioFile = readdirSync(nestedDrawioPath).find(file => file.endsWith('.drawio'));
                if (drawioFile) {
                    foundFiles.push({
                        drawioPath: join(nestedDrawioPath, drawioFile),
                        readmePath: readmePath,
                        dirName: dirName
                    });
                } else {
                    log(`[WARNING] Skipping ${dirName}: No .drawio file found in ${nestedDrawioPath}`);
                }
            } else {
                log(`[WARNING] Skipping ${dirName}: Missing readme.md at ${readmePath} or drawio directory at ${nestedDrawioPath}`);
            }
            continue; // Skip standard processing for RA0007
        }

        // Standard processing for other RAs
        const drawioDir = join(refArchPath, 'drawio');
        if (existsSync(readmePath) && existsSync(drawioDir)) {
            const drawioFile = readdirSync(drawioDir).find(file => file.endsWith('.drawio'));
            if (drawioFile) {
                foundFiles.push({
                    drawioPath: join(drawioDir, drawioFile),
                    readmePath: readmePath,
                    dirName: dirName
                });
            } else {
                log(`[WARNING] Skipping ${dirName}: No .drawio file found in ${drawioDir}`);
            }
        } else {
            log(`[WARNING] Skipping ${dirName}: Missing readme.md at ${readmePath} or drawio directory at ${drawioDir}`);
        }
    }
    return foundFiles;
}

const allDrawioInfo = findDrawioFilesAndReadmes(SEARCH_DIR);
log(`Found ${allDrawioInfo.length} drawios to export to svg and generate artifacts from.\n`);

const transforms = {};
const artifactData = []; // To store data for data.json

async function processDrawios() {
    for (const { drawioPath, readmePath, dirName } of allDrawioInfo) {
        const name = basename(drawioPath, '.drawio');
        const baseDir = dirname(drawioPath);
        const outputDir = join(SEARCH_DIR, baseDir.replace(SEARCH_DIR, ''), '..', 'images'); // Adjust outputDir to be relative to SEARCH_DIR
        const svgPath = join(outputDir, `${name}.svg`);

        transforms[drawioPath] = svgPath;

        // Export drawio to SVG
        const dir = dirname(svgPath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); // Ensure recursive creation

        try {
            let cmd = DRAWIO_CLI_BINARY;
            let args = ['--export', '--embed-svg-images', '--svg-theme', 'light', '--output'];
            if (DOCKER) {
                const d = 'docs/';
                const relativeSvgPath = d + svgPath.split(d)[1];
                const relativeDrawioPath = d + drawioPath.split(d)[1];
                cmd = 'docker';
                args = ['run', '-w', '/data', '-v', `${ROOT}:/data`, 'rlespinasse/drawio-desktop-headless'].concat(args);
                args.push(relativeSvgPath, relativeDrawioPath);
            } else {
                args.push(svgPath, drawioPath);
            }

            const stdout = execFileSync(cmd, args, { encoding: 'utf8' });
            log(prettyPaths(stdout));

            if (GITHUB_ACTIONS) {
                const user = userInfo().username;
                const group = execFileSync('id', ['-gn'], { encoding: 'utf8' }).trim();
                execFileSync('sudo', ['chown', '-R', `${user}:${group}`, dir]);
            }
        } catch (e) {
            log(`[ERROR] Export failed for ${drawioPath} -> ${svgPath}. Error: ${e.message}`);
            continue; // Continue to next drawio instead of aborting
        }

        // Watermark and generate thumbnail
        try {
            let svgContent = readFileSync(svgPath, 'utf8');
            const viewBox = svgContent.match(/viewBox="([^"]*)"/)[1].split(' ');
            const height = parseInt(viewBox[3]);
            const width = parseInt(viewBox[2]);
            let scaleBox = width / 1500;
            scaleBox = Math.max(1, scaleBox);
            const pad = 20 * scaleBox;
            viewBox[0] = -pad;
            viewBox[1] = -pad;
            viewBox[2] = width + pad * 2;
            const logo = { h: 52, w: 106, mt: 28 };
            logo.y = height + logo.mt;
            let scaleDown = width / 1500;
            scaleDown = Math.max(0.7, scaleDown);
            logo.h = logo.h * scaleDown;
            logo.w = logo.w * scaleDown;
            const yShift = 56 * scaleBox;
            viewBox[3] = height + pad * 2 + logo.mt + logo.h + yShift;
            const textX = logo.w + pad;

            const iso = execFileSync('git', ['log', '-1', '--format=%cd', '--date=iso', drawioPath]);
            const lastUpdate = new Date(iso).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
            });

            const logoSvg = readFileSync(SAP_LOGO, 'utf8');
            const readmeContent = readFileSync(readmePath, 'utf8');
            const { attributes } = fm(readmeContent);
            let title = attributes.title;
            if (title.includes('#')) title = title.split('#')[0];
            const slug = attributes.slug;
            const smallSlug = slug.match(/\/ref-arch\/(\S+)/)?.[1] || '';
            // Ensure the QR code link includes the /docs path
            const qrLink = `${BASE_URL}/docs${slug}`;
            const qrSvgContent = await generateQrSvg(qrLink);
            const qrSize = 33 * 1.9 * scaleDown;

            const mark = `<text x="0" y="${pad}" font-family="Arial" font-weight="bold" font-size="${Math.round(22 * scaleDown)}">
                            <![CDATA[${title}]]>
                        </text>
                        <g transform="translate(0, ${yShift})">
                        <text x="${textX}" y="${logo.y + Math.round(logo.h * 0.5)}" font-family="Arial" font-weight="bold"
                                font-size="${Math.round(20 * scaleDown)}">
                            Architecture Center
                        </text>
                        <text x="${textX}" y="${logo.y + Math.round(logo.h * 0.9)}" font-family="Arial" font-style="italic"
                                font-size="${Math.round(16 * scaleDown)}">
                            Last update on ${lastUpdate}
                        </text>
                        <g transform="translate(0, ${logo.y})">
                            <image width="${logo.w}" height="${logo.h}" href="data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}" />
                        </g>
                        <text x="${width / 2 - pad}" y="${logo.y + Math.round(logo.h * 0.75)}" font-family="Arial"
                                font-size="${Math.round(18 * scaleDown)}">
                            ${smallSlug}
                        </text>
                        </g>
                        <g transform="translate(${width - qrSize}, ${viewBox[3] - pad * 2 - qrSize}) scale(${1.9 * scaleDown})">
                            ${qrSvgContent}
                        </g>`;

            const bg = `<rect x="${-pad}" y="${-pad}" width="${viewBox[2]}" height="${viewBox[3]}" fill="${SVG_BACKGROUND_COLOR}"/>`;
            svgContent = svgContent
                .replace(/<svg([^>]*)>/, '<svg$1>' + bg)
                .replace('<g>', `<g transform="translate(0, ${yShift})">`)
                .replace(/<\/svg>$/, mark + '</svg>')
                .replace(/viewBox="([^"]*)"/, `viewBox="${viewBox.join(' ')}"`)
                .replace(/height="([^"]*)"/, `height="${viewBox[3]}"`)
                .replace(/width="([^"]*)"/, `width="${viewBox[2]}"`);

            writeFileSync(svgPath, svgContent);
            log(prettyPaths('Watermarked ' + svgPath));

            // Generate thumbnail from the watermarked SVG
            const titleAsFileName = attributes.title.toLowerCase().replace(/\s+/g, '-');
            const thumbnailSvgPath = join(THUMBNAILS_DIR, `${titleAsFileName}.svg`);

            // Copy the watermarked SVG to the thumbnails directory
            writeFileSync(thumbnailSvgPath, svgContent);
            log(`Generated thumbnail: ${thumbnailSvgPath}`);

            artifactData.push({
                id: dirName.toLowerCase(),
                name: attributes.title,
                drawioLink: `${BASE_URL}/docs/ref-arch/${dirName}/drawio/${basename(drawioPath)}`, // Adjusted drawioLink
                thumbnailLink: `${BASE_URL}/artifacts/thumbnails/${titleAsFileName}.svg`,
                acLink: `${BASE_URL}/docs/ref-arch${attributes.slug}`,
                shortDescription: attributes.description,
            });

        } catch (e) {
            log(`[ERROR] Failed to watermark or generate thumbnail for ${svgPath}. Error: ${e.message}`);
        }
    }

    // Write data.json
    writeFileSync(join(ARTIFACTS_DIR, 'data.json'), JSON.stringify(artifactData, null, 2));
    log('Successfully generated artifacts data.json.');
}

// generate qrcode, only get inner part
async function generateQrSvg(link) {
    const rawSvg = await QRCode.toString(link, { type: 'svg', margin: 0 });
    const qrInner = rawSvg.replace(/<\/*svg[^>]*>/g, '');
    return qrInner;
}

function prettyPaths(log) {
    const strip = DOCKER ? 'docs/ref-arch/' : SEARCH_DIR + '/';
    return log.replaceAll(strip, '').replaceAll('\n', '');
}

processDrawios().catch(e => {
    log('Error during processing:', e);
    process.exit(1);
});
