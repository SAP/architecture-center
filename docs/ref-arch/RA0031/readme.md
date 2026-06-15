---
id: id-ra0031
slug: /ref-arch/CAjENFVC
sidebar_position: 31
title: 'HANA AI Toolkit - Local MCP Server'
description: 'Local MCP Server for Generative AI Toolkit for SAP HANA Cloud'
keywords: 
  - data
sidebar_label: 'HANA AI Toolkit - Local MCP Server'
image: img/logo.svg
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
tags:
  - data
contributors:
  - raymondyao
last_update:
  date: 2026-06-15
  author: raymondyao
---

The **HANAMLToolkit local MCP server** is a Model Context Protocol (MCP) endpoint that turns the [hana-ml](https://pypi.org/project/hana-ml/) Python library into a set of governed tools that AI agents — Joule, Claude Desktop, IDE-side copilots, custom LangChain/LangGraph agents — can invoke against an SAP HANA Cloud instance. The server is shipped as part of the [hana-ai](https://pypi.org/project/hana-ai/) toolkit, runs in-process next to the agent or as a sidecar, and exposes the same tool catalog over three interchangeable transports: **stdio**, **SSE**, and **streamable HTTP**.

The architecture is opinionated about one thing in particular: every tool invocation must be attributable end-to-end. To make that real, an audit module writes a fixed set of **HANA Session Variables** on the toolkit's current ConnectionContext.connection — the same connection the tool is about to use to run SQL or PAL. DBAs and auditors can join MCP-side events with HANA-side audit / M_SESSION_CONTEXT records by MCP_SESSION_ID and HANA_CORRELATION_ID. A once-per-session bootstrap write happens earlier on that same connection (best-effort) so identity is observable even before the first tool call runs.

This document is the official endorsed architecture for that server, per the API Policy requirement that AI-facing data-access surfaces be published in the SAP Architecture Center.

# Top-level Component View

![drawio](drawio/diagram-UerktXkmCe.drawio)

Key properties:

- **One toolkit, three transports.** stdio and SSE share one MCP server library; HTTP uses a different one with first-class HTTP middleware. The same toolkit dispatches by transport, so tools, schemas, and audit behavior are identical from a client's perspective.
- **Background-thread server.** The MCP server runs in a daemon thread; multiple servers can coexist in the same process and be stopped individually.
- **Hot-swappable HANA connection.** Built-in admin tools replace the underlying ConnectionContext without restarting the server.
- **Audit is mandatory, not optional.** Before any tool's SQL or PAL runs, the audit module writes a fixed set of HANA Session Variables on the toolkit's current ConnectionContext.connection — the exact connection the tool is about to use. If that pre-execution write fails the tool call is failed deliberately; there is no untraced path. A once-per-session bootstrap write happens earlier on the same connection (best-effort) so client identity is observable even before the first tool call.

The HTTP transport is the recommended choice for any deployment where the agent runs out of process or in a different container; stdio remains the default for desktop IDE integrations and unit tests.

The audit pipeline is wired in at different points depending on transport, but the externally observable behavior — the set of HANA Session Variables written, and the audit-event types emitted — is identical across all three. HTTP installs the audit pipeline as server middleware and reacts the moment the client sends MCP initialize. stdio and SSE rely on the legacy MCP server library that does not expose a middleware surface, so the audit pipeline is invoked from the per-tool execution wrapper instead — on the first tool call of a session, identity is recovered from the parsed initialize parameters the legacy session object retains. Beyond clientInfo.name and clientInfo.version, agent-name / model-name / client-id arrive only if the client populated params.metadata extension fields. The official MCP Python SDK's ClientSession does not currently send those, so on stdio identity beyond clientInfo.name is best-effort; clients that build the JSON-RPC initialize payload themselves carry the full set.

# Tool Invocation Flow

# ![drawio](drawio/diagram-T3gm4bQtUx.drawio)

Audit Module

This section is the core of the architecture: how MCP-side identity and intent are projected into SAP HANA so DBAs and auditors can attribute every statement back to a specific agent, model, session, and tool invocation.

## Three Phases

The audit module writes HANA Session Variables at three points in a tool call's lifetime:

- **Bootstrap (once per session, best-effort).** When the client connects, the audit module writes session-level identity — who is calling, which agent, which model — onto the HANA connection. If the write fails, the call still proceeds.
- **Pre-tool (before each call, strict).** Before the tool issues any SQL or PAL, the audit module writes per-call identity — MCP_SESSION_ID, INVOCATION_ID, HANA_CORRELATION_ID, TOOL_NAME, redacted arguments. **If this write fails, the tool call is failed deliberately** — there must be no untraced execution.
- **Post-tool (after each call, best-effort).** Once the tool returns or throws, the audit module updates STATUS, DURATION_MS, and (on success) output metadata such as RESPONSE_SIZE. Failure here is logged but never propagates to the client — the response is already produced.

The same connection that carries these SET statements is then used by the tool to run SQL or PAL. As a result, M_SESSION_CONTEXT and any HANA audit policy that joins on SESSION_CONTEXT('MCP_SESSION_ID') or SESSION_CONTEXT('HANA_CORRELATION_ID') will see the same identity values that were emitted by the MCP server.

On a failed tool call the only HANA Session Variables that change in phase 2 are STATUS (set to failure) and DURATION_MS. The error class, error code and redacted error message remain on the audit event itself (server log + JSONL); they are intentionally not projected into SESSION_CONTEXT because they are unsafe to truncate to 512 chars and unsafe for HANA audit policies to filter on.

## Variable Set Written Into HANA

Every variable is normalized to a string and truncated to 512 characters before being written. Variable names are validated against [A-Za-z0-9_]+; single quotes in values are escaped via SQL doubling.

HANA Session Variable (SESSION_CONTEXT(<KEY>))

Source

Purpose

EVENT_TYPE

Audit event type

mcp.tool.invocation.started / …succeeded / …failed

OCCURRED_AT

Audit event timestamp

UTC ISO 8601

MCP_SESSION_ID

MCP session identity

HTTP mcp-session-id header / stdio-{pid}

CLIENT_IP

Resolved client IP

Real client IP after walking the trusted-proxy chain

CLIENT_DECLARED_NAME

MCP initialize clientInfo.name

Originating client/agent name

CLIENT_DECLARED_AGENT_NAME

MCP initialize extension

Agent declared by the client

CLIENT_DECLARED_MODEL_NAME

MCP initialize extension

Model declared by the client

MCP_CLIENT_NAME

Same source as CLIENT_DECLARED_NAME

Convenience alias for DBAs

MCP_CLIENT_ID

MCP initialize extension

Stable client identifier

AI_AGENT_NAME

Same source as CLIENT_DECLARED_AGENT_NAME

Convenience alias

AI_MODEL_NAME

Same source as CLIENT_DECLARED_MODEL_NAME

Convenience alias

TOOL_NAME

Tool key

Which tool is executing

TOOL_ARGS_JSON

Redacted arguments (sensitive keys → ***)

What the tool was called with

TARGET_TABLES

Heuristic from input arguments (e.g. fetch_data)

Tables the call is expected to read

RESPONSE_SIZE

Row count / item count from the tool result

What was returned

MODEL_STORAGE_NAME

Extracted from result (when applicable)

PAL model identity

MODEL_STORAGE_VERSION

Extracted from result (when applicable)

PAL model version

STATUS

started / success / failure

Lifecycle state

DURATION_MS

Wall-clock duration

End-to-end timing (terminal events only)

INVOCATION_ID

Per-call UUID (inv-…)

Unique per tool invocation

HANA_CORRELATION_ID

Per-call UUID (hana-corr-…)

Cross-system correlation handle



# Operational Considerations

- **Process model.** The MCP server runs in a daemon thread inside the agent process. Lifetime is bounded by the host process; for long-running deployments, prefer the HTTP transport inside a supervised container (systemd, Kubernetes, etc.).
- **Hot connection swap.** Built-in admin tools replace the underlying HANA connection without bouncing the server; every registered tool sees the new connection on its next call.
- **Trusted-proxy chain.** When deployed behind a reverse proxy or load balancer, configure the trusted-proxy settings so CLIENT_IP is resolved correctly from Forwarded / X-Forwarded-For.
- **Stop semantics.** A graceful stop is attempted first; a forced stop falls back to event-based termination flags and always cleans up the registry, because the HTTP transport may spawn a worker that outlives the calling thread.

# Related Readings

- [Agentic AI & AI Agents (RA0029)](file:///ref-arch/ca1d2a3e) — broader agent architecture on SAP BTP
- [A2A and MCP for Interoperability (RA0029-1)](file:///ref-arch/ca1d2a3e/1) — MCP / A2A protocol context
- [Third-Party MCP Access to SAP Solutions (RA0029-10)](file:///ref-arch/ca1d2a3e/10) — governed third-party MCP access
- [hana-ai on PyPI](https://pypi.org/project/hana-ai/) — the package that ships this server
- [Model Context Protocol specification](https://modelcontextprotocol.io/) — upstream protocol

