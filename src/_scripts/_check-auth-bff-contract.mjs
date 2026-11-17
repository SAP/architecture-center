import { pathToFileURL } from 'node:url';

const REQUIRED_ENVIRONMENT = [
    'AUTH_CONTRACT_BASE_URL',
    'AUTH_CONTRACT_GITHUB_OWNER_COOKIE',
    'AUTH_CONTRACT_GITHUB_OWNER_CSRF',
    'AUTH_CONTRACT_GITHUB_CONTRIBUTOR_COOKIE',
    'AUTH_CONTRACT_GITHUB_CONTRIBUTOR_CSRF',
    'AUTH_CONTRACT_GITHUB_NO_PUBLISH_COOKIE',
    'AUTH_CONTRACT_GITHUB_NO_PUBLISH_CSRF',
    'AUTH_CONTRACT_GITHUB_REVOKED_COOKIE',
    'AUTH_CONTRACT_BTP_COOKIE',
    'AUTH_CONTRACT_BTP_CSRF',
    'AUTH_CONTRACT_OWNER_DOCUMENT_ID',
    'AUTH_CONTRACT_CONTRIBUTOR_DOCUMENT_ID',
    'AUTH_CONTRACT_FORBIDDEN_DOCUMENT_ID',
    'AUTH_CONTRACT_MISSING_RESOURCE_ID',
];

const ALLOWED_AUTH_CONTRACT_ORIGINS = new Set([
    'https://dev.sap-architecture-center.pages.dev',
    'https://test.sap-architecture-center.pages.dev',
]);
const RESOURCE_ID_PATTERN = /^[A-Za-z0-9-]{1,128}$/;

function session(cookie, csrfToken) {
    return { cookie, csrfToken };
}

function validateSession(name, value, csrfRequired = true) {
    if (!value.cookie.includes('__Host-ac_session=')) {
        throw new Error(`${name} must contain the __Host-ac_session cookie.`);
    }
    if (csrfRequired && (!value.csrfToken || value.csrfToken.length < 16)) {
        throw new Error(`${name} must include a CSRF token of at least 16 characters.`);
    }
}

export function loadAuthContractConfig(environment = process.env) {
    const missing = REQUIRED_ENVIRONMENT.filter((name) => !environment[name]);
    if (missing.length > 0) {
        throw new Error(`Missing auth contract environment variables: ${missing.join(', ')}`);
    }

    const baseUrl = new URL(environment.AUTH_CONTRACT_BASE_URL);
    if (baseUrl.protocol !== 'https:') {
        throw new Error('AUTH_CONTRACT_BASE_URL must use HTTPS.');
    }
    if (baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash || baseUrl.pathname !== '/') {
        throw new Error('AUTH_CONTRACT_BASE_URL must contain only the staging origin.');
    }
    if (!ALLOWED_AUTH_CONTRACT_ORIGINS.has(baseUrl.origin)) {
        throw new Error(
            `AUTH_CONTRACT_BASE_URL must be one of the repository allowlisted origins: ${[...ALLOWED_AUTH_CONTRACT_ORIGINS].join(', ')}`,
        );
    }

    const sessions = {
        owner: session(
            environment.AUTH_CONTRACT_GITHUB_OWNER_COOKIE,
            environment.AUTH_CONTRACT_GITHUB_OWNER_CSRF,
        ),
        contributor: session(
            environment.AUTH_CONTRACT_GITHUB_CONTRIBUTOR_COOKIE,
            environment.AUTH_CONTRACT_GITHUB_CONTRIBUTOR_CSRF,
        ),
        noPublish: session(
            environment.AUTH_CONTRACT_GITHUB_NO_PUBLISH_COOKIE,
            environment.AUTH_CONTRACT_GITHUB_NO_PUBLISH_CSRF,
        ),
        revoked: session(environment.AUTH_CONTRACT_GITHUB_REVOKED_COOKIE),
        btp: session(environment.AUTH_CONTRACT_BTP_COOKIE, environment.AUTH_CONTRACT_BTP_CSRF),
    };

    validateSession('owner session', sessions.owner);
    validateSession('contributor session', sessions.contributor);
    validateSession('no-publish session', sessions.noPublish);
    validateSession('revoked GitHub session', sessions.revoked, false);
    validateSession('BTP session', sessions.btp);

    const documents = {
        owner: environment.AUTH_CONTRACT_OWNER_DOCUMENT_ID,
        contributor: environment.AUTH_CONTRACT_CONTRIBUTOR_DOCUMENT_ID,
        forbidden: environment.AUTH_CONTRACT_FORBIDDEN_DOCUMENT_ID,
        missing: environment.AUTH_CONTRACT_MISSING_RESOURCE_ID,
    };
    for (const [name, id] of Object.entries(documents)) {
        if (!RESOURCE_ID_PATTERN.test(id)) {
            throw new Error(`${name} document ID has an invalid format.`);
        }
    }

    return { baseUrl: baseUrl.origin, sessions, documents };
}

function proxyPath(path) {
    return `/api/backend${path}`;
}

function githubProviderRoutes(missingId) {
    return [
        { method: 'GET', path: '/quickstart/document-service/Documents' },
        { method: 'GET', path: `/quickstart/document-service/Documents(${missingId})` },
        { method: 'PATCH', path: `/quickstart/document-service/Documents(${missingId})`, body: {} },
        { method: 'DELETE', path: `/quickstart/document-service/Documents(${missingId})` },
        { method: 'POST', path: '/quickstart/document-service/createNewDocument', body: {} },
        { method: 'POST', path: '/quickstart/document-service/setDocumentContributors', body: {} },
        { method: 'POST', path: '/quickstart/document-service/setDocumentTags', body: {} },
        { method: 'POST', path: '/quickstart/document-service/syncOperations', body: {} },
        { method: 'POST', path: '/quickstart/document-service/DocumentAssets', body: {} },
        { method: 'GET', path: `/quickstart/document-service/DocumentAssets(${missingId})` },
        { method: 'DELETE', path: `/quickstart/document-service/DocumentAssets(${missingId})` },
        { method: 'GET', path: `/quickstart/document-service/DocumentAssets(${missingId})/content` },
        { method: 'GET', path: '/quickstart/document-service/Tags' },
        { method: 'GET', path: '/user/github/search-users?q=contract-probe' },
        { method: 'GET', path: '/github/user/contract-probe-user' },
        { method: 'POST', path: '/api/publish', body: {} },
        { method: 'POST', path: '/api/sync-fork', body: {} },
    ];
}

export function buildAuthorizationProbes(config) {
    const { documents, sessions } = config;
    const probes = [
        {
            name: 'missing session is unauthenticated',
            method: 'GET',
            path: proxyPath('/quickstart/document-service/Documents'),
            expectedStatus: 401,
        },
        {
            name: 'revoked GitHub credential is forbidden',
            method: 'GET',
            path: proxyPath('/quickstart/document-service/Documents'),
            session: sessions.revoked,
            expectedStatus: 403,
        },
        {
            name: 'owner can read owned document',
            method: 'GET',
            path: proxyPath(`/quickstart/document-service/Documents(${documents.owner})`),
            session: sessions.owner,
            expectedStatus: 200,
        },
        {
            name: 'owner collection contains only authorized documents',
            method: 'GET',
            path: proxyPath(
                '/quickstart/document-service/Documents?$expand=author,contributors($expand=user),tags($expand=tag)',
            ),
            session: sessions.owner,
            expectedStatus: 200,
            documentCollection: {
                required: [documents.owner],
                forbidden: [documents.forbidden],
            },
        },
        {
            name: 'contributor can read shared document',
            method: 'GET',
            path: proxyPath(`/quickstart/document-service/Documents(${documents.contributor})`),
            session: sessions.contributor,
            expectedStatus: 200,
        },
        {
            name: 'contributor cannot mutate shared document',
            method: 'PATCH',
            path: proxyPath(`/quickstart/document-service/Documents(${documents.contributor})`),
            session: sessions.contributor,
            body: {},
            expectedStatus: 403,
        },
        {
            name: 'unrelated user cannot read document',
            method: 'GET',
            path: proxyPath(`/quickstart/document-service/Documents(${documents.forbidden})`),
            session: sessions.owner,
            expectedStatus: 403,
        },
        {
            name: 'unrelated user cannot create a child under another owner document',
            method: 'POST',
            path: proxyPath('/quickstart/document-service/createNewDocument'),
            session: sessions.owner,
            body: { title: 'authorization probe', parentId: documents.forbidden },
            expectedStatus: 403,
        },
        {
            name: 'missing publish capability is forbidden',
            method: 'POST',
            path: proxyPath('/api/publish'),
            session: sessions.noPublish,
            body: {},
            expectedStatus: 403,
        },
        {
            name: 'missing fork-sync capability is forbidden',
            method: 'POST',
            path: proxyPath('/api/sync-fork'),
            session: sessions.noPublish,
            body: {},
            expectedStatus: 403,
        },
        {
            name: 'missing CSRF token is forbidden',
            method: 'POST',
            path: proxyPath('/api/publish'),
            session: { ...sessions.owner, csrfToken: undefined },
            body: {},
            expectedStatus: 403,
        },
        {
            name: 'unknown proxy path is denied without forwarding',
            method: 'GET',
            path: proxyPath('/not-allowlisted'),
            session: sessions.owner,
            expectedStatus: 404,
        },
        {
            name: 'unlisted method on allowed path is denied without forwarding',
            method: 'HEAD',
            path: proxyPath('/quickstart/document-service/Documents'),
            session: sessions.owner,
            expectedStatus: 404,
        },
        {
            name: 'unlisted ownership filter is denied without forwarding',
            method: 'GET',
            path: proxyPath('/quickstart/document-service/Documents?$filter=author_ID%20ne%20null'),
            session: sessions.owner,
            expectedStatus: 400,
        },
    ];

    for (const route of githubProviderRoutes(documents.missing)) {
        probes.push({
            ...route,
            name: `BTP-only session cannot call ${route.method} ${route.path}`,
            path: proxyPath(route.path),
            session: sessions.btp,
            expectedStatus: 403,
        });
    }

    return probes;
}

function headersForProbe(config, probe) {
    const headers = {
        Accept: 'application/json',
        Origin: config.baseUrl,
        'Sec-Fetch-Site': 'same-origin',
    };
    if (probe.session) {
        headers.Cookie = probe.session.cookie;
        if (probe.session.csrfToken) headers['X-CSRF-Token'] = probe.session.csrfToken;
    }
    if (probe.body !== undefined) headers['Content-Type'] = 'application/json';
    return headers;
}

async function validateDocumentCollection(response, expectation) {
    let payload;
    try {
        payload = await response.json();
    } catch {
        throw new Error('response is not valid JSON');
    }

    if (!payload || !Array.isArray(payload.value)) {
        throw new Error('response does not contain an OData value array');
    }

    const documentIds = payload.value.map((document) => document?.ID);
    for (const requiredId of expectation.required) {
        if (!documentIds.includes(requiredId)) {
            throw new Error(`response omits accessible document ${requiredId}`);
        }
    }
    for (const forbiddenId of expectation.forbidden) {
        if (documentIds.includes(forbiddenId)) {
            throw new Error(`response exposes forbidden document ${forbiddenId}`);
        }
    }
}

export async function runAuthBffContract(
    config,
    { fetchImpl = fetch, logger = console } = {},
) {
    const failures = [];
    const probes = buildAuthorizationProbes(config);

    for (const probe of probes) {
        let response;
        try {
            response = await fetchImpl(new URL(probe.path, config.baseUrl), {
                method: probe.method,
                headers: headersForProbe(config, probe),
                body: probe.body === undefined ? undefined : JSON.stringify(probe.body),
                redirect: 'manual',
                signal: AbortSignal.timeout(15_000),
            });
        } catch (error) {
            failures.push(`${probe.name}: request failed (${error instanceof Error ? error.message : 'unknown error'})`);
            continue;
        }

        if (response.status !== probe.expectedStatus) {
            failures.push(`${probe.name}: expected ${probe.expectedStatus}, received ${response.status}`);
            continue;
        }

        if (probe.documentCollection) {
            try {
                await validateDocumentCollection(response, probe.documentCollection);
            } catch (error) {
                failures.push(
                    `${probe.name}: ${error instanceof Error ? error.message : 'response validation failed'}`,
                );
                continue;
            }
        }

        logger.log(`pass: ${probe.name}`);
    }

    if (failures.length > 0) {
        throw new Error(`Authentication BFF contract failed: ${failures.join('; ')}`);
    }

    return { passed: probes.length, total: probes.length };
}

async function main() {
    const result = await runAuthBffContract(loadAuthContractConfig());
    console.log(`Authentication BFF contract passed (${result.passed}/${result.total}).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}
