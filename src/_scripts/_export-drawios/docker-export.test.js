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
const { DRAWIO_IMAGE, buildDockerArgs, exportDrawioWithDocker } = require('./docker-export');

function mountSource(args, target) {
    const mounts = args.filter((value) => value.startsWith('type=bind,'));
    const mount = mounts.find((value) => value.includes(`target=${target}`));
    return mount?.match(/source=([^,]+)/)?.[1];
}

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

    assert.match(
        DRAWIO_IMAGE,
        /^rlespinasse\/drawio-desktop-headless:v1\.76\.0@sha256:[0-9a-f]{64}$/
    );
    assert.ok(args.includes('--read-only'));
    assert.ok(args.includes('--cap-drop=ALL'));
    assert.ok(args.includes('--security-opt=no-new-privileges:true'));
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
