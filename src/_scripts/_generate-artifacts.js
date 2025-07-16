const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const { normalize: normalizePath, dirname, basename, join } = require('node:path');
const fm = require('front-matter');

const log = console.log;

// DOCKER=1 -> run drawio cli via docker
const { DOCKER = 0 } = process.env;
// searching in different directories, depending on OS
const isMac = process.platform === 'darwin';
const DRAWIO_CLI_BINARY = isMac
    ? '/Applications/draw.io.app/Contents/MacOS/draw.io'
    : 'C:\\Program Files\\draw.io\\draw.io.exe';
// assuming script is in src/_scripts/
const ROOT = normalizePath(__dirname + '/../..');
const SEARCH_DIR = ROOT + '/docs/ref-arch';
const ARTIFACTS_DIR = ROOT + '/static/artifacts';
const THUMBNAILS_DIR = ARTIFACTS_DIR + '/thumbnails';
const BASE_URL = 'https://architecture.learning.sap.com';

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

if (!existsSync(ARTIFACTS_DIR)) mkdirSync(ARTIFACTS_DIR, { recursive: true });
if (!existsSync(THUMBNAILS_DIR)) mkdirSync(THUMBNAILS_DIR, { recursive: true });

const refArchDirs = readdirSync(SEARCH_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('RA') && dirent.name !== 'RA0000')
    .map(dirent => dirent.name);

async function generateArtifacts() {
    const allArtifacts = [];

    for (const dirName of refArchDirs) {
        const refArchPath = join(SEARCH_DIR, dirName);
        const readmePath = join(refArchPath, 'readme.md');
        const drawioDir = join(refArchPath, 'drawio');

        if (!existsSync(readmePath) || !existsSync(drawioDir)) {
            log(`Skipping ${dirName} as it does not contain a readme.md or a drawio directory.`);
            continue;
        }

        const readmeContent = readFileSync(readmePath, 'utf8');
        const { attributes } = fm(readmeContent);

        const drawioFile = readdirSync(drawioDir).find(file => file.endsWith('.drawio'));

        if (!drawioFile) {
            log(`Skipping ${dirName} as it does not contain a .drawio file.`);
            continue;
        }

        const drawioPath = join(drawioDir, drawioFile);
        const titleAsFileName = attributes.title.toLowerCase().replace(/\s+/g, '-');
        const svgPath = join(THUMBNAILS_DIR, `${titleAsFileName}.svg`);

        try {
            let cmd = DRAWIO_CLI_BINARY;
            let args = ['--export', '--output', svgPath, drawioPath];
            if (DOCKER) {
                const d = 'docs/';
                const dockerDrawioPath = d + drawioPath.split(d)[1];
                const dockerSvgPath = 'static/artifacts/thumbnails/' + basename(svgPath);
                cmd = 'docker';
                args = ['run', '-w', '/data', '-v', `${ROOT}:/data`, 'rlespinasse/drawio-desktop-headless', '--export', '--output', dockerSvgPath, dockerDrawioPath];
            }

            execFileSync(cmd, args, { encoding: 'utf8' });
            log(`Exported ${drawioPath} to ${svgPath}`);

            allArtifacts.push({
                id: dirName.toLowerCase(),
                name: attributes.title,
                drawioLink: `${BASE_URL}/docs/ref-arch/${dirName}/drawio/${drawioFile}`,
                thumbnailLink: `${BASE_URL}/artifacts/thumbnails/${titleAsFileName}.svg`,
                acLink: `${BASE_URL}/docs/ref-arch${attributes.slug}`,
                shortDescription: attributes.description,
            });

        } catch (e) {
            log(`Failed to process ${dirName}. Error: ${e.message}`);
        }
    }

    writeFileSync(join(ARTIFACTS_DIR, 'data.json'), JSON.stringify(allArtifacts, null, 2));
    log('Successfully generated artifacts.');
}

generateArtifacts().catch(e => {
    log('Error generating artifacts:', e);
    process.exit(1);
});
