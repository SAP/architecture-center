# Authentication session contract

The site frontend uses a same-origin backend-for-frontend (BFF) under `/api`. The BFF owns the OAuth authorization-code exchange, provider credentials, and session state. No bearer token may be placed in a URL, returned to browser JavaScript, written to Web Storage, or accepted from a browser `Authorization` header.

This repository contains the frontend half of the contract. The production Cloudflare Worker and the upstream authentication services must implement the server half before this change can be deployed. Until then, the frontend fails closed: it reports no authenticated user and `/api/auth/login` cannot start a login.

## Browser-facing routes

All routes are served from the same origin as the site and return `Cache-Control: no-store`.

### `GET /api/auth/login`

Query parameters:

- `provider`: `github` or `btp`
- `returnTo`: a path on the Architecture Center origin

The BFF validates `returnTo`, generates a cryptographically random one-time state value and a PKCE verifier, stores them server-side with a short expiry, and redirects to the provider. It must use the authorization-code flow. The response should also send `Referrer-Policy: no-referrer`.

### `GET /api/auth/callback/:provider`

The BFF validates and consumes the state value, exchanges the code server-side, loads the user profile, rotates the session identifier, and redirects to the stored `returnTo` path. OAuth codes and provider tokens must never be copied into the redirect URL.

### `GET /api/auth/session`

An authenticated response has this shape:

```json
{
  "users": {
    "github": {
      "username": "octocat",
      "email": "optional@example.com",
      "avatar": "https://avatars.githubusercontent.com/u/1",
      "provider": "github"
    },
    "btp": null
  },
  "activeProvider": "github",
  "csrfToken": "a-random-session-bound-value"
}
```

An unauthenticated request returns `401`. The response contains profile data and a CSRF token only; it never contains provider credentials or the opaque session identifier.

### `POST /api/auth/logout`

The JSON request contains `provider` (`github`, `btp`, or `all`) and a same-origin `returnTo` path. The request includes `X-CSRF-Token`. The BFF validates the header, `Origin`, and Fetch Metadata headers before changing the session.

The response uses the session response shape and may add a same-origin `redirectTo` path when a provider logout needs another BFF step. Logging out of all providers expires the session cookie and deletes the server-side session.

### `/api/backend/*`

This route proxies a fixed set of Quick Start operations to the CAP/Express service. Every request under `/api/backend`, including read-only requests, requires a server-validated GitHub identity and a usable server-held GitHub credential. A BTP-only session, a session whose GitHub identity cannot be revalidated, or a session whose provider credential has expired or been revoked receives `403 Forbidden`. The BFF must never infer GitHub authorization from `activeProvider`, a username, request parameters, or other browser-controlled data.

The BFF strips browser-supplied `Authorization`, `Cookie`, forwarding, scope, ownership, contributor, and identity headers before constructing the upstream request. It supplies the upstream credential and identity from server-side session state. Unsafe methods require the session-bound `X-CSRF-Token`; `Origin` and Fetch Metadata must also be checked.

The suffix remains unchanged when it is forwarded. For example, `/api/backend/quickstart/document-service/Documents` maps to `/quickstart/document-service/Documents`, and `/api/backend/api/publish` maps to `/api/publish`.

#### Default-deny route allowlist

The proxy matches the normalized path and HTTP method against this allowlist before selecting an upstream. Matching is exact except for the named, validated path parameters. A path parameter must be decoded once, checked against its expected format, and encoded again before forwarding. Prefix matching, arbitrary suffix forwarding, method overrides, and upstream URLs supplied by the browser are forbidden.

| Browser-facing path | Allowed methods | Required resource authorization |
| --- | --- | --- |
| `/api/backend/quickstart/document-service/Documents` | `GET` | Return only documents owned by or shared with the GitHub user |
| `/api/backend/quickstart/document-service/Documents(<document-id>)` | `GET` | Owner or contributor with `VIEW` access |
| `/api/backend/quickstart/document-service/Documents(<document-id>)` | `PATCH`, `DELETE` | Owner |
| `/api/backend/quickstart/document-service/createNewDocument` | `POST` | Authenticated GitHub user; server assigns that user as owner. A non-null `parentId` also requires ownership of the parent document |
| `/api/backend/quickstart/document-service/setDocumentContributors` | `POST` | Owner of the referenced document |
| `/api/backend/quickstart/document-service/setDocumentTags` | `POST` | Owner of the referenced document |
| `/api/backend/quickstart/document-service/syncOperations` | `POST` | Owner of the referenced document |
| `/api/backend/quickstart/document-service/DocumentAssets` | `POST` | Owner of the referenced parent document |
| `/api/backend/quickstart/document-service/DocumentAssets(<asset-id>)` | `GET` | Owner or contributor with `VIEW` access to the parent document |
| `/api/backend/quickstart/document-service/DocumentAssets(<asset-id>)` | `DELETE` | Owner of the parent document |
| `/api/backend/quickstart/document-service/DocumentAssets(<asset-id>)/content` | `GET` | Owner or contributor with `VIEW` access to the parent document |
| `/api/backend/quickstart/document-service/Tags` | `GET` | Authenticated GitHub user |
| `/api/backend/user/github/search-users` | `GET` | Authenticated GitHub user |
| `/api/backend/github/user/<login>` | `GET` | Authenticated GitHub user |
| `/api/backend/api/publish` | `POST` | Owner of every document in the submitted tree and the publish capability described below |
| `/api/backend/api/sync-fork` | `POST` | Publish capability described below |

All other path and method combinations return `404 Not Found` without contacting an upstream service. In particular, an allowed path with an unlisted method is denied rather than forwarded using a framework fallback. Query parameters are also default-deny: document reads accept only the explicitly supported OData expansion, user search accepts only a bounded `q` value, and no browser-supplied filter may widen the server-side ownership or contributor constraint. Unsupported or repeated query parameters return `400 Bad Request`.

#### Provider, resource, and scope authorization

Authorization is evaluated server-side on every request and before parsing or forwarding a mutation:

1. An absent or invalid opaque session returns `401 Unauthorized`.
2. An authenticated session without a valid GitHub provider identity and server-held credential returns `403 Forbidden`.
3. Missing ownership, contributor access, or another required resource grant returns `403 Forbidden`. Collection queries are constrained server-side and never rely on a browser-supplied owner filter. Asset access is authorized through its parent document.
4. `/api/backend/api/publish` and `/api/backend/api/sync-fork` require a server-derived `quickstart:publish` capability. The BFF grants that capability only after verifying that the current GitHub credential has the repository permissions needed for the operation, including repository contents and pull-request write access. If the integration uses OAuth scopes, this means `public_repo` or a stricter equivalent appropriate to the target repository. If it uses a GitHub App, the installation token must have equivalent `Contents: write` and `Pull requests: write` permissions. Workflow-file changes additionally require the corresponding workflow permission. Missing or stale grants return `403 Forbidden`.
5. CSRF failure on an otherwise authenticated unsafe request returns `403 Forbidden`.

The BFF must perform the same checks even when the upstream also enforces authorization. It must not forward first and treat an upstream denial as its authorization decision. Identity, ownership, contributor access, and publish capabilities are never accepted from request headers or bodies.

## Session requirements

Set the browser cookie with this shape:

```text
Set-Cookie: __Host-ac_session=<opaque random value>; Path=/; Secure; HttpOnly; SameSite=Lax
```

Do not set `Domain`. Store only a high-entropy opaque identifier in the cookie. Hash the identifier in the session store, encrypt provider tokens at rest, cap the session lifetime, rotate the identifier after login or privilege changes, and revoke it on logout. Provider tokens must be refreshed or expired server-side.

CSRF tokens are session-bound, random, and may be held in browser memory. They are not authentication credentials. The BFF must compare them in constant time and reject unsafe requests without a valid value.

## Frontend identity changes

Quick Start namespaces locally persisted editor state by the normalized GitHub username. When a refreshed session reports a different GitHub identity, the frontend cancels delayed writes, rehydrates only that identity's state, and withholds the editor until the new identity's authorized document collection loads successfully. Responses from requests started under a previous identity are discarded. The retired, unscoped `docusaurus-editor-content` storage entry is deleted because its owner cannot be established safely.

## Deployment dependency

Before merging or deploying the frontend migration:

1. Deploy the BFF routes on `architecture.learning.sap.com` and provision its session store and encryption keys.
2. Configure both OAuth providers to use the same-origin BFF callback URLs.
3. Update the CAP/Express and SAP authentication services to accept only BFF-originated credentials. Disable callbacks that place `token`, `t`, `access_token`, or `id_token` in redirects.
4. Verify that CDN, Worker, and upstream logs redact OAuth codes, cookies, CSRF values, and provider tokens.
5. Seed the non-production authorization fixtures required by `npm run test:auth-contract`, store their cookies and CSRF values as protected environment secrets, and run the contract workflow against the deployed BFF. The checks cover missing sessions, missing GitHub provider identity, resource ownership, contributor read-only access, publish scope, CSRF, and the default-deny path and method allowlist.
6. Exercise login, session restore, partial logout, complete logout, expired sessions, invalid state, and invalid return paths.
7. Deploy this frontend only after those checks pass.

The manual **Validate authentication BFF contract** workflow reads its target origin and document IDs from GitHub environment variables and its opaque cookies and CSRF values from GitHub environment secrets. The script accepts only the repository-controlled Cloudflare `dev` and `test` origins. Adding or changing an origin requires a reviewed code change; an environment variable alone cannot redirect the fixture credentials.

Store the variables and secrets in a GitHub environment named `auth-bff-contract`. Configure that environment to allow deployments only from the protected `dev` branch and require approval from its designated reviewers. The workflow also rejects every other ref and checks out the triggering `dev` commit by SHA. Environment deployment-branch protection remains the security boundary because code on another ref could remove a workflow-level condition.

Use dedicated, non-production fixtures with these properties:

- The owner session has a valid GitHub credential, owns `AUTH_CONTRACT_OWNER_DOCUMENT_ID`, and has the publish capability.
- The contributor session has `VIEW` access, but no ownership, for `AUTH_CONTRACT_CONTRIBUTOR_DOCUMENT_ID`.
- The owner session has no access to `AUTH_CONTRACT_FORBIDDEN_DOCUMENT_ID`.
- `AUTH_CONTRACT_FORBIDDEN_DOCUMENT_ID` belongs to another user and is also a valid parent, so the probe can verify that the owner cannot create a child beneath it.
- `AUTH_CONTRACT_MISSING_RESOURCE_ID` does not exist and is used for safe provider-denial probes.
- The no-publish session has a valid GitHub identity and credential without the required repository grants.
- The revoked session retains server-side session state whose GitHub credential has been revoked or expired.
- The BTP session has a valid BTP identity and no GitHub identity or credential.

The owner collection fixture must include `AUTH_CONTRACT_OWNER_DOCUMENT_ID`; the checker verifies that the response includes it and excludes `AUTH_CONTRACT_FORBIDDEN_DOCUMENT_ID`. The probe sends invalid or empty bodies for other denied mutations. Refresh the short-lived fixture sessions immediately before running the workflow and never place cookie or CSRF values in repository variables or workflow output.

The old backend base URLs are deliberately no longer embedded in the static JavaScript bundle. `AUTH_API_PATH` and `AUTHENTICATED_API_PATH` may override the default route prefixes at build time, but they must still resolve to the site origin.
