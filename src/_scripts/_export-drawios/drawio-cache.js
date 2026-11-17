const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MANIFEST_SCHEMA_VERSION = 2;

/**
 * DrawioCache manages the caching of watermarked SVG artifacts to speed up build times.
 * It encapsulates file system operations related to caching, ensuring that cache misses or 
 * file system failures gracefully degrade to regenerating the artifacts.
 */
class DrawioCache {
    /**
     * @param {Object} options - Configuration for the cache.
     * @param {boolean} options.isEnabled - Whether caching is active.
     * @param {string} options.cacheDir - The directory where cache artifacts are stored.
     */
    constructor({ isEnabled, cacheDir }) {
        this._isEnabled = Boolean(isEnabled);
        this._cacheDir = cacheDir;
        this._manifestPath = path.join(this._cacheDir, 'manifest.json');
        this._manifest = {};
        
        if (this._isEnabled) {
            this._initialize();
        }
    }

    _initialize() {
        try {
            fs.mkdirSync(this._cacheDir, { recursive: true });
            if (!fs.lstatSync(this._cacheDir).isDirectory()) {
                throw new Error('Cache path is not a regular directory.');
            }
            
            if (fs.existsSync(this._manifestPath)) {
                if (!fs.lstatSync(this._manifestPath).isFile()) {
                    throw new Error('Cache manifest is not a regular file.');
                }
                const manifestContent = fs.readFileSync(this._manifestPath, 'utf-8');
                const storedManifest = JSON.parse(manifestContent);
                if (
                    storedManifest.schemaVersion === MANIFEST_SCHEMA_VERSION &&
                    storedManifest.entries &&
                    typeof storedManifest.entries === 'object'
                ) {
                    this._manifest = storedManifest.entries;
                }
            }
        } catch (error) {
            console.warn(`[DrawioCache] Initialization failed, caching disabled for this run. Error: ${error.message}`);
            this._isEnabled = false;
        }
    }

    _hash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    _isRegularFile(filePath) {
        return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
    }

    _writeFileAtomically(destinationPath, content) {
        const temporaryPath = `${destinationPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
        try {
            fs.writeFileSync(temporaryPath, content, { encoding: 'utf-8', flag: 'wx', mode: 0o600 });
            fs.renameSync(temporaryPath, destinationPath);
        } finally {
            fs.rmSync(temporaryPath, { force: true });
        }
    }

    /**
     * Validates if a cached artifact exists and is up-to-date with the source file.
     * @param {string} sourceFilePath - The path to the original source file.
     * @param {string} fingerprint - A hash of every input that affects the rendered SVG.
     * @returns {boolean} True if a valid cache entry exists.
     */
    isValid(sourceFilePath, fingerprint) {
        if (!this._isEnabled) return false;

        const entry = this._manifest[sourceFilePath];
        if (!entry || entry.fingerprint !== fingerprint || !entry.artifactHash) return false;

        const artifactPath = path.join(this._cacheDir, this._hash(sourceFilePath));
        try {
            return (
                this._isRegularFile(artifactPath) &&
                this._hash(fs.readFileSync(artifactPath)) === entry.artifactHash
            );
        } catch (error) {
            console.warn(`[DrawioCache] Failed to validate artifact for ${sourceFilePath}: ${error.message}`);
            return false;
        }
    }

    /**
     * Restores a cached artifact to a designated destination path.
     * @param {string} sourceFilePath - The original source file path used as a cache key.
     * @param {string} destinationPath - The path where the cached file should be restored.
     * @returns {boolean} True if restoration was successful, false otherwise.
     */
    restore(sourceFilePath, destinationPath) {
        if (!this._isEnabled) return false;

        const artifactName = this._hash(sourceFilePath);
        const artifactPath = path.join(this._cacheDir, artifactName);

        try {
            const entry = this._manifest[sourceFilePath];
            if (!entry?.artifactHash || !this._isRegularFile(artifactPath)) return false;
            if (fs.existsSync(destinationPath) && !this._isRegularFile(destinationPath)) {
                throw new Error('Draw.io cache restore destination is not a regular file.');
            }

            const artifactContent = fs.readFileSync(artifactPath);
            if (this._hash(artifactContent) !== entry.artifactHash) return false;
            this._writeFileAtomically(destinationPath, artifactContent);
            return true;
        } catch (error) {
            console.warn(`[DrawioCache] Failed to restore artifact for ${sourceFilePath}: ${error.message}`);
        }
        
        return false;
    }

    /**
     * Stores a generated artifact in the cache and updates the manifest.
     * @param {string} sourceFilePath - The original source file path.
     * @param {string} fingerprint - A hash of every input that affects the rendered SVG.
     * @param {string} artifactContent - The content of the generated artifact to cache.
     */
    store(sourceFilePath, fingerprint, artifactContent) {
        if (!this._isEnabled) return;

        const artifactName = this._hash(sourceFilePath);
        const artifactPath = path.join(this._cacheDir, artifactName);

        try {
            if (fs.existsSync(artifactPath) && !this._isRegularFile(artifactPath)) {
                throw new Error('Cached artifact path is not a regular file.');
            }
            this._writeFileAtomically(artifactPath, artifactContent);

            this._manifest[sourceFilePath] = {
                fingerprint,
                artifactHash: this._hash(artifactContent),
                lastUpdate: Date.now(),
            };
        } catch (error) {
            console.warn(`[DrawioCache] Failed to store artifact for ${sourceFilePath}: ${error.message}`);
        }
    }

    /**
     * Flushes the manifest state to disk.
     */
    flush() {
        if (!this._isEnabled) return;
        
        try {
            if (fs.existsSync(this._manifestPath) && !this._isRegularFile(this._manifestPath)) {
                throw new Error('Cache manifest path is not a regular file.');
            }
            this._writeFileAtomically(
                this._manifestPath,
                JSON.stringify(
                    {
                        schemaVersion: MANIFEST_SCHEMA_VERSION,
                        entries: this._manifest,
                    },
                    null,
                    2
                )
            );
        } catch (error) {
            console.warn(`[DrawioCache] Failed to save manifest: ${error.message}`);
        }
    }
}

module.exports = DrawioCache;
