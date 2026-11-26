const fs = require('node:fs');

const BLOCKED_SEVERITIES = new Set(['high', 'critical']);
const SEVERITY_PRIORITY = ['critical', 'high', 'moderate', 'low', 'info'];
const SEVERITY_TO_SARIF_LEVEL = {
    critical: 'error',
    high: 'error',
    moderate: 'warning',
    low: 'note',
    info: 'note',
};

function readJson(filePath, description) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`Could not read ${description} at ${filePath}: ${error.message}`);
    }

    try {
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`${description} is not valid JSON: ${error.message}`);
    }
}

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSeverity(value) {
    return typeof value === 'string' && Object.hasOwn(SEVERITY_TO_SARIF_LEVEL, value);
}

function validateAuditReport(audit) {
    if (!isRecord(audit)) {
        throw new Error('npm audit returned an invalid report.');
    }
    if (audit.error || audit.message) {
        const detail = audit.error?.detail || audit.error?.summary || audit.message;
        throw new Error(`npm audit did not return vulnerability data: ${detail || 'unknown registry error'}`);
    }
    if (!Number.isInteger(audit.auditReportVersion) || audit.auditReportVersion < 2 || !isRecord(audit.vulnerabilities)) {
        throw new Error('npm audit response is missing an auditReportVersion >= 2 vulnerabilities object.');
    }

    for (const [packageName, vulnerability] of Object.entries(audit.vulnerabilities)) {
        if (!packageName.trim() || !isRecord(vulnerability)) {
            throw new Error(`npm audit returned an invalid vulnerability entry for ${packageName}.`);
        }
        if (!isSeverity(vulnerability.severity)) {
            throw new Error(`npm audit returned a missing or unknown severity for ${packageName}.`);
        }
        if (!Array.isArray(vulnerability.via)) {
            throw new Error(`npm audit returned an invalid via array for ${packageName}.`);
        }
        for (const via of vulnerability.via) {
            if (typeof via === 'string') {
                if (!via.trim() || !Object.hasOwn(audit.vulnerabilities, via)) {
                    throw new Error(`npm audit returned an unresolved package reference for ${packageName}: ${via}.`);
                }
                continue;
            }
            if (!isRecord(via) || !isSeverity(via.severity) || typeof via.url !== 'string') {
                throw new Error(`npm audit returned an invalid advisory for ${packageName}.`);
            }
            let url;
            try {
                url = new URL(via.url);
            } catch {
                throw new Error(`npm audit returned an invalid advisory URL for ${packageName}.`);
            }
            if (url.protocol !== 'https:' && url.protocol !== 'http:') {
                throw new Error(`npm audit returned an invalid advisory URL for ${packageName}.`);
            }
        }
    }
}

function validateAllowlist(allowlist) {
    if (!allowlist || typeof allowlist !== 'object' || Array.isArray(allowlist)) {
        throw new Error('npm audit allowlist must be an object.');
    }
    if (!allowlist.advisories || typeof allowlist.advisories !== 'object' || Array.isArray(allowlist.advisories)) {
        throw new Error('npm audit allowlist must contain an advisories object.');
    }

    for (const [id, entry] of Object.entries(allowlist.advisories)) {
        if (!/^GHSA-[A-Za-z0-9_-]+$/.test(id)) throw new Error(`Invalid advisory ID in allowlist: ${id}`);
        const expiry = entry?.expires;
        const expiryDate = typeof expiry === 'string' ? new Date(`${expiry}T00:00:00.000Z`) : null;
        if (
            !entry ||
            typeof entry !== 'object' ||
            Array.isArray(entry) ||
            !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(expiry || '') ||
            !expiryDate ||
            Number.isNaN(expiryDate.getTime()) ||
            expiryDate.toISOString().slice(0, 10) !== expiry
        ) {
            throw new Error(`Allowlist entry ${id} must have a valid expiry in YYYY-MM-DD format.`);
        }
        if (!entry.reason || typeof entry.reason !== 'string') {
            throw new Error(`Allowlist entry ${id} must explain why it is temporarily accepted.`);
        }
    }
}

function advisoryId(advisory) {
    const match = advisory.url?.match(/[/]advisories[/](GHSA-[A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
}

function resolveAdvisories(packageName, vulnerabilities, resolving = new Set()) {
    if (resolving.has(packageName)) return [];
    const vulnerability = vulnerabilities[packageName];
    if (!vulnerability || !Array.isArray(vulnerability.via)) return [];

    const nextResolving = new Set(resolving).add(packageName);
    return vulnerability.via.flatMap((via) => {
        if (typeof via === 'string') return resolveAdvisories(via, vulnerabilities, nextResolving);
        if (via && typeof via === 'object') return [via];
        return [];
    });
}

function effectiveSeverity(packageName, vulnerabilities) {
    let severity = vulnerabilities[packageName].severity;
    for (const advisory of resolveAdvisories(packageName, vulnerabilities)) {
        if (SEVERITY_PRIORITY.indexOf(advisory.severity) < SEVERITY_PRIORITY.indexOf(severity)) {
            severity = advisory.severity;
        }
    }
    return severity;
}

function isExpired(expiry, now) {
    const expiresAt = Date.parse(`${expiry}T23:59:59.999Z`);
    if (Number.isNaN(expiresAt)) return true;
    return now.getTime() > expiresAt;
}

function evaluateAudit(audit, allowlist, now = new Date()) {
    validateAuditReport(audit);
    validateAllowlist(allowlist);

    const blockedPackages = [];
    const advisoryPackages = new Map();
    const unresolvedPackages = [];

    for (const [packageName, vulnerability] of Object.entries(audit.vulnerabilities)) {
        const advisories = resolveAdvisories(packageName, audit.vulnerabilities)
            .filter((advisory) => BLOCKED_SEVERITIES.has(advisory.severity));
        // Check advisory severity as well as the aggregate package label so an
        // understated label cannot suppress an otherwise blocking finding.
        if (!BLOCKED_SEVERITIES.has(vulnerability.severity) && advisories.length === 0) continue;
        blockedPackages.push(packageName);
        if (advisories.length === 0) {
            unresolvedPackages.push(packageName);
            continue;
        }
        for (const advisory of advisories) {
            const id = advisoryId(advisory);
            if (!id) {
                unresolvedPackages.push(packageName);
                continue;
            }
            if (!advisoryPackages.has(id)) advisoryPackages.set(id, new Set());
            advisoryPackages.get(id).add(packageName);
        }
    }

    const rejected = [];
    const accepted = [];
    const allowedAdvisories = new Map(
        Object.entries(allowlist.advisories).map(([id, entry]) => [id.toUpperCase(), entry])
    );
    for (const [id, packages] of advisoryPackages) {
        const exception = allowedAdvisories.get(id.toUpperCase());
        if (!exception) {
            rejected.push({ id, packages: [...packages].sort(), reason: 'not allowlisted' });
        } else if (isExpired(exception.expires, now)) {
            rejected.push({ id, packages: [...packages].sort(), reason: `allowlist expired ${exception.expires}` });
        } else {
            accepted.push({ id, packages: [...packages].sort(), expires: exception.expires });
        }
    }

    return {
        accepted,
        rejected,
        unresolvedPackages: [...new Set(unresolvedPackages)].sort(),
        blockedPackageCount: blockedPackages.length,
    };
}

function createSarif(audit, lockfilePath = 'package-lock.json') {
    const segments = typeof lockfilePath === 'string' ? lockfilePath.split('/') : [];
    if (
        segments.pop() !== 'package-lock.json' ||
        segments.some((part) => !/^[A-Za-z0-9._-]+$/.test(part) || part === '.' || part === '..')
    ) {
        throw new Error('SARIF lockfile path must be a repository-relative package-lock.json path.');
    }
    validateAuditReport(audit);
    const vulnerabilities = Object.entries(audit.vulnerabilities).map(([name, vulnerability]) => [
        name,
        { ...vulnerability, severity: effectiveSeverity(name, audit.vulnerabilities) },
    ]);
    return {
        $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
        version: '2.1.0',
        runs: [{
            tool: {
                driver: {
                    name: 'npm-audit',
                    informationUri: 'https://docs.npmjs.com/cli/audit',
                    rules: vulnerabilities.map(([name, vulnerability]) => ({
                        id: name,
                        shortDescription: { text: `${vulnerability.severity} vulnerability in ${name}` },
                        properties: { severity: vulnerability.severity },
                    })),
                },
            },
            results: vulnerabilities.map(([name, vulnerability]) => ({
                ruleId: name,
                level: SEVERITY_TO_SARIF_LEVEL[vulnerability.severity] || 'warning',
                message: { text: `Vulnerable package: ${name} (${vulnerability.severity})` },
                locations: [{
                    physicalLocation: {
                        artifactLocation: { uri: lockfilePath, uriBaseId: '%SRCROOT%' },
                        region: { startLine: 1 },
                    },
                }],
            })),
        }],
    };
}

function run(argv = process.argv.slice(2)) {
    const [auditPath, allowlistPath, sarifPath, lockfilePath] = argv;
    if (!auditPath || !allowlistPath || !sarifPath) {
        throw new Error('Usage: node check-npm-audit.js <audit.json> <allowlist.json> <output.sarif> [lockfile-path]');
    }

    const audit = readJson(auditPath, 'npm audit report');
    const allowlist = readJson(allowlistPath, 'npm audit allowlist');
    const sarif = createSarif(audit, lockfilePath);
    fs.writeFileSync(sarifPath, JSON.stringify(sarif, null, 2));

    const evaluation = evaluateAudit(audit, allowlist);
    process.stdout.write(`npm audit reported ${evaluation.blockedPackageCount} high or critical package finding(s).\n`);
    for (const item of evaluation.accepted) {
        process.stdout.write(
            `Allowed temporarily: ${item.id} (${item.packages.length} package(s), expires ${item.expires}).\n`
        );
    }
    for (const item of evaluation.rejected) {
        console.error(`Blocked: ${item.id} affects ${item.packages.join(', ')} (${item.reason}).`);
    }
    if (evaluation.unresolvedPackages.length > 0) {
        console.error(`Blocked findings without a resolvable advisory: ${evaluation.unresolvedPackages.join(', ')}.`);
    }

    if (evaluation.rejected.length > 0 || evaluation.unresolvedPackages.length > 0) {
        throw new Error('npm audit found new, expired, or unresolvable high/critical vulnerabilities.');
    }
    process.stdout.write('npm audit policy passed.\n');
}

if (require.main === module) {
    try {
        run();
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

module.exports = { createSarif, evaluateAudit, run, validateAuditReport };
