const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');
const { createSarif, evaluateAudit, validateAuditReport } = require('./check-npm-audit');

const knownAdvisory = 'GHSA-xxxx-yyyy-zzzz';
const newAdvisory = 'GHSA-aaaa-bbbb-cccc';
const allowlist = {
    advisories: {
        [knownAdvisory]: {
            expires: '2027-01-31',
            reason: 'Synthetic exception for testing expiry enforcement.',
        },
    },
};

function report(advisoryId = knownAdvisory) {
    return {
        auditReportVersion: 2,
        vulnerabilities: {
            braces: {
                severity: 'high',
                via: [{ severity: 'high', url: 'https://github.com/advisories/' + advisoryId }],
            },
            micromatch: { severity: 'high', via: ['braces'] },
        },
    };
}

test('accepts a known advisory before its explicit expiry', () => {
    const result = evaluateAudit(report(), allowlist, new Date('2026-10-22T00:00:00Z'));
    assert.equal(result.blockedPackageCount, 2);
    assert.deepEqual(result.rejected, []);
    assert.equal(result.accepted[0].id, knownAdvisory);
    assert.deepEqual(result.accepted[0].packages, ['braces', 'micromatch']);
});

test('rejects a new high advisory', () => {
    const result = evaluateAudit(report(newAdvisory), allowlist, new Date('2026-10-22T00:00:00Z'));
    assert.equal(result.rejected[0].reason, 'not allowlisted');
});

test('rejects an expired exception', () => {
    const result = evaluateAudit(report(), allowlist, new Date('2027-02-01T00:00:00Z'));
    assert.equal(result.rejected[0].reason, 'allowlist expired 2027-01-31');
});

test('rejects an impossible allowlist expiry date', () => {
    const invalidAllowlist = {
        advisories: {
            [knownAdvisory]: {
                expires: '2027-02-31',
                reason: 'Synthetic exception for testing calendar validation.',
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
    assert.throws(() => validateAuditReport({ auditReportVersion: 2 }));
});

test('accepts integer auditReportVersion >= 2 with the supported report structure', () => {
    assert.doesNotThrow(() => validateAuditReport({ auditReportVersion: 2, vulnerabilities: {} }));
    assert.doesNotThrow(() => validateAuditReport({ auditReportVersion: 3, vulnerabilities: {} }));
});

for (const version of [1, 2.5, '2', null, undefined, NaN, Infinity]) {
    test('rejects invalid auditReportVersion: ' + typeof version + ' ' + String(version), () => {
        assert.throws(() => validateAuditReport({ auditReportVersion: version, vulnerabilities: {} }));
    });
}

for (const [name, value] of [['array', []], ['null', null], ['string', 'none']]) {
    test('rejects an invalid vulnerabilities collection: ' + name, () => {
        assert.throws(() => evaluateAudit({ auditReportVersion: 2, vulnerabilities: value }, { advisories: {} }));
    });
}

for (const [name, vulnerability] of [
    ['null entry', null],
    ['array entry', []],
    ['missing severity', { via: report().vulnerabilities.braces.via }],
    ['unknown severity', { severity: 'unknown', via: report().vulnerabilities.braces.via }],
    ['missing via', { severity: 'high' }],
    ['non-array via', { severity: 'high', via: 'braces' }],
]) {
    test('rejects a malformed package record: ' + name, () => {
        const audit = report();
        audit.vulnerabilities.braces = vulnerability;
        assert.throws(() => evaluateAudit(audit, { advisories: {} }));
    });
}

for (const [name, via] of [
    ['null advisory', null],
    ['array advisory', []],
    ['numeric advisory', 42],
    ['missing severity', { url: 'https://github.com/advisories/' + knownAdvisory }],
    ['unknown severity', { severity: 'unknown', url: 'https://github.com/advisories/' + knownAdvisory }],
    ['missing URL', { severity: 'high' }],
    ['numeric URL', { severity: 'high', url: 42 }],
    ['relative URL', { severity: 'high', url: '/advisories/' + knownAdvisory }],
    ['invalid URL', { severity: 'high', url: 'not a URL' }],
    ['non-http URL', { severity: 'high', url: 'file:///advisories/' + knownAdvisory }],
    ['empty reference', ''],
    ['dangling reference', 'missing-package'],
    ['inherited reference', 'constructor'],
]) {
    test('rejects a malformed advisory or package reference: ' + name, () => {
        const audit = report();
        audit.vulnerabilities.braces.via = [via];
        assert.throws(() => evaluateAudit(audit, { advisories: {} }));
    });
}

test('accepts a valid absolute HTTP advisory URL', () => {
    const audit = report();
    audit.vulnerabilities.braces.via[0].url = 'http://github.com/advisories/' + knownAdvisory;
    assert.doesNotThrow(() => validateAuditReport(audit));
});

for (const severity of ['high', 'critical']) {
    test('blocks a ' + severity + ' advisory even if package severity is lower', () => {
        const audit = report(newAdvisory);
        audit.vulnerabilities.braces.severity = 'low';
        audit.vulnerabilities.micromatch.severity = 'low';
        audit.vulnerabilities.braces.via[0].severity = severity;
        const result = evaluateAudit(audit, { advisories: {} });
        assert.equal(result.blockedPackageCount, 2);
        assert.deepEqual(result.rejected, [{
            id: newAdvisory,
            packages: ['braces', 'micromatch'],
            reason: 'not allowlisted',
        }]);
        const sarif = createSarif(audit);
        assert.ok(sarif.runs[0].results.every((finding) => finding.level === 'error'));
        assert.ok(sarif.runs[0].tool.driver.rules.every((rule) => rule.properties.severity === severity));
        assert.equal(audit.vulnerabilities.braces.severity, 'low', 'Reporting must not mutate the input.');
    });
}

test('does not block valid low-severity findings', () => {
    const audit = report();
    audit.vulnerabilities.braces.severity = 'low';
    audit.vulnerabilities.micromatch.severity = 'low';
    audit.vulnerabilities.braces.via[0].severity = 'low';
    const result = evaluateAudit(audit, { advisories: {} });
    assert.equal(result.blockedPackageCount, 0);
    assert.deepEqual(result.rejected, []);
    assert.deepEqual(result.unresolvedPackages, []);
});

test('resolves a cyclic package graph without losing its high advisory', () => {
    const audit = report(newAdvisory);
    audit.vulnerabilities.braces.via.push('micromatch');
    const result = evaluateAudit(audit, { advisories: {} });
    assert.equal(result.blockedPackageCount, 2);
    assert.deepEqual(result.rejected[0].packages, ['braces', 'micromatch']);
});

function runCli(t, audit) {
    const directory = mkdtempSync(join(tmpdir(), 'npm-audit-policy-cli-test-'));
    t.after(() => rmSync(directory, { recursive: true, force: true }));
    const auditPath = join(directory, 'audit.json');
    const allowlistPath = join(directory, 'allowlist.json');
    const sarifPath = join(directory, 'audit.sarif');
    writeFileSync(auditPath, typeof audit === 'string' ? audit : JSON.stringify(audit));
    writeFileSync(allowlistPath, JSON.stringify({ advisories: {} }));
    const result = spawnSync(process.execPath, [join(__dirname, 'check-npm-audit.js'), auditPath, allowlistPath, sarifPath], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 10000,
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null);
    return { result, sarifPath };
}

for (const [name, audit] of [
    ['malformed JSON', '{'],
    ['registry error', { error: { detail: 'registry unavailable' } }],
    ['malformed report', { auditReportVersion: 2, vulnerabilities: [] }],
]) {
    test('CLI fails without success or SARIF: ' + name, (t) => {
        const { result, sarifPath } = runCli(t, audit);
        assert.equal(result.status, 1);
        assert.ok(result.stderr.trim().length > 0, 'Explain why the audit could not be trusted.');
        assert.ok(!result.stdout.includes('policy passed'));
        assert.equal(existsSync(sarifPath), false);
    });
}

test('CLI writes valid SARIF before rejecting a new high advisory', (t) => {
    const { result, sarifPath } = runCli(t, report(newAdvisory));
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(newAdvisory));
    assert.ok(!result.stdout.includes('policy passed'));
    const sarif = JSON.parse(readFileSync(sarifPath, 'utf8'));
    assert.equal(sarif.version, '2.1.0');
    assert.equal(sarif.runs[0].tool.driver.name, 'npm-audit');
    assert.equal(sarif.runs[0].results.length, 2);
    assert.deepEqual(sarif.runs[0].results.map((finding) => finding.ruleId).sort(), ['braces', 'micromatch']);
    assert.ok(sarif.runs[0].results.every((finding) => finding.level === 'error'));
});

test('CLI accepts a clean report with an empty allowlist and writes empty SARIF', (t) => {
    const { result, sarifPath } = runCli(t, { auditReportVersion: 2, vulnerabilities: {} });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('policy passed'));
    const sarif = JSON.parse(readFileSync(sarifPath, 'utf8'));
    assert.equal(sarif.version, '2.1.0');
    assert.deepEqual(sarif.runs[0].results, []);
});
