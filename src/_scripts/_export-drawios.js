const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require('node:fs');
const { execSync } = require('node:child_process');
const { normalize: normalizePath, dirname } = require('node:path');

// SCRIPT CAN BE RUN NATIVELY ON MAC OR VIA DOCKER.
// THE FORMER REQUIRES DRAWIO TO BE INSTALLED
const log = console.log;

// DOCKER=1 -> run drawio cli via docker
const { DOCKER = 0 } = process.env;
const GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true' ? true : false;
const DRAWIO_CLI_MAC_BINARY = '/Applications/draw.io.app/Contents/MacOS/draw.io';
// assuming script is in src/_scripts/
const ROOT = normalizePath(__dirname + '/../..');
const SEARCH_DIR = ROOT + '/docs/ref-arch';
const SAP_LOGO = __dirname + '/../../static/img/logo.svg';
const SVG_BACKGROUND_COLOR = '#ffffff';
const URL = 'https://architecture.cloud.sap';

if (!DOCKER) {
    try {
        execSync(DRAWIO_CLI_MAC_BINARY + ' -h', { encoding: 'utf8' });
    } catch (e) {
        const msg = `Cannot find Drawio executable at ${DRAWIO_CLI_MAC_BINARY}. For now only Mac is supported. Set DOCKER=1 to run Drawio CLI via docker (if installed)`;
        throw new Error(msg, { cause: e });
    }
}

const files = readdirSync(SEARCH_DIR, { recursive: true });
const drawios = files.filter((file) => file.match(/\.drawio$/));
log(`Found ${drawios.length} drawios to export to svg\n`);

const transforms = {};
// drawio as in RA0001/drawio/Events-to-business-actions-framework.drawio
for (const drawio of drawios) {
    // Events-to-business-actions-framework part
    const name = drawio.split('/').slice(-1)[0].split('.')[0];
    const svg = `${SEARCH_DIR}/${drawio.split('/drawio/')[0]}/images/${name}.svg`;
    transforms[`${SEARCH_DIR}/${drawio}`] = svg;
}

// export all drawios to svgs
for (const [input, out] of Object.entries(transforms)) {
    const dir = dirname(out);
    if (!existsSync(dir)) mkdirSync(dir);
    const cmd = prepareCommand(input, out);
    try {
        // try sync variant first to not overwhelm runner in GitHub workflow
        const stdout = execSync(cmd, { encoding: 'utf8' });
        log(prettyPaths(stdout));
        // github workflow: docker creates files as root! set proper owner
        if (GITHUB_ACTIONS) execSync(`sudo chown -R $(whoami):$(id -gn) ${dir}`);
    } catch (e) {
        const msg = prettyPaths(`Export failed ${input} -> ${out}, aborting now`);
        // let's fail early
        throw new Error(msg, { cause: e });
    }
}
log('\n');

function prepareCommand(input, out) {
    if (DOCKER) {
        // make relative, docker doesn't have same dir structure
        const d = 'docs/';
        out = d + out.split(d)[1];
        input = d + input.split(d)[1];
    }

    // put path in quotes because there are spaces sometimes
    const args = ` --export --embed-svg-images --svg-theme light --output "${out}" "${input}"`;
    const cmd =
        (!DOCKER ? DRAWIO_CLI_MAC_BINARY : `docker run -w /data -v ${ROOT}:/data rlespinasse/drawio-desktop-headless`) +
        args;
    return cmd;
}

// watermark the svgs, which were created in the previous step
for (const [drawioPath, svgPath] of Object.entries(transforms)) {
    let svg = readFileSync(svgPath, 'utf8');
    const viewBox = svg.match(/viewBox="([^"]*)"/)[1].split(' ');
    const height = parseInt(viewBox[3]);
    const width = parseInt(viewBox[2]);
    // finding these exact values is a bit trial and error..
    const pad = 20;
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
    // have now title of solution diagram on top
    // need to shift everything else
    const yShift = 56;
    viewBox[3] = height + pad * 2 + logo.mt + logo.h + yShift;
    const textX = logo.w + pad;

    try {
        const iso = execSync(`git log -1 --format=%cd --date=iso "${drawioPath}"`);
        const lastUpdate = new Date(iso).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const logoSvg = readFileSync(SAP_LOGO, 'utf8');
        const frontmatter = readFileSync(drawioPath.split('drawio/')[0] + 'readme.md', 'utf8').split('---')[1];
        let title = frontmatter.match(/^title:\s(.*)$/m)[1];
        if (title.includes('#')) title = title.split('#')[0];
        const slug = frontmatter.match(/^slug:\s(\S+)/m)[1];
        const mark = `<text x="0" y="${pad}" font-family="Arial" font-weight="bold" font-size="22">
                        <![CDATA[${title}]]>
                    </text>
                    <g transform="translate(0, ${yShift})">
                    <text x="${textX}" y="${logo.y + 20}" font-family="Arial" font-weight="bold" font-size="20">
                        Architecture Center
                    </text>
                    <text x="${textX}" y="${logo.y + logo.h - 4}" font-family="Arial" font-style="italic" font-size="16">
                        Last update on ${lastUpdate}
                    </text>
                    <g transform="translate(0, ${logo.y})">
                        <image width="${logo.w}" height="${logo.h}" href="data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}" />
                    </g>
                    <text x="${width / 2}" y="${logo.y + 36}" font-family="Arial" font-size="18">
                        ${URL + slug}
                    </text>
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

function prettyPaths(log) {
    const strip = DOCKER ? 'docs/ref-arch/' : SEARCH_DIR + '/';
    return log.replaceAll(strip, '').replaceAll('\n', '');
}
