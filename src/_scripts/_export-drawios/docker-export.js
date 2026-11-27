const {
    copyFileSync,
    lstatSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    realpathSync,
    rmSync,
    writeFileSync,
} = require('node:fs');
const { execFileSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
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

// Benign startup chatter the headless Chromium/Electron runtime prints on every
// export: it cannot reach the (deliberately unavailable) D-Bus system bus, the
// Bluetooth "Floss" manager, or launch its GPU sandbox cleanly under our
// --cap-drop=ALL / non-root / read-only / tmpfs-/run hardening. None of it
// affects the rendered SVG. The image pipes drawio's merged output through
// `grep -Fvf /opt/drawio-desktop/unwanted-lines.txt`, dropping any line that
// CONTAINS one of these fixed strings, so we seed that mounted file with the
// noise fragments to keep the export log readable. Each fragment must be a
// substring that appears ONLY in a noise line, never in drawio's own
// "input -> output" success line (which shares no text with these).
const UNWANTED_OUTPUT_LINE_FRAGMENTS = [
    'Failed to connect to the bus',
    'Floss manager service not available',
    'InitializeSandbox() called with multiple threads',
    // drawio's own Chromium console chatter while rendering a diagram, e.g.
    // "...INFO:CONSOLE:1956] "mxCellCodec.beforeDecode: target X not found for
    // cell Y", source: .../app.min.js". Emitted at INFO level for benign things
    // like dangling edge references; the SVG still renders. Only INFO-level
    // console lines are dropped, so a genuine ERROR:CONSOLE still surfaces.
    'INFO:CONSOLE',
];

// Build the contents of the mounted unwanted-lines.txt. The image's entrypoint
// appends its own built-in patterns to this file with `cat >>`, so it MUST end
// with a trailing newline or the first appended line would merge onto our last
// fragment. A single trailing newline terminates the last line WITHOUT creating
// an empty pattern line: an empty fixed-string is contained in every line, so
// `grep -Fv` would blank the entire export log.
function buildUnwantedLinesFile(fragments = UNWANTED_OUTPUT_LINE_FRAGMENTS) {
    return fragments.length > 0 ? `${fragments.join('\n')}\n` : '';
}

function getRendererDiagnostics(output, { inputPath, outputPath } = {}) {
    const successLine = inputPath && outputPath ? inputPath + ' -> ' + outputPath : null;
    // The container already filters startup noise. Preserve its remaining
    // diagnostics and remove only the success line logged using real job paths.
    return String(output ?? '').split(/[\r\n]+/).map((line) => line.trim()).filter((line) => (
        line && line !== '/input.drawio -> /output/export.svg' && line !== successLine
    ));
}

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

    // lstat also sees dangling symlinks, which existsSync would treat as an
    // absent destination and allow a later write to follow outside the root.
    let outputStat;
    try {
        outputStat = lstatSync(absoluteOutput);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    if (outputStat && !outputStat.isFile()) {
        throw new Error(`Draw.io output must be a regular, non-symlink file: ${absoluteOutput}`);
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
    containerName,
}) {
    [inputPath, temporaryOutputDir, temporaryStateFile, temporaryPasswdFile].forEach(assertMountSafePath);

    return [
        'run',
        '--rm',
        ...(containerName ? ['--name', containerName] : []),
        '--read-only',
        // No network: the export is a purely local .drawio -> SVG render and
        // repo policy forbids external images in diagrams, so the container
        // (which renders untrusted diagram XML via Chromium) needs no outbound
        // access. Cuts SSRF / exfiltration surface. Must stay in sync with the
        // isolation assertion in docker-export.test.js.
        '--network=none',
        '--cap-drop=ALL',
        '--security-opt=no-new-privileges:true',
        '--pids-limit=256',
        // Bound the renderer's CPU and memory so a crafted diagram cannot
        // exhaust the host. Chromium's anonymous heap is otherwise uncapped
        // (shm-size/tmpfs only bound shared memory and disk). --memory-swap set
        // equal to --memory disables swap, so OOM is contained to the container
        // (that one export fails) instead of taking down the runner. Must stay
        // in sync with the isolation assertion in docker-export.test.js.
        '--memory=2g',
        '--memory-swap=2g',
        '--cpus=2',
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
    const containerName = `architecture-center-drawio-${randomUUID()}`;

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
        writeFileSync(temporaryStateFile, buildUnwantedLinesFile());
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
            containerName,
        });
        // stdin ignored; stdout captured (the "input -> output" line); stderr
        // piped, not inherited, so the container's benign Chromium/D-Bus chatter
        // stays off the terminal on success. On a non-zero exit, execFileSync
        // still populates error.stderr, so the caller's failure handler keeps
        // full diagnostics.
        let stdout;
        try {
            stdout = runDocker('docker', args, {
                encoding: 'utf8',
                timeout: 600000,
                // Docker proxies SIGTERM to container PID 1 and may keep the
                // client alive. SIGKILL guarantees control returns for cleanup.
                killSignal: 'SIGKILL',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        } catch (exportError) {
            // Killing the Docker client on timeout does not stop the daemon's
            // container. Remove only this invocation's renderer before deleting
            // its bind mounts; --rm handles the normal successful path.
            try {
                runDocker('docker', ['rm', '--force', containerName], {
                    encoding: 'utf8',
                    timeout: 30000,
                    killSignal: 'SIGKILL',
                    stdio: ['ignore', 'pipe', 'pipe'],
                });
            } catch (cleanupError) {
                // An ordinary nonzero export may already have been removed by
                // --rm. Other failures must remain visible for manual cleanup.
                if (!String(cleanupError.stderr || '').includes('No such container:')) {
                    throw new AggregateError(
                        [exportError, cleanupError],
                        `Draw.io export failed (${exportError.message}); could not remove renderer ${containerName}: ${cleanupError.message}`
                    );
                }
            }
            throw exportError;
        }

        validateTemporarySvg(temporarySvg);
        copyFileSync(temporarySvg, absoluteOutput);
        return stdout;
    } finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
    }
}

module.exports = {
    DRAWIO_IMAGE,
    UNWANTED_OUTPUT_LINE_FRAGMENTS,
    buildDockerArgs,
    buildUnwantedLinesFile,
    getRendererDiagnostics,
    exportDrawioWithDocker,
    validateOutputPath,
};
