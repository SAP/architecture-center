const test = require('node:test');
const assert = require('node:assert/strict');
const { createDrawioFingerprint } = require('./drawio-fingerprint');

const baseInputs = {
    sourceContent: Buffer.from('<mxfile />'),
    title: 'Architecture title',
    slug: '/ref-arch/RA0001',
    logoContent: Buffer.from('<svg id=logo />'),
    lastUpdated: 'October 22, 2026',
    rendererIdentity: 'sha256:renderer',
    pipelineIdentity: 'sha256:pipeline',
    qrCodeVersion: '1.5.4',
    baseUrl: 'https://architecture.learning.sap.com',
};

test('fingerprint changes for every input that affects rendered Draw.io output', () => {
    const original = createDrawioFingerprint(baseInputs);
    const changes = {
        sourceContent: Buffer.from('<mxfile modified=true />'),
        title: 'Updated architecture title',
        slug: '/ref-arch/RA9999',
        logoContent: Buffer.from('<svg id=updated-logo />'),
        lastUpdated: 'October 23, 2026',
        rendererIdentity: 'sha256:new-renderer',
        pipelineIdentity: 'sha256:new-pipeline',
        qrCodeVersion: '2.0.0',
        baseUrl: 'https://preview.example.com',
    };

    for (const [field, value] of Object.entries(changes)) {
        const changed = createDrawioFingerprint({ ...baseInputs, [field]: value });
        assert.notEqual(changed, original, `${field} must invalidate the cache`);
    }
});

test('fingerprint is deterministic', () => {
    assert.equal(createDrawioFingerprint(baseInputs), createDrawioFingerprint({ ...baseInputs }));
});
