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
        { file: 'src/example.ts', code: 'TS2322' },
        { file: 'C:/repo/src/other.ts', code: 'TS6133' },
        { file: '<global>', code: 'TS18003' },
    ]);
});

test('groups diagnostics by file and error code', () => {
    assert.deepEqual(
        summarizeDiagnostics([
            { file: 'src/b.ts', code: 'TS2' },
            { file: 'src/a.ts', code: 'TS1' },
            { file: 'src/a.ts', code: 'TS1' },
        ]),
        [
            { file: 'src/a.ts', code: 'TS1', count: 2 },
            { file: 'src/b.ts', code: 'TS2', count: 1 },
        ]
    );
});

test('reports both regressions and stale baseline entries', () => {
    const baseline = [
        { file: 'src/a.ts', code: 'TS1', count: 1 },
        { file: 'src/removed.ts', code: 'TS2', count: 2 },
    ];
    const current = [
        { file: 'src/a.ts', code: 'TS1', count: 2 },
        { file: 'src/new.ts', code: 'TS3', count: 1 },
    ];

    assert.deepEqual(compareDiagnostics(current, baseline), {
        increased: [
            { file: 'src/a.ts', code: 'TS1', count: 2, baseline: 1 },
            { file: 'src/new.ts', code: 'TS3', count: 1, baseline: 0 },
        ],
        reduced: [{ file: 'src/removed.ts', code: 'TS2', count: 0, baseline: 2 }],
    });
});
