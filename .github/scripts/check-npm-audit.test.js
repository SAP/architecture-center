const test = require('node:test');
const assert = require('node:assert/strict');
const { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { delimiter, join } = require('node:path');
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

function runCli(t, audit, lockfilePath) {
    const directory = mkdtempSync(join(tmpdir(), 'npm-audit-policy-cli-test-'));
    t.after(() => rmSync(directory, { recursive: true, force: true }));
    const auditPath = join(directory, 'audit.json');
    const allowlistPath = join(directory, 'allowlist.json');
    const sarifPath = join(directory, 'audit.sarif');
    writeFileSync(auditPath, typeof audit === 'string' ? audit : JSON.stringify(audit));
    writeFileSync(allowlistPath, JSON.stringify({ advisories: {} }));
    const args = [join(__dirname, 'check-npm-audit.js'), auditPath, allowlistPath, sarifPath];
    if (lockfilePath !== undefined) args.push(lockfilePath);
    const result = spawnSync(process.execPath, args, {
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
    assert.ok(sarif.runs[0].results.every((finding) => finding.locations[0].physicalLocation.artifactLocation.uri === 'package-lock.json'));
});

test('CLI accepts a clean report with an empty allowlist and writes empty SARIF', (t) => {
    const { result, sarifPath } = runCli(t, { auditReportVersion: 2, vulnerabilities: {} });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('policy passed'));
    const sarif = JSON.parse(readFileSync(sarifPath, 'utf8'));
    assert.equal(sarif.version, '2.1.0');
    assert.deepEqual(sarif.runs[0].results, []);
});

for (const toolchain of ['wrangler', 'cspell']) {
    test('CLI reports blocked ' + toolchain + ' findings against its isolated lockfile', (t) => {
        const lockfilePath = '.github/workflows/' + toolchain + '/package-lock.json';
        const { result, sarifPath } = runCli(t, report(newAdvisory), lockfilePath);
        assert.equal(result.status, 1);
        assert.ok(result.stderr.includes(newAdvisory));
        const sarif = JSON.parse(readFileSync(sarifPath, 'utf8'));
        assert.equal(sarif.runs[0].results.length, 2);
        for (const finding of sarif.runs[0].results) {
            assert.deepEqual(finding.locations[0].physicalLocation.artifactLocation, {
                uri: lockfilePath,
                uriBaseId: '%SRCROOT%',
            });
        }
    });
}

test('SARIF rejects paths outside the repository or pointing at a different file', () => {
    for (const lockfilePath of [
        null, '', '../package-lock.json', '/package-lock.json', 'C:\\package-lock.json',
        'https://example.com/package-lock.json', 'package.json',
    ]) {
        assert.throws(() => createSarif(report(), lockfilePath), /repository-relative package-lock/);
    }
});

function isolatedWorkflowAudit(t, { toolchain, audit, npmStatus, missingLockfile = false }) {
    // Execute the real workflow shell block with a deterministic registry response.
    // This verifies prefix selection and failure handling without installing PR dependencies.
    const workflow = readFileSync(join(__dirname, '../workflows/security-audit.yml'), 'utf8');
    const job = workflow.split('  audit-isolated-toolchains:\n')[1]?.split('\n  audit-workflows:')[0];
    assert.ok(job, 'Missing isolated dependency audit job.');
    const step = job.split('      - name: Run and enforce isolated npm audit\n')[1]?.split('      - name: Upload isolated npm audit SARIF')[0];
    const run = step?.split('        run: |\n')[1];
    assert.ok(run, 'Missing isolated dependency audit shell command.');
    const script = run.split('\n').filter((line) => line.startsWith('          ')).map((line) => line.slice(10)).join('\n');

    const root = mkdtempSync(join(tmpdir(), 'isolated-audit-workflow-test-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const toolchainDirectory = '.github/workflows/' + toolchain;
    const scriptsDirectory = join(root, '.github/scripts');
    const bin = join(root, 'bin');
    const calls = join(root, 'npm-calls.json');
    mkdirSync(scriptsDirectory, { recursive: true });
    mkdirSync(bin);
    mkdirSync(join(root, toolchainDirectory), { recursive: true });
    if (!missingLockfile) writeFileSync(join(root, toolchainDirectory, 'package-lock.json'), '{}');
    copyFileSync(join(__dirname, 'check-npm-audit.js'), join(scriptsDirectory, 'check-npm-audit.js'));
    writeFileSync(join(root, '.github/npm-audit-allowlist.json'), JSON.stringify({ advisories: {} }));
    writeFileSync(join(bin, 'npm'), '#!' + process.execPath + '\n'
        + 'require("node:fs").writeFileSync(process.env.AUDIT_CALLS, JSON.stringify(process.argv.slice(2)));\n'
        + 'process.stdout.write(process.env.AUDIT_RESPONSE);\n'
        + 'process.exit(Number(process.env.AUDIT_STATUS));\n', { mode: 0o755 });
    const result = spawnSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', script], {
        cwd: root,
        encoding: 'utf8',
        timeout: 10000,
        env: {
            ...process.env,
            PATH: bin + delimiter + process.env.PATH,
            TOOLCHAIN_DIRECTORY: toolchainDirectory,
            AUDIT_CALLS: calls,
            AUDIT_RESPONSE: typeof audit === 'string' ? audit : JSON.stringify(audit),
            AUDIT_STATUS: String(npmStatus),
        },
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null);
    if (missingLockfile) assert.equal(existsSync(calls), false, 'Do not audit another tree if this lockfile is missing.');
    else assert.deepEqual(JSON.parse(readFileSync(calls, 'utf8')), ['audit', '--prefix', toolchainDirectory, '--json']);
    const sarifPath = join(root, 'npm-audit.sarif');
    return { result, sarif: existsSync(sarifPath) ? JSON.parse(readFileSync(sarifPath, 'utf8')) : null };
}

test('isolated workflow accepts a clean Wrangler audit without installing dependencies', (t) => {
    const { result, sarif } = isolatedWorkflowAudit(t, {
        toolchain: 'wrangler', audit: { auditReportVersion: 2, vulnerabilities: {} }, npmStatus: 0,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes('policy passed'));
    assert.deepEqual(sarif.runs[0].results, []);
});

test('isolated workflow blocks a high CSpell advisory and writes correctly located SARIF', (t) => {
    const { result, sarif } = isolatedWorkflowAudit(t, {
        toolchain: 'cspell', audit: report(newAdvisory), npmStatus: 1,
    });
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(newAdvisory));
    assert.ok(!result.stdout.includes('policy passed'));
    assert.ok(sarif.runs[0].results.every((finding) => finding.locations[0].physicalLocation.artifactLocation.uri === '.github/workflows/cspell/package-lock.json'));
});

for (const [name, audit, npmStatus] of [
    ['registry error', { error: { detail: 'registry unavailable' } }, 1],
    ['malformed JSON despite a zero npm exit', '{', 0],
    ['npm failure despite clean-looking output', { auditReportVersion: 2, vulnerabilities: {} }, 2],
]) {
    test('isolated workflow fails closed on ' + name, (t) => {
        const { result, sarif } = isolatedWorkflowAudit(t, { toolchain: 'wrangler', audit, npmStatus });
        assert.notEqual(result.status, 0);
        assert.ok(!result.stdout.includes('policy passed'));
        assert.equal(sarif, null);
    });
}

test('isolated workflow rejects a missing lockfile before calling npm', (t) => {
    const { result, sarif } = isolatedWorkflowAudit(t, {
        toolchain: 'cspell', audit: {}, npmStatus: 0, missingLockfile: true,
    });
    assert.equal(result.status, 1);
    assert.equal(sarif, null);
});
