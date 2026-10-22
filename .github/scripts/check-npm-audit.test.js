const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateAudit, validateAuditReport } = require('./check-npm-audit');

const allowlist = {
    advisories: {
        'GHSA-vfj7-8cjw-p6xm': {
            expires: '2027-01-31',
            reason: 'No upstream fix is available.',
        },
    },
};

function report(advisoryId = 'GHSA-vfj7-8cjw-p6xm') {
    return {
        auditReportVersion: 2,
        vulnerabilities: {
            braces: {
                severity: 'high',
                via: [{
                    severity: 'high',
                    url: `https://github.com/advisories/${advisoryId}`,
                }],
            },
            micromatch: { severity: 'high', via: ['braces'] },
        },
    };
}

test('accepts a known advisory before its explicit expiry', () => {
    const result = evaluateAudit(report(), allowlist, new Date('2026-10-22T00:00:00Z'));
    assert.equal(result.blockedPackageCount, 2);
    assert.deepEqual(result.rejected, []);
    assert.equal(result.accepted[0].id, 'GHSA-vfj7-8cjw-p6xm');
    assert.deepEqual(result.accepted[0].packages, ['braces', 'micromatch']);
});

test('rejects a new high advisory', () => {
    const result = evaluateAudit(report('GHSA-xxxx-yyyy-zzzz'), allowlist, new Date('2026-10-22T00:00:00Z'));
    assert.equal(result.rejected[0].reason, 'not allowlisted');
});

test('rejects an expired exception', () => {
    const result = evaluateAudit(report(), allowlist, new Date('2027-02-01T00:00:00Z'));
    assert.equal(result.rejected[0].reason, 'allowlist expired 2027-01-31');
});

test('rejects an impossible allowlist expiry date', () => {
    const invalidAllowlist = {
        advisories: {
            'GHSA-vfj7-8cjw-p6xm': {
                expires: '2027-02-31',
                reason: 'No upstream fix is available.',
            },
        },
    };

    assert.throws(
        () => evaluateAudit(report(), invalidAllowlist, new Date('2027-02-01T00:00:00Z')),
        /must have a valid expiry in YYYY-MM-DD format/
    );
});

test('rejects registry and parser error responses', () => {
    assert.throws(
        () => validateAuditReport({ message: 'registry unavailable', error: { detail: 'timeout' } }),
        /did not return vulnerability data: timeout/
    );
    assert.throws(() => validateAuditReport({ auditReportVersion: 2 }), /missing.*vulnerabilities object/);
});
