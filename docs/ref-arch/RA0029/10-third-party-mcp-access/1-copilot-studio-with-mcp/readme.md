---
id: d2e34e
slug: /ref-arch/d2e34e
sidebar_position: 1
title: Microsoft Copilot Studio and the MCP Gateway in SAP Integration Suite
description: >-
  Learn how Microsoft Copilot Studio and other Microsoft MCP clients can be
  connected using the MCP Gateway in SAP Integration Suite.
keywords:
  - sap
  - ai agents
  - a2a
  - mcp
  - interoperability
  - Agent2Agent
  - model context protocol
  - copilot studio
  - microsoft copilot
sidebar_label: Microsoft Copilot Studio and the MCP Gateway in SAP Integration Suite
image: img/ac-soc-med.png
tags:
  - agents
  - genai
  - azure
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - kay-schmitteckert
  - hterminasyan
  - hobru
discussion: 
last_update:
  author: hobru
  date: 2026-06-18
---

:::info Disclaimer
The [Agent Gateway](../../1-a2a-and-mcp/readme.md#architecture) is not yet generally available (GA). The outlined architecture here shows ways how the integration with Copilot Studio and SAP can be done today. 

:::

[Microsoft Copilot Studio](https://www.microsoft.com/en-us/microsoft-365-copilot/microsoft-copilot-studio) is Microsoft's low-code platform for building and orchestrating AI agents across Microsoft 365, Teams, and custom channels.

If you are new to Copilot Studio, start with the official product documentation: [Microsoft Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/).

Through the **Model Context Protocol (MCP)**, a Copilot Studio agent can discover and invoke SAP business capabilities as governed tools — without
bespoke point-to-point integration code and without moving SAP data out of its system of record.

In this pattern, Copilot Studio acts as the **MCP client**, and the **MCP Gateway in SAP Integration Suite** acts as the governed entry point that
exposes SAP APIs, integration flows, and data sources as MCP-compliant tools. Identity flows end-to-end through a trust relationship between **Microsoft Entra ID** and **SAP Cloud Identity Services**, so every tool call runs in the context of the signed-in business user and respects existing SAP authorizations.

![drawio](drawio/copilot-studio+mcp-gateway.drawio)

This gives organizations the best of both ecosystems: the conversational reach and authoring experience of Copilot Studio on the front end, and the
enterprise-grade security, governance, and semantic richness of SAP BTP on the back end.

## Architecture at a Glance

| Layer | Component | Role |
| --- | --- | --- |
| Front end (Microsoft Azure) | **Copilot Studio agent** | Authors topics/tools, orchestrates the conversation, calls MCP tools at runtime |
| Identity | **Microsoft Entra ID &rlarr;&rarr; SAP Cloud Identity Services** | Federated trust; issues and exchanges tokens so the user identity propagates into SAP |
| Governance (SAP BTP) | **MCP Gateway in SAP Integration Suite** | Exposes APIs/flows as MCP tools; enforces OIDC auth, rate limiting, payload protection, observability |
| Tools &amp; data | **SAP S/4HANA, SuccessFactors, Concur, Customer Experience, Business Data Cloud, custom MCP servers, third-party APIs** | The authoritative systems the tools act on |

The Copilot Studio agent connects to the gateway over **MCP using the Streamable HTTP transport** and authenticates with **OAuth 2.0**. The gateway validates the token, applies governance policy, and routes the request to the underlying SAP or non-SAP system.

## Configuration and architecture overview

The integration involves three coordinated configuration steps — one on SAP BTP, one in your identity provider(s), and one in Copilot Studio.

### Prerequisites

- An SAP BTP subaccount with **SAP Integration Suite** and the **MCP Gateway**  capability enabled.
- The SAP APIs you want to expose available as OData/REST services or integration flows.
- A Microsoft Copilot Studio environment with agent-creation permissions.
- Administrative access to **Microsoft Entra ID** and **SAP Cloud Identity Services** to configure trust and app registrations.

For step-by-step MCP setup guidance, see: [Connect your agent to an existing MCP server — Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent).


:::note Transport
Copilot Studio supports the **Streamable HTTP** transport. SSE is deprecated and is no longer supported for MCP after August 2025 — ensure the gateway exposes a Streamable HTTP endpoint.
:::

## Single Sign-On and Identity Propagation

Secure, user-context-aware access is the centerpiece of this architecture. The goal is **no shared secrets and no over-privileged service accounts** — each SAP tool call executes with the permissions of the individual signed-in user.

### How the trust is established

- **SAP Cloud Identity Services (Identity Authentication, IAS)** is federated with **Microsoft Entra ID** over OIDC. Entra ID typically acts as the
  corporate identity provider; IAS brokers the identity into the SAP landscape and maps it to the SAP user.
- In Copilot Studio, the agent authenticates to the MCP Gateway with **OAuth 2.0 Authorization Code Flow**, so a user-delegated access token is obtained interactively when the user first invokes an SAP tool.
- The MCP Gateway validates the token (OIDC), and SAP Cloud Identity Services resolves it to the corresponding SAP identity, after which the underlying  system enforces that user's existing roles and authorizations.

### Why this matters

- **Least privilege by design** — authorizations already maintained in SAP continue to govern what the agent can read or write. No parallel permission   model to build or audit.
- **End-to-end traceability** — actions are attributable to a named user, which supports compliance, audit, and accountability requirements.
- **Single sign-on experience** — users authenticate once with their Microsoft credentials; the federation handles SAP access transparently.

:::tip
For organizations migrating from SAP Identity Management to Entra ID, this pattern aligns with the joint SAP–Microsoft identity lifecycle reference architecture, reusing the same federation foundation rather than introducing a new one.
:::

## Scenarios and Use Cases

The integration shines wherever an employee already works in a Microsoft surface (Teams, Microsoft 365 Copilot, a custom Copilot Studio agent) but needs
authoritative SAP data or actions in the flow of work.

### Self-service across SAP lines of business

- **HR &amp; People:** "Show my remaining leave balance and submit a vacation request for the last week of July." The agent calls the SAP tools through the gateway under the employee's own identity. 
- **Travel &amp; Expense:** "Create an expense report from these receipts and check the status of my last reimbursement."
- **Procurement &amp; Finance:** "What's the status of purchase order 4500001234, and who needs to approve it next?"

### Operational and customer-facing agents

- **Order-to-cash / customer service:** A service agent in Teams retrieves order status, delivery dates, and account history   without leaving the conversation.
- **Supply chain &amp; logistics:** Surface inventory levels, ASN status, or supplier data in a Copilot Studio agent for   planners.

### Insight in the flow of work (SAP Business Data Cloud)

- "Summarize Q2 revenue variance by region" — the agent grounds its answer in governed SAP analytics data rather than ungoverned exports.

### Composite, multi-system agents

Because the gateway can expose SAP **and** non-SAP APIs side by side, a single Copilot Studio agent can orchestrate a process that spans, for example, an
S/4HANA sales order, a Concur travel booking, and a third-party logistics API — all behind one governed MCP entry point.

### Bridging to the broader SAP agent ecosystem

For richer multi-agent collaboration, Copilot Studio can interoperate with SAP Joule agents via the **A2A protocol** through the Agent Gateway (once it is available). MCP (tool consumption) and A2A (agent-to-agent delegation) are complementary: use MCP when Copilot Studio needs to *call SAP capabilities as tools*, and A2A when it needs to *delegate a task to a specialized SAP agent*.

For SAP Joule and Microsoft 365 Copilot integration context, see: [SAP with Microsoft: AI SAP Joule & Microsoft 365 Copilot Integration — Microsoft Learn](https://learn.microsoft.com/en-us/azure/sap/microsoft-ai/joule/joule-copilot-overview).

## What Makes This Integration Compelling

- **Open standards, no lock-in.** MCP and OAuth/OIDC are open, widely adopted standards. Tools and agents evolve independently; you are not coupled to a
  proprietary connector format.
- **Build once, consume anywhere.** A capability exposed through the MCP Gateway is immediately available to Copilot Studio *and* any other MCP-compliant agent (for example, on Azure AI Foundry, Vertex AI, or Bedrock), maximizing reuse of your integration investment.
- **Governance at the edge.** Authentication, authorization, rate limiting, payload protection, and traffic management are enforced centrally at the   gateway — independent of how many agents consume the tools.
- **Observability and adoption insight.** Built-in monitoring, tracing, and analytics show how agents consume tools, supporting compliance reporting and
  helping you understand real-world usage.
- **Low-code authoring.** Business teams build and refine agents in Copilot Studio's visual designer, while platform teams retain control of what is   exposed and how it is secured.

### Best Practices

- Write **precise, action-oriented tool descriptions** in the gateway — the Copilot Studio orchestrator relies on them for accurate tool selection.
- Start with **read-only, high-value scenarios** (status lookups, balances, summaries) to build confidence before enabling write actions (approvals,
  submissions).
- **Scope OAuth permissions tightly** and prefer delegated (user) flows over application (service) flows wherever the scenario allows.
- Use the gateway's **rate limiting and payload protection** to guard SAP backends against unbounded agent traffic.
- Validate the **Streamable HTTP** endpoint and token lifetime/refresh behavior in a non-production subaccount first.

## Simplified Flow

1. **User request** — A user asks the Copilot Studio agent a question that requires SAP data or an SAP action.
2. **Authentication** — On first use, the agent obtains a user-delegated OAuth 2.0 token; Entra ID and SAP Cloud Identity Services federate the identity into SAP.
3. **Tool discovery &amp; selection** — The orchestrator matches the request to an MCP tool exposed by the SAP MCP Gateway, using the tool's description.
4. **Governed invocation** — The agent calls the tool over MCP (Streamable HTTP). The gateway validates the token, applies governance policy, and routes to the SAP/non-SAP system.
5. **Authorized execution** — The backend executes within the signed-in user's authorizations and returns a scoped result.
6. **Response** — The agent composes and presents the answer to the user in their Microsoft surface.

## Related Resources

- [A2A and MCP for Interoperability — SAP Architecture Center](https://architecture.learning.sap.com/docs/ref-arch/ca1d2a3e/1)
- [Microsoft Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Connect your agent to an existing MCP server — Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent)
- [Create a new MCP server — Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-create-new-server)
- [SAP with Microsoft: AI SAP Joule & Microsoft 365 Copilot Integration — Microsoft Learn](https://learn.microsoft.com/en-us/azure/sap/microsoft-ai/joule/joule-copilot-overview)
- [Identity and Access Management with Microsoft Entra and SAP BTP — SAP Community](https://community.sap.com/t5/technology-blog-posts-by-members/identity-and-access-management-with-microsoft-entra-part-i-managing-access/ba-p/13873276)
