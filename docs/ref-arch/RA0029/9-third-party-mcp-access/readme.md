---
id: id-ra0029-9
slug: /ref-arch/ca1d2a3e/9
sidebar_position: 9
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
discussion:
last_update:
  author: hterminasyan
  date: 2026-05-29
---

[**Model Context Protocol (MCP)**](https://modelcontextprotocol.io/) is an open standard that defines how AI models and agents can discover, understand and interact with external tools and their surrounding context. It acts as a universal adapter, allowing agents to consume tools—from simple functions to complex APIs—without needing to know their underlying implementation details.

This page outlines the two predominant patterns for third-party MCP access, the governance guardrails each pattern requires, and SAP's recommended approach for production-grade agentic access to SAP solutions.

:::warning Protocol Volatility
MCP is still evolving rapidly. A [release candidate for a major revision of the MCP specification](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/) introduces breaking changes. Customers running self-managed MCP servers must monitor the specification roadmap closely and plan for upgrade cycles. SAP-managed MCP infrastructure absorbs this complexity on your behalf.
:::

## Third-Party MCP Access Patterns

Two patterns describe how third-party MCP servers reach SAP solutions. Both are valid, but they carry different risk profiles and operational responsibilities.

### Pattern 1 — External MCP Server on a Third-Party Platform

An MCP server is operated by a third party (vendor-supplied, open source, or SaaS-hosted) and calls SAP APIs from outside the SAP BTP boundary.

<!-- DIAGRAM PLACEHOLDER
 
-->

**Customer responsibility:** The third-party platform, its runtime, its dependencies and the credentials stored on it are entirely the customer's operational and security responsibility.

### Pattern 2 — Custom MCP Server on SAP BTP

A customer builds and operates a custom MCP server, deploying it on SAP BTP (Cloud Foundry, Kyma, or a containerized workload).

<!-- DIAGRAM PLACEHOLDER

-->

**Customer responsibility:** The application code, BTP configuration, credential lifecycle and security hardening of the custom MCP server are the customer's responsibility. Hosting on BTP reduces infrastructure risk but does not automatically provide governance tooling.

## Cross-Cutting Concerns for Both Patterns

Whether the MCP server is external or BTP-hosted, the following concerns must be addressed. Failing to do so shifts operational and security risk entirely to the customer.

### Security

- **Authentication & Authorization:** Every inbound request to the MCP server and every outbound call to an SAP API must be authenticated. Use OAuth 2.0 / OIDC flows managed through SAP Cloud Identity Services (IAS). Never embed long-lived credentials in MCP tool definitions.
- **Input Validation:** Validate and sanitize all tool call parameters before they reach SAP APIs. Treat every input as untrusted.
- **Transport Security:** Enforce TLS 1.2+ on all connections. Do not expose MCP endpoints over plain HTTP.
- **Secrets Management:** Store SAP API keys, OAuth client secrets and certificates in a dedicated secrets store (e.g., SAP Credential Store on BTP, HashiCorp Vault). Rotate regularly.

### Scalability and Reliability

- **Rate Limiting:** Apply rate limits to prevent runaway agent loops from exhausting SAP API quotas.
- **Timeouts and Circuit Breakers:** Implement timeouts for every SAP API call. Use circuit-breaker patterns to prevent cascading failures when a downstream SAP service is unavailable.
- **Horizontal Scaling:** Design MCP servers as stateless services so they can scale out. Do not store session state in the MCP server process.

### Observability

- **Logging:** Log every tool invocation including caller identity, parameters (redact PII), target SAP API, response status and latency.
- **Distributed Tracing:** Propagate trace context (e.g., W3C TraceContext headers) through the MCP server into SAP API calls so end-to-end traces are available.
- **Alerting:** Set up alerts for error rate spikes, latency degradation and authentication failures.

### Lifecycle Management

- **Versioning:** Version your MCP tool manifests. Breaking changes in tool schemas must be coordinated with consuming agents.
- **Spec Upgrades:** Track MCP specification releases. The upcoming breaking changes in the MCP release candidate require code changes in both server and client. Build upgrade cycles into your operations.

## OWASP MCP Top 10 — Relevant Risks

The [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/) catalogues the most critical security risks specific to MCP deployments. The following risks are particularly relevant when exposing SAP solutions through third-party MCP servers:

| Risk | Description | Mitigation for SAP Scenarios |
|------|-------------|------------------------------|
| **MCP01 — Prompt Injection** | Malicious content in tool responses manipulates the agent's reasoning or leaks sensitive data | Sanitize all data returned from SAP APIs before passing it back as tool results; use I/O filtering in SAP AI Orchestration |
| **MCP02 — Insecure Tool Execution** | MCP servers expose tools with excessive permissions or without proper authorization checks | Apply least-privilege OAuth scopes for each SAP API call; never grant write access unless the tool explicitly requires it |
| **MCP03 — Sensitive Data Exposure** | Tool parameters or results contain PII, financial data or credentials in plain text | Mask sensitive fields in logging; enforce data classification policies on SAP API responses |
| **MCP04 — Lack of Input Validation** | Unvalidated inputs reach SAP backends, enabling injection or unexpected behavior | Validate and type-check all tool call parameters before forwarding to SAP APIs |
| **MCP05 — Broken Authentication** | Weak or missing authentication on the MCP server endpoint allows unauthorized tool invocation | Require OAuth bearer tokens or mTLS on every MCP endpoint; integrate with IAS |
| **MCP06 — Insecure Defaults** | Out-of-the-box MCP server templates ship with permissive defaults | Review and harden all defaults before connecting to SAP production systems |
| **MCP07 — Insufficient Logging** | Missing audit trails make incident response and compliance audits impossible | Log all tool calls with caller identity and correlation IDs; retain logs per your compliance policy |

Refer to the full [OWASP MCP Top 10 project](https://owasp.org/www-project-mcp-top-10/) for the complete risk catalogue and remediation guidance.

## Customer Responsibility Statement

Customers may use third-party MCP servers to access SAP solutions, **provided the general controls of SAP's API Policy are adhered to**, including infrastructure stability, API credentials management, rate limiting and security hardening as described above. The operational responsibility for third-party MCP servers — including their security posture, availability, upgrade compatibility and compliance — rests entirely with the customer.

SAP does not certify, audit or assume liability for third-party MCP servers connecting to SAP APIs.

## SAP Recommendation: Use SAP-Managed MCP Infrastructure

Given the operational complexity, security surface area and protocol volatility outlined above, **SAP strongly recommends using SAP-managed MCP infrastructure** rather than operating third-party MCP servers in production.

The MCP specification is still maturing. The [upcoming MCP release candidate](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/) introduces breaking changes that will require coordinated upgrades across every MCP server and client in your landscape. SAP-managed infrastructure absorbs this upgrade burden and keeps your tooling current without operational disruption.

SAP provides two complementary managed paths:

### MCP Gateway in SAP Integration Suite

The **MCP Gateway** in SAP Integration Suite is SAP's enterprise-grade platform for creating, managing and exposing MCP servers from your existing API and integration landscape.

<!-- DIAGRAM PLACEHOLDER
   Suggested diagram: "SAP MCP Gateway — Managed Path"
   Show: AI Client → MCP Gateway (SAP Integration Suite) → SAP APIs / 3rd-party APIs / Integration Flows
   Highlight the governance layer: security policies, rate limiting, observability, lifecycle management — all handled by Integration Suite.
   File to create: ./images/sap-managed-mcp-gateway.svg (or .drawio)
-->

The MCP Gateway handles the cross-cutting concerns described above for you:

| Concern | How Integration Suite addresses it |
|---------|-------------------------------------|
| **Security** | OIDC/OAuth 2.0 enforcement, rate limiting, payload protection, traffic management — built-in |
| **Scalability** | Managed, auto-scaling runtime; no capacity planning for the MCP server layer |
| **Observability** | Native monitoring, distributed tracing and analytics dashboards |
| **Lifecycle** | MCP tool lifecycle management from creation and documentation to versioning and deprecation |
| **Spec upgrades** | SAP manages protocol compatibility; customers are shielded from breaking spec changes |
| **3rd-party APIs** | Existing non-SAP APIs and external MCP servers can be onboarded alongside SAP APIs under the same governed entry point |

See [MCP Gateway in Integration Suite](./1-a2a-and-mcp/readme.md#mcp-gateway-in-integration-suite) for the architectural overview.

### MCP Servers Generated by Joule Studio

When you build Joule agents using **Joule Studio**, SAP can generate MCP servers for capabilities and business data exposed by SAP Lines of Business. This means:

- **No manual MCP server authoring** — the server is generated from SAP's semantic API catalog and enriched with domain knowledge.
- **SAP manages the server lifecycle** — including spec upgrades, security patching and availability.
- **Governed by design** — authentication, authorization and data governance policies are baked in, aligned with SAP's platform security model.

This path is particularly relevant for customers building SAP-centric agentic applications who want authoritative, semantically enriched access to SAP business capabilities without the overhead of managing MCP infrastructure themselves.

TBD

## Decision Guide

Use the table below to select the appropriate approach for your scenario:

| Scenario | Recommended approach |
|----------|----------------------|
| Rapid prototyping / POC with an open-source MCP server | Third-party MCP server (Pattern 1 or 2) with basic security controls |
| Production access to SAP APIs by external AI clients | **MCP Gateway in SAP Integration Suite** |
| Building SAP-centric agents on BTP with rich SAP data access | **SAP-generated MCP servers via Joule Studio / BTP** |
| Exposing a mix of SAP and non-SAP APIs as a unified tool catalog | **MCP Gateway in SAP Integration Suite** |
| Custom tooling with full code control, hosted on BTP | Pattern 2 (custom MCP on BTP) with full governance checklist applied |
