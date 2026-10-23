---
id: 07cfe4
slug: /ref-arch/07cfe4
sidebar_position: 5
title: Non-SAP Agent Principal Propagation
description: >-
  SAP-managed IAM for non-SAP AI agents — how a third-party agent's principal
  (the acting user or agent identity) is securely propagated to SAP solutions
  through SAP Cloud Identity Services and the SAP Agent Gateway.
keywords:
  - sap
  - cloud identity
  - sap-managed
  - principal propagation
  - non-sap agent
  - agent identity
  - agent gateway
  - SAP Cloud Identity Services
sidebar_label: Non-SAP Agent Principal Propagation
image: img/ac-soc-med.png
tags:
  - security
  - sap-managed
  - genai
  - agents
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: true
contributors:
  - sapgunnar
discussion: 
last_update:
  author: sapgunnar
  date: 2026-10-22
---

This sub-page of the [SAP-managed integration](../readme.md) model describes **principal propagation for non-SAP AI agents**: how the acting principal of a third-party agent is carried, validated, and asserted when that agent interacts with SAP solutions through SAP Cloud Identity Services and the SAP Agent Gateway.

It focuses on the scenario where **third-party agents call SAP agents**, and documents two integration variants — a **front channel** and a **back channel** flow. It is the SAP-managed IAM companion to [Third-Party A2A Integration & Token Exchange](../../../RA0029/11-third-party-a2a-token-exchange/readme.md), which details the underlying token exchange and audience handling.

:::info Disclaimer
Some capabilities described here are still in preparation. The architecture reflects the recommended target design; standardization of the underlying flows is ongoing. The diagram on this page is currently a placeholder and will be replaced with the final front-channel and back-channel diagrams.
:::

## End-to-End Architecture Overview

In this scenario, **third-party agents call SAP agents**. Access from a third-party agent to an SAP agent is brokered by the **SAP Agent Gateway** and governed by SAP Cloud Identity Services, with the end user's principal propagated end to end.

### Key aspects

- Third-party agent to SAP agent access is defined via **SAP for Me / formations**.
- Third-party agents access SAP agents via the **Agent Gateway**.
- Third-party agents must be **represented in SAP Cloud Identity Services**.
- Users must be **represented in SAP Cloud Identity Services** and **authorized to access the SAP agent**.
- Authentication and authorization are based on **OAuth 2.0 / OpenID Connect (OIDC)**.
- Access makes usage of **principal propagation**.

**Token:** Access token for the **user**, requested **by the third-party agent**, issued by **SAP Cloud Identity Services**, with the **Agent Gateway** as the audience.

![drawio](drawio/non-sap-agent-principal-propagation.drawio "Non-SAP Agent Principal Propagation — End-to-End Overview")

## Integration Pattern 1: Front Channel

The front-channel variant drives user authentication and consent through browser-based OAuth/OIDC redirects at the third-party agent, then exchanges the resulting token for one targeted at the Agent Gateway.

**Steps:**

1. **User authentication at the third-party agent** — no constraints (the example assumes OAuth/OIDC).
2. The third-party agent must be able to **initiate an authorization code grant** with SAP Cloud Identity Services.
3. The third-party agent must be able to **retrieve an access token for the Agent Gateway via token exchange**.

Single sign-on may be achieved by **federating SAP Cloud Identity Services with the third-party identity provider**.

## Integration Pattern 2: Back Channel

The back-channel variant avoids an additional browser-based flow: the third-party agent authenticates the user via OAuth/OIDC, obtains a token suitable for token exchange, and exchanges it for an Agent Gateway token server-to-server.

**Steps:**

1. **User authentication at the third-party agent** using OAuth/OIDC.
2. The third-party agent must be able to **retrieve an access token suitable for a token exchange** with SAP Cloud Identity Services.
3. The third-party agent must be able to **retrieve an access token for the Agent Gateway via token exchange**.

**Identity federation between identity providers and user mapping is required.**

### Example `curl`

Token exchange at SAP Cloud Identity Services using the `jwt-bearer` grant, with the `resource` parameter identifying the Agent Gateway:

```bash
curl -XPOST -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
  -d "assertion=<user-token>" \
  -d "client_id=<3rd-party-agent-app-client-id-from-SAP-Cloud-Identity-Services>" \
  -d "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer" \
  -d "client_assertion=<jwt-for-client-authentication>" \
  -d "resource=urn:sap:identity:application:provider:name:agent-gateway" \
  -d "token_format=jwt" \
  https://<sap-cloud-identity-domain>/oauth2/token
```

## Additional Considerations

### Most relevant standards

- OAuth 2.0 Authorization Framework ([RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)) and OpenID Connect.
- OAuth Bearer Token Usage ([RFC 6750](https://www.rfc-editor.org/rfc/rfc6750)).
- OAuth Token Exchanges ([RFC 7521](https://www.rfc-editor.org/rfc/rfc7521) / [RFC 7523](https://www.rfc-editor.org/rfc/rfc7523) / [RFC 8693](https://www.rfc-editor.org/rfc/rfc8693)).

### Custom coding in third-party agents

- Token caching.
- Handling of offline access / refresh tokens.
- Handling of credentials.

### Good to know

- **Handling of credentials:** prefer usage of environment-managed credentials and JWT-based client authentication at SAP Cloud Identity Services over `client_id` and `client_secret`.
- **Front channel versus back channel:** selection heavily depends on third-party capabilities.
  - Front-channel integration does not introduce constraints on the third-party IdP / OAuth server, but SSO may introduce challenges (especially related to redirects via the browser and missing explicit user mapping).
  - Back-channel integration is typically more resilient (no additional browser-based flow), but requires third-party IdP / OAuth server support.
- **Standardization is ongoing** (for example, IETF OAuth WG: ID-JAG — based on RFC 7523 / 8693).

## Services and Components

- [SAP Cloud Identity Services - Identity Authentication](https://discovery-center.cloud.sap/serviceCatalog/identity-authentication?region=all)
- [SAP Cloud Identity Services - Identity Directory](https://api.sap.com/api/IdDS_SCIM/overview)
- [SAP Business AI Platform](https://www.sap.com/products/artificial-intelligence/ai-platform.html)

## Related

- [SAP-Managed IAM Integration](../readme.md) — overview of the SAP-managed model and its maturity stages.
- [Agent Identity](../../../RA0029/8-ai-agent-identity/readme.md) — SAP-managed identity for AI agents, including non-SAP agents.
- [Third-Party A2A Integration & Token Exchange](../../../RA0029/11-third-party-a2a-token-exchange/readme.md) — the token exchange and audience handling underlying these flows.

