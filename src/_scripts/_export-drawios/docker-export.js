const {
    copyFileSync,
    existsSync,
    lstatSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    realpathSync,
    rmSync,
    writeFileSync,
} = require('node:fs');
const { execFileSync } = require('node:child_process');
const { tmpdir } = require('node:os');
const { dirname, isAbsolute, join, relative, resolve, sep } = require('node:path');

// Full font variant v1.76.0 (Draw.io Desktop 32.5.5), verified on Docker Hub
// on 2026-10-22. The OCI index digest keeps amd64 and arm64 builds immutable.
const DRAWIO_IMAGE =
    'rlespinasse/drawio-desktop-headless:v1.76.0@sha256:b7468f89320a6b4c6d8099da224c837a03abab4832701bb4b2355e0901f805fd';
const CONTAINER_INPUT = '/input.drawio';
const CONTAINER_OUTPUT_DIR = '/output';
const CONTAINER_OUTPUT = `${CONTAINER_OUTPUT_DIR}/export.svg`;
const CONTAINER_STATE_FILE = '/opt/drawio-desktop/unwanted-lines.txt';
const CONTAINER_PASSWD_FILE = '/etc/passwd';
const MAX_EXPORTED_SVG_BYTES = 50 * 1024 * 1024;

function isPathWithin(root, candidate) {
    const relativePath = relative(root, candidate);
    return (
        relativePath === '' ||
        (relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath))
    );
}

function assertMountSafePath(hostPath) {
    if (/[\r\n,]/.test(hostPath)) {
        throw new Error(`Docker bind-mount path contains an unsupported character: ${hostPath}`);
    }
}

function validateInputPath(inputPath, allowedFilesRoot) {
    const absoluteInput = resolve(inputPath);
    const realAllowedRoot = realpathSync(allowedFilesRoot);
    const inputStat = lstatSync(absoluteInput);

    if (inputStat.isSymbolicLink() || !inputStat.isFile()) {
        throw new Error(`Draw.io input must be a regular, non-symlink file: ${absoluteInput}`);
    }

    const realInput = realpathSync(absoluteInput);
    if (!isPathWithin(realAllowedRoot, realInput)) {
        throw new Error(`Draw.io input is outside the allowed files root: ${absoluteInput}`);
    }

    assertMountSafePath(realInput);
    return realInput;
}

function validateOutputPath(outputPath, allowedFilesRoot) {
    const absoluteOutput = resolve(outputPath);
    const realAllowedRoot = realpathSync(allowedFilesRoot);
    const realOutputParent = realpathSync(dirname(absoluteOutput));

    if (!isPathWithin(realAllowedRoot, realOutputParent)) {
        throw new Error(`Draw.io output is outside the allowed files root: ${absoluteOutput}`);
    }

    if (existsSync(absoluteOutput)) {
        const outputStat = lstatSync(absoluteOutput);
        if (outputStat.isSymbolicLink() || !outputStat.isFile()) {
            throw new Error(`Draw.io output must be a regular, non-symlink file: ${absoluteOutput}`);
        }
    }

    return absoluteOutput;
}

function buildDockerArgs({
    inputPath,
    temporaryOutputDir,
    temporaryStateFile,
    temporaryPasswdFile,
    userId,
    groupId,
}) {
    [inputPath, temporaryOutputDir, temporaryStateFile, temporaryPasswdFile].forEach(assertMountSafePath);

    return [
        'run',
        '--rm',
        '--read-only',
        '--cap-drop=ALL',
        '--security-opt=no-new-privileges:true',
        '--pids-limit=256',
        `--user=${userId}:${groupId}`,
        '--env',
        'HOME=/tmp/drawio-home',
        '--tmpfs',
        '/tmp:rw,nosuid,nodev,noexec,size=256m,mode=1777',
        '--tmpfs',
        '/run:rw,nosuid,nodev,noexec,size=16m,mode=0755',
        '--shm-size=256m',
        '--mount',
        `type=bind,source=${inputPath},target=${CONTAINER_INPUT},readonly`,
        '--mount',
        `type=bind,source=${temporaryOutputDir},target=${CONTAINER_OUTPUT_DIR}`,
        '--mount',
        `type=bind,source=${temporaryStateFile},target=${CONTAINER_STATE_FILE}`,
        '--mount',
        `type=bind,source=${temporaryPasswdFile},target=${CONTAINER_PASSWD_FILE},readonly`,
        DRAWIO_IMAGE,
        '--export',
        '--embed-svg-images',
        '--svg-theme',
        'light',
        '--output',
        CONTAINER_OUTPUT,
        CONTAINER_INPUT,
    ];
}

function validateTemporarySvg(svgPath) {
    const svgStat = lstatSync(svgPath);
    if (svgStat.isSymbolicLink() || !svgStat.isFile()) {
        throw new Error('Draw.io exporter did not create a regular SVG file.');
    }
    if (svgStat.size === 0 || svgStat.size > MAX_EXPORTED_SVG_BYTES) {
        throw new Error(`Draw.io exporter produced an invalid SVG size: ${svgStat.size} bytes.`);
    }

    const svg = readFileSync(svgPath, 'utf8');
    if (!/<svg(?:\s|>)/i.test(svg)) {
        throw new Error('Draw.io exporter output is not an SVG document.');
    }
}

function exportDrawioWithDocker({
    inputPath,
    outputPath,
    allowedFilesRoot,
    repositoryRoot,
    runDocker = execFileSync,
}) {
    const realInput = validateInputPath(inputPath, allowedFilesRoot);
    const absoluteOutput = validateOutputPath(outputPath, allowedFilesRoot);
    const realRepositoryRoot = realpathSync(repositoryRoot);
    const userId = process.getuid?.();
    const groupId = process.getgid?.();
    if (!Number.isInteger(userId) || !Number.isInteger(groupId)) {
        throw new Error('Docker-based Draw.io export requires a Unix user and group ID.');
    }
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'architecture-center-drawio-'));

    try {
        const realTemporaryRoot = realpathSync(temporaryRoot);
        if (isPathWithin(realRepositoryRoot, realTemporaryRoot)) {
            throw new Error('Draw.io temporary output directory must be outside the repository.');
        }

        const temporaryOutputDir = join(realTemporaryRoot, 'output');
        const temporaryStateFile = join(realTemporaryRoot, 'unwanted-lines.txt');
        const temporaryPasswdFile = join(realTemporaryRoot, 'passwd');
        const temporarySvg = join(temporaryOutputDir, 'export.svg');
        mkdirSync(temporaryOutputDir);
        writeFileSync(temporaryStateFile, '');
        writeFileSync(
            temporaryPasswdFile,
            `drawio:x:${userId}:${groupId}:Draw.io Exporter:/tmp/drawio-home:/usr/sbin/nologin\n`
        );

        const args = buildDockerArgs({
            inputPath: realInput,
            temporaryOutputDir,
            temporaryStateFile,
            temporaryPasswdFile,
            userId,
            groupId,
        });
        const stdout = runDocker('docker', args, { encoding: 'utf8', timeout: 600000 });

        validateTemporarySvg(temporarySvg);
        copyFileSync(temporarySvg, absoluteOutput);
        return stdout;
    } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
    }
}

module.exports = {
    DRAWIO_IMAGE,
    buildDockerArgs,
    exportDrawioWithDocker,
};
