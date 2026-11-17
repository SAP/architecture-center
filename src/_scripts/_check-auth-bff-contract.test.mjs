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
    if (cookie.includes('no-publish-cookie')) return { status: 403 };
    if (url.searchParams.has('$filter')) return { status: 400 };
    if (options.method === 'HEAD' || url.pathname.endsWith('/not-allowlisted')) return { status: 404 };
    if (url.pathname.endsWith('/api/publish') && !options.headers['X-CSRF-Token']) return { status: 403 };
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

    assert.deepEqual(result, { passed: 31, total: 31 });
    assert.equal(messages.length, 31);
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
