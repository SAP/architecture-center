const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');
const DrawioCache = require('./drawio-cache');

function withCache(run) {
    const root = mkdtempSync(join(tmpdir(), 'drawio-cache-test-'));
    const cacheDir = join(root, 'cache');
    const sourcePath = join(root, 'docs', 'diagram.drawio');
    const restoredPath = join(root, 'restored.svg');
    mkdirSync(dirname(sourcePath), { recursive: true });
    writeFileSync(sourcePath, '<mxfile />');

    try {
        run({ root, cacheDir, sourcePath, restoredPath });
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}

test('stores, reloads, validates, and restores an artifact by composite fingerprint', () => {
    withCache(({ cacheDir, sourcePath, restoredPath }) => {
        const cache = new DrawioCache({ isEnabled: true, cacheDir });
        cache.store(sourcePath, 'fingerprint-v1', '<svg>valid</svg>');
        cache.flush();

        const reloaded = new DrawioCache({ isEnabled: true, cacheDir });
        assert.equal(reloaded.isValid(sourcePath, 'fingerprint-v1'), true);
        assert.equal(reloaded.isValid(sourcePath, 'fingerprint-v2'), false);
        assert.equal(reloaded.restore(sourcePath, restoredPath), true);
        assert.equal(readFileSync(restoredPath, 'utf8'), '<svg>valid</svg>');
    });
});

test('treats legacy manifests and missing artifacts as cache misses', () => {
    withCache(({ cacheDir, sourcePath }) => {
        mkdirSync(cacheDir, { recursive: true });
        writeFileSync(
            join(cacheDir, 'manifest.json'),
            JSON.stringify({ [sourcePath]: { sourceHash: 'source-only', lastUpdate: Date.now() } })
        );
        const legacyCache = new DrawioCache({ isEnabled: true, cacheDir });
        assert.equal(legacyCache.isValid(sourcePath, 'source-only'), false);

        legacyCache.store(sourcePath, 'fingerprint', '<svg>valid</svg>');
        legacyCache.flush();
        const artifactName = createHash('sha256').update(sourcePath).digest('hex');
        unlinkSync(join(cacheDir, artifactName));
        assert.equal(legacyCache.isValid(sourcePath, 'fingerprint'), false);
    });
});

test('rejects corrupted cached artifacts and will not restore them', () => {
    withCache(({ cacheDir, sourcePath, restoredPath }) => {
        const cache = new DrawioCache({ isEnabled: true, cacheDir });
        cache.store(sourcePath, 'fingerprint', '<svg>valid</svg>');
        cache.flush();

        const artifactName = createHash('sha256').update(sourcePath).digest('hex');
        writeFileSync(join(cacheDir, artifactName), '<svg>corrupted</svg>');

        assert.equal(cache.isValid(sourcePath, 'fingerprint'), false);
        assert.equal(cache.restore(sourcePath, restoredPath), false);
    });
});

test('rejects symlinked cache artifacts without reading or overwriting their targets', () => {
    withCache(({ root, cacheDir, sourcePath, restoredPath }) => {
        const cache = new DrawioCache({ isEnabled: true, cacheDir });
        cache.store(sourcePath, 'fingerprint', '<svg>valid</svg>');
        cache.flush();

        const artifactName = createHash('sha256').update(sourcePath).digest('hex');
        const artifactPath = join(cacheDir, artifactName);
        const targetPath = join(root, 'outside.svg');
        unlinkSync(artifactPath);
        writeFileSync(targetPath, '<svg>outside</svg>');
        symlinkSync(targetPath, artifactPath);

        assert.equal(cache.isValid(sourcePath, 'fingerprint'), false);
        assert.equal(cache.restore(sourcePath, restoredPath), false);
        const warnings = [];
        const originalWarn = console.warn;
        console.warn = (message) => warnings.push(message);
        try {
            cache.store(sourcePath, 'fingerprint', '<svg>replacement</svg>');
        } finally {
            console.warn = originalWarn;
        }
        assert.match(warnings.join('\n'), /not a regular file/);
        assert.equal(readFileSync(targetPath, 'utf8'), '<svg>outside</svg>');
    });
});

test('rejects a symlinked restore destination without overwriting its target', () => {
    withCache(({ root, cacheDir, sourcePath, restoredPath }) => {
        const cache = new DrawioCache({ isEnabled: true, cacheDir });
        cache.store(sourcePath, 'fingerprint', '<svg>cached</svg>');
        cache.flush();

        const targetPath = join(root, 'outside.svg');
        writeFileSync(targetPath, '<svg>outside</svg>');
        symlinkSync(targetPath, restoredPath);

        const originalWarn = console.warn;
        console.warn = () => {};
        try {
            assert.equal(cache.restore(sourcePath, restoredPath), false);
        } finally {
            console.warn = originalWarn;
        }
        assert.equal(readFileSync(targetPath, 'utf8'), '<svg>outside</svg>');
    });
});
