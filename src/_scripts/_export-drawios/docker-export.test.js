const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
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
const { DRAWIO_IMAGE, buildDockerArgs, exportDrawioWithDocker, validateOutputPath } = require('./docker-export');

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

function makeFailedExportFixture(t) {
    const repositoryRoot = mkdtempSync(join(tmpdir(), 'drawio-failed-export-test-'));
    t.after(() => rmSync(repositoryRoot, { recursive: true, force: true }));
    const docsRoot = join(repositoryRoot, 'docs');
    mkdirSync(docsRoot);
    const inputPath = join(docsRoot, 'diagram.drawio');
    const outputPath = join(docsRoot, 'diagram.svg');
    writeFileSync(inputPath, '<mxfile />');
    writeFileSync(outputPath, 'Preserve the previous output.');
    return { repositoryRoot, inputPath, outputPath, allowedFilesRoot: docsRoot };
}

test('removes a timed-out renderer before deleting its bind mounts', (t) => {
    const fixture = makeFailedExportFixture(t);
    const exportError = Object.assign(new Error('Docker client timed out'), { code: 'ETIMEDOUT' });
    let containerName;
    let temporaryOutputDir;
    const commands = [];
    assert.throws(() => exportDrawioWithDocker({
        ...fixture,
        runDocker(command, args, options) {
            commands.push(args[0]);
            assert.equal(command, 'docker');
            assert.equal(options.killSignal, 'SIGKILL');
            if (args[0] === 'run') {
                containerName = args[args.indexOf('--name') + 1];
                assert.match(containerName, /^architecture-center-drawio-[0-9a-f-]{36}$/);
                temporaryOutputDir = mountSource(args, '/output');
                throw exportError;
            }
            assert.deepEqual(args, ['rm', '--force', containerName]);
            assert.equal(options.timeout, 30000);
            assert.ok(existsSync(temporaryOutputDir), 'Stop the renderer while its mount directory still exists.');
            return '';
        },
    }), (error) => error === exportError);
    assert.deepEqual(commands, ['run', 'rm']);
    assert.equal(existsSync(temporaryOutputDir), false);
    assert.equal(readFileSync(fixture.outputPath, 'utf8'), 'Preserve the previous output.');
});

test('preserves the export failure when --rm already removed the container', (t) => {
    const fixture = makeFailedExportFixture(t);
    const exportError = new Error('Renderer failed');
    assert.throws(() => exportDrawioWithDocker({
        ...fixture,
        runDocker(_command, args) {
            if (args[0] === 'run') throw exportError;
            throw Object.assign(new Error('Docker rm failed'), { stderr: 'Error response from daemon: No such container: removed' });
        },
    }), (error) => error === exportError);
});

test('reports a renderer cleanup failure alongside the original export failure', (t) => {
    const fixture = makeFailedExportFixture(t);
    const exportError = new Error('Docker client timed out');
    const cleanupError = new Error('Docker daemon unreachable');
    assert.throws(() => exportDrawioWithDocker({
        ...fixture,
        runDocker(_command, args) {
            throw args[0] === 'run' ? exportError : cleanupError;
        },
    }), (error) => {
        assert.ok(error instanceof AggregateError);
        assert.deepEqual(error.errors, [exportError, cleanupError]);
        assert.match(error.message, /could not remove renderer architecture-center-drawio-/);
        return true;
    });
});

test('a real Docker client timeout leaves no running renderer container', {
    skip: process.env.DRAWIO_DOCKER_SMOKE !== '1',
    timeout: 60000,
}, (t) => {
    const fixture = makeFailedExportFixture(t);
    let containerName;
    t.after(() => {
        if (containerName) {
            // Keep the smoke test itself safe if an assertion or cleanup fails.
            try { execFileSync('docker', ['rm', '--force', containerName], { timeout: 30000, stdio: 'ignore' }); } catch {}
        }
    });
    const startedAt = performance.now();
    assert.throws(() => exportDrawioWithDocker({
        ...fixture,
        runDocker(command, args, options) {
            if (args[0] !== 'run') return execFileSync(command, args, options);
            containerName = args[args.indexOf('--name') + 1];
            // Sleep in the same isolated image instead of relying on a crafted
            // diagram to hang Chromium. Exercise the real client/daemon boundary.
            const imageIndex = args.indexOf(DRAWIO_IMAGE);
            const sleepArgs = [...args.slice(0, imageIndex), '--entrypoint', '/bin/sh', DRAWIO_IMAGE, '-c', 'sleep 120'];
            return execFileSync(command, sleepArgs, { ...options, timeout: 5000 });
        },
    }), (error) => error.code === 'ETIMEDOUT');
    assert.ok(performance.now() - startedAt < 45000, 'The Docker client must return promptly instead of waiting for the sleeping container.');
    const containers = execFileSync('docker', ['ps', '--all', '--quiet', '--filter', `name=^/${containerName}$`], {
        encoding: 'utf8', timeout: 30000,
    });
    assert.equal(containers.trim(), '', 'Force removal must terminate the daemon-side renderer.');
    assert.equal(readFileSync(fixture.outputPath, 'utf8'), 'Preserve the previous output.');
});

test('real rendering removes active HTML and JavaScript links from diagram cells', {
    skip: process.env.DRAWIO_DOCKER_SMOKE !== '1',
    timeout: 600000,
}, (t) => {
    const fixture = makeFailedExportFixture(t);
    const { xmlEscape } = require('./sanitize');
    const label = '<b>Safe diagram label</b><img src="invalid" onerror="alert(1)">'
        + '<script>alert(2)</script><svg onload="alert(3)"></svg>';
    writeFileSync(fixture.inputPath, '<mxfile><diagram id="security-test" name="Page-1"><mxGraphModel><root>'
        + '<mxCell id="0"/><mxCell id="1" parent="0"/>'
        + '<UserObject id="unsafe" label="' + xmlEscape(label) + '" link="javascript:alert(4)">'
        + '<mxCell style="whiteSpace=wrap;html=1;" vertex="1" parent="1">'
        + '<mxGeometry x="20" y="20" width="200" height="80" as="geometry"/>'
        + '</mxCell></UserObject></root></mxGraphModel></diagram></mxfile>');
    exportDrawioWithDocker(fixture);
    const { JSDOM } = require('jsdom');
    const parsed = new JSDOM(readFileSync(fixture.outputPath, 'utf8'), { contentType: 'image/svg+xml' });
    try {
        const document = parsed.window.document;
        assert.equal(document.querySelector('script'), null);
        assert.ok(document.documentElement.textContent.includes('Safe diagram label'));
        for (const element of document.querySelectorAll('*')) {
            for (const attribute of element.attributes) {
                assert.ok(!/^on/i.test(attribute.localName), `No event handler may survive: ${attribute.name}`);
                assert.ok(!/javascript:/i.test(attribute.value), `No JavaScript URL may survive: ${attribute.name}`);
            }
        }
    } finally {
        parsed.window.close();
    }
});

test(
    'exports a real diagram with the hardened container',
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
