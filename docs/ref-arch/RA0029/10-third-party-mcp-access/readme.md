---
id: id-ra0029-10
slug: /ref-arch/ca1d2a3e/10
sidebar_position: 10
title: Third-Party MCP Access to SAP Solutions
description: >-
  Guidance on accessing SAP solutions via third-party MCP servers, covering governance guardrails, OWASP MCP Top 10 risks, and SAP's recommended managed MCP approach via SAP Integration Suite and Joule Studio.
keywords:
  - sap
  - mcp
  - model context protocol
  - third-party
  - mcp server
  - mcp gateway
  - integration suite
  - joule studio
  - owasp
  - security
  - governance
  - btp
sidebar_label: Third-Party MCP Access
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - security
  - appdev
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - hterminasyan
  - mgnther
discussion:
last_update:
  author: hterminasyan
  date: 2026-06-08
---

[**Model Context Protocol (MCP)**](https://modelcontextprotocol.io/) is an open standard that defines how AI models and agents can discover, understand and interact with external tools and their surrounding context. It acts as a universal adapter, allowing agents to consume tools, from simple functions to complex APIs, without needing to know their underlying implementation details.

MCP is a **connectivity protocol** and the protocol itself standardizes how agents call tools and APIs, but **does not add business context or improve the accuracy of AI results.** Connecting an MCP server directly to raw SAP transactional APIs without semantic enrichment leads to poor entity discovery accuracy, excessive token consumption and, for write operations, a significant risk of incorrect business transactions (see [why MCP alone cannot run SAP business processes](https://venturebeat.com/orchestration/governance-not-gatekeeping-how-sap-brings-enterprise-grade-safety-to-ai-connectivity)). SAP-provided MCP servers via Joule Studio for Joule agents address this through semantic enrichment of SAP business capabilities. Customer-operated MCP servers carry these risks in full.

While MCP has gained traction as a tool connectivity standard, the protocol specification is still maturing, with security, identity and governance requirements for enterprise deployments not yet fully addressed. SAP is a Gold member of the [Agentic AI Foundation (AAIF)](https://aaif.io/) under the Linux Foundation and co-chairs the Agent Identity and Security workstream, which is actively working to close these gaps. These gaps span authentication and authorization, credential lifecycle, audit and observability, and governance of server proliferation, as documented in detail by the [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/).

Customers and partners building custom MCP servers or using third-party MCP servers to connect agent platforms to SAP APIs **should be aware of these open concerns and the controls required to address them**, covered in detail below. SAP addresses them through the MCP Gateway on SAP Integration Suite and, for agents built on SAP BTP, through SAP-provided MCP servers via Joule Studio. For multi-agent interoperability scenarios, [A2A via the Agent Gateway](../1-a2a-and-mcp/readme.md) is the recommended approach.

:::warning Customer Responsibility

Customers and partners may use third-party MCP servers to access SAP APIs, **provided the following conditions are met: the SAP API Policy is adhered to in full**, in particular the section on General API Controls; authentication and authorization are enforced on every connection as described below; rate limits of the underlying SAP APIs are respected; and infrastructure stability and security hardening as described on this page are in place. The operational responsibility for third-party MCP servers, including their security posture, availability, upgrade compatibility and compliance, rests entirely with the customer or partner deploying it.
:::

:::warning Protocol Volatility

MCP is still evolving rapidly. A [release candidate for a major revision of the MCP specification](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/) introduces breaking changes. Customers or partners running self-managed MCP servers must monitor the specification roadmap closely and plan for upgrade cycles. SAP-managed MCP infrastructure absorbs this complexity on your behalf.
:::

## Architecture

![drawio](./drawio/architecture.drawio)

## Third-Party MCP Access Patterns

Two patterns describe how third-party MCP servers reach SAP solutions. Both carry different risk profiles and operational responsibilities.

### Pattern 1: External MCP Server on a Third-Party Platform

An MCP server is operated by a third party (vendor-supplied, open source, or SaaS-hosted) and calls SAP APIs from outside the SAP BTP boundary.

This pattern places full operational and security responsibility, including the platform, runtime, dependencies and credentials, on the customer or partner deploying it.

### Pattern 2: Custom MCP Server on SAP BTP

A customer or partner builds and operates a custom MCP server, deploying it on SAP BTP (Cloud Foundry, Kyma, or a containerized workload).

This pattern places full operational and security responsibility, including the application code, SAP BTP configuration, credential lifecycle and security hardening, on the customer or partner deploying it. Hosting on SAP BTP reduces infrastructure risk but does not automatically provide governance tooling.

## Cross-Cutting Concerns for Both Patterns

The concerns below are not just implementation details; they reflect structural gaps in the MCP protocol itself that every operator must address independently. Whether the MCP server is external or SAP BTP-hosted, all of the following must be in place.

### Security

- **Authentication & Authorization:** Every inbound request to the MCP server and every outbound call to an SAP API must be authenticated. Use identity and access management flows managed through [SAP Cloud Identity Services](https://help.sap.com/docs/cloud-identity-services). Never store long-lived credentials in MCP servers.

- **Agent Identity:** An MCP server must **never proxy the caller's auth token directly to a downstream API**. Forwarding a user token without transformation effectively grants the MCP server and any consuming agent the full permissions of that user, bypasses audit attribution, and creates an exploitable attack surface. Instead, the MCP server must perform a token exchange to obtain a new, scoped credential that:
  - Carries the **identity of the calling agent** (the AI client or agent framework) so that SAP APIs can attribute actions to the specific agent, not just the end user.
  - Retains the **original user context** for data access control and audit purposes.
  - Is scoped to the minimum permissions required by the specific tool being invoked.

  Token exchange is a well-established pattern; refer to [OAuth 2.0 Token Exchange (RFC 8693)](https://www.rfc-editor.org/rfc/rfc8693) and the [OWASP Agentic AI — Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/) guidance for implementation context. The agent identity carried in the exchanged token must correspond to a registered agent in SAP Cloud Identity Services (see [Agent Identity](../8-ai-agent-identity/readme.md)). SAP Cloud Identity Services supports the principal propagation flows that serve as the exchange mechanism; consult your IAS documentation and verify availability in your tenant.

- **Input Validation:** Validate and sanitize all tool call parameters before they reach SAP APIs. Treat every input as untrusted.
- **Transport Security:** Enforce TLS 1.2+ on all connections. Do not expose MCP endpoints over plain HTTP.
- **Secrets Management:** Store SAP API keys, OAuth client secrets and certificates in a dedicated secrets store (e.g., SAP Credential Store on SAP BTP, HashiCorp Vault). Rotate regularly.
- **OWASP MCP Top 10 Risks:** Follow [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/) for specific risks and mitigations relevant to MCP deployments.

### Scalability and Reliability

- **Rate Limiting:** Apply rate limits to protect SAP API quotas from runaway agent loops. Critically, the rate limits enforced by the MCP server **must not exceed the quota or throttling limits of the underlying SAP APIs**. An MCP server that accepts more concurrent or burst traffic than the downstream API can handle simply shifts the exhaustion point and does not protect the system. Align MCP-level limits with the published rate limits of each API the server calls, and apply per-consumer limits where multiple agents share the same MCP entry point.
- **Timeouts and Circuit Breakers:** Implement timeouts for every SAP API call. Use circuit-breaker patterns to prevent cascading failures when a downstream SAP service is unavailable.
- **Horizontal Scaling:** Design MCP servers as stateless services so they can scale out. Do not store session state in the MCP server process.

### Observability

- **Logging:** Log every tool invocation including caller identity, parameters (redact PII), target SAP API, response status and latency.
- **Distributed Tracing:** Propagate trace context (e.g., W3C TraceContext headers) through the MCP server into SAP API calls so end-to-end traces are available.
- **Alerting:** Set up alerts for error rate spikes, latency degradation and authentication failures.

### Lifecycle Management

- **Versioning:** Version your MCP tool manifests. Breaking changes in tool schemas must be coordinated with consuming agents.
- **Spec Upgrades:** Track MCP specification releases. The upcoming breaking changes in the MCP release candidate require code changes in both server and client. Build upgrade cycles into your operations.

## SAP-Provided MCP Infrastructure

Given the operational complexity, security surface area and protocol volatility outlined above, SAP provides managed MCP infrastructure as an alternative to operating third-party MCP servers in production.

The MCP specification is still maturing. The [upcoming MCP release candidate](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/) introduces breaking changes that will require coordinated upgrades across every MCP server and client in your landscape. SAP-managed infrastructure absorbs this upgrade burden and keeps your tooling current without operational disruption.

SAP provides two complementary managed paths:

### MCP Gateway in SAP Integration Suite

The **MCP Gateway** in SAP Integration Suite is SAP's enterprise-grade platform for creating, managing and exposing MCP servers from your existing API and integration landscape. For customers and partners who need MCP connectivity in specific integration scenarios, it provides the iPaaS layer that addresses the structural gaps described above. This is an integration architecture that governs how MCP servers are exposed and consumed.

The MCP Gateway handles the cross-cutting concerns described above for you:

| Concern | How Integration Suite addresses it |
|---------|-------------------------------------|
| **Security** | OIDC/OAuth 2.0 enforcement, rate limiting, payload protection, traffic management, built-in |
| **Scalability** | Managed, auto-scaling runtime; no capacity planning for the MCP server layer |
| **Observability** | Native monitoring, distributed tracing and analytics dashboards |
| **Lifecycle** | MCP tool lifecycle management from creation and documentation to versioning and deprecation |
| **Spec upgrades** | SAP manages protocol compatibility; customers are shielded from breaking spec changes |
| **3rd-party APIs** | Existing non-SAP APIs and external MCP servers can be onboarded alongside SAP APIs under the same governed entry point |

See [MCP Gateway in Integration Suite](../1-a2a-and-mcp/readme.md#mcp-gateway-in-integration-suite) for the architectural overview.

### MCP Servers Generated by Joule Studio

When you build Joule agents using **Joule Studio**, SAP can generate MCP servers for capabilities and business data exposed by SAP Lines of Business. This means:

- **No manual MCP server authoring:** the server is generated from SAP's semantic API catalog and enriched with domain knowledge.
- **SAP manages the server lifecycle:** including spec upgrades, security patching and availability.
- **Governed by design:** authentication, authorization and data governance policies are baked in, aligned with SAP's platform security model.

This path is particularly relevant for customers building SAP-centric agentic applications who want authoritative, semantically enriched access to SAP business capabilities without the overhead of managing MCP infrastructure themselves.

### Agent-to-Agent Interoperability

For multi-agent scenarios where agents need to delegate tasks, discover capabilities or interoperate across system and vendor boundaries, the [Agent2Agent (A2A) protocol](https://a2a-protocol.org/latest/) via the **SAP Agent Gateway** is the more appropriate approach. A2A was designed specifically for agent-to-agent collaboration, with agent identity, task delegation and governance as first-class concerns.

See [Agent & Tool Interoperability](../1-a2a-and-mcp/readme.md) for the full architectural overview.

## Decision Guide

| Scenario | Recommended approach |
|----------|----------------------|
| Multi-agent collaboration and production agent interoperability | **A2A via the Agent Gateway** |
| Governed tool access via MCP for specific integration scenarios | **MCP Gateway in SAP Integration Suite** |
| Exposing a mix of SAP and non-SAP APIs as a unified MCP tool catalog | **MCP Gateway in SAP Integration Suite** |
| Building SAP-centric agents with Joule Studio | **SAP-provided MCP servers via Joule Studio** |
| Custom MCP server with full code control, hosted on BTP | Pattern 2 with full governance checklist applied |
| External MCP Server on a Third-Party Platform or Third-Party iPaaS | Pattern 1 with full governance checklist applied |

:::note Security Controls Are a Living Concern
The guardrails on this page reflect the current MCP protocol, best practices, and known threat landscape, all of which are evolving rapidly. Review your MCP security posture regularly: when new MCP specification versions ship, when OWASP guidance is updated, or after significant changes to your agentic architecture.
:::
