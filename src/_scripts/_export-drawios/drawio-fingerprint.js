const { createHash } = require('node:crypto');

const FINGERPRINT_SCHEMA_VERSION = 2;

function updateField(hash, name, value) {
    const content = Buffer.isBuffer(value) ? value : Buffer.from(String(value));
    hash.update(`${name}:${content.length}:`);
    hash.update(content);
    hash.update('\n');
}

function createDrawioFingerprint({
    sourceContent,
    title,
    slug,
    logoContent,
    lastUpdated,
    rendererIdentity,
    pipelineIdentity,
    qrCodeVersion,
    baseUrl,
}) {
    const hash = createHash('sha256');
    updateField(hash, 'schema', FINGERPRINT_SCHEMA_VERSION);
    updateField(hash, 'source', sourceContent);
    updateField(hash, 'title', title);
    updateField(hash, 'slug', slug);
    updateField(hash, 'logo', logoContent);
    updateField(hash, 'lastUpdated', lastUpdated);
    updateField(hash, 'renderer', rendererIdentity);
    updateField(hash, 'pipeline', pipelineIdentity);
    updateField(hash, 'qrCodeVersion', qrCodeVersion);
    updateField(hash, 'baseUrl', baseUrl);
    return hash.digest('hex');
}

module.exports = {
    FINGERPRINT_SCHEMA_VERSION,
    createDrawioFingerprint,
};
