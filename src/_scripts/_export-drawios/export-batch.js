function runExportBatch({ jobs, isCached, beforeExport, exportOne, onCacheHit, onSuccess, onFailure }) {
    const failures = [];

    for (const job of jobs) {
        try {
            if (isCached(job)) {
                onCacheHit?.(job);
                continue;
            }

            beforeExport?.(job);
            const result = exportOne(job);
            onSuccess?.(job, result);
        } catch (cause) {
            const failure = new Error(`Export failed ${job.input} -> ${job.output}`, { cause });
            failures.push(failure);
            onFailure?.(job, cause);
        }
    }

    if (failures.length > 0) {
        throw new AggregateError(failures, `Failed to export ${failures.length} Draw.io file(s).`);
    }
}

module.exports = { runExportBatch };
