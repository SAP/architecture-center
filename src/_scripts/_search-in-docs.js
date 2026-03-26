const { readFileSync, readdirSync } = require('node:fs');
const { join, basename } = require('node:path');
const readline = require('node:readline');

const log = console.log;

const ROOT = join(__dirname, '..', '..');
const DOCS_DIR = join(ROOT, 'docs');

function searchInDocs(pattern) {
    const files = readdirSync(DOCS_DIR, { recursive: true });
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    let matchCount = 0;

    markdownFiles.forEach(file => {
        const filePath = join(DOCS_DIR, file);
        const content = readFileSync(filePath, 'utf8');

        if (content.includes(pattern)) {
            matchCount++;
            log(`\nMatch found:`);
            log(`  Path: ${file}`);
            log(`  File: ${basename(file)}`);
            log(`  Pattern: "${pattern}"`);
        }
    });

    if (matchCount === 0) {
        log(`\nNo matches found for "${pattern}"`);
    } else {
        log(`\n---\nTotal: ${matchCount} file(s) containing "${pattern}"`);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the pattern to search for: ', (pattern) => {
    if (!pattern.trim()) {
        log('Error: Pattern cannot be empty.');
        process.exit(1);
    }
    searchInDocs(pattern.trim());
    rl.close();
});
