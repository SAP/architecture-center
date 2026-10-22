const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const baselinePath = path.join(projectRoot, 'quality-baselines/coverage.json');
const summaryPath = path.join(projectRoot, 'coverage/coverage-summary.json');
const metricNames = ['branches', 'functions', 'lines', 'statements'];

function readUncoveredSummary(summary) {
    if (!summary || typeof summary !== 'object' || !summary.total) {
        throw new Error('Coverage summary is missing its total entry.');
    }

    return Object.fromEntries(metricNames.map((metric) => {
        const value = summary.total[metric];
        if (!value || !Number.isInteger(value.total) || !Number.isInteger(value.covered)) {
            throw new Error(`Coverage summary has an invalid ${metric} metric.`);
        }
        return [metric, value.total - value.covered];
    }));
}

function compareCoverage(current, baseline) {
    const regressions = [];
    const improvements = [];

    for (const metric of metricNames) {
        const difference = { metric, current: current[metric], baseline: baseline[metric] };
        if (current[metric] > baseline[metric]) regressions.push(difference);
        if (current[metric] < baseline[metric]) improvements.push(difference);
    }

    return { regressions, improvements };
}

function formatDifference({ metric, current, baseline }) {
    return `  ${metric}: ${current} current uncovered, ${baseline} baseline`;
}

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
    const current = readUncoveredSummary(loadJson(summaryPath));

    if (process.argv.includes('--update')) {
        const baseline = {
            version: 1,
            description: 'Maximum uncovered items from Jest coverage, updated whenever coverage improves.',
            uncovered: current,
        };
        fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
        fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 4)}\n`);
        console.log('Updated coverage baseline.');
        return;
    }

    const baseline = loadJson(baselinePath);
    if (baseline.version !== 1 || !baseline.uncovered) {
        throw new Error(`Unsupported coverage baseline format in ${path.relative(projectRoot, baselinePath)}`);
    }

    const comparison = compareCoverage(current, baseline.uncovered);
    if (comparison.regressions.length > 0) {
        console.error('Coverage regressed beyond the checked-in baseline:');
        console.error(comparison.regressions.map(formatDifference).join('\n'));
    }
    if (comparison.improvements.length > 0) {
        console.error('The coverage baseline is stale because coverage improved:');
        console.error(comparison.improvements.map(formatDifference).join('\n'));
        console.error('Run `npm run coverage:baseline` and commit the reduced baseline.');
    }
    if (comparison.regressions.length > 0 || comparison.improvements.length > 0) {
        process.exitCode = 1;
        return;
    }

    console.log('Coverage baseline passed: uncovered-item counts match the checked-in baseline.');
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

module.exports = { compareCoverage, readUncoveredSummary };
