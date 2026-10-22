const test = require('node:test');
const assert = require('node:assert/strict');
const { runExportBatch } = require('./export-batch');

test('attempts every cache miss and fails the batch after collecting export errors', () => {
    const attempted = [];
    const failed = [];
    const jobs = [
        { input: 'cached.drawio', output: 'cached.svg' },
        { input: 'first.drawio', output: 'first.svg' },
        { input: 'second.drawio', output: 'second.svg' },
    ];

    assert.throws(
        () =>
            runExportBatch({
                jobs,
                isCached: ({ input }) => input === 'cached.drawio',
                exportOne: ({ input }) => {
                    attempted.push(input);
                    throw new Error(`renderer rejected ${input}`);
                },
                onFailure: ({ input }) => failed.push(input),
            }),
        (error) => {
            assert.ok(error instanceof AggregateError);
            assert.equal(error.errors.length, 2);
            assert.match(error.message, /Failed to export 2 Draw.io file/);
            return true;
        }
    );

    assert.deepEqual(attempted, ['first.drawio', 'second.drawio']);
    assert.deepEqual(failed, ['first.drawio', 'second.drawio']);
});

test('reports successful exports and cache hits without throwing', () => {
    const events = [];
    runExportBatch({
        jobs: [
            { input: 'cached.drawio', output: 'cached.svg' },
            { input: 'fresh.drawio', output: 'fresh.svg' },
        ],
        isCached: ({ input }) => input === 'cached.drawio',
        beforeExport: ({ input }) => events.push(`prepare:${input}`),
        exportOne: () => 'rendered',
        onCacheHit: ({ input }) => events.push(`cached:${input}`),
        onSuccess: ({ input }, result) => events.push(`${result}:${input}`),
    });

    assert.deepEqual(events, [
        'cached:cached.drawio',
        'prepare:fresh.drawio',
        'rendered:fresh.drawio',
    ]);
});
