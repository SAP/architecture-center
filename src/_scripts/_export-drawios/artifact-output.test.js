const test = require('node:test');
const assert = require('node:assert/strict');
const {
    existsSync,
    lstatSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    realpathSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { ensureOutputDirectory, writeArtifactFile } = require('./artifact-output');

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'drawio-artifact-output-test-'));
    const repositoryRoot = join(root, 'repository');
    const outsideRoot = join(root, 'outside');
    mkdirSync(repositoryRoot);
    mkdirSync(outsideRoot);
    t.after(() => rmSync(root, { recursive: true, force: true }));
    return { repositoryRoot, outsideRoot };
}

test('creates an artifact directory within the trusted repository and returns its canonical path', (t) => {
    const { repositoryRoot } = fixture(t);
    const thumbnailsRoot = join(repositoryRoot, 'static', 'artifacts', 'thumbnails');

    assert.equal(ensureOutputDirectory(thumbnailsRoot, repositoryRoot), realpathSync(thumbnailsRoot));
    assert.ok(lstatSync(thumbnailsRoot).isDirectory());
    assert.equal(ensureOutputDirectory(thumbnailsRoot, repositoryRoot), realpathSync(thumbnailsRoot));
});

test('writes and replaces regular artifact files without leaving temporary files', (t) => {
    const { repositoryRoot } = fixture(t);
    const thumbnailsRoot = join(repositoryRoot, 'static', 'artifacts', 'thumbnails');
    const outputPath = join(thumbnailsRoot, 'architecture.svg');

    writeArtifactFile(outputPath, '<svg>first</svg>', thumbnailsRoot, repositoryRoot);
    assert.equal(readFileSync(outputPath, 'utf8'), '<svg>first</svg>');
    writeArtifactFile(outputPath, '<svg>updated</svg>', thumbnailsRoot, repositoryRoot);
    assert.equal(readFileSync(outputPath, 'utf8'), '<svg>updated</svg>');
    assert.deepEqual(readdirSync(thumbnailsRoot), ['architecture.svg']);
});

for (const targetExists of [false, true]) {
    test(`rejects a ${targetExists ? 'live' : 'dangling'} thumbnail symlink without writing outside the repository`, (t) => {
        const { repositoryRoot, outsideRoot } = fixture(t);
        const thumbnailsRoot = join(repositoryRoot, 'static', 'artifacts', 'thumbnails');
        mkdirSync(thumbnailsRoot, { recursive: true });
        const outputPath = join(thumbnailsRoot, 'architecture.svg');
        const outsideTarget = join(outsideRoot, 'target.svg');
        if (targetExists) writeFileSync(outsideTarget, 'original outside content');
        symlinkSync(outsideTarget, outputPath);

        assert.throws(() => writeArtifactFile(outputPath, '<svg/>', thumbnailsRoot, repositoryRoot));
        assert.ok(lstatSync(outputPath).isSymbolicLink());
        assert.deepEqual(readdirSync(thumbnailsRoot), ['architecture.svg']);
        if (targetExists) {
            assert.equal(readFileSync(outsideTarget, 'utf8'), 'original outside content');
        } else {
            assert.equal(existsSync(outsideTarget), false);
        }
    });
}

for (const ancestor of ['static', 'artifacts', 'thumbnails']) {
    for (const targetInside of [false, true]) {
        test(`rejects a symlinked ${ancestor} directory pointing ${targetInside ? 'inside' : 'outside'} the repository`, (t) => {
            const { repositoryRoot, outsideRoot } = fixture(t);
            const targetRoot = targetInside ? join(repositoryRoot, 'redirected') : outsideRoot;
            if (targetInside) mkdirSync(targetRoot);
            writeFileSync(join(targetRoot, 'preserved.txt'), 'original content');
            const parts = ['static', 'artifacts', 'thumbnails'];
            const index = parts.indexOf(ancestor);
            const parent = join(repositoryRoot, ...parts.slice(0, index));
            mkdirSync(parent, { recursive: true });
            const linkedDirectory = join(parent, ancestor);
            symlinkSync(targetRoot, linkedDirectory, 'dir');
            const thumbnailsRoot = join(repositoryRoot, ...parts);
            const outputPath = join(thumbnailsRoot, 'architecture.svg');

            assert.throws(() => ensureOutputDirectory(thumbnailsRoot, repositoryRoot));
            assert.throws(() => writeArtifactFile(outputPath, '<svg/>', thumbnailsRoot, repositoryRoot));
            assert.ok(lstatSync(linkedDirectory).isSymbolicLink());
            assert.deepEqual(readdirSync(targetRoot), ['preserved.txt']);
            assert.equal(readFileSync(join(targetRoot, 'preserved.txt'), 'utf8'), 'original content');
        });
    }
}

test('rejects a non-directory artifact ancestor without replacing it', (t) => {
    const { repositoryRoot } = fixture(t);
    const staticPath = join(repositoryRoot, 'static');
    writeFileSync(staticPath, 'original file');

    assert.throws(() => ensureOutputDirectory(join(staticPath, 'artifacts'), repositoryRoot));
    assert.equal(readFileSync(staticPath, 'utf8'), 'original file');
});

test('rejects an output directory outside the repository before creating it', (t) => {
    const { repositoryRoot, outsideRoot } = fixture(t);
    const requestedDirectory = join(outsideRoot, 'new-artifacts');

    assert.throws(() => ensureOutputDirectory(requestedDirectory, repositoryRoot));
    assert.equal(existsSync(requestedDirectory), false);
});

test('rejects an artifact destination outside its allowed root', (t) => {
    const { repositoryRoot } = fixture(t);
    const artifactsRoot = join(repositoryRoot, 'static', 'artifacts');
    const thumbnailsRoot = join(artifactsRoot, 'thumbnails');
    mkdirSync(thumbnailsRoot, { recursive: true });
    const otherPath = join(artifactsRoot, 'other.svg');
    writeFileSync(otherPath, 'preserved artifact');

    assert.throws(() => writeArtifactFile(otherPath, '<svg/>', thumbnailsRoot, repositoryRoot));
    assert.equal(readFileSync(otherPath, 'utf8'), 'preserved artifact');
    assert.deepEqual(readdirSync(thumbnailsRoot), []);
});

for (const targetExists of [false, true]) {
    test(`protects data.json from a ${targetExists ? 'live' : 'dangling'} symlink`, (t) => {
        const { repositoryRoot, outsideRoot } = fixture(t);
        const artifactsRoot = join(repositoryRoot, 'static', 'artifacts');
        mkdirSync(artifactsRoot, { recursive: true });
        const outputPath = join(artifactsRoot, 'data.json');
        const outsideTarget = join(outsideRoot, 'data.json');
        if (targetExists) writeFileSync(outsideTarget, '{"preserved":true}');
        symlinkSync(outsideTarget, outputPath);

        assert.throws(() => writeArtifactFile(outputPath, '[]', artifactsRoot, repositoryRoot));
        assert.ok(lstatSync(outputPath).isSymbolicLink());
        assert.deepEqual(readdirSync(artifactsRoot), ['data.json']);
        if (targetExists) {
            assert.equal(readFileSync(outsideTarget, 'utf8'), '{"preserved":true}');
        } else {
            assert.equal(existsSync(outsideTarget), false);
        }
    });
}
