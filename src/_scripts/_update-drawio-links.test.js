const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');
const { resolveDrawioLinks, updateDrawioLinks } = require('./_update-drawio-links');

function createFixture(run) {
    const rootDir = mkdtempSync(join(tmpdir(), 'drawio-links-test-'));
    const buildDir = join(rootDir, 'build');
    mkdirSync(buildDir);
    mkdirSync(join(rootDir, 'docs'));

    function write(relativePath, content) {
        const filePath = join(rootDir, relativePath);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, content);
        return filePath;
    }

    try {
        run({ rootDir, buildDir, write });
    } finally {
        rmSync(rootDir, { recursive: true, force: true });
    }
}

test('resolves duplicate basenames by exact source content', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('docs/ref-arch/RA0029/drawio/architecture.drawio', 'top-level');
        write('docs/ref-arch/RA0029/1-child/drawio/architecture.drawio', 'child');
        write('build/architecture-1111111111111111.drawio', 'child');
        write('build/architecture-2222222222222222.drawio', 'top-level');

        const result = resolveDrawioLinks({
            data: [
                {
                    id: 'top',
                    name: 'Top-level architecture',
                    drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0029/drawio/architecture.drawio',
                },
                {
                    id: 'child',
                    name: 'Child architecture',
                    drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0029/1-child/drawio/architecture.drawio',
                },
            ],
            buildDir,
            rootDir,
            baseUrl: 'https://example.test',
        });

        assert.deepEqual(result, [
            {
                id: 'top',
                name: 'Top-level architecture',
                drawioLink: 'https://example.test/architecture-2222222222222222.drawio',
            },
            {
                id: 'child',
                name: 'Child architecture',
                drawioLink: 'https://example.test/architecture-1111111111111111.drawio',
            },
        ]);
    });
});

test('resolves id-bearing emitted names', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('docs/ref-arch/RA0029/10-third-party-mcp-access/readme.md', '---\nid: "137800"\n---\n');
        write('docs/ref-arch/RA0029/10-third-party-mcp-access/drawio/architecture.drawio', 'mcp-child');
        // Emitted with the document's unique id between the stem and the content hash.
        write('build/architecture-137800-abcdef0123456789.drawio', 'mcp-child');

        const result = resolveDrawioLinks({
            data: [
                {
                    id: 'mcp',
                    name: 'Third-party MCP access',
                    drawioLink:
                        'PLACEHOLDER:docs/ref-arch/RA0029/10-third-party-mcp-access/drawio/architecture.drawio',
                },
            ],
            buildDir,
            rootDir,
            baseUrl: 'https://example.test',
        });

        assert.equal(
            result[0].drawioLink,
            'https://example.test/architecture-137800-abcdef0123456789.drawio'
        );
    });
});

test('prefers the emitted asset whose id matches the corresponding document for identical content', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        // Two documents with byte-identical diagrams share the same content hash,
        // so the content index returns both emitted assets as candidates.
        write('docs/ref-arch/RA0050/readme.md', '---\nid: "500"\n---\n');
        write('docs/ref-arch/RA0050/drawio/architecture.drawio', 'same-bytes');
        write('docs/ref-arch/RA0060/readme.md', '---\nid: "600"\n---\n');
        write('docs/ref-arch/RA0060/drawio/architecture.drawio', 'same-bytes');
        // Same hash segment, different id segment.
        write('build/architecture-500-aaaaaaaaaaaaaaaa.drawio', 'same-bytes');
        write('build/architecture-600-aaaaaaaaaaaaaaaa.drawio', 'same-bytes');

        const result = resolveDrawioLinks({
            data: [
                { id: 'a', drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0050/drawio/architecture.drawio' },
                { id: 'b', drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0060/drawio/architecture.drawio' },
            ],
            buildDir,
            rootDir,
            baseUrl: 'https://example.test',
        });

        // Each resolves to its OWN id despite identical content (not candidates[0]).
        assert.equal(result[0].drawioLink, 'https://example.test/architecture-500-aaaaaaaaaaaaaaaa.drawio');
        assert.equal(result[1].drawioLink, 'https://example.test/architecture-600-aaaaaaaaaaaaaaaa.drawio');
    });
});

test('fails when the matching built asset is missing', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('docs/ref-arch/RA0001/drawio/diagram.drawio', 'source');
        assert.throws(
            () =>
                resolveDrawioLinks({
                    data: [{ drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0001/drawio/diagram.drawio' }],
                    buildDir,
                    rootDir,
                    baseUrl: 'https://example.test',
                }),
            /Could not resolve emitted Draw.io asset/
        );
    });
});

test('does not attribute an identical diagram to another document when its emitted asset is missing', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('docs/ref-arch/RA0050/readme.md', '---\nid: "500"\n---\n');
        write('docs/ref-arch/RA0050/drawio/architecture.drawio', 'same-bytes');
        write('build/architecture-600-aaaaaaaaaaaaaaaa.drawio', 'same-bytes');
        assert.throws(() => resolveDrawioLinks({
            data: [{ drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0050/drawio/architecture.drawio' }],
            buildDir, rootDir, baseUrl: 'https://example.test',
        }), /matching document id/);
    });
});

test('prefers a legacy asset over an identical diagram belonging to another document', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('docs/ref-arch/RA0050/readme.md', '---\nid: "500"\n---\n');
        write('docs/ref-arch/RA0050/drawio/architecture.drawio', 'same-bytes');
        write('build/architecture-600-aaaaaaaaaaaaaaaa.drawio', 'same-bytes');
        write('build/architecture-aaaaaaaaaaaaaaaa.drawio', 'same-bytes');
        const result = resolveDrawioLinks({
            data: [{ drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0050/drawio/architecture.drawio' }],
            buildDir, rootDir, baseUrl: 'https://example.test',
        });
        assert.equal(result[0].drawioLink, 'https://example.test/architecture-aaaaaaaaaaaaaaaa.drawio');
    });
});

test('encodes emitted filenames as URL path segments', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('docs/diagram #1.drawio', 'source');
        write('build/assets/diagram #1-aaaaaaaaaaaaaaaa.drawio', 'source');
        const result = resolveDrawioLinks({
            data: [{ drawioLink: 'PLACEHOLDER:docs/diagram #1.drawio' }],
            buildDir, rootDir, baseUrl: 'https://example.test/',
        });
        assert.equal(result[0].drawioLink, 'https://example.test/assets/diagram%20%231-aaaaaaaaaaaaaaaa.drawio');
        assert.equal(new URL(result[0].drawioLink).hash, '');
    });
});

test('ignores symlinked emitted asset files and directories', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('docs/diagram.drawio', 'source');
        const outside = write('outside/diagram-aaaaaaaaaaaaaaaa.drawio', 'source');
        symlinkSync(outside, join(buildDir, 'diagram-aaaaaaaaaaaaaaaa.drawio'));
        symlinkSync(dirname(outside), join(buildDir, 'assets'), 'dir');
        assert.throws(() => resolveDrawioLinks({
            data: [{ drawioLink: 'PLACEHOLDER:docs/diagram.drawio' }],
            buildDir, rootDir, baseUrl: 'https://example.test',
        }), /Could not resolve emitted Draw.io asset/);
    });
});

for (const targetExists of [false, true]) {
    test('rejects a ' + (targetExists ? 'live' : 'dangling') + ' data.json symlink before writing', () => {
        createFixture(({ rootDir, buildDir, write }) => {
            mkdirSync(join(buildDir, 'artifacts'));
            const outside = join(rootDir, 'outside.json');
            if (targetExists) write('outside.json', '[]\n');
            const dataJsonPath = join(buildDir, 'artifacts/data.json');
            symlinkSync(outside, dataJsonPath);
            assert.throws(() => updateDrawioLinks({ dataJsonPath, buildDir, rootDir }), /regular, non-symlink file/);
            assert.equal(existsSync(outside), targetExists);
            if (targetExists) assert.equal(readFileSync(outside, 'utf8'), '[]\n');
        });
    });
}

for (const directoryName of ['build', 'build/artifacts', 'docs', 'docs/ref-arch']) {
    test('rejects symlinked ' + directoryName + ' ancestry before rewriting links', () => {
        createFixture(({ rootDir, buildDir, write }) => {
            write('docs/ref-arch/RA0050/drawio/architecture.drawio', 'source');
            write('build/architecture-aaaaaaaaaaaaaaaa.drawio', 'source');
            const dataJsonPath = write('build/artifacts/data.json', JSON.stringify([
                { drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0050/drawio/architecture.drawio' },
            ]));
            const original = readFileSync(dataJsonPath, 'utf8');
            const directory = join(rootDir, directoryName);
            const outside = join(rootDir, 'outside-directory');
            renameSync(directory, outside);
            symlinkSync(outside, directory, 'dir');
            assert.throws(() => updateDrawioLinks({ dataJsonPath, buildDir, rootDir }), /non-symlink directory/);
            assert.equal(readFileSync(dataJsonPath, 'utf8'), original);
        });
    });
}

test('rewrites data atomically and keeps the original metadata on resolution failure', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('docs/diagram.drawio', 'source');
        const dataJsonPath = write('build/artifacts/data.json', '[{"drawioLink":"PLACEHOLDER:docs/diagram.drawio"}]\n');
        const original = readFileSync(dataJsonPath, 'utf8');
        assert.throws(() => updateDrawioLinks({ dataJsonPath, buildDir, rootDir }), /Could not resolve/);
        assert.equal(readFileSync(dataJsonPath, 'utf8'), original);
        write('build/diagram-aaaaaaaaaaaaaaaa.drawio', 'source');
        const updated = updateDrawioLinks({ dataJsonPath, buildDir, rootDir, baseUrl: 'https://example.test' });
        assert.deepEqual(JSON.parse(readFileSync(dataJsonPath, 'utf8')), updated);
        assert.deepEqual(readdirSync(dirname(dataJsonPath)), ['data.json']);
    });
});

test('rejects a symlinked source .drawio leaf without reading its target', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        const outside = write('outside-secret.drawio', 'external-content');
        mkdirSync(join(rootDir, 'docs/ref-arch/RA0050/drawio'), { recursive: true });
        symlinkSync(outside, join(rootDir, 'docs/ref-arch/RA0050/drawio/architecture.drawio'));
        // An emitted asset carrying the external content's hash exists in build/.
        write('build/architecture-aaaaaaaaaaaaaaaa.drawio', 'external-content');
        assert.throws(() => resolveDrawioLinks({
            data: [{ drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0050/drawio/architecture.drawio' }],
            buildDir, rootDir, baseUrl: 'https://example.test',
        }), /regular file under docs\//);
    });
});

for (const hash of ['aaaaaaaa', 'a'.repeat(64)]) {
    test('resolves emitted names whose content hash is ' + hash.length + ' hex (not pinned to 16)', () => {
        createFixture(({ rootDir, buildDir, write }) => {
            write('docs/ref-arch/RA0050/readme.md', '---\nid: "500"\n---\n');
            write('docs/ref-arch/RA0050/drawio/architecture.drawio', 'content');
            write('build/architecture-500-' + hash + '.drawio', 'content');
            const result = resolveDrawioLinks({
                data: [{ drawioLink: 'PLACEHOLDER:docs/ref-arch/RA0050/drawio/architecture.drawio' }],
                buildDir, rootDir, baseUrl: 'https://example.test',
            });
            assert.equal(result[0].drawioLink, 'https://example.test/architecture-500-' + hash + '.drawio');
        });
    });
}

test('rejects placeholders that escape docs', () => {
    createFixture(({ rootDir, buildDir, write }) => {
        write('outside.drawio', 'source');
        assert.throws(
            () =>
                resolveDrawioLinks({
                    data: [{ drawioLink: 'PLACEHOLDER:outside.drawio' }],
                    buildDir,
                    rootDir,
                    baseUrl: 'https://example.test',
                }),
            /under docs/
        );
    });
});
