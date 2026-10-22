const test = require('node:test');
const assert = require('node:assert/strict');

const {
    compareDiagnostics,
    parseDiagnostics,
    summarizeDiagnostics,
} = require('./_check-typescript-baseline');

test('parses file, Windows-path, and global TypeScript diagnostics', () => {
    const output = [
        'src/example.ts(4,2): error TS2322: Type mismatch.',
        '  This continuation is ignored.',
        'C:\\repo\\src\\other.ts(8,1): error TS6133: Unused.',
        'error TS18003: No inputs were found.',
    ].join('\n');

    assert.deepEqual(parseDiagnostics(output), [
        { file: 'src/example.ts', line: 4, column: 2, code: 'TS2322', message: 'Type mismatch.' },
        { file: 'C:/repo/src/other.ts', line: 8, column: 1, code: 'TS6133', message: 'Unused.' },
        { file: '<global>', code: 'TS18003', message: 'No inputs were found.' },
    ]);
});

test('groups only diagnostics with the same location, code, and message', () => {
    assert.deepEqual(
        summarizeDiagnostics([
            { file: 'src/b.ts', line: 1, column: 2, code: 'TS2', message: 'B' },
            { file: 'src/a.ts', line: 1, column: 2, code: 'TS1', message: 'A' },
            { file: 'src/a.ts', line: 1, column: 2, code: 'TS1', message: 'A' },
            { file: 'src/a.ts', line: 3, column: 4, code: 'TS1', message: 'Different diagnostic' },
        ]),
        [
            { file: 'src/a.ts', line: 1, column: 2, code: 'TS1', message: 'A', count: 2 },
            { file: 'src/a.ts', line: 3, column: 4, code: 'TS1', message: 'Different diagnostic', count: 1 },
            { file: 'src/b.ts', line: 1, column: 2, code: 'TS2', message: 'B', count: 1 },
        ]
    );
});

test('reports both regressions and stale baseline entries', () => {
    const baseline = [
        { file: 'src/a.ts', line: 1, column: 1, code: 'TS1', message: 'Existing', count: 1 },
        { file: 'src/removed.ts', line: 2, column: 1, code: 'TS2', message: 'Removed', count: 2 },
    ];
    const current = [
        { file: 'src/a.ts', line: 1, column: 1, code: 'TS1', message: 'Existing', count: 2 },
        { file: 'src/new.ts', line: 3, column: 1, code: 'TS3', message: 'New', count: 1 },
    ];

    assert.deepEqual(compareDiagnostics(current, baseline), {
        increased: [
            { file: 'src/a.ts', line: 1, column: 1, code: 'TS1', message: 'Existing', count: 2, baseline: 1 },
            { file: 'src/new.ts', line: 3, column: 1, code: 'TS3', message: 'New', count: 1, baseline: 0 },
        ],
        reduced: [
            { file: 'src/removed.ts', line: 2, column: 1, code: 'TS2', message: 'Removed', count: 0, baseline: 2 },
        ],
    });
});

test('does not allow one diagnostic to be exchanged for another with the same code', () => {
    const baseline = [
        { file: 'src/a.ts', line: 1, column: 1, code: 'TS2322', message: 'Old mismatch', count: 1 },
    ];
    const current = [
        { file: 'src/a.ts', line: 8, column: 1, code: 'TS2322', message: 'New mismatch', count: 1 },
    ];

    const comparison = compareDiagnostics(current, baseline);
    assert.equal(comparison.increased.length, 1);
    assert.equal(comparison.reduced.length, 1);
});
