---
id: f4a2c8
slug: /ref-arch/f4a2c8
sidebar_position: 11
title: Third-Party A2A Integration & Token Exchange
description: >-
  How a third-party agent integrates with SAP via A2A — including the token
  exchange at SAP Cloud Identity Services that produces a correctly-scoped token
  before the Agent Gateway is called, and principal propagation across hops.
keywords:
  - sap
  - a2a
  - agent2agent
  - token exchange
  - principal propagation
  - agent gateway
  - cloud identity
  - oauth
  - audience
  - technical user
  - agent identity
  - SAP Cloud Identity Services
sidebar_label: Third-Party A2A & Token Exchange
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - security
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - sapgunnar
  - kay-schmitteckert
discussion: 
last_update:
  author: sapgunnar
  date: 2026-10-13
---

:::info Disclaimer
Some capabilities described here — in particular agent-user / technical-user principal propagation and application-to-agent authorization — are still in preparation. The architecture reflects the recommended target design; per-customer configuration steps noted below are transitional until SAP-managed automation is available.
:::

When a **third-party agent runtime** (configured by the customer, running on a non-SAP platform) needs to call SAP business capabilities through the **SAP Agent Gateway (AGW)**, it must present an access token that the Agent Gateway will accept. The core difficulty is an **audience mismatch**: the token a third-party runtime can natively obtain identifies the *agent*, not the SAP target. This reference architecture describes how a **token exchange at SAP Cloud Identity Services** resolves that mismatch *before* the Agent Gateway is called, and how **principal propagation** carries the subject consistently across every hop.

This is the inbound A2A counterpart to [Agent Identity](../8-ai-agent-identity/readme.md) and builds on the [SAP-Managed IAM Integration](../../RA0019/2-sap-managed/readme.md) model, where SAP Cloud Identity Services is the central identity and token-exchange authority.

## Architecture

![drawio](./drawio/third-party-a2a-token-exchange-sd.drawio "Token Exchange at SAP Cloud Identity before the Agent Gateway")

## The Audience-Mismatch Problem

A third-party agent runtime typically obtains its token via the OAuth **Authorization Code Grant** using **its own `client_id`**. The resulting token therefore carries an **audience that identifies the agent**, not the SAP target API:

```text
t_token(sub: U, azp: Agent, aud: Agent)
```

If this token is forwarded unchanged via A2A toward the Agent Gateway, the gateway rejects it because the token's audience identifies the agent rather than the gateway. The initial exchange must produce a token whose audience identifies the Agent Gateway (`aud = AGW`); after validating it, the gateway performs another exchange for the downstream target.

## Solution: Token Exchange at SAP Cloud Identity Services

The recommended resolution is an **OAuth token exchange performed at SAP Cloud Identity Services** that re-issues the token with the correct audience and tenant, derived from a `resource` parameter, **before** the Agent Gateway is called. Three variants address the mismatch at different points:

1. **Token exchange with a `resource` parameter (recommended)** — The caller performs an OAuth token exchange (`jwt-bearer` grant) against SAP Cloud Identity Services, passing a `resource` parameter that names the SAP target. SAP Cloud Identity Services issues a new token whose `aud` and `app_tid` are derived from the target resource, while `sub`, `sap_id_type` and `sap_user_type` are preserved. No separate proxy component is required.
2. **`resource` parameter on the Authorization Code / Refresh Token Grant** — The runtime supplies the `resource` parameter already at the original grant, so the token is issued with the correct target audience from the start (also covers unattended/refresh scenarios).
3. **Proxy App** — A dedicated component is explicitly configured to accept the `aud = Agent` token and broker the token exchange toward the target; useful when the runtime cannot pass a `resource` parameter itself.

### Token Exchange Request

The exchange uses the `urn:ietf:params:oauth:grant-type:jwt-bearer` grant with a `resource` parameter identifying the SAP target application:

```bash
curl -XPOST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "client_id={client_id_of_target}" \
  -d "app_tid={app_tid_of_target}" \
  -d 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer' \
  -d "assertion={incoming-token}" \
  -d "resource=urn:sap:identity:application:provider:name:{resourcename}" \
  https://{subdomain}.accounts.cloud.sap/oauth2/token
```

Client authentication is via client certificate (mTLS), `client_id`/`client_secret`, or a `jwt-bearer` client assertion.

The resulting token keeps the subject stable and carries the target audience:

```json
{
  "sub": "{some_user_or_agent_user_identifier}",
  "azp": "{client_id_of_target}",
  "aud": "{...derived from resource...}",
  "app_tid": "{...derived from resource...}",
  "iss": "https://{subdomain}.accounts.cloud.sap",
  "sap_id_type": "user",
  "sap_user_type": "{user | techUser | agentUser}"
}
```

:::note Stable subject across exchanges
`sub`, `sap_id_type` and `sap_user_type` are **preserved** across every token exchange, so the original principal (user, technical user, or agent user) remains traceable end-to-end for audit and authorization.
:::

## Principal Propagation Across Hops

Once a correctly-scoped token exists, the Agent Gateway performs a **token exchange (principal propagation) at each hop** of the call chain, always re-targeting the audience to the next component while preserving the subject. A typical multi-hop A2A chain:

```text
ApplicationX --> AGW --> AgentA --> AGW --> AgentB --> AGW --> TargetSystem
```

The token-related steps (authentication / authorization / exchange) at each hop:

1. **ApplicationX** requests a token suitable to call the Agent Gateway (for a non-SCI end user, this is an **application technical user** token, see below) and calls the Agent Gateway.
2. **Agent Gateway** validates the token (authN + authZ), performs a token exchange (principal propagation) scoped to **AgentA**, and calls AgentA.
3. **AgentA** validates the token, performs a token exchange back toward the Agent Gateway, and calls it.
4. **Agent Gateway** validates, exchanges toward **AgentB** (A2A), and calls AgentB.
5. **AgentB** validates, exchanges back toward the Agent Gateway, which finally exchanges toward the **Target System** and calls it.
6. **Target System** validates the incoming token (authN + authZ).

### Principal Propagation with an Application Technical User

A common inbound case is that the logical subject starting the chain is an **end user / consumer / customer-of-customer** who is **not** a user in the customer's SAP Cloud Identity Services tenant (they may be authenticated by another IdP, or not yet authenticated). The recommended design is **principal propagation with an application technical user**:

- ApplicationX obtains a **technical user token** (`sap_user_type: techUser`) suitable for the Agent Gateway.
- The Agent Gateway propagates this technical user across the A2A hops using the token exchange described above.
- The subject stays stable (`sub`, `sap_id_type`, `sap_user_type` preserved), so the technical user is traceable through to the target system.

A representative technical-user token payload:

```json
{
  "sub": "{customer-specific-techuser-identifier}",
  "sap_id_type": "user",
  "sap_user_type": "techUser",
  "aud": "{...}",
  "azp": "{...}",
  "iss": "https://customer-ias-domain"
}
```

:::note Transitional configuration
The customer's SAP Cloud Identity Services administrator or the managing Identity Management solution must assign ApplicationX's technical user to each target agent's `access@agent` policy. For the extended chain (reaching AgentB), ApplicationX must additionally be assigned to AgentB's `access@agent` policy.
:::

## Authorization Enforcement at the Agent Gateway

The Agent Gateway enforces authorization at every hop, failing early on unauthorized requests. Two layers apply:

- **User-to-agent (`access@agent`)** — The token forwarded to an agent carries an `authZ` claim (array of strings) that must contain `access@agent`. A user (or technical/agent user) is authorized to call an agent only if assigned to an AMS policy on that agent granting `access@agent`.
- **Agent-to-target (functional authorization)** — When an agent calls a target API (direct, A2A, or via an ephemeral MCP server), the Agent Gateway checks the agent's functional authorization against AMS policies, keyed by the target's ORD ID and global tenant ID (`gtid`). Permissions are `read`, `write`, or `access` (generic). For A2A and direct MCP access only `access` is supported; for HTTP/REST/OData, `read`/`write`/`access` apply, with read methods (`GET`, `QUERY`, `HEAD`) requiring `read` or `access` and mutating methods requiring `write` or `access`.

Authorization is modelled **directionally**: AgentA being authorized to call AgentB does not imply the reverse. These policies are created and assigned by the Agent Gateway at integration time, based on the agent's ORD integration dependencies (`requiredAgentSecurityPermissions`).


## Agent Operation Models

The token exchange supports the two agent operation models from [Agent Identity](../8-ai-agent-identity/readme.md), distinguished by `sap_user_type`:

- **Agent acting in a user's context** — the propagated subject is a human `user` (or an application `techUser` representing an external principal). The effective permission at runtime is the **intersection** of the user's permissions and the agent's permissions.
- **Autonomous agent** — the agent operates with its own dedicated **agent user** identity (`sap_user_type: agentUser`), obtained via a client-credentials grant with `impersonate_assigned_user=true`, giving it an independent token and audit trail.

## Components

| Component | Role |
|---|---|
| **Third-party agent runtime** | Runs the external agent, obtains and stores tokens, and adds them to outbound A2A calls. |
| **Corporate IdP** (e.g. Microsoft Entra ID) | Optional federated login source for the end user. |
| **SAP Cloud Identity Services** | OAuth authorization server; issues tokens and performs the token exchange that re-targets the audience; central identity and policy (AMS) authority. |
| **Proxy App** (optional) | Accepts an `aud = Agent` token and brokers the token exchange toward the target when the runtime cannot pass a `resource` parameter itself. |
| **SAP Agent Gateway (AGW)** | Validates tokens, performs principal propagation at each hop, and enforces user-to-agent and agent-to-target authorization. |
| **Target System / API** | The SAP capability ultimately invoked; validates the incoming, correctly-audienced token. |

## Example Use Cases

- **External consumer-facing agent calling SAP:** A customer embeds a third-party agent in a consumer app. The end user is authenticated by a non-SAP IdP (or not yet authenticated), so ApplicationX uses an **application technical user**. It exchanges its token at SAP Cloud Identity Services (`resource` = Agent Gateway) and calls the Agent Gateway, which propagates the technical user to the SAP agent and on to the target system — each hop re-audienced, the subject preserved.
- **Third-party agent delegating to an SAP agent via A2A:** A procurement agent on a non-SAP platform needs purchase-order status from SAP. Its native token has `aud = Agent`; a token exchange (or Proxy App) re-issues it with `aud = AGW`. The Agent Gateway validates `access@agent`, exchanges toward the SAP procurement agent, and forwards only if authorized — the external agent never receives backend credentials.

## Services and Components

- [SAP Cloud Identity Services](https://discovery-center.cloud.sap/serviceCatalog/cloud-identity-services?region=all)
- [SAP Business AI Platform](https://www.sap.com/products/artificial-intelligence/ai-platform.html)
- [SAP Integration Suite](https://discovery-center.cloud.sap/serviceCatalog/integration-suite?region=all)

## Related Readings

- [Agent Identity](../8-ai-agent-identity/readme.md) — how agent identities, policy enforcement points and the Agent Gateway are modelled.
- [A2A and MCP for Interoperability](../1-a2a-and-mcp/readme.md) — the open-standard protocols underlying this integration.
- [Integrating Joule Agents into Your Ecosystem](../5-integrate-joule-agents-and-tools-into-your-ecosystem/readme.md) — inbound A2A consumption of Joule Agents.
- [SAP-Managed IAM Integration](../../RA0019/2-sap-managed/readme.md) — the SAP-operated identity model this builds on.

