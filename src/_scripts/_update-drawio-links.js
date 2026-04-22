const { readFileSync, writeFileSync, readdirSync, existsSync } = require('node:fs');
const { join, basename } = require('node:path');

const log = console.log;

const ROOT = join(__dirname, '..', '..');
const BUILD_DIR = join(ROOT, 'build');
const ARTIFACTS_DIR = join(BUILD_DIR, 'artifacts');
const DATA_JSON_PATH = join(ARTIFACTS_DIR, 'data.json');
const BASE_URL = 'https://architecture.learning.sap.com';

async function updateDrawioLinks() {
    if (!existsSync(DATA_JSON_PATH)) {
        log(`Error: ${DATA_JSON_PATH} not found. Please ensure the build process has completed and generated data.json.`);
        process.exit(1);
    }

    const data = JSON.parse(readFileSync(DATA_JSON_PATH, 'utf8'));

    // Recursively find all .drawio files in the build directory
    const buildFiles = readdirSync(BUILD_DIR, { recursive: true });
    const hashedDrawioFiles = buildFiles.filter(file => file.match(/\.drawio$/));

    const updatedData = data.map(item => {
        if (item.drawioLink && item.drawioLink.startsWith('PLACEHOLDER:')) {
            const originalFilename = item.drawioLink.replace('PLACEHOLDER:', '');
            log(`\nProcessing item: ${item.name}`);
            log(`  Original filename from placeholder: "${originalFilename}"`);
            
            // Find the corresponding hashed file in the build directory
            const foundHashedFile = hashedDrawioFiles.find(hashedFile => {
                log(`  Checking hashed file: "${hashedFile}"`);
                // Extract the original filename part from the hashed filename
                // e.g., "susaas-app-architecture-7660296ed96a7e1e.drawio" -> "susaas-app-architecture.drawio"
                const parts = basename(hashedFile).split('-');
                let extractedBaseName;
                // Check if the last part looks like a 16-char hex hash followed by .drawio
                if (parts.length > 1 && parts[parts.length - 1].match(/^[0-9a-f]{16}\.drawio$/i)) {
                    extractedBaseName = parts.slice(0, -1).join('-') + '.drawio';
                } else {
                    // If not hashed, the base name is the filename itself
                    extractedBaseName = basename(hashedFile);
                }
                log(`  Extracted base from hashed file: "${extractedBaseName}"`);
                log(`  Comparison result: ${extractedBaseName === originalFilename}`);
                return extractedBaseName === originalFilename;
            });

            if (foundHashedFile) {
                // Construct the new URL using the BASE_URL and the path relative to BUILD_DIR
                item.drawioLink = `${BASE_URL}/${foundHashedFile.replace(/\\/g, '/')}`; // Replace backslashes for URL
                log(`Updated drawioLink for "${originalFilename}" to "${item.drawioLink}"`);
            } else {
                log(`[WARNING] Could not find hashed file for "${originalFilename}" in build directory.`);
            }
        }
        return item;
    });

    writeFileSync(DATA_JSON_PATH, JSON.stringify(updatedData, null, 2));
    log('Successfully updated drawio links in data.json.');
}

updateDrawioLinks().catch(e => {
    log('Error updating drawio links:', e);
    process.exit(1);
});
