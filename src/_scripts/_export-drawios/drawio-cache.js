const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

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
            
            if (fs.existsSync(this._manifestPath)) {
                const manifestContent = fs.readFileSync(this._manifestPath, 'utf-8');
                this._manifest = JSON.parse(manifestContent);
            }
        } catch (error) {
            console.warn(`[DrawioCache] Initialization failed, caching disabled for this run. Error: ${error.message}`);
            this._isEnabled = false;
        }
    }

    _hash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Validates if a cached artifact exists and is up-to-date with the source file.
     * @param {string} sourceFilePath - The path to the original source file.
     * @param {string} sourceHash - The SHA256 hash of the original source content.
     * @returns {boolean} True if a valid cache entry exists.
     */
    isValid(sourceFilePath, sourceHash) {
        if (!this._isEnabled) return false;
        
        const entry = this._manifest[sourceFilePath];
        return Boolean(entry && entry.sourceHash === sourceHash && entry.lastUpdate);
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
            if (fs.existsSync(artifactPath)) {
                fs.copyFileSync(artifactPath, destinationPath);
                return true;
            }
        } catch (error) {
            console.warn(`[DrawioCache] Failed to restore artifact for ${sourceFilePath}: ${error.message}`);
        }
        
        return false;
    }

    /**
     * Stores a generated artifact in the cache and updates the manifest.
     * @param {string} sourceFilePath - The original source file path.
     * @param {string} sourceHash - The SHA256 hash of the original source content.
     * @param {string} artifactContent - The content of the generated artifact to cache.
     */
    store(sourceFilePath, sourceHash, artifactContent) {
        if (!this._isEnabled) return;

        const artifactName = this._hash(sourceFilePath);
        const artifactPath = path.join(this._cacheDir, artifactName);

        try {
            fs.writeFileSync(artifactPath, artifactContent, 'utf-8');
            
            this._manifest[sourceFilePath] = {
                sourceHash,
                lastUpdate: Date.now()
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
            fs.writeFileSync(this._manifestPath, JSON.stringify(this._manifest, null, 2), 'utf-8');
        } catch (error) {
            console.warn(`[DrawioCache] Failed to save manifest: ${error.message}`);
        }
    }
}

module.exports = DrawioCache;
