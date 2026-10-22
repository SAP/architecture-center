const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '../..');
const baselinePath = path.join(projectRoot, 'quality-baselines/typescript.json');

function parseDiagnostics(output) {
    const diagnostics = [];

    for (const line of output.split(/\r?\n/)) {
        const fileDiagnostic = line.match(/^(.+)\((\d+),(\d+)\): error TS(\d+):/);
        if (fileDiagnostic) {
            diagnostics.push({
                file: fileDiagnostic[1].replaceAll('\\', '/'),
                code: `TS${fileDiagnostic[4]}`,
            });
            continue;
        }

        const globalDiagnostic = line.match(/^error TS(\d+):/);
        if (globalDiagnostic) {
            diagnostics.push({ file: '<global>', code: `TS${globalDiagnostic[1]}` });
        }
    }

    return diagnostics;
}

function summarizeDiagnostics(diagnostics) {
    const counts = new Map();

    for (const diagnostic of diagnostics) {
        const key = `${diagnostic.file}\0${diagnostic.code}`;
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    return [...counts.entries()]
        .map(([key, count]) => {
            const [file, code] = key.split('\0');
            return { file, code, count };
        })
        .sort((left, right) => left.file.localeCompare(right.file) || left.code.localeCompare(right.code));
}

function compareDiagnostics(current, baseline) {
    const key = ({ file, code }) => `${file}\0${code}`;
    const currentByKey = new Map(current.map((entry) => [key(entry), entry]));
    const baselineByKey = new Map(baseline.map((entry) => [key(entry), entry]));
    const increased = [];
    const reduced = [];

    for (const [diagnosticKey, entry] of currentByKey) {
        const allowed = baselineByKey.get(diagnosticKey)?.count || 0;
        if (entry.count > allowed) {
            increased.push({ ...entry, baseline: allowed });
        } else if (entry.count < allowed) {
            reduced.push({ ...entry, baseline: allowed });
        }
    }

    for (const [diagnosticKey, entry] of baselineByKey) {
        if (!currentByKey.has(diagnosticKey)) {
            reduced.push({ ...entry, count: 0, baseline: entry.count });
        }
    }

    return { increased, reduced };
}

function formatDifference({ file, code, count, baseline }) {
    return `  ${file} ${code}: ${count} current, ${baseline} baseline`;
}

function loadBaseline() {
    const parsed = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    if (parsed.version !== 1 || !Array.isArray(parsed.diagnostics)) {
        throw new Error(`Unsupported TypeScript baseline format in ${path.relative(projectRoot, baselinePath)}`);
    }
    return parsed.diagnostics;
}

function writeBaseline(diagnostics) {
    const baseline = {
        version: 1,
        description: 'Known TypeScript diagnostics grouped by source file and error code.',
        diagnostics,
    };
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 4)}\n`);
}

function runTypeScript() {
    const compilerPath = require.resolve('typescript/lib/tsc.js', { paths: [projectRoot] });
    return spawnSync(process.execPath, [compilerPath, '--noEmit', '--pretty', 'false'], {
        cwd: projectRoot,
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024,
    });
}

function main() {
    const result = runTypeScript();
    if (result.error) {
        throw result.error;
    }
    if (result.signal) {
        throw new Error(`TypeScript was terminated by ${result.signal}`);
    }

    const output = `${result.stdout || ''}${result.stderr || ''}`;
    const diagnostics = summarizeDiagnostics(parseDiagnostics(output));
    const total = diagnostics.reduce((sum, entry) => sum + entry.count, 0);

    if (result.status !== 0 && diagnostics.length === 0) {
        process.stderr.write(output);
        throw new Error(`TypeScript exited with status ${result.status} without parseable diagnostics`);
    }

    if (process.argv.includes('--update')) {
        writeBaseline(diagnostics);
        console.log(`Updated TypeScript baseline with ${total} diagnostics.`);
        return;
    }

    const baseline = loadBaseline();
    const comparison = compareDiagnostics(diagnostics, baseline);

    if (comparison.increased.length > 0) {
        process.stderr.write(output);
        console.error('TypeScript introduced diagnostics beyond the checked-in baseline:');
        console.error(comparison.increased.map(formatDifference).join('\n'));
    }

    if (comparison.reduced.length > 0) {
        console.error('The TypeScript baseline is stale because diagnostics were removed:');
        console.error(comparison.reduced.map(formatDifference).join('\n'));
        console.error('Run `npm run typecheck:baseline` and commit the reduced baseline.');
    }

    if (comparison.increased.length > 0 || comparison.reduced.length > 0) {
        process.exitCode = 1;
        return;
    }

    console.log(`TypeScript baseline passed: ${total} known diagnostics, no regression.`);
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

module.exports = { compareDiagnostics, parseDiagnostics, summarizeDiagnostics };
