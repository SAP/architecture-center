const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdirSync, mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');
const { resolveDrawioLinks } = require('./_update-drawio-links');

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
