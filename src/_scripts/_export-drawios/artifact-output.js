const {
    closeSync,
    lstatSync,
    mkdirSync,
    openSync,
    realpathSync,
    renameSync,
    rmSync,
    writeFileSync,
} = require('node:fs');
const { randomUUID } = require('node:crypto');
const { basename, dirname, isAbsolute, join, relative, resolve, sep } = require('node:path');
const { validateOutputPath } = require('./docker-export');

// Anchor artifact directories to the trusted checkout. Check each component
// before creating its children, so even a dangling or in-repository symlink in
// static/artifacts/thumbnails is rejected rather than followed by recursive mkdir.
function ensureOutputDirectory(directoryPath, repositoryRoot) {
    const directoryRelativePath = relative(resolve(repositoryRoot), resolve(directoryPath));
    if (
        directoryRelativePath === '..' ||
        directoryRelativePath.startsWith(`..${sep}`) ||
        isAbsolute(directoryRelativePath)
    ) {
        throw new Error(`Artifact directory is outside the repository: ${directoryPath}`);
    }

    let currentDirectory = realpathSync(repositoryRoot);
    if (directoryRelativePath) {
        for (const component of directoryRelativePath.split(sep)) {
            currentDirectory = join(currentDirectory, component);
            try {
                mkdirSync(currentDirectory);
            } catch (error) {
                if (error.code !== 'EEXIST') throw error;
            }
            if (!lstatSync(currentDirectory).isDirectory()) {
                throw new Error(`Artifact directory must be a regular, non-symlink directory: ${currentDirectory}`);
            }
        }
    }
    return currentDirectory;
}

function writeArtifactFile(outputPath, content, allowedFilesRoot, repositoryRoot) {
    const realAllowedRoot = ensureOutputDirectory(allowedFilesRoot, repositoryRoot);
    const absoluteOutput = validateOutputPath(outputPath, realAllowedRoot);
    const realOutputParent = realpathSync(dirname(absoluteOutput));
    const destinationPath = join(realOutputParent, basename(absoluteOutput));
    const temporaryPath = join(realOutputParent, `.drawio-artifact-${randomUUID()}.tmp`);
    const temporaryFd = openSync(temporaryPath, 'wx', 0o666);

    // Rename replaces the destination entry without following it, including a
    // symlink introduced after validation. Keep the temporary file beside the
    // destination so the rename is atomic and cannot cross filesystem boundaries.
    try {
        try {
            writeFileSync(temporaryFd, content, 'utf8');
        } finally {
            closeSync(temporaryFd);
        }
        renameSync(temporaryPath, destinationPath);
    } finally {
        rmSync(temporaryPath, { force: true });
    }
}

module.exports = { ensureOutputDirectory, writeArtifactFile };
