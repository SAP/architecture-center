import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildAuthorizationProbes,
    loadAuthContractConfig,
    runAuthBffContract,
} from './_check-auth-bff-contract.mjs';

const csrf = 'csrf-token-at-least-16-characters';

function contractConfig() {
    return {
        baseUrl: 'https://auth-contract.example',
        sessions: {
            owner: { cookie: '__Host-ac_session=owner-cookie', csrfToken: csrf },
            contributor: { cookie: '__Host-ac_session=contributor-cookie', csrfToken: csrf },
            noPublish: { cookie: '__Host-ac_session=no-publish-cookie', csrfToken: csrf },
            revoked: { cookie: '__Host-ac_session=revoked-cookie' },
            btp: { cookie: '__Host-ac_session=btp-cookie', csrfToken: csrf },
        },
        documents: {
            owner: 'owner-document',
            contributor: 'contributor-document',
            forbidden: 'forbidden-document',
            missing: 'missing-document',
        },
    };
}

function expectedContractResponse(urlValue, options) {
    const url = new URL(urlValue);
    const cookie = options.headers.Cookie;

    if (!cookie) return { status: 401 };
    if (cookie.includes('btp-cookie') || cookie.includes('revoked-cookie')) return { status: 403 };
    if (cookie.includes('no-publish-cookie')) {
        return { status: options.method === 'GET' && url.pathname.endsWith('/Tags') ? 200 : 403 };
    }
    if (url.searchParams.has('$filter')) return { status: 400 };
    if (options.method === 'HEAD' || url.pathname.endsWith('/not-allowlisted')) return { status: 404 };
    if (url.pathname.endsWith('/api/publish')) {
        if (options.headers['X-CSRF-Token'] !== csrf) return { status: 403 };
        if (options.headers.Origin !== url.origin) return { status: 403 };
        if (options.headers['Sec-Fetch-Site'] !== 'same-origin') return { status: 403 };
    }
    if (url.pathname.includes('forbidden-document')) return { status: 403 };
    if (cookie.includes('contributor-cookie') && options.method === 'PATCH') return { status: 403 };
    if (
        cookie.includes('owner-cookie')
        && options.method === 'POST'
        && url.pathname.endsWith('/createNewDocument')
    ) {
        return { status: 403 };
    }
    if (
        cookie.includes('owner-cookie')
        && options.method === 'GET'
        && url.pathname.endsWith('/Documents')
        && url.searchParams.has('$expand')
    ) {
        return {
            status: 200,
            json: async () => ({ value: [{ ID: 'owner-document' }] }),
        };
    }
    if (url.pathname.includes('owner-document') || url.pathname.includes('contributor-document')) {
        return { status: 200 };
    }

    throw new Error(`Unexpected contract probe: ${options.method} ${url.pathname}`);
}

test('contract probes enforce GitHub identity on every allowlisted route', () => {
    const probes = buildAuthorizationProbes(contractConfig());
    const providerProbes = probes.filter((probe) => probe.name.startsWith('BTP-only session'));

    assert.equal(providerProbes.length, 17);
    assert.ok(providerProbes.every((probe) => probe.expectedStatus === 403));
    assert.ok(providerProbes.some((probe) => probe.path.endsWith('/api/publish')));
    assert.ok(providerProbes.some((probe) => probe.path.endsWith('/api/sync-fork')));
    assert.ok(providerProbes.some((probe) => probe.method === 'DELETE'));
});

test('contract runner checks provider, scope, resource, CSRF, path, and method denials', async () => {
    const messages = [];
    const result = await runAuthBffContract(contractConfig(), {
        fetchImpl: async (url, options) => expectedContractResponse(url, options),
        logger: { log: (message) => messages.push(message) },
    });

    assert.deepEqual(result, { passed: 35, total: 35 });
    assert.equal(messages.length, 35);
    assert.ok(messages.every((message) => !message.includes('__Host-ac_session')));
});

test('contract runner fails when provider authorization is missing', async () => {
    await assert.rejects(
        runAuthBffContract(contractConfig(), {
            fetchImpl: async (url, options) => {
                if (options.headers.Cookie?.includes('btp-cookie')) return { status: 200 };
                return expectedContractResponse(url, options);
            },
            logger: { log: () => {} },
        }),
        /BTP-only session cannot call/,
    );
});

test('publish scope probes fail if the no-publish fixture lacks GitHub access', async () => {
    const config = contractConfig();
    config.sessions.noPublish = config.sessions.btp;
    await assert.rejects(
        runAuthBffContract(config, {
            fetchImpl: async (url, options) => expectedContractResponse(url, options),
            logger: { log: () => {} },
        }),
        /no-publish fixture has valid GitHub access: expected 200, received 403/,
    );
});

test('contract runner fails when an invalid CSRF token is accepted', async () => {
    await assert.rejects(
        runAuthBffContract(contractConfig(), {
            fetchImpl: async (url, options) => {
                const token = options.headers['X-CSRF-Token'];
                if (options.headers.Cookie?.includes('owner-cookie') && token && token !== csrf) {
                    assert.equal(token.length, csrf.length);
                    return { status: 200 };
                }
                return expectedContractResponse(url, options);
            },
            logger: { log: () => {} },
        }),
        /invalid CSRF token is forbidden: expected 403, received 200/,
    );
});

test('contract runner fails when foreign Origin is accepted with valid CSRF', async () => {
    await assert.rejects(
        runAuthBffContract(contractConfig(), {
            fetchImpl: async (url, options) => {
                if (options.headers.Origin !== new URL(url).origin) {
                    assert.equal(new URL(url).origin, contractConfig().baseUrl);
                    assert.equal(options.headers['X-CSRF-Token'], csrf);
                    assert.equal(options.headers['Sec-Fetch-Site'], 'same-origin');
                    return { status: 200 };
                }
                return expectedContractResponse(url, options);
            },
            logger: { log: () => {} },
        }),
        /foreign Origin is forbidden even with valid CSRF: expected 403, received 200/,
    );
});

test('contract runner fails when cross-site Fetch Metadata is accepted with valid CSRF', async () => {
    await assert.rejects(
        runAuthBffContract(contractConfig(), {
            fetchImpl: async (url, options) => {
                if (options.headers['Sec-Fetch-Site'] === 'cross-site') {
                    assert.equal(options.headers.Origin, new URL(url).origin);
                    assert.equal(options.headers['X-CSRF-Token'], csrf);
                    return { status: 200 };
                }
                return expectedContractResponse(url, options);
            },
            logger: { log: () => {} },
        }),
        /cross-site Fetch Metadata is forbidden even with valid CSRF: expected 403, received 200/,
    );
});

test('contract requests keep fixture credentials on the target origin and reject redirects', async () => {
    const target = contractConfig().baseUrl;
    await assert.rejects(
        runAuthBffContract(contractConfig(), {
            fetchImpl: async (url, options) => {
                assert.equal(new URL(url).origin, target);
                assert.equal(options.redirect, 'manual');
                assert.ok(options.signal instanceof AbortSignal);
                return { status: 302 };
            },
            logger: { log: () => {} },
        }),
        /received 302/,
    );
});

test('contract runner fails when the document collection exposes another user document', async () => {
    await assert.rejects(
        runAuthBffContract(contractConfig(), {
            fetchImpl: async (urlValue, options) => {
                const url = new URL(urlValue);
                if (
                    options.headers.Cookie?.includes('owner-cookie')
                    && options.method === 'GET'
                    && url.pathname.endsWith('/Documents')
                    && url.searchParams.has('$expand')
                ) {
                    return {
                        status: 200,
                        json: async () => ({
                            value: [{ ID: 'owner-document' }, { ID: 'forbidden-document' }],
                        }),
                    };
                }
                return expectedContractResponse(url, options);
            },
            logger: { log: () => {} },
        }),
        /response exposes forbidden document forbidden-document/,
    );
});

function deploymentEnvironment(baseUrl) {
    return {
        AUTH_CONTRACT_BASE_URL: baseUrl,
        AUTH_CONTRACT_GITHUB_OWNER_COOKIE: '__Host-ac_session=owner',
        AUTH_CONTRACT_GITHUB_OWNER_CSRF: csrf,
        AUTH_CONTRACT_GITHUB_CONTRIBUTOR_COOKIE: '__Host-ac_session=contributor',
        AUTH_CONTRACT_GITHUB_CONTRIBUTOR_CSRF: csrf,
        AUTH_CONTRACT_GITHUB_NO_PUBLISH_COOKIE: '__Host-ac_session=no-publish',
        AUTH_CONTRACT_GITHUB_NO_PUBLISH_CSRF: csrf,
        AUTH_CONTRACT_GITHUB_REVOKED_COOKIE: '__Host-ac_session=revoked',
        AUTH_CONTRACT_BTP_COOKIE: '__Host-ac_session=btp',
        AUTH_CONTRACT_BTP_CSRF: csrf,
        AUTH_CONTRACT_OWNER_DOCUMENT_ID: 'owner-document',
        AUTH_CONTRACT_CONTRIBUTOR_DOCUMENT_ID: 'contributor-document',
        AUTH_CONTRACT_FORBIDDEN_DOCUMENT_ID: 'forbidden-document',
        AUTH_CONTRACT_MISSING_RESOURCE_ID: 'missing-document',
    };
}

test('deployment configuration accepts only repository-allowlisted origins', () => {
    assert.equal(
        loadAuthContractConfig(
            deploymentEnvironment('https://test.sap-architecture-center.pages.dev'),
        ).baseUrl,
        'https://test.sap-architecture-center.pages.dev',
    );

    assert.throws(
        () => loadAuthContractConfig(deploymentEnvironment('https://architecture.learning.sap.com')),
        /repository allowlisted origins/,
    );
    assert.throws(
        () => loadAuthContractConfig(deploymentEnvironment('https://attacker.example')),
        /repository allowlisted origins/,
    );
    assert.throws(
        () => loadAuthContractConfig(
            deploymentEnvironment('https://test.sap-architecture-center.pages.dev:8443'),
        ),
        /repository allowlisted origins/,
    );
});

test('deployment configuration rejects missing fixture values and invalid document IDs', () => {
    const missingCookie = deploymentEnvironment('https://test.sap-architecture-center.pages.dev');
    delete missingCookie.AUTH_CONTRACT_GITHUB_OWNER_COOKIE;
    assert.throws(() => loadAuthContractConfig(missingCookie), /Missing auth contract environment variables/);

    const invalidDocument = deploymentEnvironment('https://test.sap-architecture-center.pages.dev');
    invalidDocument.AUTH_CONTRACT_FORBIDDEN_DOCUMENT_ID = '../other-resource';
    assert.throws(() => loadAuthContractConfig(invalidDocument), /forbidden document ID has an invalid format/);
});
