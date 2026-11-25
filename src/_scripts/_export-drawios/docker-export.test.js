const test = require('node:test');
const assert = require('node:assert/strict');
const {
    copyFileSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join, resolve } = require('node:path');
const { DRAWIO_IMAGE, buildDockerArgs, buildUnwantedLinesFile, exportDrawioWithDocker, validateOutputPath } = require('./docker-export');

function mountSource(args, target) {
    const mounts = args.filter((value) => value.startsWith('type=bind,'));
    const mount = mounts.find((value) => value.includes(`target=${target}`));
    return mount?.match(/source=([^,]+)/)?.[1];
}

test('accepts a nonexistent regular output path without creating it', (t) => {
    const allowedRoot = mkdtempSync(join(tmpdir(), 'drawio-output-path-test-'));
    t.after(() => rmSync(allowedRoot, { recursive: true, force: true }));
    const outputPath = join(allowedRoot, 'new.svg');

    assert.equal(validateOutputPath(outputPath, allowedRoot), resolve(outputPath));
    assert.equal(existsSync(outputPath), false);
});

for (const targetExists of [false, true]) {
    test(`rejects a ${targetExists ? 'live' : 'dangling'} output symlink`, (t) => {
        const fixtureRoot = mkdtempSync(join(tmpdir(), 'drawio-output-path-test-'));
        t.after(() => rmSync(fixtureRoot, { recursive: true, force: true }));
        const allowedRoot = join(fixtureRoot, 'allowed');
        const outsideTarget = join(fixtureRoot, 'outside.svg');
        mkdirSync(allowedRoot);
        if (targetExists) writeFileSync(outsideTarget, 'preserved outside content');
        const outputPath = join(allowedRoot, 'linked.svg');
        symlinkSync(outsideTarget, outputPath);

        assert.throws(() => validateOutputPath(outputPath, allowedRoot), /regular, non-symlink file/);
        if (targetExists) {
            assert.equal(readFileSync(outsideTarget, 'utf8'), 'preserved outside content');
        } else {
            assert.equal(existsSync(outsideTarget), false);
        }
    });
}

test('rejects a directory used as an output file', (t) => {
    const allowedRoot = mkdtempSync(join(tmpdir(), 'drawio-output-path-test-'));
    t.after(() => rmSync(allowedRoot, { recursive: true, force: true }));
    const outputPath = join(allowedRoot, 'directory.svg');
    mkdirSync(outputPath);

    assert.throws(() => validateOutputPath(outputPath, allowedRoot), /regular, non-symlink file/);
    assert.ok(existsSync(outputPath));
});

test('pins and isolates the Draw.io container', () => {
    const inputPath = '/repository/docs/diagram.drawio';
    const temporaryOutputDir = '/runner-temp/export/output';
    const temporaryStateFile = '/runner-temp/export/unwanted-lines.txt';
    const temporaryPasswdFile = '/runner-temp/export/passwd';
    const args = buildDockerArgs({
        inputPath,
        temporaryOutputDir,
        temporaryStateFile,
        temporaryPasswdFile,
        userId: 1001,
        groupId: 127,
    });

    assert.equal(
        DRAWIO_IMAGE,
        'rlespinasse/drawio-desktop-headless:v1.76.0@sha256:b7468f89320a6b4c6d8099da224c837a03abab4832701bb4b2355e0901f805fd'
    );
    assert.ok(args.includes('--read-only'));
    assert.ok(args.includes('--network=none'));
    assert.ok(args.includes('--cap-drop=ALL'));
    assert.ok(args.includes('--security-opt=no-new-privileges:true'));
    assert.ok(args.includes('--pids-limit=256'));
    assert.ok(args.includes('--memory=2g'));
    assert.ok(args.includes('--memory-swap=2g'));
    assert.ok(args.includes('--cpus=2'));
    assert.ok(args.includes('--user=1001:127'));
    assert.ok(!args.includes('--privileged'));
    assert.ok(!args.some((value) => value.includes('/var/run/docker.sock')));
    assert.ok(!args.some((value) => value === '/repository' || value.includes('source=/repository,target=')));

    const mounts = args.filter((value) => value.startsWith('type=bind,'));
    assert.equal(mounts.length, 4);
    assert.equal(
        mounts.find((value) => value.includes('target=/input.drawio')),
        `type=bind,source=${inputPath},target=/input.drawio,readonly`
    );
    assert.equal(mountSource(args, '/output'), temporaryOutputDir);
    assert.equal(mountSource(args, '/opt/drawio-desktop/unwanted-lines.txt'), temporaryStateFile);
    assert.equal(
        mounts.find((value) => value.includes('target=/etc/passwd')),
        `type=bind,source=${temporaryPasswdFile},target=/etc/passwd,readonly`
    );
});

test('copies a validated temporary SVG without exposing a repository write mount', () => {
    const repositoryRoot = mkdtempSync(join(tmpdir(), 'drawio-export-test-repository-'));
    const docsRoot = join(repositoryRoot, 'docs');
    const inputPath = join(docsRoot, 'drawio', 'diagram.drawio');
    const outputPath = join(docsRoot, 'images', 'diagram.svg');
    let temporaryOutputDir;

    mkdirSync(dirname(inputPath), { recursive: true });
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(inputPath, '<mxfile />');

    try {
        const stdout = exportDrawioWithDocker({
            inputPath,
            outputPath,
            allowedFilesRoot: docsRoot,
            repositoryRoot,
            runDocker(command, args) {
                assert.equal(command, 'docker');
                temporaryOutputDir = mountSource(args, '/output');
                writeFileSync(join(temporaryOutputDir, 'export.svg'), '<svg viewBox="0 0 1 1"></svg>');
                return 'exported';
            },
        });

        assert.equal(stdout, 'exported');
        assert.equal(readFileSync(outputPath, 'utf8'), '<svg viewBox="0 0 1 1"></svg>');
        assert.ok(!existsSync(temporaryOutputDir));
    } finally {
        rmSync(repositoryRoot, { recursive: true, force: true });
    }
});

test('rejects symlinked Draw.io inputs before invoking Docker', () => {
    const repositoryRoot = mkdtempSync(join(tmpdir(), 'drawio-export-test-repository-'));
    const docsRoot = join(repositoryRoot, 'docs');
    const realInput = join(docsRoot, 'real.drawio');
    const symlinkInput = join(docsRoot, 'linked.drawio');
    const outputPath = join(docsRoot, 'output.svg');
    let invoked = false;

    mkdirSync(docsRoot);
    writeFileSync(realInput, '<mxfile />');
    symlinkSync(realInput, symlinkInput);

    try {
        assert.throws(
            () =>
                exportDrawioWithDocker({
                    inputPath: symlinkInput,
                    outputPath,
                    allowedFilesRoot: docsRoot,
                    repositoryRoot,
                    runDocker() {
                        invoked = true;
                    },
                }),
            /regular, non-symlink file/
        );
        assert.equal(invoked, false);
    } finally {
        rmSync(repositoryRoot, { recursive: true, force: true });
    }
});

test('rejects a symlinked temporary SVG before copying it into the repository', () => {
    const repositoryRoot = mkdtempSync(join(tmpdir(), 'drawio-export-test-repository-'));
    const docsRoot = join(repositoryRoot, 'docs');
    const inputPath = join(docsRoot, 'diagram.drawio');
    const outputPath = join(docsRoot, 'diagram.svg');
    const symlinkTarget = join(repositoryRoot, 'unexpected.svg');

    mkdirSync(docsRoot);
    writeFileSync(inputPath, '<mxfile />');
    writeFileSync(symlinkTarget, '<svg></svg>');

    try {
        assert.throws(
            () =>
                exportDrawioWithDocker({
                    inputPath,
                    outputPath,
                    allowedFilesRoot: docsRoot,
                    repositoryRoot,
                    runDocker(command, args) {
                        const temporaryOutputDir = mountSource(args, '/output');
                        symlinkSync(symlinkTarget, join(temporaryOutputDir, 'export.svg'));
                        return '';
                    },
                }),
            /did not create a regular SVG file/
        );
        assert.equal(existsSync(outputPath), false);
    } finally {
        rmSync(repositoryRoot, { recursive: true, force: true });
    }
});

test('seeds the container output filter so startup chatter is dropped but the export line survives', () => {
    const contents = buildUnwantedLinesFile();

    // The image runs `grep -Fvf unwanted-lines.txt`: each non-empty line is a
    // fixed-string pattern and a line of drawio output is removed if it contains
    // any pattern. An empty pattern line matches everything, so it must never
    // appear — it would blank the whole export log.
    const patterns = contents.split('\n');
    assert.ok(contents.endsWith('\n'), 'must end with a newline so the image can safely `cat >>` its own patterns');
    assert.equal(patterns.pop(), '', 'the trailing newline is a line terminator, not an extra pattern');
    assert.ok(patterns.length > 0);
    assert.ok(!patterns.includes(''), 'no empty pattern line (it would match and drop every output line)');

    const matches = (line) => patterns.some((pattern) => line.includes(pattern));
    // Real noise lines from a hardened-container export are dropped...
    assert.ok(matches('[22:1125/101357:ERROR:dbus/bus.cc:406] Failed to connect to the bus: ...'));
    assert.ok(matches('[22:1125/101358:WARNING:device/bluetooth/dbus/bluez_dbus_manager.cc:209] Floss manager service not available, cannot set Floss enable/disable.'));
    assert.ok(matches('[49:1125/101442:WARNING:sandbox/policy/linux/sandbox_linux.cc:405] InitializeSandbox() called with multiple threads in process gpu-process.'));
    // ...while drawio's own success line is kept.
    assert.ok(!matches('/input.drawio -> /output/export.svg'));
});

test('writes the seeded output filter to the mounted state file', () => {
    const repositoryRoot = mkdtempSync(join(tmpdir(), 'drawio-export-test-repository-'));
    const docsRoot = join(repositoryRoot, 'docs');
    const inputPath = join(docsRoot, 'drawio', 'diagram.drawio');
    const outputPath = join(docsRoot, 'images', 'diagram.svg');
    let stateFileContents;

    mkdirSync(dirname(inputPath), { recursive: true });
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(inputPath, '<mxfile />');

    try {
        exportDrawioWithDocker({
            inputPath,
            outputPath,
            allowedFilesRoot: docsRoot,
            repositoryRoot,
            runDocker(command, args) {
                const temporaryStateFile = mountSource(args, '/opt/drawio-desktop/unwanted-lines.txt');
                stateFileContents = readFileSync(temporaryStateFile, 'utf8');
                const temporaryOutputDir = mountSource(args, '/output');
                writeFileSync(join(temporaryOutputDir, 'export.svg'), '<svg viewBox="0 0 1 1"></svg>');
                return 'exported';
            },
        });

        assert.equal(stateFileContents, buildUnwantedLinesFile());
    } finally {
        rmSync(repositoryRoot, { recursive: true, force: true });
    }
});

test(
    { skip: process.env.DRAWIO_DOCKER_SMOKE !== '1', timeout: 600000 },
    () => {
        const repositoryRoot = resolve(__dirname, '../../..');
        const isolatedRoot = mkdtempSync(join(tmpdir(), 'drawio-export-smoke-'));
        const inputPath = join(isolatedRoot, 'input.drawio');
        const outputPath = join(isolatedRoot, 'output.svg');
        const fixture = join(repositoryRoot, 'docs/ref-arch/RA0014/drawio/Direct_OData_Call.drawio');

        copyFileSync(fixture, inputPath);
        try {
            exportDrawioWithDocker({
                inputPath,
                outputPath,
                allowedFilesRoot: isolatedRoot,
                repositoryRoot,
            });
            assert.match(readFileSync(outputPath, 'utf8'), /<svg(?:\s|>)/i);
        } finally {
            rmSync(isolatedRoot, { recursive: true, force: true });
        }
    }
);
