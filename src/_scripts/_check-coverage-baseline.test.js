const test = require('node:test');
const assert = require('node:assert/strict');

const { compareCoverage, readUncoveredSummary } = require('./_check-coverage-baseline');

test('extracts uncovered counts from a Jest coverage summary', () => {
    const total = Object.fromEntries(
        ['branches', 'functions', 'lines', 'statements'].map((metric, index) => [
            metric,
            { total: 10 + index, covered: 4 + index, skipped: 0, pct: 40 },
        ])
    );

    assert.deepEqual(readUncoveredSummary({ total }), {
        branches: 6,
        functions: 6,
        lines: 6,
        statements: 6,
    });
});

test('reports regressions and stale improvements independently', () => {
    const baseline = { branches: 10, functions: 10, lines: 10, statements: 10 };
    const current = { branches: 11, functions: 9, lines: 10, statements: 12 };

    assert.deepEqual(compareCoverage(current, baseline), {
        regressions: [
            { metric: 'branches', current: 11, baseline: 10 },
            { metric: 'statements', current: 12, baseline: 10 },
        ],
        improvements: [{ metric: 'functions', current: 9, baseline: 10 }],
    });
});
