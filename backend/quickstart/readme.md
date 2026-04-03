# Quickstart Backend

This service is the backend of Quickstart, built with SAP CAP on top of Express. It stores and manages draft reference architectures, including document metadata, contributor assignments, tags, and assets, until content is ready to be published.

The repository also contains the previous vanilla Express implementation in `srv/vanilla/`. That part still handles GitHub OAuth and publishing-related flows, while CAP powers the document persistence model and authorization-aware data access.

API details are documented in `docs/api.md`.

## Local Setup

To run locally, create a GitHub OAuth app and provide the required credentials in CAP configuration.

1. Copy `.cdsrc.sample.json` to `.cdsrc.json`.
2. Fill in the OAuth and runtime settings (`FRONTEND_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `JWT_SECRET`, and repository target fields if publishing is used).
3. Use Node.js 24.x.

Run commands:

```bash
npm install
npm run watch
```

The watch profile runs CAP with a local in-memory SQLite database by default.

Run the integration tests:

```bash
npm run test
```

## Deployment

Run the deployment steps in order:

```bash
cf login -a <CF_API_URL>
npm run build
npm run deploy
```

This builds the MTA archive and deploys it to SAP BTP (Cloud Foundry).
