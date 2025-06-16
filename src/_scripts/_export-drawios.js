const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require('node:fs');
const { execFileSync, execSync } = require('node:child_process');
const { normalize: normalizePath, dirname, basename, join } = require('node:path');
const { userInfo } = require('os');
const QRCode = require('qrcode');

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
const URL = 'https://architecture.learning.sap.com/docs';

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

const files = readdirSync(SEARCH_DIR, { recursive: true });
const drawios = files.filter((file) => file.match(/\.drawio$/));
log(`Found ${drawios.length} drawios to export to svg\n`);

const transforms = {};
// drawio as in RA0001/drawio/Events-to-business-actions-framework.drawio
for (const drawio of drawios) {
    // origin directory of the drawio
    const fullInput = join(SEARCH_DIR, drawio);
    const name = basename(drawio, '.drawio');
    const baseDir = dirname(drawio);
    const outputDir = join(SEARCH_DIR, baseDir, '..', 'images');
    // final path for the svg
    const svg = join(outputDir, `${name}.svg`);
    transforms[fullInput] = svg;
}

// export all drawios to svgs
for (let [input, out] of Object.entries(transforms)) {
    const dir = dirname(out);
    if (!existsSync(dir)) mkdirSync(dir);
    try {
        let cmd = DRAWIO_CLI_BINARY;
        let args = ['--export', '--embed-svg-images', '--svg-theme', 'light', '--output'];
        if (DOCKER) {
            // make relative, docker doesn't have same dir structure
            const d = 'docs/';
            out = d + out.split(d)[1];
            input = d + input.split(d)[1];
            cmd = 'docker';
            args = ['run', '-w', '/data', '-v', `${ROOT}:/data`, 'rlespinasse/drawio-desktop-headless'].concat(args);
        }
        args.push(out, input);

        // try sync variant first to not overwhelm runner in GitHub workflow
        const stdout = execFileSync(cmd, args, { encoding: 'utf8' });
        log(prettyPaths(stdout));
        // github workflow: docker creates files as root! set proper owner
        if (GITHUB_ACTIONS) {
            const user = userInfo().username;
            const group = execFileSync('id', ['-gn'], { encoding: 'utf8' }).trim();
            execFileSync('sudo', ['chown', '-R', `${user}:${group}`, dir]);
        }
    } catch (e) {
        const msg = prettyPaths(`Export failed ${input} -> ${out}, aborting now`);
        // let's fail early
        throw new Error(msg, { cause: e });
    }
}
log('\n');

// generate qrcode, only get inner part
async function generateQrSvg(link) {
    const rawSvg = await QRCode.toString(link, { type: 'svg', margin: 0 });
    const qrInner = rawSvg.replace(/<\/*svg[^>]*>/g, '');
    return qrInner;
}

// watermark the svgs, which were created in the previous step
async function watermarkAll() {
    for (const [drawioPath, svgPath] of Object.entries(transforms)) {
        let svg = readFileSync(svgPath, 'utf8');
        const viewBox = svg.match(/viewBox="([^"]*)"/)[1].split(' ');
        const height = parseInt(viewBox[3]);
        const width = parseInt(viewBox[2]);
        // scale factor for pad and yShift to adjust for wide svgs
        let scaleBox = width / 1500;
        scaleBox = Math.max(1, scaleBox);
        // finding these exact values is a bit trial and error..
        const pad = 20 * scaleBox;
        viewBox[0] = -pad;
        viewBox[1] = -pad;
        viewBox[2] = width + pad * 2; // add padding left/right
        const logo = {
            h: 52,
            w: 106,
            // margin top of logo
            mt: 28,
        };
        logo.y = height + logo.mt;

        // ensure watermark doesn't get to big for smaller & bigger diagrams
        let scaleDown = width / 1500;
        scaleDown = Math.max(0.7, scaleDown);
        logo.h = logo.h * scaleDown;
        logo.w = logo.w * scaleDown;

        // have now title of solution diagram on top
        // need to shift everything else
        const yShift = 56 * scaleBox;
        viewBox[3] = height + pad * 2 + logo.mt + logo.h + yShift;
        const textX = logo.w + pad;

        try {
            const iso = execFileSync('git', ['log',  '-1', '--format=%cd', '--date=iso', drawioPath]);
            const lastUpdate = new Date(iso).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            const logoSvg = readFileSync(SAP_LOGO, 'utf8');
            const readmePath = join(dirname(drawioPath), '..', 'readme.md');
            const frontmatter = readFileSync(readmePath, 'utf8').split('---')[1];
            let title = frontmatter.match(/^title:\s(.*)$/m)[1];
            if (title.includes('#')) title = title.split('#')[0];
            const slug = frontmatter.match(/^slug:\s(\S+)/m)[1];
            const smallSlug = frontmatter.match(/^slug:\s\/ref-arch\/(\S+)/m)[1];
            const qrSvgContent = await generateQrSvg(URL + slug);
            // Set qrSize to dynamically position the qrCode later (33 = original qrCode width)
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
            svg = svg
                // leave svg opening tag unchanged, but add rect element to set background color
                .replace(/<svg([^>]*)>/, '<svg$1>' + bg)
                // this g contains the diagram
                .replace('<g>', `<g transform="translate(0, ${yShift})">`)
                .replace(/<\/svg>$/, mark + '</svg>')
                .replace(/viewBox="([^"]*)"/, `viewBox="${viewBox.join(' ')}"`)
                // height attribute was set to same as viewbox height, so update it too
                .replace(/height="([^"]*)"/, `height="${viewBox[3]}"`)
                .replace(/width="([^"]*)"/, `width="${viewBox[2]}"`);

            writeFileSync(svgPath, svg);
            log(prettyPaths('Watermarked ' + svgPath));
        } catch (e) {
            const msg = prettyPaths(`Failed to watermark ${svgPath}, aborting now`);
            throw new Error(msg, { cause: e });
        }
    }
}

watermarkAll();

function prettyPaths(log) {
    const strip = DOCKER ? 'docs/ref-arch/' : SEARCH_DIR + '/';
    return log.replaceAll(strip, '').replaceAll('\n', '');
}
