const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const {
    copyFileSync,
    cpSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    realpathSync,
    rmSync,
    writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { delimiter, dirname, join, resolve, sep } = require('node:path');
const { pathToFileURL } = require('node:url');

// The normal unit-test glob needs no npm dependencies or running Docker daemon.
// Opt in with npm run test:drawio:e2e after installing the project dependencies.
const enabled = process.env.DRAWIO_EXPORT_E2E === '1';
const sourceRoot = resolve(__dirname, '../../..');
const baseUrl = 'https://architecture.learning.sap.com';
const initialDate = '2026-01-02T00:15:00+00:00';
const updatedDate = '2026-01-03T00:15:00+00:00';
const architectures = [
    {
        id: 'RA9001',
        title: 'Export E2E Architecture',
        slug: '/ref-arch/RA9001',
        label: 'Original source one',
        description: 'Primary export test fixture.',
        thumbnailName: 'export-e2e-architecture.svg',
    },
    {
        id: 'RA9002',
        title: 'Second E2E Architecture',
        slug: '/ref-arch/RA9002',
        label: 'Original source two',
        description: 'Independent export test fixture.',
        thumbnailName: 'second-e2e-architecture.svg',
    },
];

function diagram(label) {
    return '<mxfile><diagram id="e2e-diagram" name="Page-1"><mxGraphModel><root>'
        + '<mxCell id="0"/><mxCell id="1" parent="0"/>'
        + '<mxCell id="e2e-shape" value="' + label + '" style="rounded=0;whiteSpace=wrap;html=0;"'
        + ' vertex="1" parent="1"><mxGeometry x="20" y="20" width="200" height="80" as="geometry"/>'
        + '</mxCell></root></mxGraphModel></diagram></mxfile>';
}

function readme(architecture) {
    const attributes = ['id', 'title', 'slug', 'description']
        .filter((key) => architecture[key] !== undefined)
        .map((key) => key + ': ' + JSON.stringify(architecture[key]));
    return '---\n' + attributes.join('\n') + '\ntags: []\n---\n\n'
        + '![](drawio/architecture.drawio)\n';
}

function removeInterruptedRendererContainers(temporaryRoot) {
    const { DRAWIO_IMAGE } = require('./docker-export');
    const options = { encoding: 'utf8', timeout: 30000 };
    const ids = execFileSync('docker', ['ps', '--quiet', '--filter', 'ancestor=' + DRAWIO_IMAGE], options)
        .trim().split(/\s+/).filter(Boolean);
    for (const id of ids) {
        let container;
        try {
            [container] = JSON.parse(execFileSync('docker', ['inspect', id], options));
        } catch (error) {
            // A --rm container may finish between listing and inspecting it.
            if (error.status === 1) continue;
            throw error;
        }
        if (container.Mounts.some((mount) => mount.Source.startsWith(temporaryRoot + sep))) {
            execFileSync('docker', ['rm', '--force', id], options);
        }
    }
}

function makeFixture(t, documents = architectures) {
    const temporaryRoot = realpathSync(mkdtempSync(join(tmpdir(), 'drawio-export-e2e-')));
    const root = join(temporaryRoot, 'repository');
    const cache = join(temporaryRoot, 'cache');
    const rendererTemporaryRoot = join(temporaryRoot, 'renderer-tmp');
    mkdirSync(root);
    mkdirSync(rendererTemporaryRoot);
    let rendererInterrupted = false;
    t.after(() => {
        try {
            // Killing the export process does not stop a daemon-side container.
            // Only remove renderers whose bind mounts belong to this fixture.
            if (rendererInterrupted) removeInterruptedRendererContainers(temporaryRoot);
        } finally {
            rmSync(temporaryRoot, { recursive: true, force: true });
        }
    });
    const env = {
        ...process.env,
        DOCKER: '1',
        CACHE_ENABLED: '1',
        DRAWIO_CACHE_DIR: cache,
        NODE_PATH: [process.env.NODE_PATH, join(sourceRoot, 'node_modules')].filter(Boolean).join(delimiter),
        TMPDIR: rendererTemporaryRoot,
        GIT_CONFIG_NOSYSTEM: '1',
        GIT_CONFIG_GLOBAL: '/dev/null',
        // Deliberately cross a day boundary; watermark dates must remain UTC.
        TZ: 'Pacific/Honolulu',
    };

    function write(relativePath, content) {
        const filePath = join(root, relativePath);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, content);
        return filePath;
    }

    const scriptsPath = join(root, 'src', '_scripts', '_export-drawios');
    mkdirSync(scriptsPath, { recursive: true });
    for (const file of readdirSync(__dirname)) {
        if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            copyFileSync(join(__dirname, file), join(scriptsPath, file));
        }
    }
    copyFileSync(
        join(sourceRoot, 'src', '_scripts', '_update-drawio-links.js'),
        join(root, 'src', '_scripts', '_update-drawio-links.js'),
    );
    copyFileSync(join(sourceRoot, 'package-lock.json'), join(root, 'package-lock.json'));
    mkdirSync(join(root, 'static', 'img'), { recursive: true });
    copyFileSync(join(sourceRoot, 'static', 'img', 'logo.svg'), join(root, 'static', 'img', 'logo.svg'));
    for (const architecture of documents) {
        write('docs/ref-arch/' + architecture.id + '/readme.md', readme(architecture));
        write('docs/ref-arch/' + architecture.id + '/drawio/architecture.drawio', diagram(architecture.label));
    }

    function git(args, date = initialDate) {
        return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], {
            cwd: root,
            env: {
                ...env,
                GIT_AUTHOR_DATE: date,
                GIT_COMMITTER_DATE: date,
            },
            encoding: 'utf8',
            timeout: 30000,
        });
    }
    git(['init', '--quiet', '--initial-branch=e2e']);
    git(['add', 'docs', 'src', 'static', 'package-lock.json']);
    git(['-c', 'user.name=Drawio E2E', '-c', 'user.email=drawio-e2e@example.test',
        'commit', '--quiet', '--no-gpg-sign', '-m', 'Create export fixtures']);

    function run(relativeScript, extraEnv = {}) {
        const result = spawnSync(process.execPath, [join(root, relativeScript)], {
            cwd: root,
            env: { ...env, ...extraEnv },
            encoding: 'utf8',
            // Generous: the first run may cold-pull the ~1 GB renderer image before
            // rendering. Keep below the per-test timeouts so a genuine hang still
            // surfaces as a killed subprocess rather than a bare test timeout.
            timeout: 300000,
            maxBuffer: 10 * 1024 * 1024,
        });
        rendererInterrupted ||= Boolean(result.error || result.signal);
        assert.ifError(result.error);
        assert.equal(result.signal, null, 'Export process must finish without being killed.');
        return { ...result, output: result.stdout + result.stderr };
    }

    return {
        root,
        cache,
        write,
        git,
        run,
        export: (extraEnv) => run('src/_scripts/_export-drawios/_export.js', extraEnv),
        svgPath: (id) => join(root, 'docs', 'ref-arch', id, 'images', 'architecture.svg'),
        sourcePath: (id) => join(root, 'docs', 'ref-arch', id, 'drawio', 'architecture.drawio'),
        indexPath: join(root, 'static', 'artifacts', 'data.json'),
    };
}

function assertSuccessfulExport(fixture, documents, dates = {}) {
    const data = JSON.parse(readFileSync(fixture.indexPath, 'utf8'));
    assert.equal(data.length, documents.length);
    const qrCode = require('qrcode');
    const { JSDOM } = require('jsdom');

    return Promise.all(documents.map(async (architecture) => {
        const svg = readFileSync(fixture.svgPath(architecture.id), 'utf8');
        assert.match(svg, /<svg(?:\s|>)/);
        assert.equal((svg.match(/id="drawio-title"/g) || []).length, 1, 'Apply exactly one watermark.');
        const parsedSvg = new JSDOM(svg, { contentType: 'image/svg+xml' });
        try {
            const document = parsedSvg.window.document;
            assert.equal(document.documentElement.localName, 'svg');
            assert.equal(document.documentElement.namespaceURI, 'http://www.w3.org/2000/svg');
            assert.equal(document.getElementById('drawio-title')?.textContent.trim(), architecture.title);
            assert.equal(document.querySelector('script'), null);
        } finally {
            parsedSvg.window.close();
        }
        assert.ok(svg.includes(architecture.label), 'The actual diagram label must be rendered.');
        assert.ok(svg.includes('Last update on ' + (dates[architecture.id] || 'January 2, 2026')));
        assert.ok(svg.includes(architecture.slug.slice('/ref-arch/'.length)));
        const viewBox = svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
        assert.ok(viewBox.every(Number.isFinite));
        assert.ok(viewBox[2] > 0 && viewBox[3] > 0);
        const logo = readFileSync(join(fixture.root, 'static', 'img', 'logo.svg'));
        assert.ok(svg.includes('href="data:image/svg+xml;base64,' + logo.toString('base64') + '"'));
        const qrSvg = await qrCode.toString(baseUrl + '/docs' + architecture.slug, { type: 'svg', margin: 0 });
        assert.ok(svg.includes(qrSvg.replace(/<\/*svg[^>]*>/g, '')), 'Embed the QR geometry for the page URL.');

        const thumbnailName = architecture.thumbnailName;
        const thumbnail = join(fixture.root, 'static', 'artifacts', 'thumbnails', thumbnailName);
        assert.equal(readFileSync(thumbnail, 'utf8'), svg, 'Thumbnail must be the watermarked SVG.');
        assert.deepEqual(data.find((item) => item.id === architecture.id), {
            id: architecture.id,
            name: architecture.title,
            drawioLink: 'PLACEHOLDER:docs/ref-arch/' + architecture.id + '/drawio/architecture.drawio',
            thumbnailLink: baseUrl + '/artifacts/thumbnails/' + thumbnailName,
            acLink: baseUrl + '/docs' + architecture.slug,
            shortDescription: architecture.description,
        });
        return svg;
    }));
}

async function buildAndResolveLinks(fixture, documents) {
    const webpack = require('webpack');
    const { default: assetTypes } = await import(pathToFileURL(join(sourceRoot, 'src', 'plugins', 'asset-types', 'index.js')).href);
    const entryPath = fixture.write('entry.cjs', 'module.exports = {\n'
        + documents.map((architecture) => JSON.stringify(architecture.id) + ': {\n'
            + 'drawio: require(' + JSON.stringify('./docs/ref-arch/' + architecture.id + '/drawio/architecture.drawio') + '),\n'
            + 'xml: require(' + JSON.stringify('./docs/ref-arch/' + architecture.id + '/drawio/architecture.drawio?source') + '),\n'
            + 'svg: require(' + JSON.stringify('./docs/ref-arch/' + architecture.id + '/images/architecture.svg?resource') + ')\n'
            + '}').join(',\n') + '\n};\n');
    const buildPath = join(fixture.root, 'build');
    const config = {
        mode: 'production',
        target: 'node',
        entry: entryPath,
        output: {
            path: buildPath,
            filename: 'bundle.cjs',
            library: { type: 'commonjs2' },
            publicPath: '',
            hashFunction: 'xxhash64',
            clean: true,
        },
        optimization: { minimize: false },
        module: { rules: [{ test: /\.svg$/, type: 'asset/source' }] },
    };
    assetTypes().configureWebpack(config);
    const compiler = webpack(config);
    const stats = await new Promise((resolveStats, reject) => {
        compiler.run((error, result) => {
            compiler.close((closeError) => {
                if (error || closeError) reject(error || closeError);
                else resolveStats(result);
            });
        });
    });
    assert.ok(!stats.hasErrors(), stats.toString({ all: false, errors: true }));
    cpSync(join(fixture.root, 'static', 'artifacts'), join(buildPath, 'artifacts'), { recursive: true });
    const result = fixture.run('src/_scripts/_update-drawio-links.js');
    assert.equal(result.status, 0, result.output);
    const resolvedData = JSON.parse(readFileSync(join(buildPath, 'artifacts', 'data.json'), 'utf8'));
    const bundlePath = join(buildPath, 'bundle.cjs');
    delete require.cache[require.resolve(bundlePath)];
    const emitted = require(bundlePath);
    const emittedNames = new Set();
    for (const architecture of documents) {
        assert.match(emitted[architecture.id].drawio, /^architecture-[0-9a-f]{16}\.drawio$/);
        emittedNames.add(emitted[architecture.id].drawio);
        assert.equal(emitted[architecture.id].xml, readFileSync(fixture.sourcePath(architecture.id), 'utf8'));
        assert.equal(readFileSync(join(buildPath, emitted[architecture.id].drawio), 'utf8'), emitted[architecture.id].xml);
        assert.equal(readFileSync(join(buildPath, emitted[architecture.id].svg), 'utf8'), readFileSync(fixture.svgPath(architecture.id), 'utf8'));
        const artifact = resolvedData.find((item) => item.id === architecture.id);
        assert.equal(artifact.drawioLink, baseUrl + '/' + emitted[architecture.id].drawio);
        assert.ok(!artifact.drawioLink.includes('PLACEHOLDER:'));
    }
    assert.equal(emittedNames.size, documents.length, 'Same-basename diagrams must remain distinct emitted assets.');
    return resolvedData;
}

test('Draw.io export completes rendering, watermarking, assets, and cache invalidation', {
    skip: !enabled,
    timeout: 600000,
}, async (t) => {
    const fixture = makeFixture(t);
    const first = fixture.export();
    assert.equal(first.status, 0, first.output);
    const originalSvgs = await assertSuccessfulExport(fixture, architectures);
    assert.ok(existsSync(join(fixture.cache, 'manifest.json')), 'Persist the private cache.');
    const initialAssets = await buildAndResolveLinks(fixture, architectures);

    for (const architecture of architectures) rmSync(dirname(fixture.svgPath(architecture.id)), { recursive: true });
    rmSync(join(fixture.root, 'static', 'artifacts'), { recursive: true });
    const restored = fixture.export();
    assert.equal(restored.status, 0, restored.output);
    assert.equal((restored.output.match(/Cache hit for /g) || []).length, architectures.length);
    assert.equal((restored.output.match(/Using watermarked SVG from cache/g) || []).length, architectures.length);
    assert.deepEqual(await assertSuccessfulExport(fixture, architectures), originalSvgs, 'Restore the exact cached SVGs.');

    const updated = [
        { ...architectures[0], title: 'Updated E2E Architecture', slug: '/ref-arch/RA9001/updated',
            thumbnailName: 'updated-e2e-architecture.svg' },
        architectures[1],
    ];
    fixture.write('docs/ref-arch/RA9001/readme.md', readme(updated[0]));
    const metadataChanged = fixture.export();
    assert.equal(metadataChanged.status, 0, metadataChanged.output);
    assert.equal((metadataChanged.output.match(/Cache hit for /g) || []).length, 1);
    const metadataSvgs = await assertSuccessfulExport(fixture, updated);
    assert.notEqual(metadataSvgs[0], originalSvgs[0]);
    assert.equal(metadataSvgs[1], originalSvgs[1], 'Unchanged architecture stays cached.');

    updated[0] = { ...updated[0], label: 'Updated source one' };
    fixture.write('docs/ref-arch/RA9001/drawio/architecture.drawio', diagram(updated[0].label));
    fixture.git(['add', 'docs/ref-arch/RA9001/drawio/architecture.drawio']);
    fixture.git(['-c', 'user.name=Drawio E2E', '-c', 'user.email=drawio-e2e@example.test',
        'commit', '--quiet', '--no-gpg-sign', '-m', 'Update diagram source'], updatedDate);
    const sourceChanged = fixture.export();
    assert.equal(sourceChanged.status, 0, sourceChanged.output);
    assert.equal((sourceChanged.output.match(/Cache hit for /g) || []).length, 1);
    const sourceSvgs = await assertSuccessfulExport(fixture, updated, { RA9001: 'January 3, 2026' });
    assert.notEqual(sourceSvgs[0], metadataSvgs[0]);
    assert.ok(!sourceSvgs[0].includes('Original source one'));
    assert.equal(sourceSvgs[1], originalSvgs[1]);
    const updatedAssets = await buildAndResolveLinks(fixture, updated);
    assert.notEqual(updatedAssets[0].drawioLink, initialAssets[0].drawioLink, 'Changed source gets a new download URL.');
    assert.equal(updatedAssets[1].drawioLink, initialAssets[1].drawioLink, 'Unchanged source keeps its download URL.');
});

for (const missingField of ['title', 'slug']) {
    test('Draw.io export fails without artifact metadata when ' + missingField + ' is missing', {
        skip: !enabled,
        timeout: 180000,
    }, (t) => {
        const fixture = makeFixture(t, [{ ...architectures[0], [missingField]: undefined }]);
        fixture.write('docs/ref-arch/RA9001/images/architecture.svg', '<svg>stale output</svg>');
        const result = fixture.export();
        assert.equal(result.status, 1, result.output);
        assert.ok(result.output.includes('missing a "' + missingField + '" front-matter field'));
        assert.equal(existsSync(fixture.svgPath('RA9001')), false, 'Remove stale output on failure.');
        assert.equal(existsSync(fixture.indexPath), false, 'Do not publish a successful artifact index.');
    });
}

test('Draw.io export fails without publishing artifacts for an invalid diagram', {
    skip: !enabled,
    timeout: 180000,
}, (t) => {
    const fixture = makeFixture(t, [architectures[0]]);
    fixture.write('docs/ref-arch/RA9001/drawio/architecture.drawio', 'This is not a Draw.io document.');
    fixture.write('docs/ref-arch/RA9001/images/architecture.svg', '<svg>stale output</svg>');
    const result = fixture.export();
    assert.equal(result.status, 1, result.output);
    assert.ok(result.output.includes('Failed to export 1 Draw.io file(s).'));
    assert.equal(existsSync(fixture.svgPath('RA9001')), false, 'Remove stale output on export failure.');
    assert.equal(existsSync(fixture.indexPath), false, 'Do not publish a successful artifact index.');
});

test('interrupted renderer cleanup only removes containers belonging to its fixture', {
    skip: !enabled,
    timeout: 120000,
}, (t) => {
    const { DRAWIO_IMAGE } = require('./docker-export');
    const fixture = makeFixture(t, [architectures[0]]);
    const remainingContainers = new Set();
    const options = { encoding: 'utf8', timeout: 30000 };
    t.after(() => {
        if (remainingContainers.size) {
            execFileSync('docker', ['rm', '--force', ...remainingContainers], options);
        }
    });

    function startContainer(mountFixture) {
        const args = ['run', '--detach', '--rm', '--read-only', '--network=none',
            '--cap-drop=ALL', '--security-opt=no-new-privileges:true', '--pids-limit=16',
            '--memory=32m', '--memory-swap=32m', '--cpus=0.1',
            `--user=${process.getuid()}:${process.getgid()}`, '--entrypoint=/bin/sh'];
        if (mountFixture) {
            args.push('--mount', `type=bind,source=${fixture.sourcePath('RA9001')},target=/input.drawio,readonly`);
        }
        args.push(DRAWIO_IMAGE, '-c', 'sleep 120');
        const id = execFileSync('docker', args, options).trim();
        remainingContainers.add(id);
        return id;
    }

    const ownedContainer = startContainer(true);
    const otherContainer = startContainer(false);
    removeInterruptedRendererContainers(dirname(fixture.root));
    const removed = spawnSync('docker', ['inspect', ownedContainer], options);
    assert.ifError(removed.error);
    assert.equal(removed.status, 1, 'Remove the interrupted renderer for this fixture.');
    remainingContainers.delete(ownedContainer);
    const [other] = JSON.parse(execFileSync('docker', ['inspect', otherContainer], options));
    assert.equal(other.State.Running, true, 'Leave containers without fixture bind mounts running.');
});

test('Draw.io export escapes hostile readme metadata instead of emitting active content', {
    skip: !enabled,
    timeout: 600000,
}, async (t) => {
    const { JSDOM } = require('jsdom');
    // Both vectors are whitespace-free so the slug survives the `\S+` capture in
    // getRenderContext, and the title carries a `]]>` CDATA-breakout sequence.
    const hostile = {
        id: 'RA9001',
        title: 'Evil]]></text><script>alert(document.domain)</script><text><![CDATA[x',
        slug: '/ref-arch/RA9001</text><script>alert(document.domain)</script><text>',
        label: 'Hostile fixture source',
        description: 'Attempts stored XSS via title and slug front-matter.',
    };
    const fixture = makeFixture(t, [hostile]);
    const result = fixture.export();
    assert.equal(result.status, 0, result.output);

    const svg = readFileSync(fixture.svgPath('RA9001'), 'utf8');
    // No raw <script> may appear anywhere in the served SVG (plain substring
    // check, case-insensitive — not a tag-matching regex).
    assert.ok(!svg.toLowerCase().includes('<script'), 'Raw <script> must not survive the watermark splice.');
    const parsed = new JSDOM(svg, { contentType: 'image/svg+xml' });
    try {
        const document = parsed.window.document;
        assert.equal(document.querySelector('parsererror'), null, 'Exported SVG must be well-formed XML.');
        assert.equal(document.documentElement.localName, 'svg');
        assert.equal(document.querySelector('script'), null, 'No script element may be injected.');
        // The hostile title survives only as inert, entity-escaped text content.
        assert.equal(document.getElementById('drawio-title')?.textContent.trim(), hostile.title);
    } finally {
        parsed.window.close();
    }
});
