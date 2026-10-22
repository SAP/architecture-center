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

This route proxies the allowlisted Quick Start operations to the CAP/Express service. The BFF authenticates the opaque session and supplies the required upstream credential itself. It strips browser-supplied `Authorization`, `Cookie`, forwarding, and identity headers before constructing the upstream request. Unsafe methods require the session-bound `X-CSRF-Token`; `Origin` and Fetch Metadata must also be checked.

The suffix remains unchanged when it is forwarded. For example, `/api/backend/quickstart/document-service/Documents` maps to `/quickstart/document-service/Documents`, and `/api/backend/api/publish` maps to `/api/publish`.

## Session requirements

Set the browser cookie with this shape:

```text
Set-Cookie: __Host-ac_session=<opaque random value>; Path=/; Secure; HttpOnly; SameSite=Lax
```

Do not set `Domain`. Store only a high-entropy opaque identifier in the cookie. Hash the identifier in the session store, encrypt provider tokens at rest, cap the session lifetime, rotate the identifier after login or privilege changes, and revoke it on logout. Provider tokens must be refreshed or expired server-side.

CSRF tokens are session-bound, random, and may be held in browser memory. They are not authentication credentials. The BFF must compare them in constant time and reject unsafe requests without a valid value.

## Deployment dependency

Before merging or deploying the frontend migration:

1. Deploy the BFF routes on `architecture.learning.sap.com` and provision its session store and encryption keys.
2. Configure both OAuth providers to use the same-origin BFF callback URLs.
3. Update the CAP/Express and SAP authentication services to accept only BFF-originated credentials. Disable callbacks that place `token`, `t`, `access_token`, or `id_token` in redirects.
4. Verify that CDN, Worker, and upstream logs redact OAuth codes, cookies, CSRF values, and provider tokens.
5. Exercise login, session restore, partial logout, complete logout, Quick Start reads and mutations, expired sessions, invalid state, invalid return paths, and CSRF rejection.
6. Deploy this frontend only after those checks pass.

The old backend base URLs are deliberately no longer embedded in the static JavaScript bundle. `AUTH_API_PATH` and `AUTHENTICATED_API_PATH` may override the default route prefixes at build time, but they must still resolve to the site origin.
