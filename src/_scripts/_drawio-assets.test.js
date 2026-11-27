const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } = require('node:fs');
const { createServer } = require('node:http');
const { tmpdir } = require('node:os');
const { basename, dirname, join, resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const { resolveDrawioLinks } = require('./_update-drawio-links');

// CI opts in after installing dependencies; these integration tests need no Docker.
const enabled = process.env.DRAWIO_EXPORT_E2E === '1';
const options = { skip: !enabled, timeout: 60000 };
const baseUrl = 'https://example.test';
const sourceRoot = resolve(__dirname, '../..');
const identicalSource = '<mxfile><diagram name="Identical source"/></mxfile>';

function downloadUrl(origin, emittedPath) {
    return origin + '/' + emittedPath.split('/').map(encodeURIComponent).join('/');
}

async function makeFixture(t, sources) {
    const rootDir = realpathSync(mkdtempSync(join(tmpdir(), 'drawio-assets-test-')));
    const buildDir = join(rootDir, 'build');
    t.after(() => rmSync(rootDir, { recursive: true, force: true }));

    function write(relativePath, content) {
        const filePath = join(rootDir, relativePath);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, content);
        return filePath;
    }
    for (const source of sources) write(source.path, source.content || identicalSource);
    const entry = 'module.exports = {\n' + sources.map((source) => {
        const resource = './' + source.path;
        return JSON.stringify(source.key) + ': {\n'
            + (source.sourceOnly ? '' : 'download: require(' + JSON.stringify(resource) + '),\n')
            + 'xml: require(' + JSON.stringify(resource + '?source') + ')\n}';
    }).join(',\n') + '\n};\n';
    const entryPath = write('entry.cjs', entry);
    const webpack = require('webpack');
    const { default: assetTypes } = await import(pathToFileURL(join(sourceRoot, 'src/plugins/asset-types/index.js')).href);
    const config = {
        mode: 'production',
        target: 'node',
        cache: { type: 'memory' },
        entry: entryPath,
        output: {
            path: buildDir,
            filename: 'bundle.cjs',
            library: { type: 'commonjs2' },
            publicPath: '',
            hashFunction: 'xxhash64',
            hashDigestLength: 16,
            clean: true,
        },
        optimization: { minimize: false },
        module: { rules: [{ test: /\.svg$/, type: 'asset/source' }] },
    };
    assetTypes().configureWebpack(config);
    const compiler = webpack(config);
    t.after(() => new Promise((resolveClose, reject) => {
        compiler.close((error) => error ? reject(error) : resolveClose());
    }));

    async function build(origin = baseUrl) {
        const stats = await new Promise((resolveStats, reject) => {
            compiler.run((error, result) => error ? reject(error) : resolveStats(result));
        });
        assert.ok(!stats.hasErrors(), stats.toString({ all: false, errors: true }));
        const bundlePath = join(buildDir, 'bundle.cjs');
        delete require.cache[require.resolve(bundlePath)];
        const emitted = require(bundlePath);
        for (const source of sources) {
            const actual = emitted[source.key];
            const sourceContent = readFileSync(join(rootDir, source.path), 'utf8');
            assert.equal(actual.xml, sourceContent, '?source must return the exact original XML.');
            if (!source.sourceOnly) {
                assert.equal(actual.download, basename(actual.download), 'Emit downloads inside the build root.');
                assert.equal(readFileSync(join(buildDir, actual.download), 'utf8'), sourceContent);
            }
        }
        const data = sources.filter((source) => !source.sourceOnly).map((source) => ({
            id: source.key,
            drawioLink: 'PLACEHOLDER:' + source.path,
        }));
        const resolved = resolveDrawioLinks({ data, buildDir, rootDir, baseUrl: origin });
        for (const item of resolved) {
            assert.equal(item.drawioLink, downloadUrl(origin, emitted[item.id].download), 'Artifact links must match webpack exports.');
        }
        return { emitted, resolved, stats };
    }
    return { rootDir, buildDir, write, build };
}

test('webpack and artifact links use document unique IDs across four nesting levels', options, async (t) => {
    const sources = [
        { key: 'first', path: 'docs/ref-arch/RA0101/drawio/architecture.drawio' },
        { key: 'second', path: 'docs/ref-arch/RA0202/drawio/architecture.drawio' },
        { key: 'child', path: 'docs/ref-arch/RA0101/child/drawio/architecture.drawio' },
        { key: 'grandchild', path: 'docs/ref-arch/RA0101/child/grandchild/drawio/architecture.drawio' },
        { key: 'greatGrandchild', path: 'docs/ref-arch/RA0101/child/grandchild/great-grandchild/drawio/architecture.drawio' },
        { key: 'fallback', path: 'docs/ref-arch/RA0007/5-mt-architecture/drawio/architecture.drawio' },
        { key: 'legacy', path: 'docs/community/example/drawio/architecture.drawio' },
        { key: 'xmlOnly', path: 'docs/ref-arch/RA0303/drawio/source-only.drawio', sourceOnly: true },
    ];
    const fixture = await makeFixture(t, sources);
    fixture.write('docs/ref-arch/RA0101/readme.md', '---\nid: 101 # YAML comment is not part of the ID\n---\n');
    fixture.write('docs/ref-arch/RA0202/readme.md', '---\nid: "202"\n---\n');
    fixture.write('docs/ref-arch/RA0101/child/readme.md', "---\nid: 'child-303'\n---\n");
    fixture.write('docs/ref-arch/RA0101/child/grandchild/readme.md', '---\nid: "d00404"\n---\n');
    const uniqueId = '00000000-0000-4000-8000-000000000005';
    fixture.write('docs/ref-arch/RA0101/child/grandchild/great-grandchild/readme.md', '---\nid: "' + uniqueId + '"\n---\n');
    fixture.write('docs/ref-arch/RA0007/readme.md', '---\nid: "700"\n---\n');
    fixture.write('docs/ref-arch/readme.md', '---\nid: "not-an-architecture"\n---\n');
    fixture.write('docs/readme.md', '---\nid: "not-an-architecture"\n---\n');
    fixture.write('readme.md', '---\nid: "not-an-architecture"\n---\n');
    const { emitted, stats } = await fixture.build();
    assert.ok(stats.compilation.missingDependencies.has(join(fixture.rootDir, 'docs/ref-arch/RA0007/5-mt-architecture/readme.md')),
        'Watch builds must notice a newly created child readme before continuing ancestor fallback.');
    assert.match(emitted.first.download, /^architecture-101-[0-9a-f]{16}\.drawio$/);
    assert.match(emitted.second.download, /^architecture-202-[0-9a-f]{16}\.drawio$/);
    assert.match(emitted.child.download, /^architecture-child-303-[0-9a-f]{16}\.drawio$/);
    assert.match(emitted.grandchild.download, /^architecture-d00404-[0-9a-f]{16}\.drawio$/);
    assert.match(emitted.greatGrandchild.download, /^architecture-00000000-0000-4000-8000-000000000005-[0-9a-f]{16}\.drawio$/);
    assert.match(emitted.fallback.download, /^architecture-700-[0-9a-f]{16}\.drawio$/);
    assert.match(emitted.legacy.download, /^architecture-[0-9a-f]{16}\.drawio$/);
    const downloads = sources.filter((source) => !source.sourceOnly).map((source) => emitted[source.key].download);
    assert.equal(new Set(downloads).size, downloads.length, 'Identical contents have distinct attributed asset names.');
    const hashes = downloads.map((name) => name.match(/-([0-9a-f]{16})\.drawio$/)[1]);
    assert.equal(new Set(hashes).size, 1, 'Every fixture has exactly the same source bytes.');
    assert.equal(readdirSync(fixture.buildDir).filter((name) => name.endsWith('.drawio')).length, downloads.length);
    assert.equal('download' in emitted.xmlOnly, false, 'Source-only imports must not emit a download.');
});

test('rebuilding in one webpack process picks up an ID-only metadata change', options, async (t) => {
    const fixture = await makeFixture(t, [{ key: 'diagram', path: 'docs/ref-arch/RA0101/drawio/architecture.drawio' }]);
    fixture.write('docs/ref-arch/RA0101/readme.md', '---\nid: "before"\n---\n');
    const { emitted: before, stats } = await fixture.build();
    assert.ok(stats.compilation.fileDependencies.has(join(fixture.rootDir, 'docs/ref-arch/RA0101/readme.md')),
        'Watch builds must track the readme as a filename dependency.');
    fixture.write('docs/ref-arch/RA0101/readme.md', '---\nid: "after"\n---\n');
    const { emitted: after } = await fixture.build();
    assert.match(before.diagram.download, /^architecture-before-[0-9a-f]{16}\.drawio$/);
    assert.match(after.diagram.download, /^architecture-after-[0-9a-f]{16}\.drawio$/);
    assert.equal(before.diagram.xml, after.diagram.xml, 'An ID-only change leaves the original diagram untouched.');
    assert.equal(
        before.diagram.download.match(/-([0-9a-f]{16})\.drawio$/)[1],
        after.diagram.download.match(/-([0-9a-f]{16})\.drawio$/)[1],
        'An ID-only change leaves the content hash unchanged.',
    );
    assert.equal(readdirSync(fixture.buildDir).includes(before.diagram.download), false, 'Clean builds remove the obsolete name.');
});

test('a nested document ID change updates only that document download in a cached build', options, async (t) => {
    const fixture = await makeFixture(t, [
        { key: 'top', path: 'docs/ref-arch/RA0101/drawio/architecture.drawio' },
        { key: 'child', path: 'docs/ref-arch/RA0101/child/drawio/architecture.drawio' },
        { key: 'grandchild', path: 'docs/ref-arch/RA0101/child/grandchild/drawio/architecture.drawio' },
    ]);
    fixture.write('docs/ref-arch/RA0101/readme.md', '---\nid: "top101"\n---\n');
    fixture.write('docs/ref-arch/RA0101/child/readme.md', '---\nid: "sub202"\n---\n');
    fixture.write('docs/ref-arch/RA0101/child/grandchild/readme.md', '---\nid: "old303"\n---\n');
    const { emitted: before } = await fixture.build();
    fixture.write('docs/ref-arch/RA0101/child/grandchild/readme.md', '---\nid: "new404"\n---\n');
    const { emitted: after } = await fixture.build();
    assert.equal(after.top.download, before.top.download);
    assert.equal(after.child.download, before.child.download);
    assert.match(before.grandchild.download, /^architecture-old303-[0-9a-f]{16}\.drawio$/);
    assert.match(after.grandchild.download, /^architecture-new404-[0-9a-f]{16}\.drawio$/);
    assert.equal(after.grandchild.xml, before.grandchild.xml);
    assert.equal(readdirSync(fixture.buildDir).includes(before.grandchild.download), false);
});

test('hostile YAML IDs fail the build before paths or webpack template tokens can be emitted', options, async (t) => {
    const fixture = await makeFixture(t, [{ key: 'diagram', path: 'docs/ref-arch/RA0101/drawio/architecture.drawio' }]);
    const hostile = '../../[path][name][hash]/evil?query#fragment\\' + 'x'.repeat(300);
    fixture.write('docs/ref-arch/RA0101/readme.md', '---\nid: ' + JSON.stringify(hostile) + '\n---\n');
    await assert.rejects(fixture.build(), /Invalid Draw.io document id/);
    assert.equal(existsSync(fixture.buildDir), false, 'A failed production build must not publish any output.');
    assert.equal(readdirSync(fixture.rootDir).filter((name) => name.endsWith('.drawio')).length, 0);
});

test('URL-encoded artifact downloads serve the exact original bytes for special-character basenames', options, async (t) => {
    const sourcePath = 'docs/ref-arch/RA0101/drawio/architecture report%one.drawio';
    const fixture = await makeFixture(t, [{ key: 'diagram', path: sourcePath }]);
    fixture.write('docs/ref-arch/RA0101/readme.md', '---\nid: "101"\n---\n');
    const server = createServer((request, response) => {
        const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname.slice(1));
        if (name !== basename(name)) {
            response.writeHead(400).end();
            return;
        }
        try {
            const content = readFileSync(join(fixture.buildDir, name));
            response.writeHead(200, { 'content-type': 'application/xml' });
            response.end(content);
        } catch {
            response.writeHead(404).end();
        }
    });
    await new Promise((resolveListen, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolveListen);
    });
    t.after(() => new Promise((resolveClose, reject) => {
        server.close((error) => error ? reject(error) : resolveClose());
    }));
    const origin = 'http://127.0.0.1:' + server.address().port;
    const { resolved } = await fixture.build(origin);
    assert.ok(resolved[0].drawioLink.includes('%20'), 'Spaces must be encoded in the published URL.');
    assert.ok(resolved[0].drawioLink.includes('%25'), 'Literal percent signs must be encoded in the published URL.');
    const response = await fetch(resolved[0].drawioLink);
    assert.equal(response.status, 200);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(join(fixture.rootDir, sourcePath)));
});
